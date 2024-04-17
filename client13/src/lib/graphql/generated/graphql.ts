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
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.This scalar is serialized to a string in ISO 8601 format and parsed from a string in ISO 8601 format. */
  DateTimeISO: { input: any; output: any; }
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

export type AddressInput = {
  city: Scalars['String']['input'];
  country: Scalars['String']['input'];
  postal: Scalars['String']['input'];
  street: Scalars['String']['input'];
};

/** Attendee model type */
export type Attendee = {
  __typename?: 'Attendee';
  conference: Conference;
  createdAt: Scalars['DateTimeISO']['output'];
  id: Scalars['ID']['output'];
  invoice: Invoice;
  submissions: Array<Submission>;
  ticket: Ticket;
  updatedAt: Scalars['DateTimeISO']['output'];
  user: User;
};

/** Billing information */
export type Billing = {
  __typename?: 'Billing';
  DIC?: Maybe<Scalars['String']['output']>;
  IBAN?: Maybe<Scalars['String']['output']>;
  ICDPH?: Maybe<Scalars['String']['output']>;
  ICO: Scalars['String']['output'];
  SWIFT?: Maybe<Scalars['String']['output']>;
  address: Address;
  name: Scalars['String']['output'];
  stampUrl?: Maybe<Scalars['String']['output']>;
  variableSymbol?: Maybe<Scalars['String']['output']>;
};

export type BillingInput = {
  DIC: Scalars['String']['input'];
  IBAN: Scalars['String']['input'];
  ICDPH: Scalars['String']['input'];
  ICO: Scalars['String']['input'];
  SWIFT: Scalars['String']['input'];
  address: AddressInput;
  name: Scalars['String']['input'];
  stampUrl: Scalars['String']['input'];
  variableSymbol: Scalars['String']['input'];
};

/** Conference model type */
export type Conference = {
  __typename?: 'Conference';
  attendeesCount: Scalars['Int']['output'];
  attending?: Maybe<Attendee>;
  billing: Billing;
  createdAt: Scalars['DateTimeISO']['output'];
  dates: ImportantDates;
  id: Scalars['ObjectId']['output'];
  sections: Array<Section>;
  slug: Scalars['String']['output'];
  tickets: Array<Ticket>;
  translations: ConferenceTranslation;
  updatedAt: Scalars['DateTimeISO']['output'];
};

/** ConferenceConnection type enabling cursor based pagination */
export type ConferenceConnection = {
  __typename?: 'ConferenceConnection';
  edges: Array<Maybe<ConferenceEdge>>;
  pageInfo: ConferencePageInfo;
};

export type ConferenceEdge = {
  __typename?: 'ConferenceEdge';
  cursor: Scalars['ObjectId']['output'];
  node: Conference;
};

/** Conference input type */
export type ConferenceInput = {
  billing: BillingInput;
  dates: DatesInput;
  slug: Scalars['String']['input'];
  translations: ConferenceTranslationInput;
};

export type ConferenceMutationResponse = IMutationResponse & {
  __typename?: 'ConferenceMutationResponse';
  data: Conference;
  message: Scalars['String']['output'];
};

export type ConferencePageInfo = {
  __typename?: 'ConferencePageInfo';
  endCursor: Scalars['ObjectId']['output'];
  hasNextPage: Scalars['Boolean']['output'];
};

export type ConferenceTranslation = {
  __typename?: 'ConferenceTranslation';
  en: ConferenceTranslations;
  sk: ConferenceTranslations;
};

export type ConferenceTranslationInput = {
  en: LocalizedConferenceInputs;
  sk: LocalizedConferenceInputs;
};

