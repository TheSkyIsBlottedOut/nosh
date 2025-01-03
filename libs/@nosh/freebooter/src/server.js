/* Use this as your Bun.serve args */
import { Freebooter } from './bootloader'
import Bun, { $ } from 'bun'
import { O_O } from 'unhelpfully'
import { handleApiRequest } from './helpers'



class BunServer {
  #config = O_O.obj
  #bunconfig = O_O.obj
  #server = Bun.serve({fetch: async () => {}})
  constructor(configdata) {
    this.#config = configdata
    this.#bunconfig = new Freebooter(configdata)
  }

  get pathToRepo() { return this.#bunconfig.pathToRepo }
  get pathToApp() { return this.#bunconfig.pathToApp }
  get config() { return { ...this.#config } }

  async navToApp() { await $`cd ${this.pathToApp}` }

  async preloadService() {
    await this.navToApp()
    await this.#bunconfig.loadAllRoutes()
    return this
  }

  apiRouteFor(path) {
    const { defined } = this.#bunconfig.routes
    // replace all :interpolations with [^\/]+
    // todo: optionals
    const matching_paths = defined.filter(route => new RegExp(route.replace(/:\w+/g, '[\w\-\.+]')).test(path))
    if (matching_paths.length > 0) return matching_paths[matching_paths.length - 1]
    return null
  }

  async start() {
    await this.initServer(port = null)
    port ??= this.config.port
    await this.#server.start({ port })
    pragma.logger.info(`Service application ${this.config.name} started on port ${port}`)
  }

  async initServer() {
    this.#server = Bun.serve({
      port: this.#config.port ?? 7070,
      static: this.#bunconfig.routes.static,
      fetch: async (req) => {
        const { pathname, searchParams } = new URL(req.url)
        // is this an FS route, or is it defined as an api route?
        const api_route = this.apiRouteFor(pathname)
        if (api_route) {
          // right now we're ignoring middleware configs
          const { handler, method } = api_route
          return await this.handleApiRequest(req, { handler, method })
        } else if (this.#bunconfig.routes.static && this.#bunconfig.routes.static.findFirst(pathname)) {
          return this.#bunconfig.routes.static[pathname]
        } else if (this.boot.router.pages && this.boot.router.pages.match(pathname)) {
          return this.boot.router.pages[pathname]
        } else {
          return
        }
      }
    })
  }
}

export { BunServer }