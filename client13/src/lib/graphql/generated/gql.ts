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
    "fragment User on User {\n  id\n  titlesBefore\n  name\n  titlesAfter\n  email\n  role\n  verified\n  createdAt\n  updatedAt\n}\n\nmutation login($email: String!, $password: String!) {\n  login(email: $email, password: $password)\n}\n\nquery me {\n  me {\n    ...User\n    organisation\n    telephone\n    billings {\n      name\n      address {\n        street\n        city\n        postal\n        country\n      }\n      ICO\n      DIC\n      ICDPH\n    }\n  }\n}\n\nquery forgotPassword($email: String!) {\n  forgotPassword(email: $email)\n}\n\nmutation passwordReset($data: PasswordInput!) {\n  passwordReset(data: $data)\n}\n\nmutation register($data: RegisterInput!) {\n  register(data: $data)\n}\n\nmutation resendActivationLink {\n  resendActivationLink\n}\n\nmutation activateUser {\n  activateUser\n}\n\nmutation logout {\n  logout\n}": types.UserFragmentDoc,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment User on User {\n  id\n  titlesBefore\n  name\n  titlesAfter\n  email\n  role\n  verified\n  createdAt\n  updatedAt\n}\n\nmutation login($email: String!, $password: String!) {\n  login(email: $email, password: $password)\n}\n\nquery me {\n  me {\n    ...User\n    organisation\n    telephone\n    billings {\n      name\n      address {\n        street\n        city\n        postal\n        country\n      }\n      ICO\n      DIC\n      ICDPH\n    }\n  }\n}\n\nquery forgotPassword($email: String!) {\n  forgotPassword(email: $email)\n}\n\nmutation passwordReset($data: PasswordInput!) {\n  passwordReset(data: $data)\n}\n\nmutation register($data: RegisterInput!) {\n  register(data: $data)\n}\n\nmutation resendActivationLink {\n  resendActivationLink\n}\n\nmutation activateUser {\n  activateUser\n}\n\nmutation logout {\n  logout\n}"): typeof import('./graphql').UserFragmentDoc;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
