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

/** User access inside the FLAWIS system */
export enum Access {
  Admin = 'Admin',
  ConferenceAttendee = 'ConferenceAttendee',
  Organization = 'Organization',
  Student = 'Student'
}

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
  id: Scalars['ObjectId']['output'];
  invoice: Invoice;
  submissions: Array<Submission>;
  ticket: Ticket;
  updatedAt: Scalars['DateTimeISO']['output'];
  user: AttendeeUserUnion;
};

export type AttendeeBillingInput = {
  DIC?: InputMaybe<Scalars['String']['input']>;
  ICDPH?: InputMaybe<Scalars['String']['input']>;
  ICO?: InputMaybe<Scalars['String']['input']>;
  address: AddressInput;
  name: Scalars['String']['input'];
};

/** AttendeeConnection type enabling cursor based pagination */
export type AttendeeConnection = {
  __typename?: 'AttendeeConnection';
  edges: Array<Maybe<AttendeeEdge>>;
  pageInfo: AttendeePageInfo;
  totalCount: Scalars['Int']['output'];
};

export type AttendeeEdge = {
  __typename?: 'AttendeeEdge';
  cursor: Scalars['ObjectId']['output'];
  node: Attendee;
};

/** Conference registration input type */
export type AttendeeInput = {
  billing: AttendeeBillingInput;
  conferenceId: Scalars['ObjectId']['input'];
  ticketId: Scalars['ObjectId']['input'];
};

export type AttendeeMutationResponse = IMutationResponse & {
  __typename?: 'AttendeeMutationResponse';
  data: Attendee;
  message: Scalars['String']['output'];
};

