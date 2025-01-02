import { system } from './system';

const routes = []
const R = (path, routerobj, method = 'get') => {
  routes.push({ ...routerobj, method, path })
}

R('/system/heartbeat', system.heartbeat)


export { routes }