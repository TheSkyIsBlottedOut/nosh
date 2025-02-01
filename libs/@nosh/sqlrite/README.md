# Sqlrite

A utility wrapper around bun's SQLite [utility](https://bun.sh/docs/api/sqlite)

Uses [tag functions](https://codeburst.io/javascript-what-are-tag-functions-97682f29521b) as the npm [postgres](https://www.npmjs.com/package/postgres) package does.


## Usage

```typescript
import { SQLRite } from '@nosh/sqlrite'
const {$} = new SQLRite({ dbfile: 'myapp.db' }) // app-level data folder; use absolute path to override

// replace this string interpolation with a variable!
$(`SELECT * FROM users WHERE email = ${ 'email@example.com' }`)
```

