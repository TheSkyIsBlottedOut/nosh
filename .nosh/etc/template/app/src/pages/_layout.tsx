import { StyledApp, JSXApp, type JSXChild } from '@nosh/compact'
import React from 'react'
// @ts-expect-error - compilation happens at runtime
import css from '../styles/globals.css'
const Layout = (args: Record<string, string|React.JSX.Element>) => {
  const children:React.JSX.Element = args.children as React.JSX.Element
  return (
    <StyledApp styles={[css]}>
      <h1>My Application</h1>
      {children}
    </StyledApp>
  )
}

export default Layout

