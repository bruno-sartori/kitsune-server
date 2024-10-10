# Nekomata API

Nekomata API is a simple Node.js and TypeScript-based API server. This project is structured to provide a solid foundation for building scalable APIs using modern JavaScript/TypeScript practices.

## Features

- **TypeScript**: Strongly typed JavaScript, providing better tooling and readability.
- **Node.js**: Fast and scalable server-side runtime.
- **Modular Structure**: Easily extendable with well-defined modules and services.

## Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/en/) (v14+ recommended)
- [Yarn](https://classic.yarnpkg.com/en/docs/install) (optional, you can use npm instead)

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/nekomata-api.git
cd nekomata-api
```

Install the dependencies:

```bash
yarn install
```

## Useful Commands

* Enter Docker Mysql: `sudo docker exec -it mysql bash`
* Create new Sequelize Model (and migration for it): `npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string`


## Available Scripts

### 1. Development Mode

To run the project in development mode with hot-reloading:

```bash
yarn dev
```

### 2. Build for Production

To compile the project into JavaScript (production build):

```bash
yarn build
```

The compiled files will be located in the `dist/` folder.

### 3. Serve Production Build

After building the project, you can serve it in production mode:

```bash
yarn serve
```

## Project Structure

```bash
├── src/              # Source code
│   ├── controllers/  # API controllers
│   ├── services/     # Business logic
│   ├── routes/       # API routes
│   ├── models/       # Data models (if using a database)
│   ├── utils/        # Utility functions
│   └── index.ts      # Application entry point
├── dist/             # Compiled production code
├── package.json      # Project dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── README.md         # Project documentation
```

## License

All rights reserved. This project and its content may not be used, copied, modified, or distributed without prior permission from the owner.




# nekomata-api neon

This project was bootstrapped by [create-neon](https://www.npmjs.com/package/create-neon).

## Building nekomata-api neon

Building nekomata-api neon requires a [supported version of Node and Rust](https://github.com/neon-bindings/neon#platform-support).

To run the build, run:

```sh
$ npm run build
```

This command uses the [@neon-rs/cli](https://www.npmjs.com/package/@neon-rs/cli) utility to assemble the binary Node addon from the output of `cargo`.

## Exploring nekomata-api neon

After building nekomata-api neon, you can explore its exports at the Node console:

```sh
$ npm i
$ npm run build
$ node
> require('.').hello()
'hello node'
```

## Available Scripts

In the project directory, you can run:

#### `npm install`

Installs the project, including running `npm run build`.

#### `npm run build`

Builds the Node addon (`index.node`) from source, generating a release build with `cargo --release`.

Additional [`cargo build`](https://doc.rust-lang.org/cargo/commands/cargo-build.html) arguments may be passed to `npm run build` and similar commands. For example, to enable a [cargo feature](https://doc.rust-lang.org/cargo/reference/features.html):

```
npm run build -- --feature=beetle
```

#### `npm run debug`

Similar to `npm run build` but generates a debug build with `cargo`.

#### `npm run cross`

Similar to `npm run build` but uses [cross-rs](https://github.com/cross-rs/cross) to cross-compile for another platform. Use the [`CARGO_BUILD_TARGET`](https://doc.rust-lang.org/cargo/reference/config.html#buildtarget) environment variable to select the build target.

#### `npm test`

Runs the unit tests by calling `cargo test`. You can learn more about [adding tests to your Rust code](https://doc.rust-lang.org/book/ch11-01-writing-tests.html) from the [Rust book](https://doc.rust-lang.org/book/).

## Project Layout

The directory structure of this project is:

```
nekomata-api neon/
├── Cargo.toml
├── README.md
├── src/
|   └── lib.rs
├── index.node
├── package.json
└── target/
```

| Entry          | Purpose                                                                                                                                  |
|----------------|------------------------------------------------------------------------------------------------------------------------------------------|
| `Cargo.toml`   | The Cargo [manifest file](https://doc.rust-lang.org/cargo/reference/manifest.html), which informs the `cargo` command.                   |
| `README.md`    | This file.                                                                                                                               |
| `src/`         | The directory tree containing the Rust source code for the project.                                                                      |
| `lib.rs`       | Entry point for the Rust source code.                                                                                                          |
| `index.node`   | The main module, a [Node addon](https://nodejs.org/api/addons.html) generated by the build and pointed to by `"main"` in `package.json`. |
| `package.json` | The npm [manifest file](https://docs.npmjs.com/cli/v7/configuring-npm/package-json), which informs the `npm` command.                    |
| `target/`      | Binary artifacts generated by the Rust build.                                                                                            |

## Learn More

Learn more about:

- [Neon](https://neon-bindings.com).
- [Rust](https://www.rust-lang.org).
- [Node](https://nodejs.org).


https://blog.metlo.com/writing-a-node-library-in-rust/



https://assets.razerzone.com/dev_portal/REST/html/md__r_e_s_t_external_11_heartbeat.html
https://developers.home.google.com/codelabs/smarthome-washer?hl=en&continue=https%3A%2F%2Fcodelabs.developers.google.com%2F%3Fcat%3Dassistant#2
https://github.com/google-home/smarthome-washer
https://github.com/google-home/smart-home-local


https://console.actions.google.com/u/0/
https://www.home-assistant.io/integrations/google_assistant_sdk
https://medium.com/@silvano.luciani/actions-on-google-client-library-for-node-js-v2-0-0-alpha-c92361167f15
https://medium.com/@silvano.luciani/deploy-your-assistant-app-fulfillment-webhook-using-cloud-functions-for-firebase-da83275ee715


https://dev.to/obniz_io/google-home-integration-3e8c
https://dev.to/davidnadejdin/build-your-for-google-home-2b2a


https://console.cloud.google.com/apis/credentials?authuser=2&project=pcsmart
https://codeculturepro.medium.com/implementing-authentication-in-nodejs-app-using-oauth2-0-59fee8f63798
https://dev.to/davidnadejdin/build-your-for-google-home-2b2a
