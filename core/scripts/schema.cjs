require("reflect-metadata");
const fs = require("node:fs");
const path = require("node:path");
const { buildSchema } = require("type-graphql");
const { ObjectId } = require("mongodb");
const { ObjectIdScalar, JSONObject } = require("../dist/src/util/scalars");
function files(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? files(path.join(dir, e.name))
        : e.name.endsWith(".resolver.js")
          ? [path.join(dir, e.name)]
          : [],
    );
}
const resolvers = files(
  path.resolve(__dirname, "../dist/src/resolvers"),
).flatMap((file) =>
  Object.values(require(file)).filter((x) => typeof x === "function"),
);
buildSchema({
  resolvers,
  scalarsMap: [
    { type: ObjectId, scalar: ObjectIdScalar },
    { type: Object, scalar: JSONObject },
  ],
  authChecker: () => true,
  emitSchemaFile: path.resolve(__dirname, "../schema.graphql"),
})
  .then(() =>
    fs.copyFileSync(
      path.resolve(__dirname, "../schema.graphql"),
      path.resolve(__dirname, "../schema.gql"),
    ),
  )
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
