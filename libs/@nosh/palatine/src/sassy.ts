// @ts-expect-error no types in bun
import Bun, { Glob, $, type BunPlugin, plugin } from 'bun' 
import { configScout, appScout } from './config-scout'

export type SassyConfig = {
  styles: string[]
  output: string
  options: { minify: boolean, sourceMap: boolean }
}

const sassy = plugin({
  name: 'sassy sass/scss plugin',
  // when a sass/scss file is loaded:
  async setup(build: any) {
    const sass = await import('sass')
    build.onLoad({ filter: /\.(s(?:a|c)ss)$/ }, async (args: { path: string }) => {
      console.log('loading sass/scss file:', args.path)
      const { path } = args
      const { compileString } = await import('sass')
      const contents = await Bun.file(path).text()
      const result = await compileString(contents)
      return { loader: 'css', contents: `${result.css}` }
    })
  },
  plugin: async (appdir: string, config: SassyConfig) => {
    const { styles, output, options } = config
    Bun.build({
      entrypoints: styles.map((style) => `app/${appdir}/${style}`),
      sourcemap: options.sourceMap ? 'inline' : false,
      outdir: output,
      naming: options.minify ? '[name].css' : '[name]-[hash].css',
      plugins: [sassy]
    })
  }
})
export { sassy }