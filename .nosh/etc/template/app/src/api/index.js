import { UserAuth } from './user/auth'
const routes = []
const R = (path, options = { method: 'get'}) => {
  const method = options.method ?? 'get'
  routes.push({ ...options, method, path })
}

R('users/auth', UserAuth.validate)