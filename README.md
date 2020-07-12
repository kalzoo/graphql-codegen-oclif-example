# GraphQL Codegen: CLI

With GraphQL Codegen, building a CLI tool for your GraphQL API couldn't be easier. In four steps,
you can have a user-friendly command-line interface:

1. Generate a boilerplate CLI using `oclif`
2. Add GraphQL Documents (Queries & Mutations)
3. Add and export a graphql client of your choice (`graphql-request`, `apollo-client`, etc)
4. Add, configure, and run the code generator

In short: you'll use `.graphql` document files with `@oclif` directives to generate `oclif` commands
with the right arguments and basic input validation, so you don't have to write any CLI-specific logic
or boilerplate.

### Step 1: Generate the CLI scaffold

You'll be starting from your projects directory. From there, generate the CLI skeleton using `oclif`
by following the steps in their [guide](https://oclif.io/docs/introduction). You can choose either
the `single` or `multi` type, and can switch later if you change your mind. This example uses
`multi`.

### Step 2: Add GraphQL Documents

These documents are how `oclif` will interact with your API. For each document, there will be exactly one command.

Within the directory created by the `oclif` tool, you'll have a subdirectory `src/commands`. That's
where you'll put your GraphQL documents. Ie, to create a `<cli-name> hello` command, you'd write a
`src/commands/hello.graphql` document, which will be used to generate a `src/commands/hello.ts`
file. **Important**: each document should contain exactly one GraphQL operation.

### Step 3: Add & Export a GraphQL Client

Which client you use, and how you configure it, is entirely up to you! All calls wil be performed
by your _handler_, which you write yourself (it's not generated). The path to that handler is
registered in your `codegen.yml` file, and _all_ of your generated `oclif` commands will package
their arguments and queries and then submit them to your handler, leaving you in complete control
of what goes to the server and what you do with the result.

The example handler is located at `src/handler.ts`, and shows how it works. This example handler is
simple - it sends off the query string and variables to the backend, and then simply prints the
raw result or error. Note that the `handler` function is the default export.

Within your handler, you could use `graphql-request` as we do here, `apollo-client`, or even just a
custom fetch function. You can:

- implement any kind of authentication you'll need to connect to the backend.
- format results based on the query that was sent or the shape of the data returned.

Like all files outside of the configured `documents` blob, this file will not be modified by the
codegen.

### Step 4: Add & Configure GraphQL Codegen

First, follow the GraphQL-Code-Generator guide to install it, and make sure to also install
`@graphql-codegen/typescript-oclif`. Then, change your `codegen.yml` file to look like this:

```
schema: <path-to-your-schema>
documents: "src/commands/**/*.graphql"
generates:
  src/types.ts:
    - typescript
  src/commands/:
    preset: near-operation-file
    presetConfig:
      extension: .ts
      baseTypesPath: ../types.ts
    plugins:
      - typescript-oclif:
          handlerPath: ../../handler
```

Breaking that down:

- Reading your schema allows the codegen tool to understand what types it's working with
- The 'documents' section will collect all of your `*.graphql` files
- `src/types.ts` creates the typescript types that the rest of the tool can reference
- `near-operation-file` is a `graphql-codegen` preset which allows one output file per input file
  (ie, one `.ts` module per `.graphql` document) rather than one output file for the whole package.
  This is _required_ for `oclif` to work, since it relies on the file structure for information.
- Note: `typescript-operations` plugin isn't required, since this library isn't meant to be consumed
  programmatically (and so nothing reads the types that `typescript-operations` would produce)
- The `handlerPath` (default: `../../handler`) is a _relative_ path from your generated commands
  to the handler which will actually send them to the server and then display the output. See below
  for more information.

If you use `documents: "src/commands/**/*.graphql"` here, then `src/commands/foo/bar.graphql` will
generate a command `src/commands/foo/bar.ts`. That file will then import and call your handler at
`src/handler.ts`, if you use `handlerPath: ../../handler`.

With that configured, just run `yarn codegen` or `npx codegen` to generate all the
necessary `oclif` command files. With that complete, follow the directions in the
[oclif guide](https://oclif.io/docs/introduction) to run your new CLI tool
(by default, `./bin/run`).

## Advanced Features

### Descriptions & Examples

You can add descriptions and examples for your commands via `typescript-oclif` with the `@oclif` client-side directive, like so:

```
mutation CreateAuthor($name: String!)
  @oclif(description: "Create a new author", example: "cli author:create --name Alice", example: "cli author:create --name Bob") {
  createAuthor(input: { name: $name }) {
    name
  }
}
```

This `@oclif` directive will not be sent to the server. Note that, for multiple examples, you must
use multiple `example` keys rather than an `examples` array. This is a ~~quirk~~ feature of `graphql`.

### Custom/Manually-maintained Commands

If you want a command that doesn't just execute a GraphQL Query or Mutation, then you can still create
one manually in the same way as any other `oclif` application. If you wanted to add a `fix` command,
for example, you can just create a file at `src/commands/fix.ts`, follow the `oclif` API (ie, export
a class with a `run()` method), and `graphql-codegen` won't disturb that file - so long as you
**don't** _also_ create a `fix.graphql` file next to it (in which case, it _would_ overrride
`fix.ts` on the next run of `graphql-codegen`).

## The Example Application

This repo is an example of a working `typescript-oclif` application, built using the same steps as above.

It also includes a simple GraphQL server to run commands against. In practice, you won't need that
part; you'll have a real service to use somewhere.

To run the example:

1. First, install dependencies with `yarn install` or `npm install`
2. Start the toy server in one terminal: `yarn start:example_server` or `npm run start:example_server`.
   If it's successful, you'll see `Server ready at http://localhost:4000/`. If it's not, please
   post an issue!
3. In a second terminal, run `yarn codegen`, and see the `.ts` files populate under `src/commands`.
   Run the cli with `bin/run`, and use the helpful output to navigate through the options.
   This is how it might look:

```console
foo@bar:~$ ./bin/run
VERSION
  graphql-codegen-oclif-example/1.0.0 darwin-x64 node-v10.16.3

USAGE
  $ example [COMMAND]

TOPICS
  authors     Create a new author
  books       Contract a book to a publisher
  publishers  Find a publisher by name

COMMANDS
  help  display help for example

foo@bar:~$ ./bin/run ./bin/run authors:list
{ authors: [ { name: 'JK Rowling' } ] }

foo@bar:~$ ./bin/run authors:create
 ›   Error: Missing required flag:
 ›    --name NAME
 ›   See more help with --help

foo@bar:~$ ./bin/run authors:create --name "You"
{ createAuthor: { name: 'You' } }

foo@bar:~$ ./bin/run authors:list   { authors: [ { name: 'JK Rowling' }, { name: 'You' } ] }
```

## Contribution

This repo should require relatively little maintenance, but it's still maintained! If it doesn't
work for you, or you'd like to see a change, please do post an issue or PR 😀.
