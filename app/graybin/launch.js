import cfg from './src/etc/app.json'
import { BunServer } from '@nosh/freebooter'
console.log('Starting server (check http://localhost:3000 if it just freezes, it does that)')
const server = new BunServer(cfg)
server.initServer()
  .then(() => server.start())
  .catch(e => console.error(e))
  .then(console.log('Server started on port', server.config.port))