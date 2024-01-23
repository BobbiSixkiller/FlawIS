/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "fragment User on User {\n  id\n  name\n  email\n  organization\n  telephone\n  role\n  verified\n  createdAt\n  updatedAt\n  billings {\n    name\n    address {\n      street\n      city\n      postal\n      country\n    }\n    ICO\n    DIC\n    ICDPH\n  }\n}\n\nquery me {\n  me {\n    ...User\n  }\n}\n\nmutation login($email: String!, $password: String!) {\n  login(email: $email, password: $password) {\n    token\n  }\n}\n\nquery forgotPassword($email: String!) {\n  forgotPassword(email: $email)\n}\n\nmutation passwordReset($data: PasswordInput!) {\n  passwordReset(data: $data) {\n    message\n    data {\n      token\n    }\n  }\n}\n\nmutation register($data: RegisterInput!) {\n  register(data: $data) {\n    message\n    data {\n      token\n    }\n  }\n}\n\nmutation resendActivationLink {\n  resendActivationLink\n}\n\nmutation activateUser {\n  activateUser\n}": types.UserFragmentDoc,
    "query users($after: ObjectId, $first: Int) {\n  users(after: $after, first: $first) {\n    edges {\n      cursor\n      node {\n        id\n        name\n        email\n        organization\n        verified\n        role\n        createdAt\n        updatedAt\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nquery user($id: ObjectId!) {\n  user(id: $id) {\n    ...User\n  }\n}\n\nquery textSearchUser($text: String!) {\n  textSearchUser(text: $text) {\n    id\n    name\n    email\n  }\n}\n\nmutation updateUser($id: ObjectId!, $data: UserInput!) {\n  updateUser(id: $id, data: $data) {\n    message\n  }\n}\n\nmutation toggleVerifiedUser($id: ObjectId!) {\n  toggleVerifiedUser(id: $id) {\n    message\n  }\n}": types.UsersDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment User on User {\n  id\n  name\n  email\n  organization\n  telephone\n  role\n  verified\n  createdAt\n  updatedAt\n  billings {\n    name\n    address {\n      street\n      city\n      postal\n      country\n    }\n    ICO\n    DIC\n    ICDPH\n  }\n}\n\nquery me {\n  me {\n    ...User\n  }\n}\n\nmutation login($email: String!, $password: String!) {\n  login(email: $email, password: $password) {\n    token\n  }\n}\n\nquery forgotPassword($email: String!) {\n  forgotPassword(email: $email)\n}\n\nmutation passwordReset($data: PasswordInput!) {\n  passwordReset(data: $data) {\n    message\n    data {\n      token\n    }\n  }\n}\n\nmutation register($data: RegisterInput!) {\n  register(data: $data) {\n    message\n    data {\n      token\n    }\n  }\n}\n\nmutation resendActivationLink {\n  resendActivationLink\n}\n\nmutation activateUser {\n  activateUser\n}"): typeof import('./graphql').UserFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query users($after: ObjectId, $first: Int) {\n  users(after: $after, first: $first) {\n    edges {\n      cursor\n      node {\n        id\n        name\n        email\n        organization\n        verified\n        role\n        createdAt\n        updatedAt\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nquery user($id: ObjectId!) {\n  user(id: $id) {\n    ...User\n  }\n}\n\nquery textSearchUser($text: String!) {\n  textSearchUser(text: $text) {\n    id\n    name\n    email\n  }\n}\n\nmutation updateUser($id: ObjectId!, $data: UserInput!) {\n  updateUser(id: $id, data: $data) {\n    message\n  }\n}\n\nmutation toggleVerifiedUser($id: ObjectId!) {\n  toggleVerifiedUser(id: $id) {\n    message\n  }\n}"): typeof import('./graphql').UsersDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
