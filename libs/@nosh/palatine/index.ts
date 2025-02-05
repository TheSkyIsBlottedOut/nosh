import { sassy, type SassyConfig } from './src/sassy.ts'
import { configScout, appScout } from './src/config-scout.ts'
// @ts-expect-error no types in Bun
import Bun, { BunPlugin } from 'bun'


const appdirs = await appScout()
type PalatineConfig = Record<string, Record<string, any>> & { sassy: Partial<SassyConfig> }
const Palatine = { sassy } as Record<string, BunPlugin>

await appdirs.forEach(async (dir) => {
  // config-scout the directories, then pass dir and config for each middleware to the lib.plugin function.

  const settings = await configScout(dir) as Partial<PalatineConfig>
  Object.keys(settings).forEach(async (lib: string) => {
    if (Palatine[lib]?.plugin) await Palatine[lib].plugin(dir, settings[lib])
  })
})
