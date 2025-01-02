import cfg from './src/etc/app.json'
import { BunServer } from '@nosh/freebooter'

const server = new BunServer(cfg)
server.initServer().then(() => server.start()).catch(e => console.error(e))