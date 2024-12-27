import * as Neo from 'neoclassical'
import { pragma } from 'pragma'

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

class Freebooter {
  constructor(config) {
    this.config = config
    this.app = config.name
    this.logger = new Logger(this.app)
    this.router = O_O.fn.obj
    this.pragma = pragmas
    this.logger.config = config.logger
    this.logger.log('info', 'boot.sequence.initiated')
  }

  async loadFSData() {
    this.logger.log('info', 'boot.sequence.fsdata.load.start')
    this.repoRoot = await this.findRepoRoot
    this.appRoot = `${this.repoRoot}/apps/${this.app}`
    this.logger.log('info', 'boot.sequence.fsdata.load.end')
  }
  async get findRepoRoot() {
    return process.env.Nosh_AppDir || (await $`git rev-parse --show-toplevel`).text().trim()
  }

  pageRouting() {
    // this is where we'll set up the filesystem routing for jsx pages
    this.router.pages ??= Bun.FileSystemRouter({
      style: 'nextjs',
      dir: `${this.appRoot}/${this.config.routes.views}`
    })
  }

  staticRouting() {
    if (this.router.static) return this.router.static
    if (!this.config.routes.static) return { dir: `${this.appRoot}/public` }
    this.router.static ??= Bun.StaticRouter({
      dir: `${this.appRoot}/${this.config.routes.static}`
    })
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
    if (!!this.router.defined) return this.routes.defined
    if (this.config.routes.named && Array.isArray(this.config.routes.named.paths)) {
      const routesources = this.config.routes.named.paths.map(async path => {
        const source = await import(`${this.appRoot}/${path}`).then(({ routes }) => routes)
        return source
      }
      this.router.defined = await Promise.allSettled(routesources).then(results => this.seek(...results)).then(routedefs => routedefs.flat())
      this.router.defined.forEach(route => { this.logger.info('route.named.discovered', { path: route.path, method: route.method }) })
    }
    return this.router.defined
  } else { return [] }

  seek(...target) {
    return target.map(t => {
      if (typeof t !== 'object' || Object.keys(t).length < 3) return
      if (Array.isArray(t)) return this.seek(...t)
      const keys = Object.keys(t)
      const results = []
      keys.forEach(key => (['handler', 'method', 'path'].includes(key)) ? results.push(t) : return this.seek(Object.values(t[key])))
      return results
    })
  }

  async loadRoutes() {
    this.logger.log('info', 'boot.sequence.routes.load.start')
    this.pageRouting()
    this.staticRouting()
    this.logger.log('info', 'boot.sequence.routes.load.end')
  }




}
