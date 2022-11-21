import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  ObjectId: any;
  Upload: any;
};

export type Address = {
  __typename?: 'Address';
  city: Scalars['String'];
  country: Scalars['String'];
  postal: Scalars['String'];
  street: Scalars['String'];
};

export type AddressInput = {
  city: Scalars['String'];
  country: Scalars['String'];
  postal: Scalars['String'];
  street: Scalars['String'];
};

/** Attendee model type */
export type Attendee = {
  __typename?: 'Attendee';
  conference: Conference;
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  invoice: Invoice;
  online: Scalars['Boolean'];
  submissions: Array<Submission>;
  updatedAt: Scalars['DateTime'];
  user: User;
  withSubmission: Scalars['Boolean'];
};

/** AttendeeConnection type enabling cursor based pagination */
export type AttendeeConnection = {
  __typename?: 'AttendeeConnection';
  edges: Array<Maybe<AttendeeEdge>>;
  pageInfo: PageInfo;
};

export type AttendeeEdge = {
  __typename?: 'AttendeeEdge';
  cursor: Scalars['ObjectId'];
  node: Attendee;
};

export type AttendeeInput = {
  billing: BillingInput;
  conferenceId: Scalars['ObjectId'];
  ticketId: Scalars['ObjectId'];
};

/** Billing information */
export type Billing = {
  __typename?: 'Billing';
  DIC: Scalars['String'];
  IBAN?: Maybe<Scalars['String']>;
  ICDPH: Scalars['String'];
  ICO: Scalars['String'];
  SWIFT?: Maybe<Scalars['String']>;
  address: Address;
  name: Scalars['String'];
};

export type BillingInput = {
  DIC: Scalars['String'];
  IBAN?: InputMaybe<Scalars['String']>;
  ICDPH: Scalars['String'];
  ICO: Scalars['String'];
  SWIFT?: InputMaybe<Scalars['String']>;
  address: AddressInput;
  name: Scalars['String'];
};

/** Budget model type */
export type Budget = {
  __typename?: 'Budget';
  createdAt: Scalars['DateTime'];
  indirect: Scalars['Float'];
  material: Scalars['Float'];
  members: Array<Member>;
  salaries: Scalars['Float'];
  services: Scalars['Float'];
  travel: Scalars['Float'];
  updatedAt: Scalars['DateTime'];
  year: Scalars['DateTime'];
};

/** Conference model type */
export type Conference = {
  __typename?: 'Conference';
  attendees: AttendeeConnection;
  attendeesCount: Scalars['Int'];
  attending: Scalars['Boolean'];
  createdAt: Scalars['DateTime'];
  description: Scalars['String'];
  end?: Maybe<Scalars['DateTime']>;
  host?: Maybe<Host>;
  id: Scalars['ID'];
  logoUrl: Scalars['String'];
  name: Scalars['String'];
  regStart?: Maybe<Scalars['DateTime']>;
  sections: Array<Section>;
  slug: Scalars['String'];
  start?: Maybe<Scalars['DateTime']>;
  tickets: Array<Ticket>;
  translations: Array<ConferenceTranslation>;
  updatedAt: Scalars['DateTime'];
  variableSymbol: Scalars['String'];
  venue?: Maybe<Venue>;
};


/** Conference model type */
export type ConferenceAttendeesArgs = {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
};

export type ConferenceInput = {
  description: Scalars['String'];
  end?: InputMaybe<Scalars['DateTime']>;
  host?: InputMaybe<HostInput>;
  logoUrl: Scalars['String'];
  name: Scalars['String'];
  regStart?: InputMaybe<Scalars['DateTime']>;
  slug: Scalars['String'];
  start?: InputMaybe<Scalars['DateTime']>;
  tickets?: InputMaybe<Array<TicketInput>>;
  translations?: InputMaybe<Array<ConferenceInputTranslation>>;
  variableSymbol: Scalars['String'];
  venue?: InputMaybe<VenueInput>;
};

