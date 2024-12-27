/* Use this as your Bun.serve args */
import { Freebooter }  from './bootloader.js'
import Bun, { $ } from 'bun'
import { O_O } from 'unhelpfully'
class BunServer {
  constructor(config_path) {
    this.paths = O_O.obj
    this.paths.config = config_path
    const sigdirs = $.path(this.paths.config).dirname.match(/^(\/(?<fullpath>.*)\/(?<repo>[^\/]+)\/app\/(?<appname>[^\/]+)/).groups
    this.paths.parent = sigdirs.fullpath
    this.paths.repo = sigdirs.repo
    this.paths.appname = sigdirs.appname
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

  async initServer() {
    return Bun.serve({
      port: 


    })
  }


}