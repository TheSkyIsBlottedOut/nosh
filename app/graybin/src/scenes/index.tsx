import { Headline } from '../$/el/headline.tsx'
import { JSXApp, Style } from '@nosh/compact'
// @ts-expect-error - no types for bun
import Bun from 'bun'
import * as sass from 'sass'
// @ts-expect-error - ignore path error that works irl
const file = await import('./../styles/globals.scss')
const scss = await Bun.file(file.default).text()
const contents = await sass.compileString(scss)
const css = `${contents.css}`
const Index = () => (<JSXApp>
  <Style content={css} />
  <Headline text="Home" />
  <pre>
    {`CSS: \n${css}`}
  </pre>
</JSXApp>) 
export default Index