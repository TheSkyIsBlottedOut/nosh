/* Use this as your Bun.serve args */
import { Freebooter } from './bootloader'
import Bun, { $ } from 'bun'
import { O_O } from 'unhelpfully'
import { handleApiRequest, handleFSRouterRequest, NeoRequest } from './helpers'


class BunServer {
  #config = O_O.obj
  #bunconfig = O_O.obj
  #server = Bun.serve({ fetch: async () => { } })
  constructor(configdata) {
    this.#config = configdata
    this.#bunconfig = new Freebooter(configdata)
    this.logger.trace('[BOOT] BunServer setup complete')
  }

  get pathToRepo() { return this.#bunconfig.pathToRepo }
  get pathToApp() { return this.#config.appRoot ?? this.#bunconfig.pathToApp }
  get config() { return this.#bunconfig.config }
  get logger() { return this.#bunconfig.logger }

  async preloadService() {
    console.log('[BOOT] Preloading service')
    await $`cd ${this.pathToApp}`
    await this.#bunconfig.loadAllRoutes()
    console.log('[BOOT] Service preloaded')
    return this
  }

  apiRouteFor(path) {
    if (!path || !Array.isArray(this.#bunconfig.routes.defined) || this.#bunconfig.routes.defined.length === 0) return undefined
    console.log(this.#bunconfig.routes.defined)
    this.logger.data({ path }).trace('api.route.search')
    const defined = this.#bunconfig.routes.defined?.map(path => path.split('/'))
    // reverse interpolate - find routes whose static components match their :prefixed components and have the same number of arguments.
    const path_parts = path.split('/')
    const possible_paths = defined.filter(route => route.length === path_parts.length && route.every((part, idx) => part.startsWith(':') || part === path_parts[idx]))
    if (possible_paths.length === 0) return undefined
    return possible_paths[0]
  }

  get pagerouter() { return this.#bunconfig.routes.pages }

  async start() {
    this.logger.info('starting.service')
    await this.preloadService()
    await this.initServer()
  }

  async initServer() {
    const wconfig = this.#bunconfig.webConfig
    this.#server = Bun.serve({
      port: wconfig.port ?? 3000,
      host: wconfig.host ?? 'localhost',
      static: {
        ...this.#bunconfig.routes.static,
        '/nosh/heartbeat': new Response('ok', { status: 200 })
      },
      logger: this.logger.info,
      fetch: async (request) => {
        const req = new NeoRequest(request)
        const log = this.logger.withRequest(req)
        console.log('[SERVER] Fetching request', req.url)
        log.trace('request.start')
        const { pathname, searchParams } = new URL(req.url)
        // is this an FS route, or is it defined as an api route?
        // API routes are slower to resolve, so we check them last
        const page_result = await handleFSRouterRequest(req, this.pagerouter)
        if (page_result) return page_result
        const api_route = this.apiRouteFor(pathname) // these can probably go into statics
        if (!api_route) return new Response('Not Found', { status: 404 })
        return await handleApiRequest(req, api_route)
      }
    })
  }
  get server() { return this.#server }
}

export { BunServer }