/**
 *
 * You'll create this file manually, and configure the codegen with the path to this file.
 *   oclif will use the exported client for all its requests, so if you have any
 *   authentication or request manipulation to do, you can do it here.
 */

import { GraphQLClient } from "graphql-request";

const client = new GraphQLClient("http://localhost:4000");
export default client;
