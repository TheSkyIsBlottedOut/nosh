import React from 'react'
import ReactDOM from 'react-dom'
import config from '@/etc/app.json'
const { page } = config
const _cfgtitles = page.title ?? page.titles ?? config.name ?? 'nosh app'
const titles = Array.isArray(_cfgtitles) ? _cfgtitles : [_cfgtitles]
const titletext = () => titles[Math.random() * titles.length | 0]
const HTML = ({ children }) => jsx(<>{`<!doctype html>`}<html lang="en">{children}</html></>)
const Head = ({ children }) => jsx(<head>{children}</head>)
const Body = ({ children }) => jsx(<body>{children}</body>)
const Meta = ({ name, content }) => jsx(<meta name={name} content={content} />)
const Keywords = ({ content }) => jsx(<Meta name="keywords" content={content} />)
const Robots = (...directives) => jsx(<Meta name="robots" content={directives.join(', ')} />)
const Title = (t) => jsx(<title>{t}</title>)
const Script = ({ src }) => jsx(<script src={src} />)
const Root = ({ children }) => jsx(<div id='root'>{children}</div>)
const ScriptModule = ({ children }) => jsx(<script type="module">{children}</script>)
const JSXAppIntern = ({ children }) => jsx(<Root>{children}</Root>)
const ReactAppIntern = ({ children }) => { return ReactDOM.render(<React.StrictMode>{children}</React.StrictMode>) }

const ConfiguredHeader = ({ children }) => {
  return (
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <Keywords content={page.keywords} />
      <Robots content={page.robots} />
      <Title>{titletext()}</Title>
      <link rel="icon" href="/public/img/ico/favicon.ico" />
      {children}
    </head>
  )
}

const GenericApp = ({ children }) => {
  return (
    <HTML>
      <ConfiguredHeader />
      <Body>
        <Root>
          {children}
        </Root>
      </Body>
    </HTML>
  )
}

const ReactApp = ({ children }) => {
  return (
    <GenericApp>
      <ReactAppIntern>
        {children}
      </ReactAppIntern>
    </GenericApp>
  )
}

const JSXApp = ({ children }) => {
  return (
    <GenericApp>
      <JSXAppIntern>
        {children}
      </JSXAppIntern>
    </GenericApp>
  )
}

export { ReactApp, JSXApp }