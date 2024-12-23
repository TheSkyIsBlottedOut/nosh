# Bun App Repo

The best parts of Nx and Bun combined. Put apps here - this framework is designed for Bun-only JSX driven apps, but you can use
Express, Svelte, or any other framework you want.

## Getting Started
To get started, run `npx nosh init:app [app_name]`. This will create a new app in the apps directory.

If you want to use a template, use nosh init:app:[template_name]
[app_name]. This will use the template you specify.

## Adding Libraries
Apps are the 'servable' part of the monorepo. When using nosh to generate apps, it will store app info in a root level nosh.yml file,
to allow for tooling to be built around the app.

## Component Libraries
You can add component libraries to the libs directory. These are libraries that are not servable, but are used by the apps. You can
add a library as a dependency by adding the following dependency to your `package.json` file:

```json
{
  "dependencies": {
    "<library_name>": "file:libs/<library_name>"
  }
}
```

### Creating a Launch Script
The entrypoint for your app should be either a filename relative to the app directory, or a script in the package.json file. Then, you can use nosh serve [app_name] to serve the app.

### Adding a Template
Eventually, we'll detect patterns that the nosh tooling can modify for a given app/library. When this happens, the libs/nosh/ directory will have an area for templates that can modify apps.

## Patterns

There are three general app patterns that Bun lends itself to:

- **Thin Frontend + Express/Bun Backend**: This is the most common pattern. There is ongoing work to make the bun/express pattern work in pure bun.

- **Full Stack Bun** - One app serves frontend and API, and data files can be stored in the app directory or in a shared workspace.

- **Templated Apps** - Apps that are generated from templates. This is the most common pattern for new apps.