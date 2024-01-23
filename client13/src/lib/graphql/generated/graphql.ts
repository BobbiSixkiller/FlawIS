/* eslint-disable */
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** The javascript `Date` as string. Type represents date and time as the ISO Date string. */
  DateTime: { input: any; output: any; }
  /** Mongo object id scalar type */
  ObjectId: { input: any; output: any; }
};

export type Address = {
  __typename?: 'Address';
  city: Scalars['String']['output'];
  country: Scalars['String']['output'];
  postal: Scalars['String']['output'];
  street: Scalars['String']['output'];
};

/** Billing information */
export type Billing = {
  __typename?: 'Billing';
  DIC: Scalars['String']['output'];
  ICDPH: Scalars['String']['output'];
  ICO: Scalars['String']['output'];
  address: Address;
  name: Scalars['String']['output'];
};

export type IMutationResponse = {
  message: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  activateUser: Scalars['String']['output'];
  deleteUser: Scalars['Boolean']['output'];
  login: User;
  passwordReset: UserMutationResponse;
  register: UserMutationResponse;
  resendActivationLink: Scalars['String']['output'];
  toggleVerifiedUser: UserMutationResponse;
  updateUser: UserMutationResponse;
};


export type MutationDeleteUserArgs = {
  id: Scalars['ObjectId']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationPasswordResetArgs = {
  data: PasswordInput;
};


export type MutationRegisterArgs = {
  data: RegisterInput;
};


export type MutationToggleVerifiedUserArgs = {
  id: Scalars['ObjectId']['input'];
};


export type MutationUpdateUserArgs = {
  data: UserInput;
  id: Scalars['ObjectId']['input'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor: Scalars['ObjectId']['output'];
  hasNextPage: Scalars['Boolean']['output'];
};

export type PasswordInput = {
  password: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  forgotPassword: Scalars['String']['output'];
  me: User;
  textSearchUser: Array<User>;
  user: User;
  users: UserConnection;
};


export type QueryForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type QueryTextSearchUserArgs = {
  text: Scalars['String']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ObjectId']['input'];
};


export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['ObjectId']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

/** New user input data */
export type RegisterInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  organization: Scalars['String']['input'];
  password: Scalars['String']['input'];
  telephone: Scalars['String']['input'];
};

/** User role inside the FLAWIS system */
export enum Role {
  Admin = 'Admin',
  Basic = 'Basic'
}

/** The user model entity */
export type User = {
  __typename?: 'User';
  billings: Array<Maybe<Billing>>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ObjectId']['output'];
  name: Scalars['String']['output'];
  organization: Scalars['String']['output'];
  role: Role;
  telephone: Scalars['String']['output'];
  token: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  verified: Scalars['Boolean']['output'];
};

/** UserConnection type enabling cursor based pagination */
export type UserConnection = {
  __typename?: 'UserConnection';
  edges: Array<Maybe<UserEdge>>;
  pageInfo: PageInfo;
};

export type UserEdge = {
  __typename?: 'UserEdge';
  cursor: Scalars['ObjectId']['output'];
  node: User;
};

/** User update input data */
export type UserInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  organization: Scalars['String']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Role>;
  telephone: Scalars['String']['input'];
};

export type UserMutationResponse = IMutationResponse & {
  __typename?: 'UserMutationResponse';
  data: User;
  message: Scalars['String']['output'];
};

export type UserFragment = { __typename?: 'User', id: any, name: string, email: string, organization: string, telephone: string, role: Role, verified: boolean, createdAt: any, updatedAt: any, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: any, name: string, email: string, organization: string, telephone: string, role: Role, verified: boolean, createdAt: any, updatedAt: any, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } };

export type LoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'User', token: string } };

export type ForgotPasswordQueryVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type ForgotPasswordQuery = { __typename?: 'Query', forgotPassword: string };

export type PasswordResetMutationVariables = Exact<{
  data: PasswordInput;
}>;


export type PasswordResetMutation = { __typename?: 'Mutation', passwordReset: { __typename?: 'UserMutationResponse', message: string, data: { __typename?: 'User', token: string } } };

export type RegisterMutationVariables = Exact<{
  data: RegisterInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'UserMutationResponse', message: string, data: { __typename?: 'User', token: string } } };

export type ResendActivationLinkMutationVariables = Exact<{ [key: string]: never; }>;


export type ResendActivationLinkMutation = { __typename?: 'Mutation', resendActivationLink: string };

export type ActivateUserMutationVariables = Exact<{ [key: string]: never; }>;


export type ActivateUserMutation = { __typename?: 'Mutation', activateUser: string };