export type ConferenceInputTranslation = {
  description: Scalars['String'];
  language: Scalars['String'];
  logoUrl: Scalars['String'];
  name: Scalars['String'];
  tickets?: InputMaybe<Array<TicketInputTranslation>>;
};

export type ConferenceTranslation = {
  __typename?: 'ConferenceTranslation';
  description: Scalars['String'];
  language: Scalars['String'];
  logoUrl: Scalars['String'];
  name: Scalars['String'];
  tickets: Array<TicketTranslation>;
};

/** User input type */
export type ConferenceUserInput = {
  organisation: Scalars['String'];
  telephone: Scalars['String'];
};

/** Supported file types for upload mutation */
export enum FileType {
  Image = 'IMAGE',
  Submission = 'SUBMISSION'
}

/** Attendee model type */
export type Grant = {
  __typename?: 'Grant';
  budget: Array<Budget>;
  createdAt: Scalars['DateTime'];
  end: Scalars['DateTime'];
  files: Array<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  start: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
};

/** GrantConnection type enabling cursor based pagination */
export type GrantConnection = {
  __typename?: 'GrantConnection';
  edges: Array<Maybe<GrantEdge>>;
  pageInfo: PageInfo;
};

export type GrantEdge = {
  __typename?: 'GrantEdge';
  cursor: Scalars['ObjectId'];
  node: Grant;
};

export type GrantInput = {
  end: Scalars['DateTime'];
  files: Array<Scalars['String']>;
  name: Scalars['String'];
  start: Scalars['DateTime'];
};

/** Conference hosting organization */
export type Host = {
  __typename?: 'Host';
  billing: Billing;
  logoUrl: Scalars['String'];
  stampUrl: Scalars['String'];
};

export type HostInput = {
  billing: BillingInput;
  logoUrl: Scalars['String'];
  stampUrl: Scalars['String'];
};

/** Invoice entity subdocument type */
export type Invoice = {
  __typename?: 'Invoice';
  body: InvoiceData;
  issuer: Host;
  payer: Billing;
};

/** The body of an invoice */
export type InvoiceData = {
  __typename?: 'InvoiceData';
  body: Scalars['String'];
  comment: Scalars['String'];
  dueDate: Scalars['DateTime'];
  issueDate: Scalars['DateTime'];
  ticketPrice: Scalars['Int'];
  type: Scalars['String'];
  variableSymbol: Scalars['String'];
  vat: Scalars['Int'];
  vatDate: Scalars['DateTime'];
};

export type InvoiceDataInput = {
  body: Scalars['String'];
  comment: Scalars['String'];
  dueDate: Scalars['DateTime'];
  issueDate: Scalars['DateTime'];
  ticketPrice: Scalars['Int'];
  type: Scalars['String'];
  variableSymbol: Scalars['String'];
  vat: Scalars['Int'];
  vatDate: Scalars['DateTime'];
};

/** Invoice data input type facilitating attendee's invoice update */
export type InvoiceInput = {
  body?: InputMaybe<InvoiceDataInput>;
  issuer?: InputMaybe<BillingInput>;
  payer?: InputMaybe<BillingInput>;
};

/** Member model type */
export type Member = {
  __typename?: 'Member';
  createdAt: Scalars['DateTime'];
  hours: Scalars['Float'];
  member: User;
  updatedAt: Scalars['DateTime'];
  user: User;
};

export type Mutation = {
  __typename?: 'Mutation';
  activateUser: Scalars['Boolean'];
  addAttendee: Attendee;
  addSubmission: Submission;
  createConference: Conference;
  createGrant: Grant;
  createSection: Section;
  deleteConference: Scalars['Boolean'];
  deleteGrant: Scalars['Boolean'];
  deleteSection: Scalars['Boolean'];
  deleteSubmission: Scalars['Boolean'];
  deleteUser: Scalars['Boolean'];
  login: User;
  logout: Scalars['Boolean'];
  passwordReset: User;
  register: User;
  removeAttendee: Scalars['Boolean'];
  updateConference: Conference;
  updateConferenceUser: User;
  updateInvoice: Attendee;
  updateSection: Section;
  updateSubmission: Submission;
  updateUser: User;
  updategrant: Grant;
  uploadFile: Scalars['String'];
};


