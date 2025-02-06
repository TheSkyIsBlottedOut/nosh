import { StyledApp, JSXApp } from '@nosh/compact'

import css from '../styles/globals.css'
const Layout = () => {
  return await (
    <StyledApp styles={[css]}>
      <JSXApp>
        <h1>My Application</h1>
      </JSXApp>
    </StyledApp>
  )
}

export default Layout

