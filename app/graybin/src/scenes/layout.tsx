import '@/styles/globals.sass'
import { JSXApp, type JSXFn } from '@nosh/compact'

const Layout: JSXFn = (({ children }) => (<JSXApp>{children}</JSXApp>))
export default Layout
// todo - autoload layouts via bunserver in freebooter