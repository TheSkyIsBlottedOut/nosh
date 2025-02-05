// support imports of file types from other sources
// @ts-expect-error - no types for bun
import Bun, {Glob} from 'bun'
import sass from 'sass'
import { JSXApp, Style, JSXChild, JSXFn } from './wrapper'
const HasRun = { sass: false }
const initSass = async (app_path: string) => {
  if (HasRun.sass) return
  await Bun.$`sass ${app_path}`
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