export type ConferenceTranslations = {
  __typename?: 'ConferenceTranslations';
  logoUrl: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type DatesInput = {
  end: Scalars['DateTimeISO']['input'];
  regEnd?: InputMaybe<Scalars['DateTimeISO']['input']>;
  start: Scalars['DateTimeISO']['input'];
  submissionDeadline?: InputMaybe<Scalars['DateTimeISO']['input']>;
};

export type IMutationResponse = {
  message: Scalars['String']['output'];
};

/** Important dates regarding conference */
export type ImportantDates = {
  __typename?: 'ImportantDates';
  end: Scalars['DateTimeISO']['output'];
  regEnd?: Maybe<Scalars['DateTimeISO']['output']>;
  start: Scalars['DateTimeISO']['output'];
  submissionDeadline?: Maybe<Scalars['DateTimeISO']['output']>;
};

/** Invoice entity subdocument type */
export type Invoice = {
  __typename?: 'Invoice';
  body: InvoiceData;
  issuer: Billing;
  payer: Billing;
};

/** The body of an invoice */
export type InvoiceData = {
  __typename?: 'InvoiceData';
  body: Scalars['String']['output'];
  comment: Scalars['String']['output'];
  dueDate: Scalars['DateTimeISO']['output'];
  issueDate: Scalars['DateTimeISO']['output'];
  price: Scalars['Float']['output'];
  type: Scalars['String']['output'];
  vat: Scalars['Float']['output'];
  vatDate: Scalars['DateTimeISO']['output'];
};

export type LocalizedConferenceInputs = {
  logoUrl: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type LocalizedSectionInputs = {
  name: Scalars['String']['input'];
  topic: Scalars['String']['input'];
};

export type LocalizedTicketInputs = {
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  activateUser: Scalars['String']['output'];
  createConference: ConferenceMutationResponse;
  createSection: SectionMutationResponse;
  createTicket: ConferenceMutationResponse;
  deleteConference: ConferenceMutationResponse;
  deleteSection: Scalars['String']['output'];
  deleteTicket: Scalars['String']['output'];
  deleteUser: Scalars['String']['output'];
  login: User;
  passwordReset: UserMutationResponse;
  register: UserMutationResponse;
  resendActivationLink: Scalars['String']['output'];
  toggleVerifiedUser: UserMutationResponse;
  updateConferenceDates: ConferenceMutationResponse;
  updateSection: SectionMutationResponse;
  updateTicket: ConferenceMutationResponse;
  updateUser: UserMutationResponse;
};


export type MutationCreateConferenceArgs = {
  data: ConferenceInput;
};


export type MutationCreateSectionArgs = {
  data: SectionInput;
};


export type MutationCreateTicketArgs = {
  data: TicketInput;
  slug: Scalars['String']['input'];
};


export type MutationDeleteConferenceArgs = {
  id: Scalars['ObjectId']['input'];
};


export type MutationDeleteSectionArgs = {
  id: Scalars['ObjectId']['input'];
};


export type MutationDeleteTicketArgs = {
  slug: Scalars['String']['input'];
  ticketId: Scalars['ObjectId']['input'];
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


export type MutationUpdateConferenceDatesArgs = {
  data: DatesInput;
  slug: Scalars['String']['input'];
};


export type MutationUpdateSectionArgs = {
  data: SectionInput;
  id: Scalars['ObjectId']['input'];
};


export type MutationUpdateTicketArgs = {
  data: TicketInput;
  slug: Scalars['String']['input'];
  ticketId: Scalars['ObjectId']['input'];
};


export type MutationUpdateUserArgs = {
  data: UserInput;
  id: Scalars['ObjectId']['input'];
};

export type PasswordInput = {
  password: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  conference: Conference;
  conferences: ConferenceConnection;
  forgotPassword: Scalars['String']['output'];
  me: User;
  textSearchConference: Array<Conference>;
  textSearchUser: Array<User>;
  user: User;
  users: UserConnection;
};


export type QueryConferenceArgs = {
  slug: Scalars['String']['input'];
};


export type QueryConferencesArgs = {
  after?: InputMaybe<Scalars['ObjectId']['input']>;
  first?: Scalars['Int']['input'];
};


export type QueryForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type QueryTextSearchConferenceArgs = {
  text: Scalars['String']['input'];
};


export type QueryTextSearchUserArgs = {
  text: Scalars['String']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ObjectId']['input'];
};


export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['ObjectId']['input']>;
  first?: Scalars['Int']['input'];
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

/** Conference's section entity model type */
export type Section = {
  __typename?: 'Section';
  conference: Scalars['String']['output'];
  createdAt: Scalars['DateTimeISO']['output'];
  id: Scalars['ID']['output'];
  submissions: Array<Submission>;
  translations: SectionTranslation;
  updatedAt: Scalars['DateTimeISO']['output'];
};

/** Section input type */
export type SectionInput = {
  conference: Scalars['ObjectId']['input'];
  translations: SectionTranslationInput;
};

export type SectionMutationResponse = IMutationResponse & {
  __typename?: 'SectionMutationResponse';
  data: Section;
  message: Scalars['String']['output'];
};

export type SectionTranslation = {
  __typename?: 'SectionTranslation';
  en: SectionTranslations;
  sk: SectionTranslations;
};

export type SectionTranslationInput = {
  en: LocalizedSectionInputs;
  sk: LocalizedSectionInputs;
};

export type SectionTranslations = {
  __typename?: 'SectionTranslations';
  name: Scalars['String']['output'];
  topic: Scalars['String']['output'];
};

/** Submission entity model type */
export type Submission = {
  __typename?: 'Submission';
  authors: Array<User>;
  conference: Conference;
  createdAt: Scalars['DateTimeISO']['output'];
  file?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  section: Section;
  translations: SubmissionTranslation;
  updatedAt: Scalars['DateTimeISO']['output'];
};

export type SubmissionTranslation = {
  __typename?: 'SubmissionTranslation';
  en: SubmissionTranslationContent;
  sk: SubmissionTranslationContent;
};

export type SubmissionTranslationContent = {
  __typename?: 'SubmissionTranslationContent';
  abstract: Scalars['String']['output'];
  keywords: Array<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

/** Conference ticket */
export type Ticket = {
  __typename?: 'Ticket';
  id: Scalars['ObjectId']['output'];
  online: Scalars['Boolean']['output'];
  price: Scalars['Int']['output'];
  translations: TicketTranslation;
  withSubmission: Scalars['Boolean']['output'];
};

export type TicketInput = {
  online: Scalars['Boolean']['input'];
  price: Scalars['Int']['input'];
  translations: TicketTranslationInput;
  withSubmission: Scalars['Boolean']['input'];
};

export type TicketTranslation = {
  __typename?: 'TicketTranslation';
  en: TicketTranslations;
  sk: TicketTranslations;
};

export type TicketTranslationInput = {
  en: LocalizedTicketInputs;
  sk: LocalizedTicketInputs;
};

export type TicketTranslations = {
  __typename?: 'TicketTranslations';
  description: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

/** The user model entity */
export type User = {
  __typename?: 'User';
  billings: Array<Maybe<Billing>>;
  createdAt: Scalars['DateTimeISO']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ObjectId']['output'];
  name: Scalars['String']['output'];
  organization: Scalars['String']['output'];
  role: Role;
  telephone: Scalars['String']['output'];
  token: Scalars['String']['output'];
  updatedAt: Scalars['DateTimeISO']['output'];
  verified: Scalars['Boolean']['output'];
};

/** UserConnection type enabling cursor based pagination */
export type UserConnection = {
  __typename?: 'UserConnection';
  edges: Array<Maybe<UserEdge>>;
  pageInfo: UserPageInfo;
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

export type UserPageInfo = {
  __typename?: 'UserPageInfo';
  endCursor: Scalars['ObjectId']['output'];
  hasNextPage: Scalars['Boolean']['output'];
};

export type AddressFragment = { __typename?: 'Address', street: string, city: string, postal: string, country: string };

export type BillingFragment = { __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, stampUrl?: string | null, variableSymbol?: string | null, IBAN?: string | null, SWIFT?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } };

export type UserFragment = { __typename?: 'User', id: any, name: string, email: string, organization: string, telephone: string, role: Role, verified: boolean, createdAt: any, updatedAt: any, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, stampUrl?: string | null, variableSymbol?: string | null, IBAN?: string | null, SWIFT?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: any, name: string, email: string, organization: string, telephone: string, role: Role, verified: boolean, createdAt: any, updatedAt: any, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, stampUrl?: string | null, variableSymbol?: string | null, IBAN?: string | null, SWIFT?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } };

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

export type InvoiceFragment = { __typename?: 'Invoice', body: { __typename?: 'InvoiceData', body: string, comment: string, dueDate: any, issueDate: any, price: number, type: string, vat: number, vatDate: any }, issuer: { __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, stampUrl?: string | null, variableSymbol?: string | null, IBAN?: string | null, SWIFT?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, payer: { __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, stampUrl?: string | null, variableSymbol?: string | null, IBAN?: string | null, SWIFT?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } };

export type SectionFragment = { __typename?: 'Section', id: string, conference: string, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } };

export type TicketFragment = { __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } };

export type ConferenceFragment = { __typename?: 'Conference', id: any, slug: string, createdAt: any, updatedAt: any, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', name: string, logoUrl: string }, en: { __typename?: 'ConferenceTranslations', name: string, logoUrl: string } }, dates: { __typename?: 'ImportantDates', start: any, end: any, regEnd?: any | null, submissionDeadline?: any | null } };

export type ConferencesQueryVariables = Exact<{
  after?: InputMaybe<Scalars['ObjectId']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ConferencesQuery = { __typename?: 'Query', conferences: { __typename?: 'ConferenceConnection', edges: Array<{ __typename?: 'ConferenceEdge', cursor: any, node: { __typename?: 'Conference', id: any, slug: string, createdAt: any, updatedAt: any, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', name: string, logoUrl: string }, en: { __typename?: 'ConferenceTranslations', name: string, logoUrl: string } }, dates: { __typename?: 'ImportantDates', start: any, end: any, regEnd?: any | null, submissionDeadline?: any | null } } } | null>, pageInfo: { __typename?: 'ConferencePageInfo', endCursor: any, hasNextPage: boolean } } };

export type ConferenceQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type ConferenceQuery = { __typename?: 'Query', conference: { __typename?: 'Conference', id: any, slug: string, createdAt: any, updatedAt: any, sections: Array<{ __typename?: 'Section', id: string, conference: string, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } }>, tickets: Array<{ __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } }>, attending?: { __typename?: 'Attendee', invoice: { __typename?: 'Invoice', body: { __typename?: 'InvoiceData', body: string, comment: string, dueDate: any, issueDate: any, price: number, type: string, vat: number, vatDate: any }, issuer: { __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, stampUrl?: string | null, variableSymbol?: string | null, IBAN?: string | null, SWIFT?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, payer: { __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, stampUrl?: string | null, variableSymbol?: string | null, IBAN?: string | null, SWIFT?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } }, ticket: { __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } }, submissions: Array<{ __typename?: 'Submission', id: string, updatedAt: any, authors: Array<{ __typename?: 'User', id: any, name: string }>, section: { __typename?: 'Section', id: string, conference: string, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } }, translations: { __typename?: 'SubmissionTranslation', sk: { __typename?: 'SubmissionTranslationContent', name: string, keywords: Array<string>, abstract: string }, en: { __typename?: 'SubmissionTranslationContent', name: string, keywords: Array<string>, abstract: string } } }> } | null, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', name: string, logoUrl: string }, en: { __typename?: 'ConferenceTranslations', name: string, logoUrl: string } }, dates: { __typename?: 'ImportantDates', start: any, end: any, regEnd?: any | null, submissionDeadline?: any | null } } };

export type TextSearchConferenceQueryVariables = Exact<{
  text: Scalars['String']['input'];
}>;


export type TextSearchConferenceQuery = { __typename?: 'Query', textSearchConference: Array<{ __typename?: 'Conference', id: any, slug: string, createdAt: any, updatedAt: any, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', name: string, logoUrl: string }, en: { __typename?: 'ConferenceTranslations', name: string, logoUrl: string } }, dates: { __typename?: 'ImportantDates', start: any, end: any, regEnd?: any | null, submissionDeadline?: any | null } }> };

export type CreateConferenceMutationVariables = Exact<{
  data: ConferenceInput;
}>;


export type CreateConferenceMutation = { __typename?: 'Mutation', createConference: { __typename?: 'ConferenceMutationResponse', message: string } };

export type DeleteConferenceMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type DeleteConferenceMutation = { __typename?: 'Mutation', deleteConference: { __typename?: 'ConferenceMutationResponse', message: string, data: { __typename?: 'Conference', slug: string, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', logoUrl: string }, en: { __typename?: 'ConferenceTranslations', logoUrl: string } }, billing: { __typename?: 'Billing', stampUrl?: string | null } } } };

export type UpdateConferenceDatesMutationVariables = Exact<{
  slug: Scalars['String']['input'];
  data: DatesInput;
}>;


export type UpdateConferenceDatesMutation = { __typename?: 'Mutation', updateConferenceDates: { __typename?: 'ConferenceMutationResponse', message: string, data: { __typename?: 'Conference', slug: string, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', name: string }, en: { __typename?: 'ConferenceTranslations', name: string } } } } };

export type CreateSectionMutationVariables = Exact<{
  data: SectionInput;
}>;


export type CreateSectionMutation = { __typename?: 'Mutation', createSection: { __typename?: 'SectionMutationResponse', message: string } };

export type UpdateSectionMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
  data: SectionInput;
}>;


export type UpdateSectionMutation = { __typename?: 'Mutation', updateSection: { __typename?: 'SectionMutationResponse', message: string } };

export type DeleteSectionMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type DeleteSectionMutation = { __typename?: 'Mutation', deleteSection: string };

export type CreateTicketMutationVariables = Exact<{
  slug: Scalars['String']['input'];
  data: TicketInput;
}>;


export type CreateTicketMutation = { __typename?: 'Mutation', createTicket: { __typename?: 'ConferenceMutationResponse', message: string } };

export type UpdateTicketMutationVariables = Exact<{
  slug: Scalars['String']['input'];
  ticketId: Scalars['ObjectId']['input'];
  data: TicketInput;
}>;


export type UpdateTicketMutation = { __typename?: 'Mutation', updateTicket: { __typename?: 'ConferenceMutationResponse', message: string } };

export type DeleteTicketMutationVariables = Exact<{
  slug: Scalars['String']['input'];
  ticketId: Scalars['ObjectId']['input'];
}>;


export type DeleteTicketMutation = { __typename?: 'Mutation', deleteTicket: string };

export type UsersQueryVariables = Exact<{
  after?: InputMaybe<Scalars['ObjectId']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UsersQuery = { __typename?: 'Query', users: { __typename?: 'UserConnection', edges: Array<{ __typename?: 'UserEdge', cursor: any, node: { __typename?: 'User', id: any, name: string, email: string, organization: string, verified: boolean, role: Role, createdAt: any, updatedAt: any } } | null>, pageInfo: { __typename?: 'UserPageInfo', endCursor: any, hasNextPage: boolean } } };

export type UserQueryVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type UserQuery = { __typename?: 'Query', user: { __typename?: 'User', id: any, name: string, email: string, organization: string, telephone: string, role: Role, verified: boolean, createdAt: any, updatedAt: any, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, stampUrl?: string | null, variableSymbol?: string | null, IBAN?: string | null, SWIFT?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } };

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

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser: string };

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
export const AddressFragmentDoc = new TypedDocumentString(`
    fragment Address on Address {
  street
  city
  postal
  country
}
    `, {"fragmentName":"Address"}) as unknown as TypedDocumentString<AddressFragment, unknown>;
export const BillingFragmentDoc = new TypedDocumentString(`
    fragment Billing on Billing {
  name
  address {
    ...Address
  }
  ICO
  ICDPH
  DIC
  stampUrl
  variableSymbol
  IBAN
  SWIFT
}
    fragment Address on Address {
  street
  city
  postal
  country
}`, {"fragmentName":"Billing"}) as unknown as TypedDocumentString<BillingFragment, unknown>;
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
    ...Billing
  }
}
    fragment Address on Address {
  street
  city
  postal
  country
}
fragment Billing on Billing {
  name
  address {
    ...Address
  }
  ICO
  ICDPH
  DIC
  stampUrl
  variableSymbol
  IBAN
  SWIFT
}`, {"fragmentName":"User"}) as unknown as TypedDocumentString<UserFragment, unknown>;
export const InvoiceFragmentDoc = new TypedDocumentString(`
    fragment Invoice on Invoice {
  body {
    body
    comment
    dueDate
    issueDate
    price
    type
    vat
    vatDate
  }
  issuer {
    ...Billing
  }
  payer {
    ...Billing
  }
}
    fragment Address on Address {
  street
  city
  postal
  country
}
fragment Billing on Billing {
  name
  address {
    ...Address
  }
  ICO
  ICDPH
  DIC
  stampUrl
  variableSymbol
  IBAN
  SWIFT
}`, {"fragmentName":"Invoice"}) as unknown as TypedDocumentString<InvoiceFragment, unknown>;
export const SectionFragmentDoc = new TypedDocumentString(`
    fragment Section on Section {
  id
  conference
  translations {
    sk {
      name
      topic
    }
    en {
      name
      topic
    }
  }
}
    `, {"fragmentName":"Section"}) as unknown as TypedDocumentString<SectionFragment, unknown>;
export const TicketFragmentDoc = new TypedDocumentString(`
    fragment Ticket on Ticket {
  id
  online
  price
  withSubmission
  translations {
    en {
      name
      description
    }
    sk {
      name
      description
    }
  }
}
    `, {"fragmentName":"Ticket"}) as unknown as TypedDocumentString<TicketFragment, unknown>;
export const ConferenceFragmentDoc = new TypedDocumentString(`
    fragment Conference on Conference {
  id
  slug
  translations {
    sk {
      name
      logoUrl
    }
    en {
      name
      logoUrl
    }
  }
  dates {
    start
    end
    regEnd
    submissionDeadline
  }
  createdAt
  updatedAt
}
    `, {"fragmentName":"Conference"}) as unknown as TypedDocumentString<ConferenceFragment, unknown>;
export const MeDocument = new TypedDocumentString(`
    query me {
  me {
    ...User
  }
}
    fragment Address on Address {
  street
  city
  postal
  country
}
fragment Billing on Billing {
  name
  address {
    ...Address
  }
  ICO
  ICDPH
  DIC
  stampUrl
  variableSymbol
  IBAN
  SWIFT
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
    ...Billing
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
export const ConferencesDocument = new TypedDocumentString(`
    query conferences($after: ObjectId, $first: Int) {
  conferences(after: $after, first: $first) {
    edges {
      cursor
      node {
        ...Conference
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
    fragment Conference on Conference {
  id
  slug
  translations {
    sk {
      name
      logoUrl
    }
    en {
      name
      logoUrl
    }
  }
  dates {
    start
    end
    regEnd
    submissionDeadline
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<ConferencesQuery, ConferencesQueryVariables>;
export const ConferenceDocument = new TypedDocumentString(`
    query conference($slug: String!) {
  conference(slug: $slug) {
    ...Conference
    sections {
      ...Section
    }
    tickets {
      ...Ticket
    }
    attending {
      invoice {
        ...Invoice
      }
      ticket {
        ...Ticket
      }
      submissions {
        id
        authors {
          id
          name
        }
        section {
          ...Section
        }
        translations {
          sk {
            name
            keywords
            abstract
          }
          en {
            name
            keywords
            abstract
          }
        }
        updatedAt
      }
    }
  }
}
    fragment Address on Address {
  street
  city
  postal
  country
}
fragment Billing on Billing {
  name
  address {
    ...Address
  }
  ICO
  ICDPH
  DIC
  stampUrl
  variableSymbol
  IBAN
  SWIFT
}
fragment Invoice on Invoice {
  body {
    body
    comment
    dueDate
    issueDate
    price
    type
    vat
    vatDate
  }
  issuer {
    ...Billing
  }
  payer {
    ...Billing
  }
}
fragment Section on Section {
  id
  conference
  translations {
    sk {
      name
      topic
    }
    en {
      name
      topic
    }
  }
}
fragment Ticket on Ticket {
  id
  online
  price
  withSubmission
  translations {
    en {
      name
      description
    }
    sk {
      name
      description
    }
  }
}
fragment Conference on Conference {
  id
  slug
  translations {
    sk {
      name
      logoUrl
    }
    en {
      name
      logoUrl
    }
  }
  dates {
    start
    end
    regEnd
    submissionDeadline
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<ConferenceQuery, ConferenceQueryVariables>;
export const TextSearchConferenceDocument = new TypedDocumentString(`
    query textSearchConference($text: String!) {
  textSearchConference(text: $text) {
    ...Conference
  }
}
    fragment Conference on Conference {
  id
  slug
  translations {
    sk {
      name
      logoUrl
    }
    en {
      name
      logoUrl
    }
  }
  dates {
    start
    end
    regEnd
    submissionDeadline
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<TextSearchConferenceQuery, TextSearchConferenceQueryVariables>;
export const CreateConferenceDocument = new TypedDocumentString(`
    mutation createConference($data: ConferenceInput!) {
  createConference(data: $data) {
    message
  }
}
    `) as unknown as TypedDocumentString<CreateConferenceMutation, CreateConferenceMutationVariables>;
export const DeleteConferenceDocument = new TypedDocumentString(`
    mutation deleteConference($id: ObjectId!) {
  deleteConference(id: $id) {
    message
    data {
      slug
      translations {
        sk {
          logoUrl
        }
        en {
          logoUrl
        }
      }
      billing {
        stampUrl
      }
    }
  }
}
    `) as unknown as TypedDocumentString<DeleteConferenceMutation, DeleteConferenceMutationVariables>;
export const UpdateConferenceDatesDocument = new TypedDocumentString(`
    mutation updateConferenceDates($slug: String!, $data: DatesInput!) {
  updateConferenceDates(slug: $slug, data: $data) {
    message
    data {
      slug
      translations {
        sk {
          name
        }
        en {
          name
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<UpdateConferenceDatesMutation, UpdateConferenceDatesMutationVariables>;
export const CreateSectionDocument = new TypedDocumentString(`
    mutation createSection($data: SectionInput!) {
  createSection(data: $data) {
    message
  }
}
    `) as unknown as TypedDocumentString<CreateSectionMutation, CreateSectionMutationVariables>;
export const UpdateSectionDocument = new TypedDocumentString(`
    mutation updateSection($id: ObjectId!, $data: SectionInput!) {
  updateSection(id: $id, data: $data) {
    message
  }
}
    `) as unknown as TypedDocumentString<UpdateSectionMutation, UpdateSectionMutationVariables>;
export const DeleteSectionDocument = new TypedDocumentString(`
    mutation deleteSection($id: ObjectId!) {
  deleteSection(id: $id)
}
    `) as unknown as TypedDocumentString<DeleteSectionMutation, DeleteSectionMutationVariables>;
export const CreateTicketDocument = new TypedDocumentString(`
    mutation createTicket($slug: String!, $data: TicketInput!) {
  createTicket(slug: $slug, data: $data) {
    message
  }
}
    `) as unknown as TypedDocumentString<CreateTicketMutation, CreateTicketMutationVariables>;
export const UpdateTicketDocument = new TypedDocumentString(`
    mutation updateTicket($slug: String!, $ticketId: ObjectId!, $data: TicketInput!) {
  updateTicket(slug: $slug, ticketId: $ticketId, data: $data) {
    message
  }
}
    `) as unknown as TypedDocumentString<UpdateTicketMutation, UpdateTicketMutationVariables>;
export const DeleteTicketDocument = new TypedDocumentString(`
    mutation deleteTicket($slug: String!, $ticketId: ObjectId!) {
  deleteTicket(slug: $slug, ticketId: $ticketId)
}
    `) as unknown as TypedDocumentString<DeleteTicketMutation, DeleteTicketMutationVariables>;
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
    fragment Address on Address {
  street
  city
  postal
  country
}
fragment Billing on Billing {
  name
  address {
    ...Address
  }
  ICO
  ICDPH
  DIC
  stampUrl
  variableSymbol
  IBAN
  SWIFT
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
    ...Billing
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
export const DeleteUserDocument = new TypedDocumentString(`
    mutation deleteUser($id: ObjectId!) {
  deleteUser(id: $id)
}
    `) as unknown as TypedDocumentString<DeleteUserMutation, DeleteUserMutationVariables>;