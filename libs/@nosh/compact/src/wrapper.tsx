import React, { JSX } from 'react'
// @ts-expect-error - no types for react-dom
import ReactDOM from 'react-dom'
type JSXChild = JSX.Element | JSX.Element[]
type JSXChildParams = Record<string, string | JSXChild>
type JSXFn = (args: JSXChildParams) => JSX.Element
const HTML: JSXFn = ({children}) => (<><html lang="en">{children}</html></>)
const Head: JSXFn = ({children}) => (<head>{children}</head>) 
const Body: JSXFn = ({children}) => (<body>{children}</body>)
const Meta: JSXFn = ({ name, content }) => (<meta name={name as string} content={content as string} />)
const Keywords: JSXFn = ({ content }) => (<Meta name="keywords" content={content} />)
const Robots: JSXFn = ({ content}) => (<Meta name="robots" content={content} />)
const Title: JSXFn = ({text}) => (<title>{text as string}</title>)
const Script: JSXFn = ({ src }) => (<script src={src as string} />)
const LazyScript: JSXFn = ({ src }) => (<script src={src as string} defer />)
const Root: JSXFn = ({ children }) => (<div id='root'>{children}</div>)
const ScriptModule: JSXFn = ({ children }) => (<script type="module">{children}</script>)
const JSXAppIntern: JSXFn = Root
const ReactAppIntern: JSXFn = ({ children }) => { return ReactDOM.render(<React.StrictMode>{children}</React.StrictMode>) }

const ConfiguredHeader: JSXFn = ({ children, title, page }) => {
  title = (title ?? 'application') as string
  const defaultedPage = ({ keywords: '', robots: 'index, follow', ...page as unknown as Record<string, string> }) as Record<string, string>
  const { keywords, robots } = defaultedPage
  return (
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <Keywords content={keywords} />
      <Robots content={robots} />
      <Title text={title} />
      <link rel="icon" href="/public/img/ico/favicon.ico" />
      {children}
    </head>
  )
}

const GenericApp: JSXFn = (args) => {
  const { children, title, header_content } = args  
  return (
    <HTML>
      <ConfiguredHeader title={title}>{header_content}</ConfiguredHeader>
      <Body><Root>{children}</Root></Body>
    </HTML>
  )
}

const ReactApp: JSXFn = ({ children, title, header_content }) => {
  header_content = (header_content ?? '') as JSX.Element
  title = (title ?? 'application') as string
  return (
    <GenericApp title={title} header_content={header_content}>
      <ReactAppIntern>
        {children}
      </ReactAppIntern>
    </GenericApp>
  )
}

const Style: JSXFn = ({ content }) => (<style>{content}</style>)

const JSXApp: JSXFn = ({ children, title, header_content }) => {
  title = (title ?? 'application') as string
  header_content = (header_content ?? '') as JSX.Element
  return (
    <GenericApp title={title} header_content={header_content}>
        {children}
    </GenericApp>
  )
}

export { Head, Style, Title, Script, LazyScript, ScriptModule, Meta, Keywords, Robots, Root, GenericApp, ReactApp, JSXApp, type JSXFn, type JSXChild, type JSXChildParams }