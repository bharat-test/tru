# tru.ID Development Server

The **tru.ID** development server provides basic example code to be used with client application, runnable examples via served web pages and can be used to help with the **tru.ID** development process.

The server can be used from **standalone** from source or installed and used as a **module**.

## Before you being

You will need:

- Node.JS installed
- a [**tru.ID**](https://tru.id) account

## Using Standalone

### Getting Started

Clone or unzip the tru.ID Node Server into a directory.

### Create a tru.ID Project

- Install the [tru.ID CLI](https://tru.id/docs/reference/cli)
- Setup the CLI with the `client_id` and `client_secret` from the [tru.ID Console](https://tru.id/console)
- Create a project with the CLI pointing to the tru.ID Node Server directory `$ tru projects:create --project-dir PATH_TO_SERVER_DIR`. This will create a `tru.json` file in the directory.

### Install dependencies:

```
npm install
```

or

```
yarn install
```

### Configuration

If required, you can make configuration changes with the following environment variables:

- `PORT` : change the port that the server listens on
- `DEBUG` : determines whether debug information is logged via `console.log`
- `CONFIG_PATH` : the path to the `tru.json` configuration file for the tru.ID project. Not used if `TRU_CLIENT_ID` and `TRU_CLIENT_SECRET` are set.
- `API_BASE_URL` : the tru.ID base URL. Defaults to `https://eu.api.tru.id`
- `TRU_CLIENT_ID` : The `client_id` of a **tru.ID** project.
- `TRU_CLIENT_SECRET` : The `client_secret` of a **tru.ID** project.
- `USERNAME` : A username to be used with basic auth for the site
- `PASSWORD` : A password to be used with basic auth for the site

The server will attempt to load environment variables from a `.env` file in the root directory of the server.

### Phone Check callbacks

If you wish to receive Phone Check HTTP callbacks when the Phone Check enters and end state, you must:

1. Run a local tunnel solution to expose your local running server to the Internet
2. Configure your Project to have a `phonecheck_callback_url

From the project directory run the following command replacing `{local_tunnel_url}` with the URL exposing your localhost server to the Internet:

```
$ tru projects:update --phonecheck-callback {local_tunnel_url}/phone-check/callback
```

### Run the server

```
npm start
```

or

```
yarn start
```

### Explore

- View the code in [blob/main/src/index.js](blob/main/src/index.js)
- The server exposes a basic homepage with some example pages that allow you to try out some functionality

## Using as a Module

### Install

```
npm install @tru_id/dev-server
```

or

```
yarn add @tru_id/dev-server
```

### Include and Use

```js
const truDevServer = require('@tru_id/dev-server')
truDevServer.serve(config)
```

## Configuration

```js
{
    // Number. The port for the server to listen on. Defaults to 8080
    port: PORT,

    // Boolean. Whether debug output will be passed to the `log` function. Defaults to `true`
    DEBUG: DEBUG,

    // String. The base tru.ID URL. Defaults to 'https://eu.api.tru.id'
    apiBaseUrl: API_BASE_URL,

    // Optional. Set if the server should be password protected. Uses [express-password-protect](https://github.com/jdmann/express-password-protect)
    basicAuth: {
        username: USERNAME,
        password: PASSWORD
    },

    // Object. The tru.ID project configuration to use.
    project: {
        // String. The `client_id` of the project. Defaults to loading from a local `tru.json`.
        client_id: CLIENT_ID,

        // String. The `client_secret` of the project. Defaults to loading from a local `tru.json`.
        client_secret: CLIENT_SECRET
    },

    // Object. Configuration for [localtunnel.me](https://github.com/localtunnel/localtunnel)
    localtunnel: {
        // Boolean. Whether localtunnel should be run to expose the running server to the public Internet. Defaults to false.
        enabled: LOCALTUNNEL_ENABLED,

        // String. A subdomain to use with localtunnel. No default. Note: you are not guaranteed to get the subdomain.
        subdomain: LOCALTUNNEL_SUBDOMAIN
    },
    // Function. A function called with debug information when `DEBUG` is set to `true`. See below for default.
    log: (...args) => {
        if(DEBUG) {
            console.debug(...args)
        }
    }
}
```

## Releasing

### CHANGELOG

Ensure the `CHANGELOG.md` is updated and update the package version:

```
yarn run changelog
```

Finesse the contents of `CHANGELOG.md` and commit with a message:

```
chore(release): v{version}
```

### Tag

Tag the version that is being released with the version of the package and, optionally, the tag to be used in NPM:

```
git tag v{version}@{tag}
```

Push the update to the remote.

```
git push origin v{version}@{tag}
```

### Publish to NPM

To release a canary version run:

```
yarn run publish:canary
```

To release a latest version:

```
yarn run publish:latest
```

## License

[MIT](LICENSE)
