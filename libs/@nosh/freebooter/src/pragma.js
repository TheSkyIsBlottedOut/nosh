import Neo, { evolve } from 'neoclassical'
import { Logger } from 'logn'
import { O_O } from 'unhelpfully'
import { promisify } from 'util'


// why do i have 20 copies of this
const bruteForceRepoRoot = async () => {
  const most_likely_root_paths = [
    Bun.env.DIRENV_DIR,
    Bun.env.Nosh_LogDir?.replace(/\/logs$/, ''),
    Bun.env.Nosh_Dir?.replace(/\.nosh$/, ''),
    () => import.meta.dir.split(/\@nosh/)[0]?.replace(/[^\/]+\/?$/, '')
      (async () => { return (await $`git rev-parse --show-toplevel`).text().trim() })
  ]
  const testcase = import.meta.dir
  let repoDir = most_likely_root_paths.find(async (pathOrFn) => {
    const test_path = (typeof pathOrFn === 'string') ? pathOrFn : await pathOrFn()
    if (typeof test_path === 'string' && test_path.length > 4 && testcase.startsWith(test_path)) return test_path
  })
  repoDir ??= await $`cd ${import.meta.dir} && while [[ ! -d .nosh ]]; do cd ..; done && pwd`.text().trim()
  return repoDir
}



const pragma = {
  ...Neo,
  O_O,
  fn: O_O.fn,
  up: evolve,
  uuid: Bun.randomUUIDv7,
  promisify,
  repo: async () => await bruteForceRepoRoot(),
  appname: 'untitled-application',
  logger: console.log,
  initLogger() { this.logger = new Logger(this.appname) }
}
export { pragma }