export type AttendeePageInfo = {
  __typename?: 'AttendeePageInfo';
  endCursor?: Maybe<Scalars['ObjectId']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type AttendeeUser = {
  __typename?: 'AttendeeUser';
  email: Scalars['String']['output'];
  id: Scalars['ObjectId']['output'];
  name: Scalars['String']['output'];
};

export type AttendeeUserUnion = AttendeeUser | User;

/** Billing information */
export type Billing = {
  __typename?: 'Billing';
  DIC?: Maybe<Scalars['String']['output']>;
  ICDPH?: Maybe<Scalars['String']['output']>;
  ICO: Scalars['String']['output'];
  address: Address;
  name: Scalars['String']['output'];
};

/** Conference model type */
export type Conference = {
  __typename?: 'Conference';
  attendeesCount: Scalars['Int']['output'];
  attending?: Maybe<Attendee>;
  billing: ConferenceBilling;
  createdAt: Scalars['DateTimeISO']['output'];
  dates: ImportantDates;
  id: Scalars['ObjectId']['output'];
  sections: Array<Section>;
  slug: Scalars['String']['output'];
  tickets: Array<Ticket>;
  translations: ConferenceTranslation;
  updatedAt: Scalars['DateTimeISO']['output'];
};

/** Conference billing information */
export type ConferenceBilling = {
  __typename?: 'ConferenceBilling';
  DIC: Scalars['String']['output'];
  IBAN: Scalars['String']['output'];
  ICDPH: Scalars['String']['output'];
  ICO: Scalars['String']['output'];
  SWIFT: Scalars['String']['output'];
  address: Address;
  name: Scalars['String']['output'];
  stampUrl: Scalars['String']['output'];
  variableSymbol: Scalars['String']['output'];
};

export type ConferenceBillingInput = {
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

/** ConferenceConnection type enabling cursor based pagination */
export type ConferenceConnection = {
  __typename?: 'ConferenceConnection';
  edges: Array<Maybe<ConferenceEdge>>;
  pageInfo: ConferencePageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ConferenceEdge = {
  __typename?: 'ConferenceEdge';
  cursor: Scalars['ObjectId']['output'];
  node: Conference;
};

/** Conference input type */
export type ConferenceInput = {
  billing: ConferenceBillingInput;
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
  endCursor?: Maybe<Scalars['ObjectId']['output']>;
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

/** Internship object type */
export type Internship = {
  __typename?: 'Internship';
  applicationCount: Scalars['Int']['output'];
  createdAt: Scalars['DateTimeISO']['output'];
  /** String representation of internship listing's HTML page */
  description: Scalars['String']['output'];
  id: Scalars['ObjectId']['output'];
  organization: Scalars['String']['output'];
  updatedAt: Scalars['DateTimeISO']['output'];
  user: UserReferece;
};

/** InternshipConnection type enabling cursor based pagination */
export type InternshipConnection = {
  __typename?: 'InternshipConnection';
  edges: Array<Maybe<InternshipEdge>>;
  pageInfo: InternshipPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type InternshipEdge = {
  __typename?: 'InternshipEdge';
  cursor: Scalars['ObjectId']['output'];
  node: Internship;
};

export type InternshipInput = {
  description: Scalars['String']['input'];
};

export type InternshipMutationResponse = IMutationResponse & {
  __typename?: 'InternshipMutationResponse';
  data: Internship;
  message: Scalars['String']['output'];
};

export type InternshipPageInfo = {
  __typename?: 'InternshipPageInfo';
  endCursor?: Maybe<Scalars['ObjectId']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

/** Invoice entity subdocument type */
export type Invoice = {
  __typename?: 'Invoice';
  body: InvoiceData;
  issuer: ConferenceBilling;
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

export type InvoiceDataInput = {
  body: Scalars['String']['input'];
  comment: Scalars['String']['input'];
  dueDate: Scalars['DateTimeISO']['input'];
  issueDate: Scalars['DateTimeISO']['input'];
  price: Scalars['Float']['input'];
  type: Scalars['String']['input'];
  vat: Scalars['Float']['input'];
  vatDate: Scalars['DateTimeISO']['input'];
};

export type InvoiceInput = {
  body: InvoiceDataInput;
  issuer: ConferenceBillingInput;
  payer: AttendeeBillingInput;
};

export type LocalizedConferenceInputs = {
  logoUrl: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type LocalizedSectionInputs = {
  name: Scalars['String']['input'];
  topic: Scalars['String']['input'];
};

export type LocalizedSubmissionInputs = {
  abstract: Scalars['String']['input'];
  keywords: Array<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type LocalizedTicketInputs = {
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  activateUser: UserMutationResponse;
  addAttendee: ConferenceMutationResponse;
  createConference: ConferenceMutationResponse;
  createInternship: InternshipMutationResponse;
  createSection: SectionMutationResponse;
  createSubmission: SubmissionMutationResponse;
  createTicket: ConferenceMutationResponse;
  deleteAttendee: AttendeeMutationResponse;
  deleteConference: ConferenceMutationResponse;
  deleteInternship: Scalars['Boolean']['output'];
  deleteSection: SectionMutationResponse;
  deleteSubmission: SubmissionMutationResponse;
  deleteTicket: Scalars['String']['output'];
  deleteUser: UserMutationResponse;
  googleSignIn: UserMutationResponse;
  login: UserMutationResponse;
  passwordReset: UserMutationResponse;
  register: UserMutationResponse;
  removeAuthor: SubmissionMutationResponse;
  resendActivationLink: Scalars['String']['output'];
  toggleVerifiedUser: UserMutationResponse;
  updateConferenceDates: ConferenceMutationResponse;
  updateInternship: InternshipMutationResponse;
  updateInvoice: AttendeeMutationResponse;
  updateSection: SectionMutationResponse;
  updateSubmission: SubmissionMutationResponse;
  updateTicket: ConferenceMutationResponse;
  updateUser: UserMutationResponse;
};


export type MutationAddAttendeeArgs = {
  data: AttendeeInput;
};


export type MutationCreateConferenceArgs = {
  data: ConferenceInput;
};


export type MutationCreateInternshipArgs = {
  input: InternshipInput;
};


export type MutationCreateSectionArgs = {
  data: SectionInput;
};


export type MutationCreateSubmissionArgs = {
  data: SubmissionInput;
};


export type MutationCreateTicketArgs = {
  data: TicketInput;
  slug: Scalars['String']['input'];
};


export type MutationDeleteAttendeeArgs = {
  id: Scalars['ObjectId']['input'];
};


export type MutationDeleteConferenceArgs = {
  id: Scalars['ObjectId']['input'];
};


export type MutationDeleteInternshipArgs = {
  id: Scalars['ObjectId']['input'];
};


export type MutationDeleteSectionArgs = {
  id: Scalars['ObjectId']['input'];
};


export type MutationDeleteSubmissionArgs = {
  id: Scalars['ObjectId']['input'];
};


export type MutationDeleteTicketArgs = {
  slug: Scalars['String']['input'];
  ticketId: Scalars['ObjectId']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ObjectId']['input'];
};


export type MutationGoogleSignInArgs = {
  authCode: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationPasswordResetArgs = {
  data: PasswordInput;
};


export type MutationRegisterArgs = {
  data: RegisterUserInput;
};


export type MutationRemoveAuthorArgs = {
  authorId: Scalars['ObjectId']['input'];
  id: Scalars['ObjectId']['input'];
};


export type MutationToggleVerifiedUserArgs = {
  id: Scalars['ObjectId']['input'];
};


export type MutationUpdateConferenceDatesArgs = {
  data: DatesInput;
  slug: Scalars['String']['input'];
};


export type MutationUpdateInternshipArgs = {
  id: Scalars['ObjectId']['input'];
  input: InternshipInput;
};


export type MutationUpdateInvoiceArgs = {
  data: InvoiceInput;
  id: Scalars['ObjectId']['input'];
};


export type MutationUpdateSectionArgs = {
  data: SectionInput;
  id: Scalars['ObjectId']['input'];
};


export type MutationUpdateSubmissionArgs = {
  data: SubmissionInput;
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

/** Addresses of the organizations you want to invite to FlawIS/internships */
export type OrganizationEmails = {
  emails: Array<Scalars['String']['input']>;
};

export type PasswordInput = {
  password: Scalars['String']['input'];
};

/** Language the speaker will be presenting his submission in */
export enum PresentationLng {
  Cz = 'CZ',
  En = 'EN',
  Sk = 'SK'
}

export type Query = {
  __typename?: 'Query';
  attendee: Attendee;
  attendees: AttendeeConnection;
  attendeesCsvExport: Array<Attendee>;
  conference: Conference;
  conferences: ConferenceConnection;
  forgotPassword: Scalars['String']['output'];
  internship: Internship;
  internships: InternshipConnection;
  inviteUsers: Scalars['String']['output'];
  me: User;
  submission: Submission;
  textSearchAttendee: Array<Attendee>;
  textSearchConference: Array<Conference>;
  textSearchUser: Array<User>;
  user: User;
  users: UserConnection;
};


export type QueryAttendeeArgs = {
  id: Scalars['ObjectId']['input'];
};


export type QueryAttendeesArgs = {
  after?: InputMaybe<Scalars['ObjectId']['input']>;
  conferenceSlug: Scalars['String']['input'];
  first?: Scalars['Int']['input'];
  passive?: InputMaybe<Scalars['Boolean']['input']>;
  sectionIds?: Array<InputMaybe<Scalars['ObjectId']['input']>>;
};


export type QueryAttendeesCsvExportArgs = {
  slug: Scalars['String']['input'];
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


export type QueryInternshipArgs = {
  id: Scalars['ObjectId']['input'];
};


export type QueryInternshipsArgs = {
  after?: InputMaybe<Scalars['ObjectId']['input']>;
  endDate?: InputMaybe<Scalars['DateTimeISO']['input']>;
  first?: Scalars['Int']['input'];
  startDate?: InputMaybe<Scalars['DateTimeISO']['input']>;
  user?: InputMaybe<Scalars['ObjectId']['input']>;
};


export type QueryInviteUsersArgs = {
  input: OrganizationEmails;
};


export type QuerySubmissionArgs = {
  id: Scalars['ObjectId']['input'];
};


export type QueryTextSearchAttendeeArgs = {
  text: Scalars['String']['input'];
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
export type RegisterUserInput = {
  access?: InputMaybe<Array<Access>>;
  cvUrl?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  organization?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  studyProgramme?: InputMaybe<StudyProgramme>;
  telephone?: InputMaybe<Scalars['String']['input']>;
};

/** Conference's section entity model type */
export type Section = {
  __typename?: 'Section';
  conference?: Maybe<Conference>;
  createdAt: Scalars['DateTimeISO']['output'];
  id: Scalars['ID']['output'];
  submissions: SubmissionConnection;
  translations: SectionTranslation;
  updatedAt: Scalars['DateTimeISO']['output'];
};


/** Conference's section entity model type */
export type SectionSubmissionsArgs = {
  after?: InputMaybe<Scalars['ObjectId']['input']>;
  conferenceId?: InputMaybe<Scalars['ObjectId']['input']>;
  first?: Scalars['Int']['input'];
  sectionIds?: InputMaybe<Array<Scalars['ObjectId']['input']>>;
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

/** Student user account StudyProgramme */
export enum StudyProgramme {
  Bachelor1 = 'Bachelor1',
  Bachelor2 = 'Bachelor2',
  Bachelor3 = 'Bachelor3',
  Master1 = 'Master1',
  Master2 = 'Master2'
}

/** Submission entity model type */
export type Submission = {
  __typename?: 'Submission';
  authors: Array<User>;
  conference: Conference;
  createdAt: Scalars['DateTimeISO']['output'];
  fileUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['ObjectId']['output'];
  presentationLng?: Maybe<PresentationLng>;
  section: Section;
  translations: SubmissionTranslation;
  updatedAt: Scalars['DateTimeISO']['output'];
};

export type SubmissionConnection = {
  __typename?: 'SubmissionConnection';
  edges: Array<Maybe<SubmissionEdge>>;
  pageInfo: SubmissionPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type SubmissionEdge = {
  __typename?: 'SubmissionEdge';
  cursor: Scalars['ObjectId']['output'];
  node: Submission;
};

export type SubmissionInput = {
  authors: Array<InputMaybe<Scalars['String']['input']>>;
  conference: Scalars['ObjectId']['input'];
  fileUrl?: InputMaybe<Scalars['String']['input']>;
  presentationLng: PresentationLng;
  section: Scalars['ObjectId']['input'];
  translations: SubmissionTranslationInput;
};

export type SubmissionMutationResponse = IMutationResponse & {
  __typename?: 'SubmissionMutationResponse';
  data: Submission;
  message: Scalars['String']['output'];
};

export type SubmissionPageInfo = {
  __typename?: 'SubmissionPageInfo';
  endCursor?: Maybe<Scalars['ObjectId']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
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

export type SubmissionTranslationInput = {
  en: LocalizedSubmissionInputs;
  sk: LocalizedSubmissionInputs;
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
  access: Array<Access>;
  billings: Array<Maybe<Billing>>;
  createdAt: Scalars['DateTimeISO']['output'];
  cvUrl?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ObjectId']['output'];
  name: Scalars['String']['output'];
  organization?: Maybe<Scalars['String']['output']>;
  studyProgramme?: Maybe<StudyProgramme>;
  telephone?: Maybe<Scalars['String']['output']>;
  token: Scalars['String']['output'];
  updatedAt: Scalars['DateTimeISO']['output'];
  verified: Scalars['Boolean']['output'];
};

/** UserConnection type enabling cursor based pagination */
export type UserConnection = {
  __typename?: 'UserConnection';
  edges: Array<Maybe<UserEdge>>;
  pageInfo: UserPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type UserEdge = {
  __typename?: 'UserEdge';
  cursor: Scalars['ObjectId']['output'];
  node: User;
};

/** FlawIS user base input */
export type UserInput = {
  access?: InputMaybe<Array<Access>>;
  cvUrl?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  organization?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  studyProgramme?: InputMaybe<StudyProgramme>;
  telephone?: InputMaybe<Scalars['String']['input']>;
};

export type UserMutationResponse = IMutationResponse & {
  __typename?: 'UserMutationResponse';
  data: User;
  message: Scalars['String']['output'];
};

export type UserPageInfo = {
  __typename?: 'UserPageInfo';
  endCursor?: Maybe<Scalars['ObjectId']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

/** User stub type */
export type UserReferece = {
  __typename?: 'UserReferece';
  /** User document reference */
  id: Scalars['ObjectId']['output'];
  name: Scalars['String']['output'];
};

export type AttendeeFragment = { __typename?: 'Attendee', id: any, createdAt: any, updatedAt: any, user: { __typename: 'AttendeeUser', id: any, name: string, email: string } | { __typename: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrl?: string | null, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> }, invoice: { __typename?: 'Invoice', body: { __typename?: 'InvoiceData', body: string, comment: string, dueDate: any, issueDate: any, price: number, type: string, vat: number, vatDate: any }, issuer: { __typename?: 'ConferenceBilling', name: string, ICO: string, ICDPH: string, DIC: string, stampUrl: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, payer: { __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } }, ticket: { __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } }, submissions: Array<{ __typename?: 'Submission', id: any, presentationLng?: PresentationLng | null, fileUrl?: string | null, createdAt: any, updatedAt: any, translations: { __typename?: 'SubmissionTranslation', sk: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> }, en: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, conference: { __typename?: 'Conference', id: any, slug: string }, section: { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } } }>, conference: { __typename?: 'Conference', slug: string, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', logoUrl: string }, en: { __typename?: 'ConferenceTranslations', logoUrl: string } } } };

export type AttendeesQueryVariables = Exact<{
  after?: InputMaybe<Scalars['ObjectId']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  conferenceSlug: Scalars['String']['input'];
  passive?: InputMaybe<Scalars['Boolean']['input']>;
  sectionIds?: InputMaybe<Array<Scalars['ObjectId']['input']> | Scalars['ObjectId']['input']>;
}>;


export type AttendeesQuery = { __typename?: 'Query', attendees: { __typename?: 'AttendeeConnection', totalCount: number, edges: Array<{ __typename?: 'AttendeeEdge', cursor: any, node: { __typename?: 'Attendee', id: any, createdAt: any, updatedAt: any, user: { __typename: 'AttendeeUser', id: any, name: string, email: string } | { __typename: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrl?: string | null, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> }, invoice: { __typename?: 'Invoice', body: { __typename?: 'InvoiceData', body: string, comment: string, dueDate: any, issueDate: any, price: number, type: string, vat: number, vatDate: any }, issuer: { __typename?: 'ConferenceBilling', name: string, ICO: string, ICDPH: string, DIC: string, stampUrl: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, payer: { __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } }, ticket: { __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } }, submissions: Array<{ __typename?: 'Submission', id: any, presentationLng?: PresentationLng | null, fileUrl?: string | null, createdAt: any, updatedAt: any, translations: { __typename?: 'SubmissionTranslation', sk: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> }, en: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, conference: { __typename?: 'Conference', id: any, slug: string }, section: { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } } }>, conference: { __typename?: 'Conference', slug: string, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', logoUrl: string }, en: { __typename?: 'ConferenceTranslations', logoUrl: string } } } } } | null>, pageInfo: { __typename?: 'AttendeePageInfo', endCursor?: any | null, hasNextPage: boolean } } };

export type AttendeeQueryVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type AttendeeQuery = { __typename?: 'Query', attendee: { __typename?: 'Attendee', id: any, createdAt: any, updatedAt: any, user: { __typename: 'AttendeeUser', id: any, name: string, email: string } | { __typename: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrl?: string | null, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> }, invoice: { __typename?: 'Invoice', body: { __typename?: 'InvoiceData', body: string, comment: string, dueDate: any, issueDate: any, price: number, type: string, vat: number, vatDate: any }, issuer: { __typename?: 'ConferenceBilling', name: string, ICO: string, ICDPH: string, DIC: string, stampUrl: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, payer: { __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } }, ticket: { __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } }, submissions: Array<{ __typename?: 'Submission', id: any, presentationLng?: PresentationLng | null, fileUrl?: string | null, createdAt: any, updatedAt: any, translations: { __typename?: 'SubmissionTranslation', sk: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> }, en: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, conference: { __typename?: 'Conference', id: any, slug: string }, section: { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } } }>, conference: { __typename?: 'Conference', slug: string, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', logoUrl: string }, en: { __typename?: 'ConferenceTranslations', logoUrl: string } } } } };

export type AttendeesCsvExportQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type AttendeesCsvExportQuery = { __typename?: 'Query', attendeesCsvExport: Array<{ __typename?: 'Attendee', id: any, createdAt: any, updatedAt: any, user: { __typename: 'AttendeeUser', id: any, name: string, email: string } | { __typename: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrl?: string | null, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> }, invoice: { __typename?: 'Invoice', body: { __typename?: 'InvoiceData', body: string, comment: string, dueDate: any, issueDate: any, price: number, type: string, vat: number, vatDate: any }, issuer: { __typename?: 'ConferenceBilling', name: string, ICO: string, ICDPH: string, DIC: string, stampUrl: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, payer: { __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } }, ticket: { __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } }, submissions: Array<{ __typename?: 'Submission', id: any, presentationLng?: PresentationLng | null, fileUrl?: string | null, createdAt: any, updatedAt: any, translations: { __typename?: 'SubmissionTranslation', sk: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> }, en: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, conference: { __typename?: 'Conference', id: any, slug: string }, section: { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } } }>, conference: { __typename?: 'Conference', slug: string, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', logoUrl: string }, en: { __typename?: 'ConferenceTranslations', logoUrl: string } } } }> };

export type TextSearchAttendeeQueryVariables = Exact<{
  text: Scalars['String']['input'];
}>;


export type TextSearchAttendeeQuery = { __typename?: 'Query', textSearchAttendee: Array<{ __typename?: 'Attendee', id: any, user: { __typename?: 'AttendeeUser', id: any, name: string, email: string } | { __typename?: 'User', id: any, name: string, email: string } }> };

export type UpdateInvoiceMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
  data: InvoiceInput;
}>;


export type UpdateInvoiceMutation = { __typename?: 'Mutation', updateInvoice: { __typename?: 'AttendeeMutationResponse', message: string, data: { __typename?: 'Attendee', id: any, createdAt: any, updatedAt: any, user: { __typename: 'AttendeeUser', id: any, name: string, email: string } | { __typename: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrl?: string | null, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> }, invoice: { __typename?: 'Invoice', body: { __typename?: 'InvoiceData', body: string, comment: string, dueDate: any, issueDate: any, price: number, type: string, vat: number, vatDate: any }, issuer: { __typename?: 'ConferenceBilling', name: string, ICO: string, ICDPH: string, DIC: string, stampUrl: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, payer: { __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } }, ticket: { __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } }, submissions: Array<{ __typename?: 'Submission', id: any, presentationLng?: PresentationLng | null, fileUrl?: string | null, createdAt: any, updatedAt: any, translations: { __typename?: 'SubmissionTranslation', sk: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> }, en: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, conference: { __typename?: 'Conference', id: any, slug: string }, section: { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } } }>, conference: { __typename?: 'Conference', slug: string, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', logoUrl: string }, en: { __typename?: 'ConferenceTranslations', logoUrl: string } } } } } };

export type DeleteAttendeeMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type DeleteAttendeeMutation = { __typename?: 'Mutation', deleteAttendee: { __typename?: 'AttendeeMutationResponse', message: string, data: { __typename?: 'Attendee', id: any, createdAt: any, updatedAt: any, user: { __typename: 'AttendeeUser', id: any, name: string, email: string } | { __typename: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrl?: string | null, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> }, invoice: { __typename?: 'Invoice', body: { __typename?: 'InvoiceData', body: string, comment: string, dueDate: any, issueDate: any, price: number, type: string, vat: number, vatDate: any }, issuer: { __typename?: 'ConferenceBilling', name: string, ICO: string, ICDPH: string, DIC: string, stampUrl: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, payer: { __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } }, ticket: { __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } }, submissions: Array<{ __typename?: 'Submission', id: any, presentationLng?: PresentationLng | null, fileUrl?: string | null, createdAt: any, updatedAt: any, translations: { __typename?: 'SubmissionTranslation', sk: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> }, en: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, conference: { __typename?: 'Conference', id: any, slug: string }, section: { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } } }>, conference: { __typename?: 'Conference', slug: string, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', logoUrl: string }, en: { __typename?: 'ConferenceTranslations', logoUrl: string } } } } } };

export type AddressFragment = { __typename?: 'Address', street: string, city: string, postal: string, country: string };

export type BillingFragment = { __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } };

export type UserFragment = { __typename?: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrl?: string | null, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrl?: string | null, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } };

export type LoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'UserMutationResponse', message: string, data: { __typename?: 'User', token: string, id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrl?: string | null, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } } };

export type GoogleSignInMutationVariables = Exact<{
  authCode: Scalars['String']['input'];
}>;


export type GoogleSignInMutation = { __typename?: 'Mutation', googleSignIn: { __typename?: 'UserMutationResponse', message: string, data: { __typename?: 'User', token: string, id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrl?: string | null, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } } };

export type ForgotPasswordQueryVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type ForgotPasswordQuery = { __typename?: 'Query', forgotPassword: string };

export type PasswordResetMutationVariables = Exact<{
  data: PasswordInput;
}>;


export type PasswordResetMutation = { __typename?: 'Mutation', passwordReset: { __typename?: 'UserMutationResponse', message: string, data: { __typename?: 'User', token: string, id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrl?: string | null, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } } };

export type RegisterMutationVariables = Exact<{
  data: RegisterUserInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'UserMutationResponse', message: string, data: { __typename?: 'User', token: string, id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrl?: string | null, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } } };

export type ResendActivationLinkMutationVariables = Exact<{ [key: string]: never; }>;


export type ResendActivationLinkMutation = { __typename?: 'Mutation', resendActivationLink: string };

export type ActivateUserMutationVariables = Exact<{ [key: string]: never; }>;


export type ActivateUserMutation = { __typename?: 'Mutation', activateUser: { __typename?: 'UserMutationResponse', message: string, data: { __typename?: 'User', token: string, id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrl?: string | null, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } } };

export type ImpersonateQueryVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type ImpersonateQuery = { __typename?: 'Query', user: { __typename?: 'User', id: any, access: Array<Access>, token: string } };

export type InvoiceFragment = { __typename?: 'Invoice', body: { __typename?: 'InvoiceData', body: string, comment: string, dueDate: any, issueDate: any, price: number, type: string, vat: number, vatDate: any }, issuer: { __typename?: 'ConferenceBilling', name: string, ICO: string, ICDPH: string, DIC: string, stampUrl: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, payer: { __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } };

export type SectionFragment = { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } };

export type TicketFragment = { __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } };

export type ConferenceFragment = { __typename?: 'Conference', id: any, slug: string, createdAt: any, updatedAt: any, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', name: string, logoUrl: string }, en: { __typename?: 'ConferenceTranslations', name: string, logoUrl: string } }, dates: { __typename?: 'ImportantDates', start: any, end: any, regEnd?: any | null, submissionDeadline?: any | null } };

export type ConferenceRegistrationFragment = { __typename?: 'Conference', id: any, slug: string, createdAt: any, updatedAt: any, sections: Array<{ __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } }>, tickets: Array<{ __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } }>, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', name: string, logoUrl: string }, en: { __typename?: 'ConferenceTranslations', name: string, logoUrl: string } }, dates: { __typename?: 'ImportantDates', start: any, end: any, regEnd?: any | null, submissionDeadline?: any | null } };

export type ConferencesQueryVariables = Exact<{
  after?: InputMaybe<Scalars['ObjectId']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ConferencesQuery = { __typename?: 'Query', conferences: { __typename?: 'ConferenceConnection', totalCount: number, edges: Array<{ __typename?: 'ConferenceEdge', cursor: any, node: { __typename?: 'Conference', id: any, slug: string, createdAt: any, updatedAt: any, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', name: string, logoUrl: string }, en: { __typename?: 'ConferenceTranslations', name: string, logoUrl: string } }, dates: { __typename?: 'ImportantDates', start: any, end: any, regEnd?: any | null, submissionDeadline?: any | null } } } | null>, pageInfo: { __typename?: 'ConferencePageInfo', endCursor?: any | null, hasNextPage: boolean } } };

export type ConferenceQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type ConferenceQuery = { __typename?: 'Query', conference: { __typename?: 'Conference', id: any, slug: string, createdAt: any, updatedAt: any, sections: Array<{ __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } }>, tickets: Array<{ __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } }>, attending?: { __typename?: 'Attendee', id: any, createdAt: any, updatedAt: any, user: { __typename: 'AttendeeUser', id: any, name: string, email: string } | { __typename: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrl?: string | null, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> }, invoice: { __typename?: 'Invoice', body: { __typename?: 'InvoiceData', body: string, comment: string, dueDate: any, issueDate: any, price: number, type: string, vat: number, vatDate: any }, issuer: { __typename?: 'ConferenceBilling', name: string, ICO: string, ICDPH: string, DIC: string, stampUrl: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, payer: { __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } }, ticket: { __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } }, submissions: Array<{ __typename?: 'Submission', id: any, presentationLng?: PresentationLng | null, fileUrl?: string | null, createdAt: any, updatedAt: any, translations: { __typename?: 'SubmissionTranslation', sk: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> }, en: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, conference: { __typename?: 'Conference', id: any, slug: string }, section: { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } } }>, conference: { __typename?: 'Conference', slug: string, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', logoUrl: string }, en: { __typename?: 'ConferenceTranslations', logoUrl: string } } } } | null, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', name: string, logoUrl: string }, en: { __typename?: 'ConferenceTranslations', name: string, logoUrl: string } }, dates: { __typename?: 'ImportantDates', start: any, end: any, regEnd?: any | null, submissionDeadline?: any | null } } };

export type SubmissionFilesFragment = { __typename?: 'SubmissionConnection', totalCount: number, edges: Array<{ __typename?: 'SubmissionEdge', cursor: any, node: { __typename?: 'Submission', id: any, fileUrl?: string | null } } | null> };

export type ConferenceSectionsQueryVariables = Exact<{
  slug: Scalars['String']['input'];
  after?: InputMaybe<Scalars['ObjectId']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ConferenceSectionsQuery = { __typename?: 'Query', conference: { __typename?: 'Conference', id: any, sections: Array<{ __typename?: 'Section', id: string, submissions: { __typename?: 'SubmissionConnection', totalCount: number, edges: Array<{ __typename?: 'SubmissionEdge', cursor: any, node: { __typename?: 'Submission', id: any, fileUrl?: string | null } } | null> }, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } }> } };

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


export type DeleteConferenceMutation = { __typename?: 'Mutation', deleteConference: { __typename?: 'ConferenceMutationResponse', message: string, data: { __typename?: 'Conference', slug: string, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', logoUrl: string }, en: { __typename?: 'ConferenceTranslations', logoUrl: string } }, billing: { __typename?: 'ConferenceBilling', stampUrl: string } } } };

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


export type UpdateSectionMutation = { __typename?: 'Mutation', updateSection: { __typename?: 'SectionMutationResponse', message: string, data: { __typename?: 'Section', conference?: { __typename?: 'Conference', slug: string } | null } } };

export type DeleteSectionMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type DeleteSectionMutation = { __typename?: 'Mutation', deleteSection: { __typename?: 'SectionMutationResponse', message: string, data: { __typename?: 'Section', conference?: { __typename?: 'Conference', slug: string } | null } } };

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

export type AddAttendeeMutationVariables = Exact<{
  data: AttendeeInput;
}>;


export type AddAttendeeMutation = { __typename?: 'Mutation', addAttendee: { __typename?: 'ConferenceMutationResponse', message: string, data: { __typename?: 'Conference', slug: string } } };

export type InternshipsQueryVariables = Exact<{
  after?: InputMaybe<Scalars['ObjectId']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  user?: InputMaybe<Scalars['ObjectId']['input']>;
  startDate?: InputMaybe<Scalars['DateTimeISO']['input']>;
  endDate?: InputMaybe<Scalars['DateTimeISO']['input']>;
}>;


export type InternshipsQuery = { __typename?: 'Query', internships: { __typename?: 'InternshipConnection', totalCount: number, edges: Array<{ __typename?: 'InternshipEdge', cursor: any, node: { __typename?: 'Internship', id: any, organization: string, applicationCount: number } } | null>, pageInfo: { __typename?: 'InternshipPageInfo', hasNextPage: boolean, endCursor?: any | null } } };

export type InternshipQueryVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type InternshipQuery = { __typename?: 'Query', internship: { __typename?: 'Internship', id: any, organization: string, description: string, updatedAt: any, createdAt: any, applicationCount: number } };

export type CreateInternshipMutationVariables = Exact<{
  input: InternshipInput;
}>;


export type CreateInternshipMutation = { __typename?: 'Mutation', createInternship: { __typename?: 'InternshipMutationResponse', message: string, data: { __typename?: 'Internship', id: any, organization: string } } };

export type UpdateInternshipMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
  input: InternshipInput;
}>;


export type UpdateInternshipMutation = { __typename?: 'Mutation', updateInternship: { __typename?: 'InternshipMutationResponse', message: string, data: { __typename?: 'Internship', id: any, organization: string } } };

export type DeleteInternshipMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type DeleteInternshipMutation = { __typename?: 'Mutation', deleteInternship: boolean };

export type SubmissionFragment = { __typename?: 'Submission', id: any, presentationLng?: PresentationLng | null, fileUrl?: string | null, createdAt: any, updatedAt: any, translations: { __typename?: 'SubmissionTranslation', sk: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> }, en: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, conference: { __typename?: 'Conference', id: any, slug: string }, section: { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } } };

export type SubmissionQueryVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type SubmissionQuery = { __typename?: 'Query', submission: { __typename?: 'Submission', id: any, presentationLng?: PresentationLng | null, fileUrl?: string | null, createdAt: any, updatedAt: any, translations: { __typename?: 'SubmissionTranslation', sk: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> }, en: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, conference: { __typename?: 'Conference', id: any, slug: string }, section: { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } } } };

export type CreateSubmissionMutationVariables = Exact<{
  data: SubmissionInput;
}>;


export type CreateSubmissionMutation = { __typename?: 'Mutation', createSubmission: { __typename?: 'SubmissionMutationResponse', message: string, data: { __typename?: 'Submission', id: any, presentationLng?: PresentationLng | null, fileUrl?: string | null, createdAt: any, updatedAt: any, translations: { __typename?: 'SubmissionTranslation', sk: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> }, en: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, conference: { __typename?: 'Conference', id: any, slug: string }, section: { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } } } } };

export type UpdateSubmissionMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
  data: SubmissionInput;
}>;


export type UpdateSubmissionMutation = { __typename?: 'Mutation', updateSubmission: { __typename?: 'SubmissionMutationResponse', message: string, data: { __typename?: 'Submission', id: any, presentationLng?: PresentationLng | null, fileUrl?: string | null, createdAt: any, updatedAt: any, translations: { __typename?: 'SubmissionTranslation', sk: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> }, en: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, conference: { __typename?: 'Conference', id: any, slug: string }, section: { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } } } } };

export type DeleteSubmissionMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type DeleteSubmissionMutation = { __typename?: 'Mutation', deleteSubmission: { __typename?: 'SubmissionMutationResponse', message: string, data: { __typename?: 'Submission', id: any, presentationLng?: PresentationLng | null, fileUrl?: string | null, createdAt: any, updatedAt: any, translations: { __typename?: 'SubmissionTranslation', sk: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> }, en: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, conference: { __typename?: 'Conference', id: any, slug: string }, section: { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } } } } };

export type RemoveAuthorMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
  authorId: Scalars['ObjectId']['input'];
}>;


export type RemoveAuthorMutation = { __typename?: 'Mutation', removeAuthor: { __typename?: 'SubmissionMutationResponse', message: string, data: { __typename?: 'Submission', id: any, presentationLng?: PresentationLng | null, fileUrl?: string | null, createdAt: any, updatedAt: any, translations: { __typename?: 'SubmissionTranslation', sk: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> }, en: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, conference: { __typename?: 'Conference', id: any, slug: string }, section: { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } } } } };

export type UsersQueryVariables = Exact<{
  after?: InputMaybe<Scalars['ObjectId']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UsersQuery = { __typename?: 'Query', users: { __typename?: 'UserConnection', totalCount: number, edges: Array<{ __typename?: 'UserEdge', cursor: any, node: { __typename?: 'User', id: any, name: string, email: string, organization?: string | null, verified: boolean, access: Array<Access>, createdAt: any, updatedAt: any } } | null>, pageInfo: { __typename?: 'UserPageInfo', endCursor?: any | null, hasNextPage: boolean } } };

export type UserQueryVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type UserQuery = { __typename?: 'Query', user: { __typename?: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrl?: string | null, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } };

export type TextSearchUserQueryVariables = Exact<{
  text: Scalars['String']['input'];
}>;


export type TextSearchUserQuery = { __typename?: 'Query', textSearchUser: Array<{ __typename?: 'User', id: any, name: string, email: string }> };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
  data: UserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'UserMutationResponse', message: string, data: { __typename?: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrl?: string | null, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } } };

export type ToggleVerifiedUserMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type ToggleVerifiedUserMutation = { __typename?: 'Mutation', toggleVerifiedUser: { __typename?: 'UserMutationResponse', message: string, data: { __typename?: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrl?: string | null, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } } };

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser: { __typename?: 'UserMutationResponse', message: string, data: { __typename?: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrl?: string | null, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } } };

export type InviteUsersQueryVariables = Exact<{
  input: OrganizationEmails;
}>;


export type InviteUsersQuery = { __typename?: 'Query', inviteUsers: string };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: DocumentTypeDecoration<TResult, TVariables>['__apiType'];

  constructor(private value: string, public __meta__?: Record<string, any> | undefined) {
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
  access
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrl
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
}`, {"fragmentName":"Invoice"}) as unknown as TypedDocumentString<InvoiceFragment, unknown>;
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
export const SectionFragmentDoc = new TypedDocumentString(`
    fragment Section on Section {
  id
  conference {
    id
    slug
  }
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
export const SubmissionFragmentDoc = new TypedDocumentString(`
    fragment Submission on Submission {
  id
  translations {
    sk {
      name
      abstract
      keywords
    }
    en {
      name
      abstract
      keywords
    }
  }
  presentationLng
  authors {
    id
    name
    email
  }
  fileUrl
  conference {
    id
    slug
  }
  section {
    ...Section
  }
  createdAt
  updatedAt
}
    fragment Section on Section {
  id
  conference {
    id
    slug
  }
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
}`, {"fragmentName":"Submission"}) as unknown as TypedDocumentString<SubmissionFragment, unknown>;
export const AttendeeFragmentDoc = new TypedDocumentString(`
    fragment Attendee on Attendee {
  id
  user {
    ... on User {
      __typename
      ...User
    }
    ... on AttendeeUser {
      __typename
      id
      name
      email
    }
  }
  invoice {
    ...Invoice
  }
  ticket {
    ...Ticket
  }
  submissions {
    ...Submission
  }
  conference {
    slug
    translations {
      sk {
        logoUrl
      }
      en {
        logoUrl
      }
    }
  }
  createdAt
  updatedAt
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
}
fragment User on User {
  id
  name
  email
  organization
  telephone
  access
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrl
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
  payer {
    ...Billing
  }
}
fragment Section on Section {
  id
  conference {
    id
    slug
  }
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
fragment Submission on Submission {
  id
  translations {
    sk {
      name
      abstract
      keywords
    }
    en {
      name
      abstract
      keywords
    }
  }
  presentationLng
  authors {
    id
    name
    email
  }
  fileUrl
  conference {
    id
    slug
  }
  section {
    ...Section
  }
  createdAt
  updatedAt
}`, {"fragmentName":"Attendee"}) as unknown as TypedDocumentString<AttendeeFragment, unknown>;
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
export const ConferenceRegistrationFragmentDoc = new TypedDocumentString(`
    fragment ConferenceRegistration on Conference {
  ...Conference
  sections {
    ...Section
  }
  tickets {
    ...Ticket
  }
}
    fragment Section on Section {
  id
  conference {
    id
    slug
  }
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
}`, {"fragmentName":"ConferenceRegistration"}) as unknown as TypedDocumentString<ConferenceRegistrationFragment, unknown>;
export const SubmissionFilesFragmentDoc = new TypedDocumentString(`
    fragment SubmissionFiles on SubmissionConnection {
  totalCount
  edges {
    cursor
    node {
      id
      fileUrl
    }
  }
}
    `, {"fragmentName":"SubmissionFiles"}) as unknown as TypedDocumentString<SubmissionFilesFragment, unknown>;
export const AttendeesDocument = new TypedDocumentString(`
    query attendees($after: ObjectId, $first: Int, $conferenceSlug: String!, $passive: Boolean, $sectionIds: [ObjectId!]) {
  attendees(
    after: $after
    first: $first
    conferenceSlug: $conferenceSlug
    passive: $passive
    sectionIds: $sectionIds
  ) {
    totalCount
    edges {
      cursor
      node {
        ...Attendee
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
    fragment Attendee on Attendee {
  id
  user {
    ... on User {
      __typename
      ...User
    }
    ... on AttendeeUser {
      __typename
      id
      name
      email
    }
  }
  invoice {
    ...Invoice
  }
  ticket {
    ...Ticket
  }
  submissions {
    ...Submission
  }
  conference {
    slug
    translations {
      sk {
        logoUrl
      }
      en {
        logoUrl
      }
    }
  }
  createdAt
  updatedAt
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
}
fragment User on User {
  id
  name
  email
  organization
  telephone
  access
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrl
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
  payer {
    ...Billing
  }
}
fragment Section on Section {
  id
  conference {
    id
    slug
  }
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
fragment Submission on Submission {
  id
  translations {
    sk {
      name
      abstract
      keywords
    }
    en {
      name
      abstract
      keywords
    }
  }
  presentationLng
  authors {
    id
    name
    email
  }
  fileUrl
  conference {
    id
    slug
  }
  section {
    ...Section
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<AttendeesQuery, AttendeesQueryVariables>;
export const AttendeeDocument = new TypedDocumentString(`
    query attendee($id: ObjectId!) {
  attendee(id: $id) {
    ...Attendee
  }
}
    fragment Attendee on Attendee {
  id
  user {
    ... on User {
      __typename
      ...User
    }
    ... on AttendeeUser {
      __typename
      id
      name
      email
    }
  }
  invoice {
    ...Invoice
  }
  ticket {
    ...Ticket
  }
  submissions {
    ...Submission
  }
  conference {
    slug
    translations {
      sk {
        logoUrl
      }
      en {
        logoUrl
      }
    }
  }
  createdAt
  updatedAt
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
}
fragment User on User {
  id
  name
  email
  organization
  telephone
  access
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrl
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
  payer {
    ...Billing
  }
}
fragment Section on Section {
  id
  conference {
    id
    slug
  }
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
fragment Submission on Submission {
  id
  translations {
    sk {
      name
      abstract
      keywords
    }
    en {
      name
      abstract
      keywords
    }
  }
  presentationLng
  authors {
    id
    name
    email
  }
  fileUrl
  conference {
    id
    slug
  }
  section {
    ...Section
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<AttendeeQuery, AttendeeQueryVariables>;
export const AttendeesCsvExportDocument = new TypedDocumentString(`
    query attendeesCsvExport($slug: String!) {
  attendeesCsvExport(slug: $slug) {
    ...Attendee
  }
}
    fragment Attendee on Attendee {
  id
  user {
    ... on User {
      __typename
      ...User
    }
    ... on AttendeeUser {
      __typename
      id
      name
      email
    }
  }
  invoice {
    ...Invoice
  }
  ticket {
    ...Ticket
  }
  submissions {
    ...Submission
  }
  conference {
    slug
    translations {
      sk {
        logoUrl
      }
      en {
        logoUrl
      }
    }
  }
  createdAt
  updatedAt
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
}
fragment User on User {
  id
  name
  email
  organization
  telephone
  access
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrl
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
  payer {
    ...Billing
  }
}
fragment Section on Section {
  id
  conference {
    id
    slug
  }
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
fragment Submission on Submission {
  id
  translations {
    sk {
      name
      abstract
      keywords
    }
    en {
      name
      abstract
      keywords
    }
  }
  presentationLng
  authors {
    id
    name
    email
  }
  fileUrl
  conference {
    id
    slug
  }
  section {
    ...Section
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<AttendeesCsvExportQuery, AttendeesCsvExportQueryVariables>;
export const TextSearchAttendeeDocument = new TypedDocumentString(`
    query textSearchAttendee($text: String!) {
  textSearchAttendee(text: $text) {
    id
    user {
      ... on AttendeeUser {
        id
        name
        email
      }
      ... on User {
        id
        name
        email
      }
    }
  }
}
    `) as unknown as TypedDocumentString<TextSearchAttendeeQuery, TextSearchAttendeeQueryVariables>;
export const UpdateInvoiceDocument = new TypedDocumentString(`
    mutation updateInvoice($id: ObjectId!, $data: InvoiceInput!) {
  updateInvoice(id: $id, data: $data) {
    message
    data {
      ...Attendee
    }
  }
}
    fragment Attendee on Attendee {
  id
  user {
    ... on User {
      __typename
      ...User
    }
    ... on AttendeeUser {
      __typename
      id
      name
      email
    }
  }
  invoice {
    ...Invoice
  }
  ticket {
    ...Ticket
  }
  submissions {
    ...Submission
  }
  conference {
    slug
    translations {
      sk {
        logoUrl
      }
      en {
        logoUrl
      }
    }
  }
  createdAt
  updatedAt
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
}
fragment User on User {
  id
  name
  email
  organization
  telephone
  access
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrl
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
  payer {
    ...Billing
  }
}
fragment Section on Section {
  id
  conference {
    id
    slug
  }
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
fragment Submission on Submission {
  id
  translations {
    sk {
      name
      abstract
      keywords
    }
    en {
      name
      abstract
      keywords
    }
  }
  presentationLng
  authors {
    id
    name
    email
  }
  fileUrl
  conference {
    id
    slug
  }
  section {
    ...Section
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<UpdateInvoiceMutation, UpdateInvoiceMutationVariables>;
export const DeleteAttendeeDocument = new TypedDocumentString(`
    mutation deleteAttendee($id: ObjectId!) {
  deleteAttendee(id: $id) {
    message
    data {
      ...Attendee
    }
  }
}
    fragment Attendee on Attendee {
  id
  user {
    ... on User {
      __typename
      ...User
    }
    ... on AttendeeUser {
      __typename
      id
      name
      email
    }
  }
  invoice {
    ...Invoice
  }
  ticket {
    ...Ticket
  }
  submissions {
    ...Submission
  }
  conference {
    slug
    translations {
      sk {
        logoUrl
      }
      en {
        logoUrl
      }
    }
  }
  createdAt
  updatedAt
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
}
fragment User on User {
  id
  name
  email
  organization
  telephone
  access
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrl
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
  payer {
    ...Billing
  }
}
fragment Section on Section {
  id
  conference {
    id
    slug
  }
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
fragment Submission on Submission {
  id
  translations {
    sk {
      name
      abstract
      keywords
    }
    en {
      name
      abstract
      keywords
    }
  }
  presentationLng
  authors {
    id
    name
    email
  }
  fileUrl
  conference {
    id
    slug
  }
  section {
    ...Section
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<DeleteAttendeeMutation, DeleteAttendeeMutationVariables>;
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
}
fragment User on User {
  id
  name
  email
  organization
  telephone
  access
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrl
}`) as unknown as TypedDocumentString<MeQuery, MeQueryVariables>;
export const LoginDocument = new TypedDocumentString(`
    mutation login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    message
    data {
      ...User
      token
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
}
fragment User on User {
  id
  name
  email
  organization
  telephone
  access
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrl
}`) as unknown as TypedDocumentString<LoginMutation, LoginMutationVariables>;
export const GoogleSignInDocument = new TypedDocumentString(`
    mutation googleSignIn($authCode: String!) {
  googleSignIn(authCode: $authCode) {
    message
    data {
      ...User
      token
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
}
fragment User on User {
  id
  name
  email
  organization
  telephone
  access
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrl
}`) as unknown as TypedDocumentString<GoogleSignInMutation, GoogleSignInMutationVariables>;
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
      ...User
      token
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
}
fragment User on User {
  id
  name
  email
  organization
  telephone
  access
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrl
}`) as unknown as TypedDocumentString<PasswordResetMutation, PasswordResetMutationVariables>;
export const RegisterDocument = new TypedDocumentString(`
    mutation register($data: RegisterUserInput!) {
  register(data: $data) {
    message
    data {
      ...User
      token
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
}
fragment User on User {
  id
  name
  email
  organization
  telephone
  access
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrl
}`) as unknown as TypedDocumentString<RegisterMutation, RegisterMutationVariables>;
export const ResendActivationLinkDocument = new TypedDocumentString(`
    mutation resendActivationLink {
  resendActivationLink
}
    `) as unknown as TypedDocumentString<ResendActivationLinkMutation, ResendActivationLinkMutationVariables>;
export const ActivateUserDocument = new TypedDocumentString(`
    mutation activateUser {
  activateUser {
    message
    data {
      ...User
      token
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
}
fragment User on User {
  id
  name
  email
  organization
  telephone
  access
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrl
}`) as unknown as TypedDocumentString<ActivateUserMutation, ActivateUserMutationVariables>;
export const ImpersonateDocument = new TypedDocumentString(`
    query impersonate($id: ObjectId!) {
  user(id: $id) {
    id
    access
    token
  }
}
    `) as unknown as TypedDocumentString<ImpersonateQuery, ImpersonateQueryVariables>;
export const ConferencesDocument = new TypedDocumentString(`
    query conferences($after: ObjectId, $first: Int) {
  conferences(after: $after, first: $first) {
    totalCount
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
      ...Attendee
    }
  }
}
    fragment Attendee on Attendee {
  id
  user {
    ... on User {
      __typename
      ...User
    }
    ... on AttendeeUser {
      __typename
      id
      name
      email
    }
  }
  invoice {
    ...Invoice
  }
  ticket {
    ...Ticket
  }
  submissions {
    ...Submission
  }
  conference {
    slug
    translations {
      sk {
        logoUrl
      }
      en {
        logoUrl
      }
    }
  }
  createdAt
  updatedAt
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
}
fragment User on User {
  id
  name
  email
  organization
  telephone
  access
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrl
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
  payer {
    ...Billing
  }
}
fragment Section on Section {
  id
  conference {
    id
    slug
  }
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
}
fragment Submission on Submission {
  id
  translations {
    sk {
      name
      abstract
      keywords
    }
    en {
      name
      abstract
      keywords
    }
  }
  presentationLng
  authors {
    id
    name
    email
  }
  fileUrl
  conference {
    id
    slug
  }
  section {
    ...Section
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<ConferenceQuery, ConferenceQueryVariables>;
export const ConferenceSectionsDocument = new TypedDocumentString(`
    query conferenceSections($slug: String!, $after: ObjectId, $first: Int) {
  conference(slug: $slug) {
    id
    sections {
      ...Section
      submissions(first: $first, after: $after) {
        ...SubmissionFiles
      }
    }
  }
}
    fragment Section on Section {
  id
  conference {
    id
    slug
  }
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
fragment SubmissionFiles on SubmissionConnection {
  totalCount
  edges {
    cursor
    node {
      id
      fileUrl
    }
  }
}`) as unknown as TypedDocumentString<ConferenceSectionsQuery, ConferenceSectionsQueryVariables>;
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
    data {
      conference {
        slug
      }
    }
  }
}
    `) as unknown as TypedDocumentString<UpdateSectionMutation, UpdateSectionMutationVariables>;
export const DeleteSectionDocument = new TypedDocumentString(`
    mutation deleteSection($id: ObjectId!) {
  deleteSection(id: $id) {
    message
    data {
      conference {
        slug
      }
    }
  }
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
export const AddAttendeeDocument = new TypedDocumentString(`
    mutation addAttendee($data: AttendeeInput!) {
  addAttendee(data: $data) {
    message
    data {
      slug
    }
  }
}
    `) as unknown as TypedDocumentString<AddAttendeeMutation, AddAttendeeMutationVariables>;
export const InternshipsDocument = new TypedDocumentString(`
    query internships($after: ObjectId, $first: Int, $user: ObjectId, $startDate: DateTimeISO, $endDate: DateTimeISO) {
  internships(
    after: $after
    first: $first
    user: $user
    startDate: $startDate
    endDate: $endDate
  ) {
    totalCount
    edges {
      cursor
      node {
        id
        organization
        applicationCount
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    `) as unknown as TypedDocumentString<InternshipsQuery, InternshipsQueryVariables>;
export const InternshipDocument = new TypedDocumentString(`
    query internship($id: ObjectId!) {
  internship(id: $id) {
    id
    organization
    description
    updatedAt
    createdAt
    applicationCount
  }
}
    `) as unknown as TypedDocumentString<InternshipQuery, InternshipQueryVariables>;
export const CreateInternshipDocument = new TypedDocumentString(`
    mutation createInternship($input: InternshipInput!) {
  createInternship(input: $input) {
    message
    data {
      id
      organization
    }
  }
}
    `) as unknown as TypedDocumentString<CreateInternshipMutation, CreateInternshipMutationVariables>;
export const UpdateInternshipDocument = new TypedDocumentString(`
    mutation updateInternship($id: ObjectId!, $input: InternshipInput!) {
  updateInternship(id: $id, input: $input) {
    message
    data {
      id
      organization
    }
  }
}
    `) as unknown as TypedDocumentString<UpdateInternshipMutation, UpdateInternshipMutationVariables>;
export const DeleteInternshipDocument = new TypedDocumentString(`
    mutation deleteInternship($id: ObjectId!) {
  deleteInternship(id: $id)
}
    `) as unknown as TypedDocumentString<DeleteInternshipMutation, DeleteInternshipMutationVariables>;
export const SubmissionDocument = new TypedDocumentString(`
    query submission($id: ObjectId!) {
  submission(id: $id) {
    ...Submission
  }
}
    fragment Section on Section {
  id
  conference {
    id
    slug
  }
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
fragment Submission on Submission {
  id
  translations {
    sk {
      name
      abstract
      keywords
    }
    en {
      name
      abstract
      keywords
    }
  }
  presentationLng
  authors {
    id
    name
    email
  }
  fileUrl
  conference {
    id
    slug
  }
  section {
    ...Section
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<SubmissionQuery, SubmissionQueryVariables>;
export const CreateSubmissionDocument = new TypedDocumentString(`
    mutation createSubmission($data: SubmissionInput!) {
  createSubmission(data: $data) {
    message
    data {
      ...Submission
    }
  }
}
    fragment Section on Section {
  id
  conference {
    id
    slug
  }
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
fragment Submission on Submission {
  id
  translations {
    sk {
      name
      abstract
      keywords
    }
    en {
      name
      abstract
      keywords
    }
  }
  presentationLng
  authors {
    id
    name
    email
  }
  fileUrl
  conference {
    id
    slug
  }
  section {
    ...Section
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<CreateSubmissionMutation, CreateSubmissionMutationVariables>;
export const UpdateSubmissionDocument = new TypedDocumentString(`
    mutation updateSubmission($id: ObjectId!, $data: SubmissionInput!) {
  updateSubmission(id: $id, data: $data) {
    message
    data {
      ...Submission
    }
  }
}
    fragment Section on Section {
  id
  conference {
    id
    slug
  }
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
fragment Submission on Submission {
  id
  translations {
    sk {
      name
      abstract
      keywords
    }
    en {
      name
      abstract
      keywords
    }
  }
  presentationLng
  authors {
    id
    name
    email
  }
  fileUrl
  conference {
    id
    slug
  }
  section {
    ...Section
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<UpdateSubmissionMutation, UpdateSubmissionMutationVariables>;
export const DeleteSubmissionDocument = new TypedDocumentString(`
    mutation deleteSubmission($id: ObjectId!) {
  deleteSubmission(id: $id) {
    message
    data {
      ...Submission
    }
  }
}
    fragment Section on Section {
  id
  conference {
    id
    slug
  }
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
fragment Submission on Submission {
  id
  translations {
    sk {
      name
      abstract
      keywords
    }
    en {
      name
      abstract
      keywords
    }
  }
  presentationLng
  authors {
    id
    name
    email
  }
  fileUrl
  conference {
    id
    slug
  }
  section {
    ...Section
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<DeleteSubmissionMutation, DeleteSubmissionMutationVariables>;
export const RemoveAuthorDocument = new TypedDocumentString(`
    mutation removeAuthor($id: ObjectId!, $authorId: ObjectId!) {
  removeAuthor(id: $id, authorId: $authorId) {
    message
    data {
      ...Submission
    }
  }
}
    fragment Section on Section {
  id
  conference {
    id
    slug
  }
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
fragment Submission on Submission {
  id
  translations {
    sk {
      name
      abstract
      keywords
    }
    en {
      name
      abstract
      keywords
    }
  }
  presentationLng
  authors {
    id
    name
    email
  }
  fileUrl
  conference {
    id
    slug
  }
  section {
    ...Section
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<RemoveAuthorMutation, RemoveAuthorMutationVariables>;
export const UsersDocument = new TypedDocumentString(`
    query users($after: ObjectId, $first: Int) {
  users(after: $after, first: $first) {
    totalCount
    edges {
      cursor
      node {
        id
        name
        email
        organization
        verified
        access
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
}
fragment User on User {
  id
  name
  email
  organization
  telephone
  access
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrl
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
    data {
      ...User
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
}
fragment User on User {
  id
  name
  email
  organization
  telephone
  access
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrl
}`) as unknown as TypedDocumentString<UpdateUserMutation, UpdateUserMutationVariables>;
export const ToggleVerifiedUserDocument = new TypedDocumentString(`
    mutation toggleVerifiedUser($id: ObjectId!) {
  toggleVerifiedUser(id: $id) {
    message
    data {
      ...User
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
}
fragment User on User {
  id
  name
  email
  organization
  telephone
  access
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrl
}`) as unknown as TypedDocumentString<ToggleVerifiedUserMutation, ToggleVerifiedUserMutationVariables>;
export const DeleteUserDocument = new TypedDocumentString(`
    mutation deleteUser($id: ObjectId!) {
  deleteUser(id: $id) {
    message
    data {
      ...User
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
}
fragment User on User {
  id
  name
  email
  organization
  telephone
  access
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrl
}`) as unknown as TypedDocumentString<DeleteUserMutation, DeleteUserMutationVariables>;
export const InviteUsersDocument = new TypedDocumentString(`
    query inviteUsers($input: OrganizationEmails!) {
  inviteUsers(input: $input)
}
    `) as unknown as TypedDocumentString<InviteUsersQuery, InviteUsersQueryVariables>;