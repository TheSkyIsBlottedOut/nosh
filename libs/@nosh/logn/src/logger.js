import { $ } from 'bun'
import { O_O } from 'unhelpfully'
import defaults from './defaults.json' assert { type: 'json' }
const defaultConfig = defaults.logger
const RootDir = process.env.Nosh_AppDir || (await $`git rev-parse --show-toplevel`).text().trim()
const LogDir = `${RootDir}/logs`
const Microtime = [[82600, 'd'], [3600, 'h'], [60, 'm'], [1, 's']]
const LogLevel = {
  trace: 0, chatty: 1, verbose: 1,
  debug: 2, info: 3, warn: 4,
  error: 5, alert: 5,
  crit: 6, fatal: 6
}

const LevelEmojis = {
  trace: '🔍', chatty: '🗣️', verbose: '🔊',
  debug: '🐞', info: 'ℹ️', warn: '⚠️',
  error: '❌', alert: '🚨',
  crit: '🚫', fatal: '💀'
}

export class Logger {
  app = 'app'
  #logs = O_O.obj
  #config = { ...defaultConfig }
  currentLog = { data: { context: {} } }
  #timing = O_O.obj
  #lonewolf = true

  constructor(appname) {
    this.app = appname
    this.#logs = []
    this.#lonewolf = true // disable this if you want sigkill to propagate from elsewhere
    this.#config = {}
    this.#timing = { app: +new Date() } // request timing could cause conflicts
    this.currentLog = { data: { context: {} } }
    this.initLogger()
  }

  initLogger() {
    process.on('beforeExit', this.onTerminate.bind(this))
  }

  set receiveTermSignals(bool) {
    this.#lonewolf = !bool; return this
  }

  async onTerminate() {
    await this.writeLogsToFile()
    if (this.#lonewolf) process.exit(0)
    return true;
  }

  async writeLogsToFile() {
    const logs = this.#logs.filter(log => LogLevel[log.level] >= LogLevel[this.config.file.level]).map(log => JSON.stringify(log)).join('\n')
    this.logs = []
    await Bun.write(this.logfile, logs, { append: true })
   }

  set config(cfg) { this.#config = { ...this.#config, ...cfg } }
  get config() { return { ...defaultConfig, ...this.#config } }

  get logfilename() {
    const start = new Date()
    const month = (start.getMonth() + 1).toString().padStart(2, '0')
    return `${this.app}-${start.getFullYear()}.${month}.${start.getDate()}.log`
  }
  get logfile() { return `${LogDir}/${this.logfilename}` }
  data(dataval = {}) {
    this.currentLog.data = { context: {}, ...this.currentLog.data, ...dataval }
    return this
  }

  log(level, msg, data = {}) {
    data = { ...this.currentLog.data, ...data }
    this.currentLog = { ...this.currentLog, level, msg, data, timestamp: +new Date(), app: this.app }
    this.completeLog()
    return this
  }

  context(contextdata) {
    this.data().currentLog.data.context = { ...this.currentLog.data.context, ...contextdata }
    return this
  }
  get sinceAppStart() { return +new Date() - this.#timing.app }
  trace(msg, data = {}) { return this.log('trace', msg, data) }
  info(msg, data = {}) { return this.log('info', msg, data) }
  warn(msg, data = {}) { return this.log('warn', msg, data) }
  warning(msg, data = {}) { return this.log('warn', msg, data) }
  fatal(msg, data = {}) { return this.log('fatal', msg, data) }
  crit(msg, data = {}) { return this.log('crit', msg, data) }
  critical(msg, data = {}) { return this.log('crit', msg, data) }
  alert(msg, data = {}) { return this.log('alert', msg, data) }
  debug(msg, data = {}) { return this.log('debug', msg, data) }
  chatty(msg, data = {}) { return this.log('chatty', msg, data) }
  verbose(msg, data = {}) { return this.log('verbose', msg, data) }
  error(msg, data = {}) {
    if (msg instanceof Error) this.data({ stack: msg.stack })
    return this.log('error', msg.message, data)
  }
  withRequestId(reqid = null) { reqid ??= Bun.randomUUIDv7(); return this.context({ requestId: reqid }) }
  withSessionId(sessionid)  { return this.context({ sessionId: sessionid }) }
  withUserId(userid)        { return this.context({ userId: userid }) }
  get elapsedTimestamp() {
    let elapsed = this.sinceAppStart, timestring = ''
    while (elapsed > 1000) {
      Microtime.forEach(([time, unit]) => {
        if (elapsed >= time * 1000) {
          const ptime = Math.floor(elapsed / (time * 1000))
          const reduceby = ptime * time * 1000
          elapsed -= reduceby
          timestring += `${ptime}${unit}`
        }
      })
    }
    timestring += `${elapsed}ms`
    return timestring
  }

  logToConsole() {
    // normally, don't log debug or trace messages unless Bun.env.logLevel is set.
    let format = this.#config.console?.format
    if (typeof format === 'string') {
      const logdata = { app: this.appName, time: new Date().toISOString(), level: this.currentLog.level, msg: this.currentLog.msg, data: this.currentLog.data }
      const output = O_O.interpolate(format, logdata)
      Bun.write(Bun.stdout, output + '\n')
    } else {
      Bun.write(Bun.stdout, `[${this.elapsedTimestamp}] ${LevelEmojis[this.currentLog.level]} ${this.app} ${this.currentLog.level.toUpperCase()} ${this.currentLog.msg}\n${JSON.stringify(this.currentLog.data, null, 2)}\n--------------------------------------------------\n`)
    }
  }

  completeLog() {
    this.#logs.push(this.currentLog)
    this.logToConsole()
    this.currentLog = { data: { context: {} } }
  }

  withClientId(clientid) {
    if (/\w+\:\w+/.test(clientid)) {
      const [client, __] = clientid.split(':')
      return this.context({ clientId: client })
    } else {
      // it's header encrypted and base64'd - won't know this yet
      return this.context({ clientId: '<encrypted>' })
    }
  }
  withRequest(req) {
    this.withRequestId(req.headers['x-request-id'])
    if (req.headers['x-session-id']) this.withSessionId(req.headers['x-session-id'])
    if (req.headers['x-user-id']) this.withUserId(req.headers['x-user-id'])
    if (req.headers['x-client-id']) this.withClientId(req.headers['x-client-id'])
    const uridata = O_O.fn.dissectUrl(req.url)
    return this.context({
      request: {
        timing: { start: this.#timing.request, elapsed: this.sinceRequestStart },
        uri: {
          ...uridata,
          params: req.params,
          query: req.query,
          method: req.method,
          hashmark: req.url.split('#')[1],
          ssl: req.secure,
          url: req.url,
        },
        connection: {
          remoteAddress: req.connection?.remoteAddress,
          remotePort: req.connection?.remotePort,
          localAddress: req.connection?.localAddress,
          localPort: req.connection?.localPort,
          forwardedFor: req.headers['x-forwarded-for'],
          forwardedHost: req.headers['x-forwarded-host'],
          realIp: req.headers['x-real-ip']
        },
        bodyUsed: (!!req.body) ? '<empty>' : ((typeof req.body === 'string') ? req.body : JSON.stringify(req.body)).length
      }
    })
  }
}

