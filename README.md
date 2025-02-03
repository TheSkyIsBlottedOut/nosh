# Nosh - A Lightweight Framework for Almost Everything

This repo is a sample application used for the development of the Nosh framework. The application is hosted in the /app folder; 
There are lots of tools in the @nosh namespace:

- [unhelpfully](https://github.com/TheSkyIsBlottedOut/nosh/tree/main/libs/%40nosh/unhelpfully): A toolkit for common functions;
- [freebooter](https://github.com/TheSkyIsBlottedOut/nosh/tree/main/libs/%40nosh/freebooter): The nosh bootloader, with lots of neat features;
- [sqlrite](https://github.com/TheSkyIsBlottedOut/nosh/tree/main/libs/%40nosh/sqlrite): SQLite (from bun) wrapped in backtick functions;
- [logn](https://github.com/TheSkyIsBlottedOut/nosh/tree/main/libs/%40nosh/logn) The core logger;
- [testcase](https://github.com/TheSkyIsBlottedOut/nosh/tree/main/libs/%40nosh/testcase): A lightweight test suite;
- [neoclassical](https://github.com/TheSkyIsBlottedOut/nosh/tree/main/libs/%40nosh/neoclassical): A set of extensions to core JS classes;
- [nokv](https://github.com/TheSkyIsBlottedOut/nosh/tree/main/libs/%40nosh/nokv): an LMDB library;
- [authentic](https://github.com/TheSkyIsBlottedOut/nosh/tree/main/libs/%40nosh/authentic): an authenticator library.


## Sample Branch - A small web app for encrypted pastes

This is a monorepo based on my own `nosh` bun based monorepo project [here](https://github.com/Holistic-Dogma/nosh/blob/main/README.md) (text is also pasted below). This is the nightly branch, and has the application sample built in as well for testing; platform updates will be extracted and pushed separately to the above.

If you've downloaded this without installing bun, then make sure
you have the following set up:

1. Install 'direnv'; I don't have a non-intrusive way to install this package yet, so please install it manually. Alternately, you can `source .envrc` to load the environment variables. (I do have a script for force-install of direnv, but would prefer to stay out of the user's HOME directory when possible).

Milestones:
- Full feature set. Progress: 50%
- Fully functional web framework with components
- Launch of sites using Nosh to public domains

# Nosh: From The Official Repo

## A Paranoid Monorepo

Nosh intends to build a npm-compatible workspace based monorepo, with support for multiple
projects, by providing:

1. A strong suite of zsh tools, added "invisibly" (upon install of direnv).
2. Bun.sh and React; does not use other frameworks, and uses as few packages as possible.

### Why?

Since both d3.js and @mui have been found to have... metrics gathering software, Nosh is
designed to be encryption first. Yes, I do intend to have extensive browserside logging;
yes, I intend to use the w3/mdn structure rather than react wherever possible; but the goal
is to build a simple, rapid application platform that allows for rapid tooling in other
languages which fit seamlessly into the ecosystem.

### History

In the first half of 2024, I found myself migrating a company's Preact/Express setup to
Nx/Next.js. I found myself very impressed with Nx - not quite so much with Next. After
discovering Deno and Bun, I've decided to build my next toolkit in Bun, conforming to
browser standards (for which react has "workarounds"), as many home-grown, no-spyware
tools as possible, and rebuild trust.
