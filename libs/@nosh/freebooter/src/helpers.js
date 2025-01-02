import { pragma } from './pragma'
import { isBot, blockUnsafe } from './botless'
// create helpers for a bun request

/* test string will be something like 'auth_id' or 'auth.id' or 'auth-id-token'.
that means to check:
  capitalized and lowercase headers: n-auth-id, N-Auth-Id, n_auth_id, N_Auth_Id
  query params: auth_id, auth:id, auth-id, auth.id, auth_id_token, auth-id-token, auth.id.token, authIdToken

    body: { auth: { id }, auth: { id: token }, auth: { id_token } }
    path params: /:auth_id or /:auth_id_token
  cookies: auth_id, auth_id_token, auth_id_token, auth.id.token, auth-id-token, auth:id:token, auth|id|token
*/

const multisource = (req, ...possible_keys) => {
  // body is appended to the request object and curried for the helper.
  const { Case } = pragma.Neo
  while (response === null && possible_keys.length > 0) {
    const possible = new pragma.Neo.NString(possible_keys.shift())
    const cvt = !!(/^[a-zA-Z]+$/.test(possible))
    // don't convert cvt values to other cases
    testvals = cvt ? [possible] : Case.types.map(type => Case.convert(possible, type))
    const test = (obj) => !!(typeof obj === 'string' && obj.length > 0)
    testvals.forEach(t => {
      t = t.toLowerCase()
      for (hdr of [`N-${t}`, `n-${t}`, `X-${t}`, `x-${t}`]) {
        if (test(req.headers[hdr])) return req.headers[hdr]
      }
      for (loc of ['params', 'query', 'cookies']) {
        if (test(req[loc][t])) return req[loc][t]
      }
      const body = await req.json() ?? {}
      if (body && test(body[t])) return body[t]
    })
  }
  return null
}

const identify = (req) => {
  const ids = O_O.fn.obj
  const host_segments = req.hostname.split('.')
  const host = O_O.fn.obj
  if (host_segments.length > 3) {
    if (host_segments[host_segments.length - 2] == 'co') {
      const tld = host_segments.pop(), coco = host_segments.pop()
      host.tld = `${coco}.${tld}`
    } else {
      host.tld = host_segments.pop()
    }
    host.domain = host_segments.pop()
    host.subdomain = host_segments.join('.')
  }
  const appname = [host.subdomain, host.domain].join('-')
  ids.auth = multisource(req, 'auth', 'nauth', `${appname}-auth`, `${appname}-nauth`)
  ids.client = multisource(req, 'client', 'nclient', `${appname}-client`, `${appname}-nclient`)
  ids.user = multisource(req, 'user', 'nuser', `${appname}-user`, `${appname}-nuser`)
  ids.session = multisource(req, 'session', 'nsession', `${appname}-session`, `${appname}-nsession`)
  ids.request = req.headers['x-request-id'] ?? req.headers['X-Request-Id'] ?? req.headers['n-request-id'] ?? req.headers['N-Request-Id'] ?? pragma.uuid()
  ids.apikey = multisource(req, 'api key', 'apikey', 'utility-identifier')
  ids.superuser = multisource(req, 'vainglory')
  return ids
}

class ResponseBuilder {
  constructor() {
    this.#status = 200
    this.#message = 'response.complete'
    this.#data = {}
  }
  data(dobj) {
    if (typeof dobj !== 'object') return this.#data
    this.#data = Object.assign(this.#data, dobj)
    return this
  }
  status(stat) {
    this.#status = stat
    return this
  }

  message(msg) {
    this.#message = msg
    return this
  }

