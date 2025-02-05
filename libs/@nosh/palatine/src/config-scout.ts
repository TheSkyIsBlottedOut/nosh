// @ts-expect-error - no types for bun
import { $ , Glob } from 'bun'

// find the json files in the appdir ./app/{appdir}/etc/**/*.json
// find the config with { middleware: { [plugin-name]: {...}}}
// return those settings
export const configScout = async (appdir: string) => {
  const glob = new Glob(`app/${appdir}/etc/**/*.json`)
  const decoder = new TextDecoder()
  const jsonfiles = decoder.decode(await glob.stdout()).split(/\n+/).filter(x => !!(x.length > 0 && x.match(/^app\/[\w+]+\/etc\/[\w+]+\.json$/)))
  const settings = {} as Record<string, Record<string, any>>
  await jsonfiles.forEach(async (file) => {
    const json = JSON.parse(decoder.decode(await $`cat ${file}`))
    if (json.middleware) {
      Object.entries(json.middleware).forEach(([plugin, settings_]) => {
        settings[plugin as string] = settings_ as Record<string, any>
      })
    }
  })
  return settings
}

export const appScout = async () => {
  const glob = new Glob('app/*')
  const decoder = new TextDecoder()
  const appdirs = decoder.decode(await glob.stdout()).split(/\n+/).filter(x => !!(x.length > 0 && x.match(/^app\/[\w+]$/))).map(x => x.replace(/^app\//, ''))
  return appdirs
}