import { pragma } from './pragma'
import Bun, { $ } from 'bun'
import { watch } from 'fs'
const { O_O, NeoArray, NeoString, NeoObject, NeoNumber } = pragma
const neo = (obj) => {
  if (Array.isArray(obj)) return new NeoArray(obj)
  switch (typeof obj) {
    case 'string': return new NeoString(obj)
    case 'object': return new NeoObject(obj)
    case 'number': return new NeoNumber(obj)
    default: return obj
  }
}

class Freebooter {
  #config = O_O.obj
  #paths = O_O.obj
  #routes = O_O.obj
  #sys = O_O.obj
  #env = 'production'
  #app = 'webservice'
  constructor(config) {
    this.#config = this.structureConfig(config)
    this.initLogger()
    this.#paths = { app: config.appRoot }
    this.#routes = {}
    this.#sys = {}
  }

  get logger()      { return pragma.logger }
  get appName()     { return this.#app }
  get config()      { return this.#config }
  get webConfig()   { return this.#config.platform.web }
  get env()         { return this.#env }

  initLogger() {
    pragma.initLogger(this.config.name ?? 'system')
    pragma.logger.receiveTermSignals = true
    pragma.logger.trace('boot.sequence.logger.init')
    if (this.config.log) pragma.logger.config(this.config.log)
  }

  structureConfig(oconfig = {}) {
    let config = Object.assign({}, oconfig)
    this.#env = config.env ?? 'production'
    this.#app = oconfig.name ?? 'webservice'
    config.platform ??= {}
    Object.keys(config.platform).forEach((key) => {
      if (config.platform[key]?.[this.#env]) config.platform[key] = config.platform[key][this.#env]
    })
    return config
  }

  async discoverFilesystemIfNotSet() {
    this.logger.trace('boot.sequence.fsdata.discover.start')
    if (!this.#paths.app) {
      this.#paths.repo = await pragma.repo()
      this.#paths.app = this.#paths.repo + '/app/' + this.appName
    }
    this.logger.data({ paths: this.#paths }).info('boot.sequence.fsdata.discovered')
  }
  async initFSWatch() {
    if (this.#sys.watcher) return Promise.resolve(this.#sys.watcher)
    this.logger.trace('boot.sequence.fsdata.watch.start')
    if (typeof this.webConfig.watch === 'object') {
      const watch_path = [this.pathToApp, this.webConfig.watch.path ?? ''].join('/')
      const watcher = watch(this.pathToApp, { recursive: true }, (event, filename) => {
        this.logger.data({ event, filename }).info('fs.watch.reload')
        this.loadAllRoutes()
      })
      this.#sys.watcher = watcher
      process.on('exit', this.onTerminate)
      process.on('SIGINT', this.onTerminate)
      process.on('SIGTERM', this.onTerminate)
      this.logger.receiveTermSignals = true
    }
    return Promise.resolve(this.#sys.watcher)
  }

  async onTerminate() {
    await this.#sys.watcher?.close()
    await pragma.logger.onTerminate()
    process.exit(0)
  }

  get pathToRepo() { this.#paths.repo ??= this.#config.appRoot.split(/\/(?:app|dist)\/?/)[0]; return this.#paths.repo }
  get pathToApp() { this.#paths.app ??= this.#config.appRoot ?? this.#paths.repo + '/app/' + this.appName; return this.#paths.app }

  appPathFor(...ptrkeys) {
    console.log('appPathFor', ptrkeys)
    this.logger.data({ ptrkeys }).trace('boot.sequence.fsdata.app.path')
    // returns one or more paths based on the app's configuration
    const path_values = ptrkeys.reduce((acc, key) => acc[key] ?? {}, this.#config.routes)
    if (!path_values || path_values.size < 1) return Promise.resolve([])
    const app_prefix = this.pathToApp + `/${this.#config.routes.prefix ?? '/'}`
    const paths = (Array.isArray(path_values)) ? path_values : [path_values]
    return paths.map(path => [app_prefix, path].join('/').replaceAll(/\/+/g, '/'))
  }

  pageRouting() { // JSX view paths ('pages routing')
    this.logger.trace('boot.sequence.pagesrouting.load.start')
    const dir = this.appPathFor('views')?.shift()
    // potential enhancement: allow for multiple view directories? this would be annoying though.
    this.#routes.pages = (dir.length > 0) ? Bun.FileSystemRouter({ style: 'nextjs', dir }) : undefined
    this.logger.data({ dir }).trace('boot.sequence.pagesrouting.load.end')
    return this.#routes.pages
  }

  async layout() {
    if (this.#routes.layout) return this.#routes.layout
    if (!this.#routes.pages) await this.pageRouting()
    const layoutPath = this.appPathFor('views')?.shift() + '/_layout'
    await import(layoutPath).then((layout_import) => {
      this.#routes.layout = layout_import.default ?? layout_import.Layout ?? layout_import
    }).catch((e) => {
      this.logger.data({ layoutPath, error: e }).error('layout.load.error')
    })
    return this.#routes.layout
  }

  async dirExists(dir) { return (await $`[[ -d ${dir} ]] && echo 'exists'`.text()?.trim?.()) === 'exists' }
  async fileExists(file) { return (await $`[[ -f ${file} ]] && echo 'exists'`.text()?.trim?.()) === 'exists' }
  async allFilesInPath(dir) {
    if (!dir.startsWith('/')) dir = `${this.appRoot}/${dir}`
    if (!await this.dirExists(dir)) return []
    return (await $`find ${dir} -type f`.text()).split(/\n/).filter(f => f.length > 0 && /\w/.test(f))
  }

  async staticFiles(dir) { // may be replaceable by fsrouting - see bun docs on assets
    const _ptrlst = neo(this.appPathFor('static', 'paths'))
    if (_ptrlst.length === 0) return Promise.resolve([])
    const _paths = _ptrlst.map(async (path) => await this.allFilesInPath(path))
    return neo(await Promise.allSettled(_paths)).flatten
  }

  async staticRouting() {
    const _flattened = await this.staticFiles()
    this.logger.data({ static: _flattened.array }).info('static.files')
    this.#routes.static = _flattened.reduce(async (acc, file) => {
      console.log('Static file', file)
      try {
        const f = Bun.file(file)
        // key value should only be the path within the app
        const key = file.replace(this.pathToApp, '')
        acc[key] = new Response(f.read(), { headers: { 'Content-Type': f.mimetype } })
      } catch (error) { this.logger.data({ file, error }).error('static.file.cannot_load') }
      return acc
    }, {})
    return Promise.resolve(this.#routes.static)
  }


  async namedRouting() {
    pragma.logger.trace('boot.sequence.namedroutes.load.start')
    const _namedroutes = await this.appPathFor('routes', 'named')
    const _this = this
    const _neoroutes = neo(_namedroutes).compact.filter((path) => _this.fileExists(path))
    if (_neoroutes.length === 0) return Promise.resolve([])
    const _routes = _neoroutes.map(async (path) => await import(path).then(({ routes }) => routes))
    pragma.logger.data({ namedroutes: _routes }).trace('boot.sequence.namedroutes.load.end')
    this.#routes.defined = await Promise.allSettled(_routes).then((results) => results.map((r) => r.value)).catch(e => [])
    this.#routes.defined = this.#routes.defined.filter(r => r)
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
      await this.staticRouting(),
      await this.initFSWatch(),
      await this.namedRouting()
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