  get payload() {
    return { status: this.#status, message: this.#message, data: this.#data }
  }

  get response() { return new Response.json(this.payload) }
  get end() { return this.response }
}


// preflight checks are a way to ensure that the request has the necessary data to proceed
// you can set preflights in a few different ways to check for data in the request
// [[ 'exists', 'body', 'data', 'id' ],
// ['params', 'id']
// ['client-id', 'user-id', 'session-id'] // assumes an exist check on multisource
const PreflightLocations = ['params', 'query', 'body', 'headers', 'cookies', 'identifiers', 'multisource']
const preflightChecks = (req, preflights, idents) => {
  if (!Array.isArray(preflights[0])) preflights = [preflights]
  const validator = { success: true, errors: [], preflights: {} }
  for (keys of preflights) {
    var location = null
    if (keys[0] === 'exists') keys.shift() // this is the only test we're doing atm
    if (PreflightLocations.includes(keys[0])) location = keys.shift()
    let keyval = undefined
    for (key of keys) {
      keyval = ((!!location) ? req[location]?.[key] : idents[key]) ?? multisource(req, key)
      if (!keyval) validator.errors.push({ location, key, message: 'key not found' })
      validator.preflights[key] = keyval
    }
  }
  if (validator.errors.length > 0) validator.success = false
  return validator
}

export const bruteForceAppRoot = async (req) => {
  if (!!process.env.Nosh_AppRoot) return process.env.Nosh_AppRoot
  const path_with_nosh = await $`FPT='.' && cd ${import.meta.dirname} && while [[ ! -d $FPT/.nosh && $(realpath "$FPT") != "/" ]]; do FPT="$FPT/.."; done && echo "$(realpath "${FPT}")"`.text().trim()
  if (path_with_nosh == '/') return null
  return path_with_nosh
}

const findNoshBin = async (req) => {
  if (!!process.env.Nosh_BinDir) return [process.env.Nosh_BinDir, 'nosh'].join('/')
  const approot = await bruteForceAppRoot(req)
  if (!approot) return null
  return [approot, '.nosh/bin/nosh'].join('/')
}


const createHelpers = async (req) => {
  const body = await req.json() ?? {}
  const req_with_body = Object.assign(req, { body })
  const retval = {
    body, req, req_with_body,
    _nosh: await findNoshBin(req),
    nosh: async (cmd) => await $`${retval._nosh ?? 'nosh'} ${cmd}`.then(r => { return { text: r.text(), logout: r.stderr } }).catch(errors => ({errors})),
    identifiers: identify(req_with_body),
    multisource: O_O.fn.curry(multisource, req_with_body),
    log: pragma.logger.withRequest(req_with_body).withRequestId(idents.request),
    res: new ResponseBuilder(),
    success: new ResponseBuilder().status(200),
    error: new ResponseBuilder().status(500),
  }
  return retval
}

const handleApiRequest = async (req, requesthandlerdefintion) => {
  // expand request, do preflights, log, call endpoint, validate response
  const helpers = await createHelpers(req)
  const { handler, preflights, unauthenticated, withoutApiKey, bots, cors } = requesthandlerdefintion
  if (cors && req.method === 'OPTIONS') return helpers.respond('ok')
  if (!cors && req.method === 'OPTIONS') return helpers.res.status(405).message('method not allowed').response
  if (unauthenticated && helpers.identifiers.auth) return helpers.res.status(401).message('unauthenticated').response
  if (!unauthenticated && !helpers.identifiers.auth) return helpers.res.status(401).message('unauthenticated').response
  if (!withoutApiKey && !helpers.identifiers.apikey) return helpers.res.status(401).message('unauthenticated').response
  if (bots && isBot(req)) return helpers.res.status(403).message('forbidden').response
  const pfvalidator = preflightChecks(req, preflights, helpers.identifiers)
  if (!pfvalidator.success) return helpers.res.status(400).message('bad request').data(pfvalidator).response
  if (blockUnsafe(req)) return helpers.res.status(403).message('forbidden').response
  helpers.log.info('request.start', { request: req })
  const response = await handler({ helpers, pragma, req, preflights: pfvalidator.preflights })
  if (!response) return helpers.res.status(500).message('internal server error').response
  if (!response instanceof Response && response instanceof Object) return helpers.res.status(200).data(response).response
  if (!response instanceof Response) return helpers.res.status(500).message('no response').response
  helpers.log.info('request.end', { response })
  return response
}

const Pages = new Map()

const handleFSRouterRequest = async (req, fsrouter) => {
  const helpers = await createHelpers(req)
  const uri = req.uri
  // auth states must be handled internally; we will just pass the helpers along
  if (!fsrouter.match(req)) return helpers.res.status(401).message('page.not.found').end
  if (Pages.get(req.path)) {
    return Pages.get(req.path)(req, helpers)
  } else {
    const page = await fsrouter.getPage(req)
    Pages.set(req.path, page)
    return page({ req, helpers, pragma })
  }
}

export { handleApiRequest }