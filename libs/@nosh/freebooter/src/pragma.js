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



class Pragma {
  #appname = 'system'
  #logger = null
  constructor() { this.#appname = 'system' }
  get NeoArray() { return Neo.NeoArray }
  get NeoObject() { return Neo.NeoObject }
  get NeoString() { return Neo.NeoString }
  get NeoNumber() { return Neo.NeoNumber }
  get Case() { return Neo.Case }
  get Neo() { return Neo }
  get O_O() { return O_O }
  get fn() { return O_O.fn }
  get up() { return evolve }
  get uuid() { return Bun.randomUUIDv7 }
  get promisify() { return promisify }
  get repo() { return async () => await bruteForceRepoRoot() }
  set appname(name) { this.#appname = name }
  get logger() { return this.#logger ??= console.log }
  initLogger(app) {
    this.#logger = new Logger(app); this.#appname = app
  }
  get appname() { return this.#appname }
}

const pragma = new Pragma()

export { pragma }