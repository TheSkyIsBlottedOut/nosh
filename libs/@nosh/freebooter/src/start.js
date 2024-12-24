import { O_O } from 'unhelpfully'
import * as Neo from 'neoclassical'
import { Logger } from 'logn'


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
\
  pageRouting() {
    // this is where we'll set up the filesystem routing for jsx pages
    Bun.FileSystemRouter({
      style: 'nextjs',
      dir: `${this.appRoot}/${this.config.routes.views}`
    })
  }

  staticRouting() {
    // this is where we'll set up the static routing for public files
    Bun.StaticRouter({
      dir: `${this.appRoot}/${this.config.routes.static}`
    })
  }

  definedRoutes() {
    // this is where a route will map to a predefined function or Bun.file/Bun.jsx call.
    // the config's routes object should have a single export with json objects:
    // { path: '/route/:param', method: 'GET', handler: fn, preflights?: [fn1, fn2],
    //    unauthenticated: bool, withoutApiKey: bool, preflights: ['id', 'token', 'querystring'] }
    // the handler function can be async and return a promise

    if (this.config.routes.api) {
      // iterate over the api routes and set them up
    }
  }



}
