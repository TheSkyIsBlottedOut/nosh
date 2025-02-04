import { sassy, type SassyConfig } from './src/sassy.ts'
import { configScout, appScout } from './src/config-scout.ts'


const appdirs = await appScout()
type PalatineConfig = { sassy: Partial<SassyConfig> }
const Palatine = { sassy }

await appdirs.forEach(async (dir) => {
  // config-scout the directories, then pass dir and config for each middleware to the lib.plugin function.

  const settings = await configScout(dir) as Partial<PalatineConfig>
  Object.keys(settings).forEach(async (lib) => {
    if (Palatine[lib]?.plugin) await Palatine[lib].plugin(dir, settings[lib])
  })
})