export type MutationActivateUserArgs = {
  token: Scalars['String'];
};


export type MutationAddAttendeeArgs = {
  data: AttendeeInput;
};


export type MutationAddSubmissionArgs = {
  data: SubmissionInput;
};


export type MutationCreateConferenceArgs = {
  data: ConferenceInput;
};


export type MutationCreateGrantArgs = {
  data: GrantInput;
};


export type MutationCreateSectionArgs = {
  data: SectionInput;
};


export type MutationDeleteConferenceArgs = {
  id: Scalars['ObjectId'];
};


export type MutationDeleteGrantArgs = {
  id: Scalars['ObjectId'];
};


export type MutationDeleteSectionArgs = {
  id: Scalars['ObjectId'];
};


export type MutationDeleteSubmissionArgs = {
  id: Scalars['ObjectId'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ObjectId'];
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationPasswordResetArgs = {
  data: PasswordInput;
};


export type MutationRegisterArgs = {
  data: RegisterInput;
};


export type MutationRemoveAttendeeArgs = {
  id: Scalars['ObjectId'];
};


export type MutationUpdateConferenceArgs = {
  data: ConferenceInput;
  id: Scalars['ObjectId'];
};


export type MutationUpdateConferenceUserArgs = {
  data: ConferenceUserInput;
};


export type MutationUpdateInvoiceArgs = {
  data: InvoiceInput;
  id: Scalars['ObjectId'];
};


export type MutationUpdateSectionArgs = {
  data: SectionInput;
  id: Scalars['ObjectId'];
};


export type MutationUpdateSubmissionArgs = {
  data: SubmissionInput;
  id: Scalars['ObjectId'];
};


export type MutationUpdateUserArgs = {
  data: UserInput;
  id: Scalars['ObjectId'];
};


export type MutationUpdategrantArgs = {
  data: GrantInput;
  id: Scalars['ObjectId'];
};


export type MutationUploadFileArgs = {
  file: Scalars['Upload'];
  type: FileType;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor: Scalars['ObjectId'];
  hasNextPage: Scalars['Boolean'];
};

export type PasswordInput = {
  password: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  attendee: Attendee;
  conference: Conference;
  conferences: Array<Conference>;
  forgotPassword: Scalars['String'];
  grant: Grant;
  grants: GrantConnection;
  me: User;
  section: Section;
  submission: Submission;
  user: User;
  users: UserConnection;
};


export type QueryAttendeeArgs = {
  id: Scalars['ObjectId'];
};


export type QueryConferenceArgs = {
  slug: Scalars['String'];
};


export type QueryConferencesArgs = {
  year: Scalars['DateTime'];
};


export type QueryForgotPasswordArgs = {
  email: Scalars['String'];
};


export type QueryGrantArgs = {
  id: Scalars['ObjectId'];
};


export type QueryGrantsArgs = {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
};


export type QuerySectionArgs = {
  id: Scalars['ObjectId'];
};


export type QuerySubmissionArgs = {
  id: Scalars['ObjectId'];
};


export type QueryUserArgs = {
  id: Scalars['ObjectId'];
};


export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** New user input data */
export type RegisterInput = {
  email: Scalars['String'];
  name: Scalars['String'];
  password: Scalars['String'];
};

/** User role inside the FLAWIS system */
export enum Role {
  Admin = 'Admin',
  Basic = 'Basic'
}

/** Conference's section entity model type */
export type Section = {
  __typename?: 'Section';
  conference: Scalars['String'];
  createdAt: Scalars['DateTime'];
  description: Scalars['String'];
  id: Scalars['ID'];
  languages: Array<Scalars['String']>;
  name: Scalars['String'];
  submissions: Array<Submission>;
  translations: Array<SectionTranslation>;
  updatedAt: Scalars['DateTime'];
};

/** Conference section input type */
export type SectionInput = {
  conference: Scalars['String'];
  description: Scalars['String'];
  languages: Array<Scalars['String']>;
  name: Scalars['String'];
  translations: Array<TranslationInput>;
};

export type SectionTranslation = {
  __typename?: 'SectionTranslation';
  description: Scalars['String'];
  language: Scalars['String'];
  name: Scalars['String'];
};

/** Submission entity model type */
export type Submission = {
  __typename?: 'Submission';
  abstract: Scalars['String'];
  authors: Array<User>;
  conference: Conference;
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  keywords: Array<Scalars['String']>;
  name: Scalars['String'];
  section: Section;
  submissionUrl?: Maybe<Scalars['String']>;
  translations: Array<SubmissionTranslation>;
  updatedAt: Scalars['DateTime'];
};

export type SubmissionInput = {
  abstract: Scalars['String'];
  authors?: InputMaybe<Array<Scalars['String']>>;
  conferenceId?: InputMaybe<Scalars['ObjectId']>;
  keywords: Array<Scalars['String']>;
  name: Scalars['String'];
  sectionId?: InputMaybe<Scalars['ObjectId']>;
  submissionUrl?: InputMaybe<Scalars['String']>;
  translations: Array<SubmissionInputTranslation>;
};

export type SubmissionInputTranslation = {
  abstract: Scalars['String'];
  keywords: Array<Scalars['String']>;
  language: Scalars['String'];
  name: Scalars['String'];
};

export type SubmissionTranslation = {
  __typename?: 'SubmissionTranslation';
  abstract: Scalars['String'];
  keywords: Array<Scalars['String']>;
  language: Scalars['String'];
  name: Scalars['String'];
};

/** Conference ticket type */
export type Ticket = {
  __typename?: 'Ticket';
  description: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  online: Scalars['Boolean'];
  price: Scalars['Int'];
  withSubmission: Scalars['Boolean'];
};

export type TicketInput = {
  description: Scalars['String'];
  name: Scalars['String'];
  online: Scalars['Boolean'];
  price: Scalars['Int'];
  withSubmission: Scalars['Boolean'];
};

export type TicketInputTranslation = {
  description: Scalars['String'];
  language: Scalars['String'];
  name: Scalars['String'];
};

export type TicketTranslation = {
  __typename?: 'TicketTranslation';
  description: Scalars['String'];
  language: Scalars['String'];
  name: Scalars['String'];
};

export type TranslationInput = {
  description: Scalars['String'];
  language: Scalars['String'];
  name: Scalars['String'];
};

/** User reference type from users microservice with contributed billings field */
export type User = {
  __typename?: 'User';
  billings: Array<Maybe<Billing>>;
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  grants?: Maybe<Scalars['Int']>;
  hours: Scalars['Int'];
  id: Scalars['ID'];
  name: Scalars['String'];
  organisation: Scalars['String'];
  role: Role;
  telephone: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  verified: Scalars['Boolean'];
};


/** User reference type from users microservice with contributed billings field */
export type UserGrantsArgs = {
  year: Scalars['DateTime'];
};


/** User reference type from users microservice with contributed billings field */
export type UserHoursArgs = {
  year: Scalars['DateTime'];
};

/** UserConnection type enabling cursor based pagination */
export type UserConnection = {
  __typename?: 'UserConnection';
  edges: Array<Maybe<UserEdge>>;
  pageInfo: PageInfo;
};

export type UserEdge = {
  __typename?: 'UserEdge';
  cursor: Scalars['ObjectId'];
  node: User;
};

/** User update input data */
export type UserInput = {
  email: Scalars['String'];
  name: Scalars['String'];
  role?: InputMaybe<Scalars['String']>;
};

/** Venue that conference takes place in */
export type Venue = {
  __typename?: 'Venue';
  address: Address;
  name: Scalars['String'];
};

export type VenueInput = {
  address: AddressInput;
  name: Scalars['String'];
};

export type LoginMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'User', id: string, name: string, email: string, role: Role, verified: boolean, organisation: string, telephone: string, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, IBAN?: string | null, SWIFT?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, name: string, email: string, organisation: string, telephone: string, role: Role, verified: boolean, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, IBAN?: string | null, SWIFT?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } };

