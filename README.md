# GraphQL Codegen: CLI

With GraphQL Codegen, building a CLI tool for your GraphQL API couldn't be easier. In four steps, you can have a user-friendly command-line interface:

1. Generate a boilerplate CLI using `oclif`
2. Add GraphQL Documents (Queries & Mutations)
3. Add and export a graphql client of your choice (`graphql-request`, `apollo-client`, etc)
4. Add, configure, and run the code generator

### Step 1: Generate the CLI scaffold

You'll be starting from your projects directory. From there, generate the CLI skeleton using `oclif` by following the steps in their [guide](https://oclif.io/docs/introduction). You can choose either the `single` or `multi` type, and can switch later if you change your mind.

### Step 2: Add GraphQL Documents

These documents are how `oclif` will interact with your API. For each document, there will be exactly one command.

Within the directory created by the `oclif` tool, you'll have a subdirectory `src/commands`. That's where you'll put your GraphQL documents. Ie, to create a `<cli-name> hello` command, you'd write a `src/commands/hello.graphql` document, which will be used to generate a `src/commands/hello.ts` file. **Important**: each document should have exactly one GraphQL operation.

### Step 3: Add & Export a GraphQL Client

Which client you use, and how you configure it, is entirely up to you! It just has to conform to the `GraphQLClient` type interface exported by `graphql`. You can add a `src/client.ts` (or any other path), configure your client there, and then export it as the **default** (check out [our example](src/client.ts)). `graphql-request` should work for most use cases. It's in this module that you can handle auth logic, read config files, etc., and that will apply to all CLI operations. This file will not be modified by the codegen.

### Step 4: Add & Configure GraphQL Codegen

First, follow the GraphQL-Code-Generator guide to install it, and make sure to also install `@graphql-codegen/typescript-cli`. Then, change your `codegen.yml` file to look like this:

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
      - typescript-operations
      - typescript-cli:
          client: ../client.ts 
```

Breaking that down: 

* Reading your schema allows the codegen tool to understand what types it's working with
* The 'documents' section will collect all of your `*.graphql` files
* `src/types.ts` creates the typescript types that the rest of the tool can reference
* `near-operation-file` is a `graphql-codegen` preset which allows one output file per input file (ie, one `.ts` module per `.graphql` document) rather than one output file for the whole package. This is _required_ for `oclif` to work, since it relies on the file structure for information.