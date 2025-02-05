import { StyledApp, JSXApp, type JSXFn } from '@nosh/compact'
// @ts-expect-error - compilation happens at runtime
import css from '../styles/globals.css'
const Layout = async () => {
  return await (
    <StyledApp styles={[css]}>
      <JSXApp>
        <h1>Graybin</h1>
      </JSXApp>
    </StyledApp>
  )
}

export default Layout

