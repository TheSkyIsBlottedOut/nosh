import Neo from 'neoclassical'
import { pragma } from './pragma'
import Bun, { $ } from 'bun'
const { NeoArray, NeoString, NeoObject, NeoNumber } = Neo
const neo = (obj) => {
  if (Array.isArray(obj)) return new NeoArray(obj)
  switch (typeof obj) {
    case 'string': return new NeoString(obj)
    case 'object': return new NeoObject(obj)
    case 'number': return new NeoNumber(obj)
    default: return obj
  }
}
const { O_O } = pragma

class Freebooter {
  #config = O_O.obj; #paths = O_O.obj; #routes = O_O.obj
  constructor(config) {
    console.log('[BOOT] Creating Freebooter')
    this.#config = { ...config }
    pragma.initLogger(this.#config.name ?? 'system')
    this.#paths = { app: config.appRoot }
    this.#routes = {}
    if (this.#config.logger) pragma.logger.config?.(this.#config.logger)
    this.logger.info('boot.sequence.initiated')
  }
  get logger() { return pragma.logger }
  get appName() { return pragma.appname }

  async discoverFilesystemIfNotSet() {
    console.log('Filesystem not defined in config, searching...')
    if (!this.#paths.app) {
      this.#paths.repo = await pragma.repo()
      this.#paths.app = this.#paths.repo + '/app/' + this.appName
    }
    this.logger.data({ paths: this.#paths }).info('boot.sequence.fsdata.discovered')
  }

  get pathToRepo() { this.#paths.repo ??= this.#config.appRoot.split(/\/(?:app|dist)\/?/)[0]; return this.#paths.repo }
  get pathToApp() { this.#paths.app ??= this.#config.appRoot ?? this.#paths.repo + '/app/' + this.appName; return this.#paths.app }

  appPathFor(...ptrkeys) {
    console.log('appPathFor', ptrkeys)
    this.logger.data({ ptrkeys }).trace('boot.sequence.fsdata.app.path')
    // returns one or more paths based on the app's configuration
    const path_values = ptrkeys.reduce((acc, key) => acc[key] ?? Object.create(null), this.#config.routes)
    if (path_values.length === 0) return null
    const app_prefix = this.pathToApp + `/${this.#config.routes.prefix ?? '/'}`
    const paths = (Array.isArray(path_values)) ? path_values : [path_values]
    return paths.map(path => [app_prefix, path].join('/').replaceAll(/\/+/g, '/'))
  }

  pageRouting() { // JSX view paths ('pages routing')
    this.logger.trace('boot.sequence.pagesrouting.load.start')
    const dir = this.appPathFor('views')?.shift()
    // potential enhancement: allow for multiple view directories
    this.#routes.pages = (dir.length > 0) ? Bun.FileSystemRouter({ style: 'nextjs', dir }) : undefined
    this.logger.data({ dir }).trace('boot.sequence.pagesrouting.load.end')
    return this.#routes.pages
  }

  async dirExists(dir) { return ((await $`[[ -d ${dir} ]] && echo 'exists'`.text()).trim()) === 'exists' }
  async fileExists(file) { return ((await $`[[ -f ${file} ]] && echo 'exists'`.text()).trim()) === 'exists' }
  async allFilesInPath(dir) {
    if (!dir.startsWith('/')) dir = `${this.appRoot}/${dir}`
    if (!await this.dirExists(dir)) return []
    return (await $`find ${dir} -type f`.text()).split(/\n/)
  }

  async staticFiles(dir) {
    const _ptrlst = neo(this.appPathFor('static', 'paths'))
    if (_ptrlst.length === 0) return []
    const _paths = _ptrlst.map(async (path) => await this.allFilesInPath(path))
    return new NeoArray(await Promise.allSettled(_paths)).flatten()
  }

  async staticRouting() {
    const _flattened = await this.staticFiles()
    this.logger.data({ static: _flattened.array }).info('static.files')
    this.#routes.static = _flattened.reduce(async (acc, file) => new Response(await Bun.file(file).read()).then((response) => { acc[file] = response; return acc }), {})
  }

  async namedRouting() {
    pragma.logger.trace('boot.sequence.namedroutes.load.start')
    const _namedroutes = await this.appPathFor('routes', 'named')
    const _this = this
    const _neoroutes = new NeoArray(_namedroutes).compact.reject((path) => _this.fileExists(path))
    if (_neoroutes.length === 0) return []
    const _routes = _neoroutes.map(async (path) => await import(path).then(({ routes }) => routes))
    pragma.logger.data({ namedroutes: _routes }).trace('boot.sequence.namedroutes.load.end')
    this.#routes.defined = await Promise.allSettled(_routes).then((results) => results.map((r) => r.value)).catch(e => [])
    return this.#routes.defined
  }
  get routes() { return  {...this.#routes } }

  async loadAllRoutes() {
    this.logger.trace('boot.sequence.routes.load.start')
    const appExists = await this.dirExists(this.pathToApp)
    console.log('appExists', appExists, this.pathToApp)
    if (!appExists) await this.discoverFilesystemIfNotSet()
    const _this = this
    const result = await Promise.allSettled([
      this.pageRouting(),
      this.staticRouting(),
      this.namedRouting()
    ]).catch(this.logger.error)
    this.logger.data({ result }).trace('boot.sequence.routes.load.end')
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
// middleware: (defaults to undefined; an array of middleware functions to run before the handler);