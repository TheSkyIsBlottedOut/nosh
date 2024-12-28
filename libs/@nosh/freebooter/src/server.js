/* Use this as your Bun.serve args */
import { Freebooter }  from './bootloader.js'
import Bun, { $ } from 'bun'
import { O_O } from 'unhelpfully'
import { readdir } from 'node:fs/promises'
import { handleApiRequest } from './helpers'
class BunServer {
  constructor(config_path) { // relative to app dir!
    this.paths = O_O.obj
    this.paths.config = /^\//.test(config_path) ? config_path : $.path(`${this.boot.appRoot}/${config_path}`)
    (/^(\/.*?)\/([^\/]+)\/app\/([^\/]+)/i).test(this.paths.config)
    this.paths.parent = $1
    this.paths.repo = $2
    this.paths.appname = $3
  }

  get pathToRepo(){ return [this.paths.parent, this.paths.repo].join('/') }
  get pathToApp(){ return [this.paths.parent, this.paths.repo, 'app', this.paths.appname].join('/') }


  async loadConfig() { this.config = await import(this.paths.config, { type: 'json' }).then(({ default: config }) => config) }
  async navToApp() { await $`cd ${this.pathToApp}` }
  async preloadService() {
    await this.loadConfig()
    await this.navToApp()
    this.boot = new Freebooter(this.config)
    await this.boot.loadAllRoutes()
    return this
  }

  apiRouteFor(path) {
    const { defined } = this.boot.router
    // replace all :interpolations with [^\/]+
    // todo: optionals
    const matching_paths = defined.filter(route => { return new RegExp(route.path.replace(/:\w+/g, '[^\/]+')).test(path) })
    if (matching_paths.length > 1) {
      // lifo
      return matching_paths.pop()
    } else if (matching_paths.length === 1) {
      return matching_paths[0]
    } else {
      return null
    }
  }

  async start() {
    await this.initServer()
    await this.#server.start({ port: this.config.port })
    pragma.logger.info(`Server started on port ${this.config.port}`)
  }

  async initServer() {
    this.#server = Bun.serve({
      port: this.config.port,
      static: this.boot.router.static,
      fetch: (req) => {
        const { pathname, searchParams } = new URL(req.url)
        // is this an FS route, or is it defined as an api route?
        const api_route = this.apiRouteFor(pathname)
        if (api_route) {
          // handle middleware :D
          const { handler, method } = api_route
          return await handleApiRequest(req, api_route)
        } else if (this.boot.router.pages && this.boot.router.pages.match(pathname)) {
          return this.boot.router.pages[pathname]
        }
      }
    })
  }
}