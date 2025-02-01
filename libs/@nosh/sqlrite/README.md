# Sqlrite

A utility wrapper around bun's SQLite [utility](https://bun.sh/docs/api/sqlite)

Uses [tag functions](https://codeburst.io/javascript-what-are-tag-functions-97682f29521b) as the npm [postgres](https://www.npmjs.com/package/postgres) package does.


## Usage

```typescript
import { SQLRite } from '@nosh/sqlrite'
// app-level data folder; use absolute path to override
const { $ } = new SQLRite({ dbfile: 'myapp.db' })

// replace this string interpolation with a variable!
$(`SELECT * FROM users WHERE email = ${ 'email@example.com' }`)
```

## Long Term Roadmap

- Combined/Unified tooling/ORM exposure
- ActiveRecord style accessors
- Utility classes (check the SQLRite instance's schema method)

```typescript
const sqlrite = new SQLRite({ dbfile: 'myapp.db' })
// load table schemas
console.log(sqlrite.schema)
