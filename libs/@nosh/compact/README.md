# compact - nosh jsx primitives

Use compact to reduce your react/jsx boilerplate

```tsx
import { JSXApp } from '@nosh/compact'
export const Layout = ({children}) => (<JSXApp title="My Application">{children}</JSXApp>)
export const ReactLayout = ({children}) => (
  <ReactApp>{children}</ReactApp>
)
```

