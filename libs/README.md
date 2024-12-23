# Libraries

Add compilable bun libraries here; either use `bun create <library>` or create a new directory and run `bun init` in it.

You can add a library as a dependency by adding the following dependency to your `package.json` file:

```json
{
  "dependencies": {
    "<library_name>": "file:libs/<library_name>"
  }
}
```

You must have an index.js/ts file with an export statement.
You can make subfolders here so you can add component libraries, etc.

