
const heartbeat = async ({ helpers, pragma }) => {
  helpers.log.info('system.heartbeat')
  return helpers.respond('OK')
}


// note there is no point in doing a heartbeat in app, as
// freebooter has a /nosh/heartbeat endpoint built in
const system = { heartbeat: { handler: heartbeat, unauthenticated: true } }
export { system }