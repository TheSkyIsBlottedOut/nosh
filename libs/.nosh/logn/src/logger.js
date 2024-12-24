import { $ } from 'bun'
import { appendFile } from 'node:fs/promises'
import { NString } from '@@nosh/libs/neoclassical'
import defaults from './defaults.json'

const defaultConfig = defaults.logger

const RootDir = process.env.Nosh_AppDir || (await $`git rev-parse --show-toplevel`).text().trim()
const LogDir = `${RootDir}/logs`
const Microtime = [[82600, 'd'], [3600, 'h'], [60, 'm'], [1, 's']]
const LogPriority = {
  trace: 0,
  chatty: 1,
  verbose: 1,
  debug: 2,
  info: 3,
  warn: 4,
  error: 5,
  alert: 5,
  crit: 6,
  fatal: 6
}

export class Logger {
  app = 'app'
  #logs = []
  #config = {}
  currentLog = {}
  appStart = 0
  requestStart = 0

  constructor(appname) {
    this.app = appname
    this.#logs = []
    this.#config = {}
    this.appStart = +new Date()
    this.requestStart = 0
    this.currentLog = { data: { context: {} } }
    this.initLogger()
  }

  initLogger() {
    ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'].forEach(event => {
      process.on(event, () => this.writeLogsToFile())
    })
  }

  async writeLogsToFile() {
    const logs = this.#logs.map(log => JSON.stringify(log)).join('\n')
    this.logs = []
    await appendFile(this.logfile, logs)
  }
  set config(cfg) { this.#config = { ...this.#config, ...cfg } }
  get config() { return { ...defaultConfig, ...this.#config}}
  get logfilename() {
    const date = new Date()
    const datevalue = {Y: date.getFullYear(),
      M: date.getMonth() + 1,
      D: date.getDate(),
      H: date.getHours(),
      m: date.getMinutes(),
      s: date.getSeconds()}
    const datetime = new NString(this.config.file.fileNameTimeFormat).interpolate(datevalue, '%token')
    return new NString( this.config.file.fileNameTimeFormat).interpolate({
      app: this.app, time: datevalue, date: datevalue,
    })
 }
  get logfile() { return `${LogDir}/${this.logfilename}` }
  data(dataval = {}) {
    this.currentLog.data = { ...this.currentLog.data, ...dataval }
    return this
  }

  log(level, msg, data={}) {
    data = { ...this.currentLog.data, ...data }
    this.currentLog = { ...this.currentLog, level, msg, data, timestamp: +new Date() }
    this.completeLog()
    return this
  }

  context(contextdata) {
    this.currentLog.data ||= {}
    this.currentLog.data.context ||= {}
    this.currentLog.data.context = { ...this.currentLog.data.context, ...contextdata }
    return this
  }

  trace(msg, data={}) { this.log('trace', msg, data) }
  info(msg, data={}) { this.log('info', msg, data) }
  warn(msg, data={}) { this.log('warn', msg, data) }
  warning(msg, data={}) { this.log('warn', msg, data) }
  error(msg, data={}) {
    if (msg instanceof Error) {
      data = { ...data, stack: msg.stack }
      msg = msg.message
      return this.log('error', msg, data)
    } else {
      return this.log('error', msg, data)
    }
  }

  fatal(msg, data={}) { this.log('fatal', msg, data) }
  crit(msg, data={}) { this.log('crit', msg, data) }
  critical(msg, data={}) { this.log('crit', msg, data) }
  alert(msg, data={}) { this.log('alert', msg, data) }
  debug(msg, data={}) { this.log('debug', msg, data) }
  chatty(msg, data={}) { this.log('chatty', msg, data) }
  verbose(msg, data={}) { this.log('verbose', msg, data) }

  withRequestId(reqid) { return this.context({ requestId: reqid }) }
  withSessionId(sessionid) { return this.context({ sessionId: sessionid }) }
  withUserId(userid) { return this.context({ userId: userid }) }
  logToConsole() {
    const timenow = +new Date()
    var elapsed = timenow - this.requestStart
    let timestring = ''
    while (elapsed > 1000) {
      const [time, unit] = Microtime.find(([time, unit]) => elapsed > +time)
      elapsed -= +time
      timestring += `${time}${unit}`
    }
    timestring += `${elapsed}ms`
    const format = new NString(this.config.console.format)
    if (format.matches(/\:/m)) {
      console.log(format.interpolate({ app: this.app, level: this.currentLog.level, msg: this.currentLog.msg, timestamp: timestring, data: JSON.stringify(data, null, 2) }))
    }
  }

  completeLog() {
    this.logToConsole()
    this.#logs.push(this.currentLog)
    this.currentLog = { data: { context: {} } }
  }


  withClientId(clientid) {
    if (/\w+\:\w+/.test(clientid)) {
      const [client, __] = clientid.split(':')
      return this.context({ clientId: client})
    } else {
      // it's header encrypted and base64'd - won't know this yet
      return this.context({ clientId: '<encrypted>' })
    }
  }
  withRequest(req) {
    this.requestStart = +new Date()
    if (req.headers['x-request-id']) this.withRequestId(req.headers['x-request-id'])
    if (req.headers['x-session-id']) this.withSessionId(req.headers['x-session-id'])
    if (req.headers['x-user-id']) this.withUserId(req.headers['x-user-id'])
    if (req.headers['x-client-id']) this.withClientId(req.headers['x-client-id'])
    return this.context({ request: {
      start: this.requestStart,
      uri: {
        host: req.headers.host || req.hostname || req.host || req.headers['x-forwarded-host'] || this.app,
        params: req.params,
        query: req.query,
        method: req.method,
        hashmark: req.url.split('#')[1],
        ssl: req.secure,
        url: req.url,
      },
      connection: {
        remoteAddress: req.connection.remoteAddress,
        remotePort: req.connection.remotePort,
        localAddress: req.connection.localAddress,
        localPort: req.connection.localPort,
        forwardedFor: req.headers['x-forwarded-for'],
        forwardedHost: req.headers['x-forwarded-host'],
        realIp: req.headers['x-real-ip']
      },
      bodyUsed: (!!req.body) ? '<empty>' : (typeof req.body === 'string') ? req.body : JSON.stringify(req.body)
    }})
  }
}

