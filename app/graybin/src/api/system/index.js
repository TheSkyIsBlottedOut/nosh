
const heartbeat = async ({ helpers, pragma }) => {
  helpers.log.info('system.heartbeat')
  return helpers.respond('OK')
}



const system = {
  heartbeat: { handler: heartbeat, unauthenticated: true }
}
export { system }