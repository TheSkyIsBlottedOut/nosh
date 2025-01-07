import { pragma } from './pragma'
import { isBot, blockUnsafe } from './botless'
const { O_O } = pragma
// create helpers for a bun request

/* test string will be something like 'auth_id' or 'auth.id' or 'auth-id-token'.
that means to check:
  capitalized and lowercase headers: n-auth-id, N-Auth-Id, n_auth_id, N_Auth_Id
  query params: auth_id, auth:id, auth-id, auth.id, auth_id_token, auth-id-token, auth.id.token, authIdToken

    body: { auth: { id }, auth: { id: token }, auth: { id_token } }
    path params: /:auth_id or /:auth_id_token
  cookies: auth_id, auth_id_token, auth_id_token, auth.id.token, auth-id-token, auth:id:token, auth|id|token
*/


class NeoRequest {
  #request = {}
  #headers = {}
  #body = {}
  constructor(req) {
    this.#request = (req instanceof NeoRequest) ? req.originalRequest : req
    this.#headers = Object.fromEntries(this.#request.headers.entries())
    this.#body = (typeof this.#request.body === 'object') ? this.#request.body : (typeof this.#request.json === 'function') ? this.#request.json() : {}
  }
  get originalRequest() { return this.#request }
  get headers() { return this.#headers }
  get params() { return this.#request.params }
  get query() { return this.#request.query }
  get cookies() { return this.#request.cookies }
  get body() { return this.#body }
  get json() { return this.#request.json }
  get url() { return this.#request.url }
  get method() { return this.#request.method }
  get uri() { return O_O.fn.dissectUrl(this.url) }
  get path() { return this.uri.pathname }
  get host() { return this.uri.host }
  get ip() { return this.#request.connection.remoteAddress }
  get protocol() { return this.#request.protocol }
  get secure() { return this.protocol === 'https' }
  get origin() { return this.headers.origin }
  get referer() { return this.headers.referer }
  get userAgent() { return this.headers['user-agent'] }
  get accept() { return this.headers.accept }
  get acceptLanguage() { return this.headers['accept-language'] }
  get acceptEncoding() { return this.headers['accept-encoding'] }
  get acceptCharset() { return this.headers['accept-charset'] }
  get acceptType() { return this.headers['accept-type'] }
  get auth() { return this.headers.authorization }
}

const test = (val) => (val !== null && val !== undefined && val !== '')
const { Case } = pragma

const multisource = (req, ...possible_keys) => {
  // body is appended to the request object and curried for the helper.
  let response = null
  const body = (typeof req.body === 'object') ? req.body : (typeof req.json === 'function') ? req.json() : {}
  const all_variations = possible_keys.filter(t => typeof t === 'string').map(k => Case.variations(k)).flat()
  while (response === null && all_variations.length > 0) {
    const t = all_variations.shift()
    if (!t || typeof t !== 'string' || t.length < 1) continue
    for (hdr of [t, `N-${t}`, `X-${t}`]) {
      if (test(req.headers[hdr])) return req.headers[hdr]
      if (test(req.headers[hdr.toLowerCase()])) return req.headers[hdr.toLowerCase()]
    }
    for (loc of ['params', 'query', 'cookies']) {
      if (test(req[loc]?.[t])) return req[loc][t]
    }
    if (test(body[t])) return body[t]
  }
  return null
}


const identify = (req) => {
  const ids = O_O.fn.obj
  const host_segments = req.host.split('.')
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
  ids.host = host
  ids.auth = multisource(req, 'auth', 'nauth', `${appname}-auth`, `${appname}-nauth`)
  ids.client = multisource(req, 'client', 'nclient', `${appname}-client`, `${appname}-nclient`)
  ids.user = multisource(req, 'user', 'nuser', `${appname}-user`, `${appname}-nuser`)
  ids.session = multisource(req, 'session', 'nsession', `${appname}-session`, `${appname}-nsession`)
  ids.request = multisource(req, 'request-id') ?? Bun.randomUUIDv7()
  ids.apikey = multisource(req, 'api key', 'apikey', 'utility-identifier')
  // todo: define a superuser key for higher-level access from configs
  return ids
}

class ResponseBuilder {
  #status = 200
  #message = 'response.complete'
  #data = Object.create({})
  constructor() {
    console.log('[RESPONSE] Generating Response Builder')
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

export const bruteForceAppRoot = async (req) => await pragma.repo ? pragma.repo : await pragma.findAppRoot(req) ?? null

const findNoshBin = async (req) => {
  if (!!process.env.Nosh_BinDir) return [process.env.Nosh_BinDir, 'nosh'].join('/')
  const approot = await bruteForceAppRoot(req)
  if (!approot) return null
  return [approot, '.nosh/bin/nosh'].join('/')
}


const createHelpers = async (req) => {
  console.log('[HELPERS] Creating Helpers')
  const identifiers = identify(req)
  const retval = {
    req,
    _nosh: await findNoshBin(req),
    nosh: async (cmd) => await $`${retval._nosh ?? 'nosh'} ${cmd}`.then(r => { return { text: r.text(), logout: r.stderr } }).catch(errors => ({ errors })),
    identifiers,
    multisource: O_O.fn.curry(multisource, req),
    log: pragma.logger.withRequest(req).withRequestId(identifiers.request),
    res: new ResponseBuilder(),
    success: new ResponseBuilder().status(200),
    error: new ResponseBuilder().status(500),
  }
  return retval
}

const handleApiRequest = async (request, requesthandlerdefintion) => {
  const req = new NeoRequest(request)
  console.log('[API] Handling API Request')
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

const handleFSRouterRequest = async (request, fsrouter) => {
  const req = new NeoRequest(request)
  console.log('[FSROUTER] Handling FS Router request')
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

export { handleApiRequest, handleFSRouterRequest, NeoRequest }