export type UsersQueryVariables = Exact<{
  after?: InputMaybe<Scalars['ObjectId']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UsersQuery = { __typename?: 'Query', users: { __typename?: 'UserConnection', edges: Array<{ __typename?: 'UserEdge', cursor: any, node: { __typename?: 'User', id: any, name: string, email: string, organization: string, verified: boolean, role: Role, createdAt: any, updatedAt: any } } | null>, pageInfo: { __typename?: 'PageInfo', endCursor: any, hasNextPage: boolean } } };

export type UserQueryVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type UserQuery = { __typename?: 'Query', user: { __typename?: 'User', id: any, name: string, email: string, organization: string, telephone: string, role: Role, verified: boolean, createdAt: any, updatedAt: any, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } };

export type TextSearchUserQueryVariables = Exact<{
  text: Scalars['String']['input'];
}>;


export type TextSearchUserQuery = { __typename?: 'Query', textSearchUser: Array<{ __typename?: 'User', id: any, name: string, email: string }> };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
  data: UserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'UserMutationResponse', message: string } };

export type ToggleVerifiedUserMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type ToggleVerifiedUserMutation = { __typename?: 'Mutation', toggleVerifiedUser: { __typename?: 'UserMutationResponse', message: string } };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: DocumentTypeDecoration<TResult, TVariables>['__apiType'];

  constructor(private value: string, public __meta__?: Record<string, any>) {
    super(value);
  }

  toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const UserFragmentDoc = new TypedDocumentString(`
    fragment User on User {
  id
  name
  email
  organization
  telephone
  role
  verified
  createdAt
  updatedAt
  billings {
    name
    address {
      street
      city
      postal
      country
    }
    ICO
    DIC
    ICDPH
  }
}
    `, {"fragmentName":"User"}) as unknown as TypedDocumentString<UserFragment, unknown>;
export const MeDocument = new TypedDocumentString(`
    query me {
  me {
    ...User
  }
}
    fragment User on User {
  id
  name
  email
  organization
  telephone
  role
  verified
  createdAt
  updatedAt
  billings {
    name
    address {
      street
      city
      postal
      country
    }
    ICO
    DIC
    ICDPH
  }
}`) as unknown as TypedDocumentString<MeQuery, MeQueryVariables>;
export const LoginDocument = new TypedDocumentString(`
    mutation login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
  }
}
    `) as unknown as TypedDocumentString<LoginMutation, LoginMutationVariables>;
export const ForgotPasswordDocument = new TypedDocumentString(`
    query forgotPassword($email: String!) {
  forgotPassword(email: $email)
}
    `) as unknown as TypedDocumentString<ForgotPasswordQuery, ForgotPasswordQueryVariables>;
export const PasswordResetDocument = new TypedDocumentString(`
    mutation passwordReset($data: PasswordInput!) {
  passwordReset(data: $data) {
    message
    data {
      token
    }
  }
}
    `) as unknown as TypedDocumentString<PasswordResetMutation, PasswordResetMutationVariables>;
export const RegisterDocument = new TypedDocumentString(`
    mutation register($data: RegisterInput!) {
  register(data: $data) {
    message
    data {
      token
    }
  }
}
    `) as unknown as TypedDocumentString<RegisterMutation, RegisterMutationVariables>;
export const ResendActivationLinkDocument = new TypedDocumentString(`
    mutation resendActivationLink {
  resendActivationLink
}
    `) as unknown as TypedDocumentString<ResendActivationLinkMutation, ResendActivationLinkMutationVariables>;
export const ActivateUserDocument = new TypedDocumentString(`
    mutation activateUser {
  activateUser
}
    `) as unknown as TypedDocumentString<ActivateUserMutation, ActivateUserMutationVariables>;
export const UsersDocument = new TypedDocumentString(`
    query users($after: ObjectId, $first: Int) {
  users(after: $after, first: $first) {
    edges {
      cursor
      node {
        id
        name
        email
        organization
        verified
        role
        createdAt
        updatedAt
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
    `) as unknown as TypedDocumentString<UsersQuery, UsersQueryVariables>;
export const UserDocument = new TypedDocumentString(`
    query user($id: ObjectId!) {
  user(id: $id) {
    ...User
  }
}
    fragment User on User {
  id
  name
  email
  organization
  telephone
  role
  verified
  createdAt
  updatedAt
  billings {
    name
    address {
      street
      city
      postal
      country
    }
    ICO
    DIC
    ICDPH
  }
}`) as unknown as TypedDocumentString<UserQuery, UserQueryVariables>;
export const TextSearchUserDocument = new TypedDocumentString(`
    query textSearchUser($text: String!) {
  textSearchUser(text: $text) {
    id
    name
    email
  }
}
    `) as unknown as TypedDocumentString<TextSearchUserQuery, TextSearchUserQueryVariables>;
export const UpdateUserDocument = new TypedDocumentString(`
    mutation updateUser($id: ObjectId!, $data: UserInput!) {
  updateUser(id: $id, data: $data) {
    message
  }
}
    `) as unknown as TypedDocumentString<UpdateUserMutation, UpdateUserMutationVariables>;
export const ToggleVerifiedUserDocument = new TypedDocumentString(`
    mutation toggleVerifiedUser($id: ObjectId!) {
  toggleVerifiedUser(id: $id) {
    message
  }
}
    `) as unknown as TypedDocumentString<ToggleVerifiedUserMutation, ToggleVerifiedUserMutationVariables>;