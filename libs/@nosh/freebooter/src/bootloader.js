import X from 'neoclassical'
import { pragma } from './pragma'
import { $ } from 'bun'
import { Logger } from 'logn'
import Bun from 'bun'
import Neo from 'neoclassical'
const { NeoArray, NeoString, NeoObject, NeoNumber } = Neo
const neo = (obj) => {
  if (Array.isArray(obj)) return new NeoArray(obj)
  if (typeof obj === 'string') return new NeoString(obj)
  if (typeof obj === 'object') return new NeoObject(obj)
  if (typeof obj === 'number') return new NeoNumber(obj)
  return obj
}
const { O_O } = pragma
/* Unlike 'server', I think Freebooter does the dirty work of actually setting up the server:
  - It loads the configuration
  - It searches the filesystem for the app directory
  - It sets up the filesystem routing for jsx pages
  - It sets up the static routing for public files
  - It sets up the named routes
  - It sets up the API routes
  - It sets up the server
  - It starts the server
  - It handles the request
  - It handles the response (theoretically, it might farm it out to a responder)
  - It handles the end state of the request
  - It keeps a constant request id for the life of the request
  - It leans heavily on JSX and not so much on react (the parts that break the MDN)
  - It uses the Bun server to handle the request

  BunServer, on the other hand, is an interface class for people who don't really need the guts of the service to show.
  It's a wrapper around Freebooter that does the following:
  - It loads the configuration
  - It navigates to the app directory
  - It preloads the service
  - It creates a Freebooter instance
  - It starts the server
  */

class Freebooter {
  #config = O_O.obj
  #logger = O_O.obj
  #paths = O_O.obj
  #routes = O_O.obj
  #pragma = pragma


  constructor(config) {
    this.#config = { ...config }
    this.#logger = new Logger(config.name ?? 'untitled-application')
    this.#paths = {}
    this.#routes = {}
    this.pragma = pragma
    this.logger.config(this.config.logger || {})
    this.logger.info('boot.sequence.initiated')
  }

  get appName() { return this.#config.name ?? 'untitled-application' }

  async loadFSData() {
    this.logger.info('boot.sequence.fsdata.load.start')
    this.#paths.repo = await this.pragma.repo
    this.#paths.app = [this.#paths.repo, 'app', this.appName].join('/')
    // note this finds the *non dist* app directory. Modify this if we standardize build.
    if (await $`[[ ! -d ${this.#paths.app} ]] && echo 'found'`.text() !== 'found') {
      this.logger.data({ paths: this.#paths }).error('boot.sequence.fsdata.app.not.found')
      exit(1)
    }
    this.logger.info('boot.sequence.fsdata.load.success')
  }

  appPathFor(...ptrkeys) {
    // returns one or more paths based on the app's configuration
    const path_values = ptrkeys.reduce((acc, key) => acc[key] ?? Object.create(null), this.#config.routes)
    if (path_values.length === 0) return null
    const app_prefix = this.pathToApp + `/${this.#config.routes.prefix ?? ''}`
    const paths = (Array.isArray(path_values)) ? path_values : [path_values]
    return paths.map(path => [app_prefix, path].join('').replaceAll(/\/+/g, '/'))
  }

  pageRouting() { // JSX view paths ('pages routing')
    const dir = this.appPathFor('views')?.shift()
    // potential enhancement: allow for multiple view directories
    this.#routes.pages = (pages.length > 0) ? Bun.FileSystemRouter({ style: 'nextjs', dir }) : undefined
  }

  async dirExists(dir) {
    return (await $`[[ -d ${dir} ]] && echo 'exists'`.text()) === 'exists'
  }

  async fileExists(file) {
    return (await $`[[ -f ${file} ]] && echo 'exists'`.text()) === 'exists'
  }

  async allFilesInPath(dir) {
    if (!await this.dirExists(dir)) return []
    return (await $`find ${dir} -type f`.text()).split(/\n/)
  }

  async staticFiles(dir) {
    const _ptrlst = neo(this.appPathFor('static', 'paths'))
    if (_ptrlst.length === 0) return []
    const _absdir = _ptrlst.map(ptr => `${this.appRoot}/${ptr}`)
    return await Promise.allSettled(_absdir.map(async dir => await this.allFilesInPath(dir))).catch(e => []).then(...files => neo(files).flatten.compact.reject(x => typeof x !== 'string').map(f => `${this.#routes.appRoot}/${f}`))
  }

  async staticRouting() {
    const _flattened = await this.staticFiles()
    this.#logger.data({ static: _flattened.array }).info('static.files')
    this.#routes.static = _flattened.reduce(async (acc, file) => new Response(await Bun.file(file).read()).then((response) => { acc[file] = response; return acc }), {})
  }

  // named routes are configured app-relative dynamic includes which return the following
  // format: an object or array of any structure containing objects with:
  // { path: /path/to/thing/:param, handler: fn }. The handler can be async.
  // This item also has the following optional arguments:
  // method: (defaults to 'get');
  // preflights: (defaults to undefined; an array of values to check for using multisource);
  // unauthenticated: (defaults to false; whether or not this route requires user (jwt) authentication, which is set in the cookie appname-nauth);
  // withoutApiKey: (defaults to false; whether or not this route requires an api key; otherwise, the ncli must be passed);
  // bots: (defaults to false; whether or not this route allows bots);
  // cors: (defaults to false; whether or not this route allows cross-origin requests);

  async loadNamedRoutes() {
    const _namedroutes = await this.appPathFor('routes', 'named')
    const _this = this
    const _neoroutes = new NeoArray(_namedroutes).compact.reject((path) => _this.fileExists(path))
    if (_neoroutes.length === 0) return []
    console.log('loading named routes', _neoroutes.join(', '))
    const _routes = _neoroutes.map(async (path) => await import(path).then(({ routes }) => routes))
    return await Promise.allSettled(_routes).then((results) => results.map((r) => r.value)).catch(e => [])
  }

  get routes() { return  {...this.#routes } }

  async namedRouting() {
    this.logger.log('info', 'boot.sequence.namedroutes.load.start')
    this.#routes.defined = await this.loadNamedRoutes()
    this.logger.log('info', 'boot.sequence.namedroutes.load.end')
  }

  seek(...target) { // dunno if this is used elsewhere, law of demeter says kill
    const results = []
    target.map((t) => {
      if (Array.isArray(t)) return this.seek(...t)
      if (typeof t !== 'object' || Object.keys(t).length < 3) return []
      const keys = Object.keys(t)
      ['handler', 'method', 'path'].every((k) => keys.includes(k)) ? results.push(t) : results.push(...this.seek(Object.values(t)))
    })
    return results.flat()
  }

  async loadAllRoutes() {
    this.logger.log('info', 'boot.sequence.routes.load.start')
    const _this = this
    Promise.allSettled([
      await this.pageRouting(),
      await this.staticRouting(),
      await this.namedRouting()
    ]).then(() => _this.logger.log('info', 'boot.sequence.routes.load.end'))
  }
}

export { Freebooter }



/*
  Using the app's configuration, we need to initialize the Bun server for both
  app and api endpoints. Steps required:
    1. Ensure middleware is loaded:
      - bot blockers
      - request parsers
      - request multisourcing
      - preflights (request validators)
      - authentication
      - per-request helpers
      - API: response promise awaiters, response formatters, response helpers
      - Filesystem routing for jsx pages
      - Static routing for public files
      - Initialize react/jsx requests
      - Handle request end state
      - Keep a constant request id for the life of the request
      - Ideally, lean heavily on JSX and not so much on react (the parts that break the MDN)
*/
