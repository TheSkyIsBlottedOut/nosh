// originally sassfile support; now just give an interface to inject css-compiled styles into the @nosh/compact JSXApp
// @ts-expect-error - no types for bun
import Bun from 'bun'
import { JSXApp, Style, JSXChild } from './wrapper'
const HasRun = { sass: false }
const initSass = async (app_path: string) => {
  if (HasRun.sass) return
  try {
    await Bun.$`nosh app:sass`
  } catch (e) { console.log(`Error running sass: ${e}`) }
  HasRun.sass = true
}

type StyledAppParams = { children: JSXChild, styles: string[] }
type StyledAppFn = (args: StyledAppParams) =>  Promise<JSXChild>
const StyledApp: StyledAppFn = async ({ children, styles }) => {
  initSass(process.argv[process.argv.length - 1])
  const css = await Promise.all(styles.map((stylepath: string) => {
    if (/\.s[ac]ss$/.test(stylepath)) stylepath = stylepath.replace(/\.s[ca]ss/, '.css')
    if (/\.css/.test(stylepath)) {
      return Bun.file(stylepath).text().catch((e: Error | string) => { console.error(e); return '' })
    } else if ((/(?:\*|\.\w+|\#\w+|\w+\:\w+|\w+\[\w+.?\=.?\]\s*)*\s\{(?:\w+\:\w+\;)*\}/m).test(stylepath)) return stylepath
    else {
      console.error(`Unsupported stylesheet type: ${stylepath}`)
      return ''
    }
  }))
  return (<JSXApp header_content={(<Style content={css}/>)}>{children}</JSXApp>)
}


export { StyledApp, initSass }