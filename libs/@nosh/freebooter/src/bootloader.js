import * as Neo from 'neoclassical'
import { pragma } from './pragma'
import { $ } from 'bun'

class Freebooter {

  constructor(config) {
    this.config = config || {}
    this.app = config.name ?? 'app'
    this.logger = new Logger(this.app)
    this.approot = null
    this.router = { pages: null, static: null, defined: null }
    this.pragma = pragma
    this.logger.config(this.config.logger || {})
    this.logger.info('boot.sequence.initiated')
  }

  async loadFSData() {
    this.logger.info('boot.sequence.fsdata.load.start')
    this.repoRoot = process.env.Nosh_AppDir || (await $`git rev-parse --show-toplevel`).text().trim()
    this.appRoot = `${this.repoRoot}/apps/${this.app}`
    this.logger.log('info', 'boot.sequence.fsdata.load.end')
  }

  pageRouting() {
    // this is where we'll set up the filesystem routing for jsx pages
    if (!this.config?.routes?.views) return
    this.router.pages ??= Bun.FileSystemRouter({ style: 'nextjs', dir: `${this.appRoot}/${this.config.routes.views}` })
  }

  async readDir() {
    const _cfgptr = this.config.routes.static.paths
    const _ptrlst = isArray(_cfgptr) ? _cfgptr : [_cfgptr]
    const _absdir = _ptrlst.map(ptr => `${this.appRoot}/${ptr}`)
    const _files = await Promise.all(_absdir.map(async dir => { return [dir, (await $`ls -l "${dir}.*s" | tr ' ' '\n'`.text()).split(/\n/)] }).then(async ([dir, files]) => { return files.map(file => `${dir}/${file}`) }))
    return _files.flat()
  }

  async staticRouting() {
    if (!this.config?.routes?.static?.paths) return []
    const _cfgptr = this.config.routes.static.paths
    const _ptrlst = isArray(_cfgptr) ? _cfgptr : [_cfgptr]
    const _absdir = _ptrlst.map(ptr => `${this.appRoot}/${ptr}`)
    const _files = await Promise.all(_absdir.map(async dir => { return [dir, await readdir(dir)] }).then(async ([dir, files]) => { return files.map(file => `${dir}/${file}`) }))
    const _flattened = _files.flat()
    this.logger.data({ _flattened }).info('static.files')
    this.router.static = _flattened.reduce(async (acc, file) => {
      const responsevalue = await Bun.file(file).read()
      acc[file] = new Response(responsevalue, { headers: { 'Content-Type': 'text/json' } })
      return acc
    }, {})
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

  async namedRouting() {
    this.logger.log('info', 'boot.sequence.namedroutes.load.start')
    if (Array.isArray(this.router.defined)) return this.router.defined
    if (!this.config?.routes?.named?.paths) return []
    if (!Array.isArray(this.config?.routes?.named?.paths)) return []
    const rps = this.config.routes.named.paths.map(path => `${this.appRoot}/${path}`)
    const rs = rps.map(async (path) => { return await import(path).then(({ routes }) => routes) })
    this.router.defined = await Promise.allSettled(rs).then(r => this.seek(...r)).then(a => a.flat())
    this.router.defined.forEach(route => { const { path, method } = route; this.logger.data({ path, method }).info('route.load') })
    return this.router.defined ?? []
  }

  seek(...target) {
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
    this.pageRouting()
    this.staticRouting()
    await this.namedRouting()
    this.logger.log('info', 'boot.sequence.routes.load.end')
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
