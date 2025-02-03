# testcase - nosh testing library

No-dependency simple testing.

Usage: `bun run ./libs/@nosh/sqlrite/test.ts`

Within the nosh ecosystem: `nosh util:test sqlrite`

Code Format:
```typescript
import { testsuite, test, utils } from '@nosh/testcase'
const TestSuite = testsuite()
TestSuite.test1 = () => utils.isEmpty([])
TestSuite.test2 = () => utils.isArray([])

test(TestSuite)
```

