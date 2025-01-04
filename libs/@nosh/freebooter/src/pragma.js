import Neo, { evolve } from 'neoclassical'
import { Logger } from 'logn'
import { O_O } from 'unhelpfully'
import { promisify } from 'util'
import { v4 as uuid } from 'uuid'

console.log('[BOOT] Creating #pragma. You need pragma.')



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



const pragma = { ...Neo }
pragma.O_O = O_O
pragma.fn = O_O.fn
pragma.up = evolve
pragma.uuid = uuid
pragma.promisify = promisify
O_O.add('repo').to(pragma).get(async () => await bruteForceRepoRoot())
export { pragma }