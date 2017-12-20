# City Popup

## Setup

1. Clone the repo
2. `cd city-popup`
3. `yarn`

## Development

`main.es6.js` is the file we work on. Do not modify the `main.js` file, it is created and maintained automatically by Babel

1. Run a local server from the repo's root folder (I suggest using httpster - install it with `yarn global add httpster` if you don't have it already, then run it with `httpster` and navigate to `localhost:3333`)
2. `yarn start` - watches for changes in `main.es6.js` and transpiles it to `main.js`, which is then used by `index.html`

## Production

1. `yarn build` - transpiles `main.es6.js` to `main.js` (similar to `yarn start`, but does that only once)
