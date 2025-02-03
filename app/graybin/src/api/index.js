/*
  This is the named export target for API routes.
  Use this folder to implement API routes and use this file to export them.
*/
import { system } from './system';

const routes = []
const R = (path, routerobj, method = 'get') => {
  routes.push({ ...routerobj, method, path })
}

R('/system/heartbeat', system.heartbeat)


export { routes }