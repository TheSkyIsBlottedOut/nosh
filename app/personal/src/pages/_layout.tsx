import { StyledApp, JSXApp, type JSXChild } from '@nosh/compact'
import React from 'react'
// @ts-expect-error - compilation happens at runtime
import css from '../styles/globals.css'
const Layout = (args: Record<string, string|React.JSX.Element>) => {
  const children:React.JSX.Element = args.children as React.JSX.Element
  return (
    <StyledApp styles={[css]}>
      <h1 id="layout-headline">Indomitable Pragma</h1>
      <ul id="navbar">
        <li><a href="/">Home</a></li>
        <li>Stuff<ul>
          <a href="/page1"><li>Page 1</li></a>
          <a href="/page2"><li>Page 2</li></a>
        </ul></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
      {children}
    </StyledApp>
  )
}

export default Layout

