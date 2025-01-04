/* Use this as your Bun.serve args */
import { Freebooter } from './bootloader'
import Bun, { $ } from 'bun'
import { O_O } from 'unhelpfully'
import { handleApiRequest, handleFSRouterRequest } from './helpers'



class BunServer {
  #config = O_O.obj
  #bunconfig = O_O.obj
  #server = Bun.serve({fetch: async () => {}})
  constructor(configdata) {
    console.log('[BOOT] Initializing server, which gives all the work to Freebooter')
    this.#config = configdata
    this.#bunconfig = new Freebooter(configdata)
  }

  get pathToRepo() { return this.#bunconfig.pathToRepo }
  get pathToApp() { return this.#bunconfig.pathToApp }
  get config() { return { ...this.#config } }

  async navToApp() { await $`cd ${this.pathToApp}` }

  async preloadService() {
    console.log('[BOOT] Preloading service')
    await this.navToApp()
    await this.#bunconfig.loadAllRoutes()
    console.log('[BOOT] Service preloaded')
    return this
  }

  apiRouteFor(path) {
    console.log('[ROUTER] Finding route for', path)
    const { defined } = this.#bunconfig.routes
    // replace all :interpolations with [^\/]+
    // todo: optionals
    const matching_paths = defined.filter(route => new RegExp(route.replace(/:\w+/g, '[\w\-\.+]')).test(path))
    if (matching_paths.length > 0) return matching_paths[matching_paths.length - 1]
    return null
  }

  async start() {
    console.log('[BOOT] Starting server')
    await this.initServer(port = null)
    port ??= this.config.port
    await this.#server.start({ port })
    pragma.logger.info(`Service application ${this.config.name} started on port ${port}`)
  }

  async initServer() {
    console.log('[BOOT] Actually running Bun.serve')
    this.#server = Bun.serve({
      port: this.#config.port ?? 7070,
      static: this.#bunconfig.routes.static,
      async fetch(req) {
        console.log('[SERVER] Fetching request', req.url)
        this.#bunconfig.logger.withRequest(req).info("request.start")
        const { pathname, searchParams } = new URL(req.url)
        // is this an FS route, or is it defined as an api route?
        const api_route = this.apiRouteFor(pathname)
        if (api_route) {
          // right now we're ignoring middleware configs, and maybe middleware?

          const { handler, method } = api_route
          return await this.handleApiRequest(req, { handler, method })
        } else if (this.#bunconfig.routes.static && this.#bunconfig.routes.static.findFirst(pathname)) {
          return this.#bunconfig.routes.static[pathname]
        } else if (this.#bunconfig.routes.pages && this.#bunconfig.routes.pages.match(pathname)) {
          return handleFSRouterRequest(this.#bunconfig.router.pages[pathname]) ?? new Response('Not Found', { status: 404 })
        } else {
          return new Response('Not Found', { status: 404 })
        }
      }
    })
  }

  get server() { return this.#server }
}

export { BunServer }