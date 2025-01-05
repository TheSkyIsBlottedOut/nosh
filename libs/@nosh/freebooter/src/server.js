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
    console.log('[BOOT] setting up BunServer...')
    this.#config = configdata
    this.#bunconfig = new Freebooter(configdata)
    console.log('[BOOT] BunServer setup complete')
  }

  get pathToRepo() { return this.#bunconfig.pathToRepo }
  get pathToApp() { return this.#config.appRoot ?? this.#bunconfig.pathToApp }
  get config() { return { ...this.#config } }

  async preloadService() {
    console.log('[BOOT] Preloading service')
    await $`cd ${this.pathToApp}`
    await this.#bunconfig.loadAllRoutes()
    console.log('[BOOT] Service preloaded')
    return this
  }

  apiRouteFor(path) {
    this.logger.data({ path }).trace('api.route.search')
    const defined = this.#bunconfig.routes.defined.map(path => path.split('/'))
    // reverse interpolate - find routes whose static components match their :prefixed components and have the same number of arguments.
    const path_parts = path.split('/')
    const possible_paths = defined.filter(route => route.length === path_parts.length && route.every((part, idx) => part.startsWith(':') || part === path_parts[idx]))
    if (possible_paths.length === 0) return undefined
    return possible_paths[0]
  }

  async start() {
    console.log('[BOOT] Bunserver.start')
    await this.initServer()
    console.log('preloadService')
    await this.preloadService()
    console.log('#server.start')
    await this.#server.start()
    console.log('Server started')
    pragma.logger.info(`Service application ${this.config.name} started on port ${port}`)
  }

  respond(rval) {
    return new Response(rval)
  }

  async initServer() {
    console.log('[BOOT] Actually running Bun.serve')
    this.#server = Bun.serve({
      port: this.#config.port ?? 7070,
      static: this.#bunconfig.routes.static,
      logger: this.#bunconfig.logger,
      async fetch(req) {
        return this.respond('Hi')
        const log = O_O.curry(pragma.logger.withRequest(req))
        console.log('[SERVER] Fetching request', req.url)
        log.trace('request.start')
        const { pathname, searchParams } = new URL(req.url)
        // is this an FS route, or is it defined as an api route?
        const api_route = this.apiRouteFor(pathname)
        if (api_route) {
          log.data({ api_route }).trace('api.route.found')
          // right now we're ignoring middleware configs, and maybe middleware?
          const { handler, method } = api_route
          return await this.handleApiRequest(req, { handler, method })
        } else if (this.#bunconfig.routes.static && this.#bunconfig.routes.static.findFirst(pathname)) {
          log.data({ pathname }).trace('static.route.found')
          return this.#bunconfig.routes.static[pathname] ?? new Response('Not Found', { status: 404, pathname })
        } else if (this.#bunconfig.routes.pages && this.#bunconfig.routes.pages.match(pathname)) {
          log.data({ pathname }).trace('pages.route.found')
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