export type RegisterMutationVariables = Exact<{
  data: RegisterInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'User', id: string, name: string, email: string, role: Role, verified: boolean } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type UpdateConferenceUserMutationVariables = Exact<{
  data: ConferenceUserInput;
}>;


export type UpdateConferenceUserMutation = { __typename?: 'Mutation', updateConferenceUser: { __typename?: 'User', id: string, name: string, email: string, organisation: string, telephone: string, role: Role, verified: boolean, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, IBAN?: string | null, SWIFT?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ObjectId'];
  data: UserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'User', id: string, name: string, email: string, role: Role, verified: boolean, organisation: string, telephone: string, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, IBAN?: string | null, SWIFT?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } };


export const LoginDocument = gql`
    mutation login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    id
    name
    email
    role
    verified
    organisation
    telephone
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
      IBAN
      SWIFT
    }
  }
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const MeDocument = gql`
    query me {
  me {
    id
    name
    email
    organisation
    telephone
    role
    verified
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
      IBAN
      SWIFT
    }
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const RegisterDocument = gql`
    mutation register($data: RegisterInput!) {
  register(data: $data) {
    id
    name
    email
    role
    verified
  }
}
    `;
export type RegisterMutationFn = Apollo.MutationFunction<RegisterMutation, RegisterMutationVariables>;

/**
 * __useRegisterMutation__
 *
 * To run a mutation, you first call `useRegisterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerMutation, { data, loading, error }] = useRegisterMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useRegisterMutation(baseOptions?: Apollo.MutationHookOptions<RegisterMutation, RegisterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument, options);
      }
export type RegisterMutationHookResult = ReturnType<typeof useRegisterMutation>;
export type RegisterMutationResult = Apollo.MutationResult<RegisterMutation>;
export type RegisterMutationOptions = Apollo.BaseMutationOptions<RegisterMutation, RegisterMutationVariables>;
export const LogoutDocument = gql`
    mutation logout {
  logout
}
    `;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: Apollo.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, options);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const UpdateConferenceUserDocument = gql`
    mutation updateConferenceUser($data: ConferenceUserInput!) {
  updateConferenceUser(data: $data) {
    id
    name
    email
    organisation
    telephone
    role
    verified
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
      IBAN
      SWIFT
    }
  }
}
    `;
export type UpdateConferenceUserMutationFn = Apollo.MutationFunction<UpdateConferenceUserMutation, UpdateConferenceUserMutationVariables>;

/**
 * __useUpdateConferenceUserMutation__
 *
 * To run a mutation, you first call `useUpdateConferenceUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateConferenceUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateConferenceUserMutation, { data, loading, error }] = useUpdateConferenceUserMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateConferenceUserMutation(baseOptions?: Apollo.MutationHookOptions<UpdateConferenceUserMutation, UpdateConferenceUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateConferenceUserMutation, UpdateConferenceUserMutationVariables>(UpdateConferenceUserDocument, options);
      }
export type UpdateConferenceUserMutationHookResult = ReturnType<typeof useUpdateConferenceUserMutation>;
export type UpdateConferenceUserMutationResult = Apollo.MutationResult<UpdateConferenceUserMutation>;
export type UpdateConferenceUserMutationOptions = Apollo.BaseMutationOptions<UpdateConferenceUserMutation, UpdateConferenceUserMutationVariables>;
export const UpdateUserDocument = gql`
    mutation updateUser($id: ObjectId!, $data: UserInput!) {
  updateUser(id: $id, data: $data) {
    id
    name
    email
    role
    verified
    organisation
    telephone
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
      IBAN
      SWIFT
    }
  }
}
    `;
export type UpdateUserMutationFn = Apollo.MutationFunction<UpdateUserMutation, UpdateUserMutationVariables>;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateUserMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserMutation, UpdateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument, options);
      }
export type UpdateUserMutationHookResult = ReturnType<typeof useUpdateUserMutation>;
export type UpdateUserMutationResult = Apollo.MutationResult<UpdateUserMutation>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<UpdateUserMutation, UpdateUserMutationVariables>;