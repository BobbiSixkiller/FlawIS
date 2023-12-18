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
  /** The `Upload` scalar type represents a file upload. */
  Upload: { input: any; output: any; }
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

export type Announcement = {
  __typename?: 'Announcement';
  createdAt: Scalars['DateTime']['output'];
  files?: Maybe<Array<Scalars['String']['output']>>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  text: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AnnouncementConnection = {
  __typename?: 'AnnouncementConnection';
  edges: Array<Maybe<AnnouncementEdge>>;
  pageInfo: AnnouncementPageInfo;
};

export type AnnouncementEdge = {
  __typename?: 'AnnouncementEdge';
  cursor: Scalars['ObjectId']['output'];
  node: Announcement;
};

export type AnnouncementInput = {
  files?: InputMaybe<Array<Scalars['String']['input']>>;
  grantId?: InputMaybe<Scalars['ObjectId']['input']>;
  grantType?: InputMaybe<GrantType>;
  name: Scalars['String']['input'];
  text: Scalars['String']['input'];
};

export type AnnouncementPageInfo = {
  __typename?: 'AnnouncementPageInfo';
  endCursor: Scalars['ObjectId']['output'];
  hasNextPage: Scalars['Boolean']['output'];
};

export type Approved = {
  __typename?: 'Approved';
  indirect: Scalars['Int']['output'];
  material: Scalars['Int']['output'];
  salaries: Scalars['Int']['output'];
  services: Scalars['Int']['output'];
  travel: Scalars['Int']['output'];
};

/** Attendee model type */
export type Attendee = {
  __typename?: 'Attendee';
  conference: Conference;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  invoice: Invoice;
  submissions: Array<Submission>;
  ticket: Ticket;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type AttendeeBillingInput = {
  DIC: Scalars['String']['input'];
  ICDPH: Scalars['String']['input'];
  ICO: Scalars['String']['input'];
  address: AddressInput;
  name: Scalars['String']['input'];
};

/** AttendeeConnection type enabling cursor based pagination */
export type AttendeeConnection = {
  __typename?: 'AttendeeConnection';
  edges: Array<Maybe<AttendeeEdge>>;
  pageInfo: AttendeePageInfo;
};

export type AttendeeEdge = {
  __typename?: 'AttendeeEdge';
  cursor: Scalars['ObjectId']['output'];
  node: Attendee;
};

export type AttendeeInput = {
  billing: AttendeeBillingInput;
  conferenceId: Scalars['ObjectId']['input'];
  submission?: InputMaybe<SubmissionInput>;
  submissionId?: InputMaybe<Scalars['ObjectId']['input']>;
  ticketId: Scalars['ObjectId']['input'];
};

export type AttendeePageInfo = {
  __typename?: 'AttendeePageInfo';
  endCursor: Scalars['ObjectId']['output'];
  hasNextPage: Scalars['Boolean']['output'];
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

export type BillingInput = {
  DIC: Scalars['String']['input'];
  IBAN: Scalars['String']['input'];
  ICDPH: Scalars['String']['input'];
  ICO: Scalars['String']['input'];
  SWIFT: Scalars['String']['input'];
  address: AddressInput;
  name: Scalars['String']['input'];
  stamp: FileInput;
  variableSymbol: Scalars['String']['input'];
};

/** Budget schema type */
export type Budget = {
  __typename?: 'Budget';
  approved: Approved;
  createdAt: Scalars['DateTime']['output'];
  members: Array<Maybe<Member>>;
  spent?: Maybe<Spent>;
  updatedAt: Scalars['DateTime']['output'];
  year: Scalars['DateTime']['output'];
};

export type BudgetInput = {
  indirect: Scalars['Float']['input'];
  material: Scalars['Float']['input'];
  salaries: Scalars['Float']['input'];
  services: Scalars['Float']['input'];
  travel: Scalars['Float']['input'];
  year: Scalars['DateTime']['input'];
};

/** Conference model type */
export type Conference = {
  __typename?: 'Conference';
  attendees: AttendeeConnection;
  attendeesCount: Scalars['Int']['output'];
  attending?: Maybe<Attendee>;
  billing: ConferenceBilling;
  contact?: Maybe<Contact>;
  createdAt: Scalars['DateTime']['output'];
  dates: ImportantDates;
  description: Scalars['String']['output'];
  id: Scalars['ObjectId']['output'];
  isAdmin: Scalars['Boolean']['output'];
  logo: File;
  name: Scalars['String']['output'];
  sections: Array<Section>;
  slug: Scalars['String']['output'];
  tickets: Array<Ticket>;
  translations: Array<ConferenceTranslation>;
  updatedAt: Scalars['DateTime']['output'];
};


/** Conference model type */
export type ConferenceAttendeesArgs = {
  after?: InputMaybe<Scalars['ObjectId']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  passive: Scalars['Boolean']['input'];
  sectionIds?: InputMaybe<Array<Scalars['ObjectId']['input']>>;
};

/** Conference billing organization */
export type ConferenceBilling = {
  __typename?: 'ConferenceBilling';
  DIC: Scalars['String']['output'];
  IBAN: Scalars['String']['output'];
  ICDPH: Scalars['String']['output'];
  ICO: Scalars['String']['output'];
  SWIFT: Scalars['String']['output'];
  address: Address;
  name: Scalars['String']['output'];
  stamp: File;
  variableSymbol: Scalars['String']['output'];
};

export type ConferenceConnection = {
  __typename?: 'ConferenceConnection';
  edges: Array<Maybe<ConferenceEdge>>;
  pageInfo: ConferencePageInfo;
  year: Scalars['Int']['output'];
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
  description: Scalars['String']['input'];
  logo: FileInput;
  name: Scalars['String']['input'];
  slug: Scalars['String']['input'];
  translations: Array<ConferenceInputTranslation>;
};

export type ConferenceInputTranslation = {
  description: Scalars['String']['input'];
  language: Scalars['String']['input'];
  logo: FileInput;
  name: Scalars['String']['input'];
};

export type ConferencePageInfo = {
  __typename?: 'ConferencePageInfo';
  endCursor: Scalars['ObjectId']['output'];
  hasNextPage: Scalars['Boolean']['output'];
};

export type ConferenceTranslation = {
  __typename?: 'ConferenceTranslation';
  description: Scalars['String']['output'];
  language: Scalars['String']['output'];
  logo: File;
  name: Scalars['String']['output'];
};

/** User input type */
export type ConferenceUserInput = {
  organisation: Scalars['String']['input'];
  telephone: Scalars['String']['input'];
  titlesAfter?: InputMaybe<Scalars['String']['input']>;
  titlesBefore: Scalars['String']['input'];
};

/** Conference contact information */
export type Contact = {
  __typename?: 'Contact';
  address: Address;
  conferenceTeam: Array<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  name: Scalars['String']['output'];
  scientificTeam: Array<Scalars['String']['output']>;
};

export type DatesInput = {
  end: Scalars['DateTime']['input'];
  regEnd?: InputMaybe<Scalars['DateTime']['input']>;
  start: Scalars['DateTime']['input'];
  submissionDeadline?: InputMaybe<Scalars['DateTime']['input']>;
};

export type File = {
  __typename?: 'File';
  clientSideUrl: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ObjectId']['output'];
  name: Scalars['String']['output'];
  path: Scalars['String']['output'];
  serverSideUrl: Scalars['String']['output'];
  type: FileType;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

/** Cursor based pagination return object type */
export type FileConnection = {
  __typename?: 'FileConnection';
  edges: Array<Maybe<FileEdge>>;
  pageInfo: FilePageInfo;
};

export type FileEdge = {
  __typename?: 'FileEdge';
  cursor: Scalars['ObjectId']['output'];
  node: File;
};

/** file input type */
export type FileInput = {
  id: Scalars['ObjectId']['input'];
  path: Scalars['String']['input'];
};

export type FilePageInfo = {
  __typename?: 'FilePageInfo';
  endCursor: Scalars['ObjectId']['output'];
  hasNextPage: Scalars['Boolean']['output'];
};

/** Supported file types for upload mutation */
export enum FileType {
  Grant = 'GRANT',
  Image = 'IMAGE',
  Submission = 'SUBMISSION'
}

/** Grant model type */
export type Grant = {
  __typename?: 'Grant';
  announcements: Array<Maybe<Announcement>>;
  budgets: Array<Maybe<Budget>>;
  createdAt: Scalars['DateTime']['output'];
  end: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  start: Scalars['DateTime']['output'];
  type: GrantType;
  updatedAt: Scalars['DateTime']['output'];
};

/** GrantConnection type enabling cursor based pagination */
export type GrantConnection = {
  __typename?: 'GrantConnection';
  edges: Array<Maybe<GrantEdge>>;
  pageInfo: GrantPageInfo;
};

export type GrantEdge = {
  __typename?: 'GrantEdge';
  cursor: Scalars['ObjectId']['output'];
  node: Grant;
};

export type GrantInfo = {
  __typename?: 'GrantInfo';
  availableYears: Array<Maybe<Scalars['DateTime']['output']>>;
  grants: Array<Maybe<Grant>>;
  hours: Scalars['Int']['output'];
};

export type GrantInput = {
  end: Scalars['DateTime']['input'];
  name: Scalars['String']['input'];
  start: Scalars['DateTime']['input'];
  type: GrantType;
};

export type GrantPageInfo = {
  __typename?: 'GrantPageInfo';
  endCursor: Scalars['ObjectId']['output'];
  hasNextPage: Scalars['Boolean']['output'];
};

/** Type of grants inside the FLAWIS system */
export enum GrantType {
  Apvv = 'APVV',
  Kega = 'KEGA',
  Vega = 'VEGA'
}

/** Important dates regarding conference */
export type ImportantDates = {
  __typename?: 'ImportantDates';
  end: Scalars['DateTime']['output'];
  regEnd?: Maybe<Scalars['DateTime']['output']>;
  start: Scalars['DateTime']['output'];
  submissionDeadline?: Maybe<Scalars['DateTime']['output']>;
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
  dueDate: Scalars['DateTime']['output'];
  issueDate: Scalars['DateTime']['output'];
  price: Scalars['Float']['output'];
  type: Scalars['String']['output'];
  vat: Scalars['Float']['output'];
  vatDate: Scalars['DateTime']['output'];
};

export type InvoiceDataInput = {
  body: Scalars['String']['input'];
  comment: Scalars['String']['input'];
  dueDate: Scalars['DateTime']['input'];
  issueDate: Scalars['DateTime']['input'];
  price: Scalars['Float']['input'];
  type: Scalars['String']['input'];
  vat: Scalars['Float']['input'];
  vatDate: Scalars['DateTime']['input'];
};

/** Invoice data input type facilitating attendee's invoice update */
export type InvoiceInput = {
  body: InvoiceDataInput;
  issuer: BillingInput;
  payer: AttendeeBillingInput;
};

/** Member schema type */
export type Member = {
  __typename?: 'Member';
  createdAt: Scalars['DateTime']['output'];
  hours: Scalars['Float']['output'];
  isMain: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type MemberInput = {
  hours: Scalars['Float']['input'];
  isMain: Scalars['Boolean']['input'];
  user: Scalars['ID']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  activateUser: Scalars['String']['output'];
  addApprovedBudget: Grant;
  addAttendee: Attendee;
  addMember: Grant;
  addSpentBudget: Grant;
  addSubmission: Submission;
  addSubmissionFile: Submission;
  addTicket: Conference;
  createAnnouncement: Announcement;
  createConference: Conference;
  createGrant: Grant;
  createSection: Section;
  deleteAnnouncement: Announcement;
  deleteBudget: Grant;
  deleteConference: Scalars['Boolean']['output'];
  deleteFile: File;
  deleteGrant: Scalars['Boolean']['output'];
  deleteMember: Grant;
  deleteSection: Scalars['Boolean']['output'];
  deleteSubmission: Submission;
  deleteSubmissionFile: Submission;
  deleteUser: Scalars['Boolean']['output'];
  login: Scalars['String']['output'];
  logout: Scalars['Boolean']['output'];
  passwordReset: Scalars['String']['output'];
  register: Scalars['String']['output'];
  removeAttendee: Attendee;
  removeTicket: Conference;
  resendActivationLink: Scalars['String']['output'];
  updateAnnouncement: Announcement;
  updateConference: Conference;
  updateConferenceUser?: Maybe<User>;
  updateInvoice: Attendee;
  updateSection: Section;
  updateSubmission: Submission;
  updateUser: User;
  updategrant: Grant;
  uploadFile: File;
};


export type MutationAddApprovedBudgetArgs = {
  data: BudgetInput;
  id: Scalars['ObjectId']['input'];
};


export type MutationAddAttendeeArgs = {
  data: AttendeeInput;
};


export type MutationAddMemberArgs = {
  data: MemberInput;
  id: Scalars['ObjectId']['input'];
  year: Scalars['DateTime']['input'];
};


export type MutationAddSpentBudgetArgs = {
  data: BudgetInput;
  id: Scalars['ObjectId']['input'];
};


export type MutationAddSubmissionArgs = {
  data: SubmissionInput;
};


export type MutationAddSubmissionFileArgs = {
  file: FileInput;
  id: Scalars['ObjectId']['input'];
};


export type MutationAddTicketArgs = {
  data: TicketInput;
  id: Scalars['ObjectId']['input'];
};


export type MutationCreateAnnouncementArgs = {
  data: AnnouncementInput;
};


export type MutationCreateConferenceArgs = {
  data: ConferenceInput;
};


export type MutationCreateGrantArgs = {
  data: GrantInput;
};


export type MutationCreateSectionArgs = {
  data: SectionInput;
  id: Scalars['ObjectId']['input'];
};


export type MutationDeleteAnnouncementArgs = {
  id: Scalars['ObjectId']['input'];
};


export type MutationDeleteBudgetArgs = {
  id: Scalars['ObjectId']['input'];
  year: Scalars['DateTime']['input'];
};


export type MutationDeleteConferenceArgs = {
  id: Scalars['ObjectId']['input'];
};


export type MutationDeleteFileArgs = {
  id: Scalars['ObjectId']['input'];
};


export type MutationDeleteGrantArgs = {
  id: Scalars['ObjectId']['input'];
};


export type MutationDeleteMemberArgs = {
  id: Scalars['ObjectId']['input'];
  user: Scalars['ObjectId']['input'];
  year: Scalars['DateTime']['input'];
};


export type MutationDeleteSectionArgs = {
  id: Scalars['ObjectId']['input'];
};


export type MutationDeleteSubmissionArgs = {
  file?: InputMaybe<FileInput>;
  id: Scalars['ObjectId']['input'];
};


export type MutationDeleteSubmissionFileArgs = {
  file: FileInput;
  id: Scalars['ObjectId']['input'];
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


export type MutationRemoveAttendeeArgs = {
  id: Scalars['ObjectId']['input'];
};


export type MutationRemoveTicketArgs = {
  id: Scalars['ObjectId']['input'];
  ticketId: Scalars['ObjectId']['input'];
};


export type MutationUpdateAnnouncementArgs = {
  data: AnnouncementInput;
  id: Scalars['ObjectId']['input'];
};


export type MutationUpdateConferenceArgs = {
  data: ConferenceInput;
  id: Scalars['ObjectId']['input'];
};


export type MutationUpdateConferenceUserArgs = {
  data: ConferenceUserInput;
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


export type MutationUpdateUserArgs = {
  data: UserInput;
  id: Scalars['ObjectId']['input'];
};


export type MutationUpdategrantArgs = {
  data: GrantInput;
  id: Scalars['ObjectId']['input'];
};


export type MutationUploadFileArgs = {
  file: Scalars['Upload']['input'];
  type: FileType;
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
  announcement: Announcement;
  announcements: AnnouncementConnection;
  attendee: Attendee;
  attendeesToCsvExport: Array<Attendee>;
  conference: Conference;
  conferences: ConferenceConnection;
  files: FileConnection;
  forgotPassword: Scalars['String']['output'];
  grant: Grant;
  grantTextSearch: Array<Grant>;
  grants: GrantConnection;
  me: User;
  searchAttendee: Array<Attendee>;
  section: Section;
  submission: Submission;
  user: User;
  userTextSearch: Array<User>;
  users: UserConnection;
};


export type QueryAnnouncementArgs = {
  id: Scalars['ObjectId']['input'];
};


export type QueryAnnouncementsArgs = {
  after?: InputMaybe<Scalars['ObjectId']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAttendeeArgs = {
  id: Scalars['ObjectId']['input'];
};


export type QueryAttendeesToCsvExportArgs = {
  conferenceId: Scalars['ObjectId']['input'];
};


export type QueryConferenceArgs = {
  slug: Scalars['String']['input'];
};


export type QueryConferencesArgs = {
  year: Scalars['Int']['input'];
};


export type QueryFilesArgs = {
  after?: InputMaybe<Scalars['ObjectId']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type QueryGrantArgs = {
  id: Scalars['ObjectId']['input'];
};


export type QueryGrantTextSearchArgs = {
  text: Scalars['String']['input'];
};


export type QueryGrantsArgs = {
  after?: InputMaybe<Scalars['ObjectId']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QuerySearchAttendeeArgs = {
  conferenceId: Scalars['ObjectId']['input'];
  text: Scalars['String']['input'];
};


export type QuerySectionArgs = {
  id: Scalars['ObjectId']['input'];
};


export type QuerySubmissionArgs = {
  id: Scalars['ObjectId']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ObjectId']['input'];
};


export type QueryUserTextSearchArgs = {
  domain?: InputMaybe<Scalars['String']['input']>;
  text: Scalars['String']['input'];
};


export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['ObjectId']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

/** New user input data */
export type RegisterInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
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
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  languages: Array<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  submissions: Array<Submission>;
  translations: Array<SectionTranslation>;
  updatedAt: Scalars['DateTime']['output'];
};

/** Conference section input type */
export type SectionInput = {
  description: Scalars['String']['input'];
  languages: Array<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  translations: Array<TranslationInput>;
};

export type SectionTranslation = {
  __typename?: 'SectionTranslation';
  description: Scalars['String']['output'];
  language: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type Spent = {
  __typename?: 'Spent';
  indirect: Scalars['Int']['output'];
  material: Scalars['Int']['output'];
  salaries: Scalars['Int']['output'];
  services: Scalars['Int']['output'];
  travel: Scalars['Int']['output'];
};

/** Submission entity model type */
export type Submission = {
  __typename?: 'Submission';
  abstract: Scalars['String']['output'];
  authors: Array<User>;
  conference: Conference;
  createdAt: Scalars['DateTime']['output'];
  file?: Maybe<File>;
  id: Scalars['ID']['output'];
  keywords: Array<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  section: Section;
  translations: Array<SubmissionTranslation>;
  updatedAt: Scalars['DateTime']['output'];
};

export type SubmissionInput = {
  abstract: Scalars['String']['input'];
  authors: Array<InputMaybe<Scalars['String']['input']>>;
  conference: Scalars['ObjectId']['input'];
  keywords: Array<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  section: Scalars['ObjectId']['input'];
  submissionUrl?: InputMaybe<Scalars['String']['input']>;
  translations: Array<SubmissionInputTranslation>;
  /** field for admin to create a submission for a given user */
  userId?: InputMaybe<Scalars['ObjectId']['input']>;
};

export type SubmissionInputTranslation = {
  abstract: Scalars['String']['input'];
  keywords: Array<Scalars['String']['input']>;
  language: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type SubmissionTranslation = {
  __typename?: 'SubmissionTranslation';
  abstract: Scalars['String']['output'];
  keywords: Array<Scalars['String']['output']>;
  language: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

/** Conference ticket */
export type Ticket = {
  __typename?: 'Ticket';
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  online: Scalars['Boolean']['output'];
  price: Scalars['Int']['output'];
  translations: Array<TicketTranslation>;
  withSubmission: Scalars['Boolean']['output'];
};

export type TicketInput = {
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
  online: Scalars['Boolean']['input'];
  price: Scalars['Int']['input'];
  translations: Array<TicketInputTranslation>;
  withSubmission: Scalars['Boolean']['input'];
};

export type TicketInputTranslation = {
  description: Scalars['String']['input'];
  language: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type TicketTranslation = {
  __typename?: 'TicketTranslation';
  description: Scalars['String']['output'];
  language: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type TranslationInput = {
  description: Scalars['String']['input'];
  language: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

/** User reference type from users microservice with contributed billings field */
export type User = {
  __typename?: 'User';
  billings: Array<Maybe<Billing>>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  grants: GrantInfo;
  id: Scalars['ObjectId']['output'];
  name: Scalars['String']['output'];
  organisation: Scalars['String']['output'];
  role: Role;
  telephone: Scalars['String']['output'];
  titlesAfter?: Maybe<Scalars['String']['output']>;
  titlesBefore?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  verified: Scalars['Boolean']['output'];
};


/** User reference type from users microservice with contributed billings field */
export type UserGrantsArgs = {
  year?: InputMaybe<Scalars['DateTime']['input']>;
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
  role?: InputMaybe<Scalars['String']['input']>;
};

export type UserFragment = { __typename?: 'User', id: any, titlesBefore?: string | null, name: string, titlesAfter?: string | null, email: string, role: Role, verified: boolean, createdAt: any, updatedAt: any };

export type LoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: string };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', organisation: string, telephone: string, id: any, titlesBefore?: string | null, name: string, titlesAfter?: string | null, email: string, role: Role, verified: boolean, createdAt: any, updatedAt: any, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } };

export type ForgotPasswordQueryVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type ForgotPasswordQuery = { __typename?: 'Query', forgotPassword: string };

export type PasswordResetMutationVariables = Exact<{
  data: PasswordInput;
}>;


export type PasswordResetMutation = { __typename?: 'Mutation', passwordReset: string };

export type RegisterMutationVariables = Exact<{
  data: RegisterInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: string };

export type ResendActivationLinkMutationVariables = Exact<{ [key: string]: never; }>;


export type ResendActivationLinkMutation = { __typename?: 'Mutation', resendActivationLink: string };

export type ActivateUserMutationVariables = Exact<{ [key: string]: never; }>;


export type ActivateUserMutation = { __typename?: 'Mutation', activateUser: string };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

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
  titlesBefore
  name
  titlesAfter
  email
  role
  verified
  createdAt
  updatedAt
}
    `, {"fragmentName":"User"}) as unknown as TypedDocumentString<UserFragment, unknown>;
export const LoginDocument = new TypedDocumentString(`
    mutation login($email: String!, $password: String!) {
  login(email: $email, password: $password)
}
    `) as unknown as TypedDocumentString<LoginMutation, LoginMutationVariables>;
export const MeDocument = new TypedDocumentString(`
    query me {
  me {
    ...User
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
    }
  }
}
    fragment User on User {
  id
  titlesBefore
  name
  titlesAfter
  email
  role
  verified
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<MeQuery, MeQueryVariables>;
export const ForgotPasswordDocument = new TypedDocumentString(`
    query forgotPassword($email: String!) {
  forgotPassword(email: $email)
}
    `) as unknown as TypedDocumentString<ForgotPasswordQuery, ForgotPasswordQueryVariables>;
export const PasswordResetDocument = new TypedDocumentString(`
    mutation passwordReset($data: PasswordInput!) {
  passwordReset(data: $data)
}
    `) as unknown as TypedDocumentString<PasswordResetMutation, PasswordResetMutationVariables>;
export const RegisterDocument = new TypedDocumentString(`
    mutation register($data: RegisterInput!) {
  register(data: $data)
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
export const LogoutDocument = new TypedDocumentString(`
    mutation logout {
  logout
}
    `) as unknown as TypedDocumentString<LogoutMutation, LogoutMutationVariables>;