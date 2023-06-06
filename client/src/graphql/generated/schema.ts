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

export type Announcement = {
  __typename?: 'Announcement';
  createdAt: Scalars['DateTime'];
  files?: Maybe<Array<Scalars['String']>>;
  id: Scalars['ID'];
  name: Scalars['String'];
  text: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type AnnouncementConnection = {
  __typename?: 'AnnouncementConnection';
  edges: Array<Maybe<AnnouncementEdge>>;
  pageInfo: AnnouncementPageInfo;
};

export type AnnouncementEdge = {
  __typename?: 'AnnouncementEdge';
  cursor: Scalars['ObjectId'];
  node: Announcement;
};

export type AnnouncementInput = {
  files?: InputMaybe<Array<Scalars['String']>>;
  grantId?: InputMaybe<Scalars['ObjectId']>;
  grantType?: InputMaybe<GrantType>;
  name: Scalars['String'];
  text: Scalars['String'];
};

export type AnnouncementPageInfo = {
  __typename?: 'AnnouncementPageInfo';
  endCursor: Scalars['ObjectId'];
  hasNextPage: Scalars['Boolean'];
};

export type Approved = {
  __typename?: 'Approved';
  indirect: Scalars['Int'];
  material: Scalars['Int'];
  salaries: Scalars['Int'];
  services: Scalars['Int'];
  travel: Scalars['Int'];
};

/** Attendee model type */
export type Attendee = {
  __typename?: 'Attendee';
  conference: Conference;
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  invoice: Invoice;
  submissions: Array<Submission>;
  ticket: Ticket;
  updatedAt: Scalars['DateTime'];
  user: User;
};

export type AttendeeBillingInput = {
  DIC: Scalars['String'];
  ICDPH: Scalars['String'];
  ICO: Scalars['String'];
  address: AddressInput;
  name: Scalars['String'];
};

/** AttendeeConnection type enabling cursor based pagination */
export type AttendeeConnection = {
  __typename?: 'AttendeeConnection';
  edges: Array<Maybe<AttendeeEdge>>;
  pageInfo: AttendeePageInfo;
};

export type AttendeeEdge = {
  __typename?: 'AttendeeEdge';
  cursor: Scalars['ObjectId'];
  node: Attendee;
};

export type AttendeeInput = {
  billing: AttendeeBillingInput;
  conferenceId: Scalars['ObjectId'];
  submission?: InputMaybe<SubmissionInput>;
  submissionId?: InputMaybe<Scalars['ObjectId']>;
  ticketId: Scalars['ObjectId'];
};

export type AttendeePageInfo = {
  __typename?: 'AttendeePageInfo';
  endCursor: Scalars['ObjectId'];
  hasNextPage: Scalars['Boolean'];
};

/** Billing information */
export type Billing = {
  __typename?: 'Billing';
  DIC: Scalars['String'];
  ICDPH: Scalars['String'];
  ICO: Scalars['String'];
  address: Address;
  name: Scalars['String'];
};

export type BillingInput = {
  DIC: Scalars['String'];
  IBAN: Scalars['String'];
  ICDPH: Scalars['String'];
  ICO: Scalars['String'];
  SWIFT: Scalars['String'];
  address: AddressInput;
  name: Scalars['String'];
  stamp: FileInput;
  variableSymbol: Scalars['String'];
};

/** Budget schema type */
export type Budget = {
  __typename?: 'Budget';
  approved: Approved;
  createdAt: Scalars['DateTime'];
  members: Array<Maybe<Member>>;
  spent?: Maybe<Spent>;
  updatedAt: Scalars['DateTime'];
  year: Scalars['DateTime'];
};

export type BudgetInput = {
  indirect: Scalars['Float'];
  material: Scalars['Float'];
  salaries: Scalars['Float'];
  services: Scalars['Float'];
  travel: Scalars['Float'];
  year: Scalars['DateTime'];
};

/** Conference model type */
export type Conference = {
  __typename?: 'Conference';
  attendees: AttendeeConnection;
  attendeesCount: Scalars['Int'];
  attending?: Maybe<Attendee>;
  billing: ConferenceBilling;
  contact?: Maybe<Contact>;
  createdAt: Scalars['DateTime'];
  dates: ImportantDates;
  description: Scalars['String'];
  id: Scalars['ObjectId'];
  isAdmin: Scalars['Boolean'];
  logo: File;
  name: Scalars['String'];
  sections: Array<Section>;
  slug: Scalars['String'];
  tickets: Array<Ticket>;
  translations: Array<ConferenceTranslation>;
  updatedAt: Scalars['DateTime'];
};


/** Conference model type */
export type ConferenceAttendeesArgs = {
  after?: InputMaybe<Scalars['ObjectId']>;
  first?: InputMaybe<Scalars['Int']>;
};

/** Conference billing organization */
export type ConferenceBilling = {
  __typename?: 'ConferenceBilling';
  DIC: Scalars['String'];
  IBAN: Scalars['String'];
  ICDPH: Scalars['String'];
  ICO: Scalars['String'];
  SWIFT: Scalars['String'];
  address: Address;
  name: Scalars['String'];
  stamp: File;
  variableSymbol: Scalars['String'];
};

export type ConferenceConnection = {
  __typename?: 'ConferenceConnection';
  edges: Array<Maybe<ConferenceEdge>>;
  pageInfo: ConferencePageInfo;
  year: Scalars['Int'];
};

export type ConferenceEdge = {
  __typename?: 'ConferenceEdge';
  cursor: Scalars['ObjectId'];
  node: Conference;
};

/** Conference input type */
export type ConferenceInput = {
  billing: BillingInput;
  dates: DatesInput;
  description: Scalars['String'];
  logo: FileInput;
  name: Scalars['String'];
  slug: Scalars['String'];
  translations: Array<ConferenceInputTranslation>;
};

export type ConferenceInputTranslation = {
  description: Scalars['String'];
  language: Scalars['String'];
  logo: FileInput;
  name: Scalars['String'];
};

export type ConferencePageInfo = {
  __typename?: 'ConferencePageInfo';
  endCursor: Scalars['ObjectId'];
  hasNextPage: Scalars['Boolean'];
};

export type ConferenceTranslation = {
  __typename?: 'ConferenceTranslation';
  description: Scalars['String'];
  language: Scalars['String'];
  logo: File;
  name: Scalars['String'];
};

/** User input type */
export type ConferenceUserInput = {
  organisation: Scalars['String'];
  telephone: Scalars['String'];
  titlesAfter?: InputMaybe<Scalars['String']>;
  titlesBefore: Scalars['String'];
};

/** Conference contact information */
export type Contact = {
  __typename?: 'Contact';
  address: Address;
  conferenceTeam: Array<Scalars['String']>;
  email: Scalars['String'];
  name: Scalars['String'];
  scientificTeam: Array<Scalars['String']>;
};

export type DatesInput = {
  end: Scalars['DateTime'];
  regEnd?: InputMaybe<Scalars['DateTime']>;
  start: Scalars['DateTime'];
  submissionDeadline?: InputMaybe<Scalars['DateTime']>;
};

export type File = {
  __typename?: 'File';
  clientSideUrl: Scalars['String'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ObjectId'];
  name: Scalars['String'];
  path: Scalars['String'];
  serverSideUrl: Scalars['String'];
  type: FileType;
  updatedAt: Scalars['DateTime'];
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
  cursor: Scalars['ObjectId'];
  node: File;
};

/** file input type */
export type FileInput = {
  id: Scalars['ObjectId'];
  path: Scalars['String'];
};

export type FilePageInfo = {
  __typename?: 'FilePageInfo';
  endCursor: Scalars['ObjectId'];
  hasNextPage: Scalars['Boolean'];
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
  createdAt: Scalars['DateTime'];
  end: Scalars['DateTime'];
  id: Scalars['ID'];
  name: Scalars['String'];
  start: Scalars['DateTime'];
  type: GrantType;
  updatedAt: Scalars['DateTime'];
};

/** GrantConnection type enabling cursor based pagination */
export type GrantConnection = {
  __typename?: 'GrantConnection';
  edges: Array<Maybe<GrantEdge>>;
  pageInfo: GrantPageInfo;
};

export type GrantEdge = {
  __typename?: 'GrantEdge';
  cursor: Scalars['ObjectId'];
  node: Grant;
};

export type GrantInfo = {
  __typename?: 'GrantInfo';
  availableYears: Array<Maybe<Scalars['DateTime']>>;
  grants: Array<Maybe<Grant>>;
  hours: Scalars['Int'];
};

export type GrantInput = {
  end: Scalars['DateTime'];
  name: Scalars['String'];
  start: Scalars['DateTime'];
  type: GrantType;
};

export type GrantPageInfo = {
  __typename?: 'GrantPageInfo';
  endCursor: Scalars['ObjectId'];
  hasNextPage: Scalars['Boolean'];
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
  end: Scalars['DateTime'];
  regEnd?: Maybe<Scalars['DateTime']>;
  start: Scalars['DateTime'];
  submissionDeadline?: Maybe<Scalars['DateTime']>;
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
  body: Scalars['String'];
  comment: Scalars['String'];
  dueDate: Scalars['DateTime'];
  issueDate: Scalars['DateTime'];
  price: Scalars['Float'];
  type: Scalars['String'];
  vat: Scalars['Float'];
  vatDate: Scalars['DateTime'];
};

export type InvoiceDataInput = {
  body: Scalars['String'];
  comment: Scalars['String'];
  dueDate: Scalars['DateTime'];
  issueDate: Scalars['DateTime'];
  price: Scalars['Float'];
  type: Scalars['String'];
  vat: Scalars['Float'];
  vatDate: Scalars['DateTime'];
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
  createdAt: Scalars['DateTime'];
  hours: Scalars['Float'];
  isMain: Scalars['Boolean'];
  updatedAt: Scalars['DateTime'];
  user: User;
};

export type MemberInput = {
  hours: Scalars['Float'];
  isMain: Scalars['Boolean'];
  user: Scalars['ID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  activateUser: Scalars['Boolean'];
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
  deleteConference: Scalars['Boolean'];
  deleteFile: File;
  deleteGrant: Scalars['Boolean'];
  deleteMember: Grant;
  deleteSection: Scalars['Boolean'];
  deleteSubmission: Submission;
  deleteSubmissionFile: Submission;
  deleteUser: Scalars['Boolean'];
  login: User;
  logout: Scalars['Boolean'];
  passwordReset: User;
  register: User;
  removeAttendee: Attendee;
  removeTicket: Conference;
  resendActivationLink: Scalars['Boolean'];
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


export type MutationActivateUserArgs = {
  token: Scalars['String'];
};


export type MutationAddApprovedBudgetArgs = {
  data: BudgetInput;
  id: Scalars['ObjectId'];
};


export type MutationAddAttendeeArgs = {
  data: AttendeeInput;
};


export type MutationAddMemberArgs = {
  data: MemberInput;
  id: Scalars['ObjectId'];
  year: Scalars['DateTime'];
};


export type MutationAddSpentBudgetArgs = {
  data: BudgetInput;
  id: Scalars['ObjectId'];
};


export type MutationAddSubmissionArgs = {
  data: SubmissionInput;
};


export type MutationAddSubmissionFileArgs = {
  file: FileInput;
  id: Scalars['ObjectId'];
};


export type MutationAddTicketArgs = {
  data: TicketInput;
  id: Scalars['ObjectId'];
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
  id: Scalars['ObjectId'];
};


export type MutationDeleteAnnouncementArgs = {
  id: Scalars['ObjectId'];
};


export type MutationDeleteBudgetArgs = {
  id: Scalars['ObjectId'];
  year: Scalars['DateTime'];
};


export type MutationDeleteConferenceArgs = {
  id: Scalars['ObjectId'];
};


export type MutationDeleteFileArgs = {
  id: Scalars['ObjectId'];
};


export type MutationDeleteGrantArgs = {
  id: Scalars['ObjectId'];
};


export type MutationDeleteMemberArgs = {
  id: Scalars['ObjectId'];
  user: Scalars['ObjectId'];
  year: Scalars['DateTime'];
};


export type MutationDeleteSectionArgs = {
  id: Scalars['ObjectId'];
};


export type MutationDeleteSubmissionArgs = {
  file?: InputMaybe<FileInput>;
  id: Scalars['ObjectId'];
};


export type MutationDeleteSubmissionFileArgs = {
  file: FileInput;
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


export type MutationRemoveTicketArgs = {
  id: Scalars['ObjectId'];
  ticketId: Scalars['ObjectId'];
};


export type MutationUpdateAnnouncementArgs = {
  data: AnnouncementInput;
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
  announcement: Announcement;
  announcements: AnnouncementConnection;
  attendee: Attendee;
  attendeesToCsvExport: Array<Attendee>;
  conference: Conference;
  conferences: ConferenceConnection;
  files: FileConnection;
  forgotPassword: Scalars['String'];
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
  id: Scalars['ObjectId'];
};


export type QueryAnnouncementsArgs = {
  after?: InputMaybe<Scalars['ObjectId']>;
  first?: InputMaybe<Scalars['Int']>;
};


export type QueryAttendeeArgs = {
  id: Scalars['ObjectId'];
};


export type QueryAttendeesToCsvExportArgs = {
  conferenceId: Scalars['ObjectId'];
};


export type QueryConferenceArgs = {
  slug: Scalars['String'];
};


export type QueryConferencesArgs = {
  year: Scalars['Int'];
};


export type QueryFilesArgs = {
  after?: InputMaybe<Scalars['ObjectId']>;
  first?: InputMaybe<Scalars['Int']>;
};


export type QueryForgotPasswordArgs = {
  email: Scalars['String'];
};


export type QueryGrantArgs = {
  id: Scalars['ObjectId'];
};


export type QueryGrantTextSearchArgs = {
  text: Scalars['String'];
};


export type QueryGrantsArgs = {
  after?: InputMaybe<Scalars['ObjectId']>;
  first?: InputMaybe<Scalars['Int']>;
};


export type QuerySearchAttendeeArgs = {
  conferenceId: Scalars['ObjectId'];
  text: Scalars['String'];
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


export type QueryUserTextSearchArgs = {
  domain?: InputMaybe<Scalars['String']>;
  text: Scalars['String'];
};


export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['ObjectId']>;
  first?: InputMaybe<Scalars['Int']>;
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

export type Spent = {
  __typename?: 'Spent';
  indirect: Scalars['Int'];
  material: Scalars['Int'];
  salaries: Scalars['Int'];
  services: Scalars['Int'];
  travel: Scalars['Int'];
};

/** Submission entity model type */
export type Submission = {
  __typename?: 'Submission';
  abstract: Scalars['String'];
  authors: Array<User>;
  conference: Conference;
  createdAt: Scalars['DateTime'];
  file?: Maybe<File>;
  id: Scalars['ID'];
  keywords: Array<Scalars['String']>;
  name: Scalars['String'];
  section: Section;
  translations: Array<SubmissionTranslation>;
  updatedAt: Scalars['DateTime'];
};

export type SubmissionInput = {
  abstract: Scalars['String'];
  authors: Array<InputMaybe<Scalars['String']>>;
  conferenceId: Scalars['ObjectId'];
  keywords: Array<Scalars['String']>;
  name: Scalars['String'];
  sectionId: Scalars['ObjectId'];
  submissionUrl?: InputMaybe<Scalars['String']>;
  translations: Array<SubmissionInputTranslation>;
  /** field for admin to create a submission for a given user */
  userId?: InputMaybe<Scalars['ObjectId']>;
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

/** Conference ticket */
export type Ticket = {
  __typename?: 'Ticket';
  description: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  online: Scalars['Boolean'];
  price: Scalars['Int'];
  translations: Array<TicketTranslation>;
  withSubmission: Scalars['Boolean'];
};

export type TicketInput = {
  description: Scalars['String'];
  name: Scalars['String'];
  online: Scalars['Boolean'];
  price: Scalars['Int'];
  translations: Array<TicketInputTranslation>;
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
  grants: GrantInfo;
  id: Scalars['ObjectId'];
  name: Scalars['String'];
  organisation: Scalars['String'];
  role: Role;
  telephone: Scalars['String'];
  titlesAfter?: Maybe<Scalars['String']>;
  titlesBefore?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  verified: Scalars['Boolean'];
};


/** User reference type from users microservice with contributed billings field */
export type UserGrantsArgs = {
  year?: InputMaybe<Scalars['DateTime']>;
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

export type AnnouncementsQueryVariables = Exact<{
  after?: InputMaybe<Scalars['ObjectId']>;
  first?: InputMaybe<Scalars['Int']>;
}>;


export type AnnouncementsQuery = { __typename?: 'Query', announcements: { __typename?: 'AnnouncementConnection', edges: Array<{ __typename?: 'AnnouncementEdge', cursor: any, node: { __typename?: 'Announcement', id: string, name: string, text: string, files?: Array<string> | null, createdAt: any, updatedAt: any } } | null>, pageInfo: { __typename?: 'AnnouncementPageInfo', endCursor: any, hasNextPage: boolean } } };

export type AnnouncementQueryVariables = Exact<{
  id: Scalars['ObjectId'];
}>;


export type AnnouncementQuery = { __typename?: 'Query', announcement: { __typename?: 'Announcement', id: string, name: string, text: string, files?: Array<string> | null, createdAt: any, updatedAt: any } };

export type CreateAnnouncementMutationVariables = Exact<{
  data: AnnouncementInput;
}>;


export type CreateAnnouncementMutation = { __typename?: 'Mutation', createAnnouncement: { __typename?: 'Announcement', id: string, name: string, text: string, files?: Array<string> | null, createdAt: any, updatedAt: any } };

export type UpdateAnnouncementMutationVariables = Exact<{
  id: Scalars['ObjectId'];
  data: AnnouncementInput;
}>;


export type UpdateAnnouncementMutation = { __typename?: 'Mutation', updateAnnouncement: { __typename?: 'Announcement', id: string, name: string, text: string, files?: Array<string> | null, createdAt: any, updatedAt: any } };

export type DeleteAnnouncementMutationVariables = Exact<{
  id: Scalars['ObjectId'];
}>;


export type DeleteAnnouncementMutation = { __typename?: 'Mutation', deleteAnnouncement: { __typename?: 'Announcement', id: string, name: string, text: string, files?: Array<string> | null, createdAt: any, updatedAt: any } };

export type UserFragment = { __typename?: 'User', id: any, titlesBefore?: string | null, name: string, titlesAfter?: string | null, email: string, role: Role, verified: boolean, createdAt: any, updatedAt: any };

export type LoginMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'User', organisation: string, telephone: string, id: any, titlesBefore?: string | null, name: string, titlesAfter?: string | null, email: string, role: Role, verified: boolean, createdAt: any, updatedAt: any, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } };

export type MeQueryVariables = Exact<{
  year?: InputMaybe<Scalars['DateTime']>;
}>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', organisation: string, telephone: string, id: any, titlesBefore?: string | null, name: string, titlesAfter?: string | null, email: string, role: Role, verified: boolean, createdAt: any, updatedAt: any, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null>, grants: { __typename?: 'GrantInfo', hours: number, availableYears: Array<any | null>, grants: Array<{ __typename?: 'Grant', id: string, name: string, type: GrantType, start: any, end: any, createdAt: any, updatedAt: any } | null> } } };

export type ForgotPasswordQueryVariables = Exact<{
  email: Scalars['String'];
}>;


export type ForgotPasswordQuery = { __typename?: 'Query', forgotPassword: string };

export type PasswordResetMutationVariables = Exact<{
  data: PasswordInput;
}>;


export type PasswordResetMutation = { __typename?: 'Mutation', passwordReset: { __typename?: 'User', organisation: string, telephone: string, id: any, titlesBefore?: string | null, name: string, titlesAfter?: string | null, email: string, role: Role, verified: boolean, createdAt: any, updatedAt: any, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } };

export type RegisterMutationVariables = Exact<{
  data: RegisterInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'User', organisation: string, telephone: string, id: any, titlesBefore?: string | null, name: string, titlesAfter?: string | null, email: string, role: Role, verified: boolean, createdAt: any, updatedAt: any, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } };

export type ResendActivationLinkMutationVariables = Exact<{ [key: string]: never; }>;


export type ResendActivationLinkMutation = { __typename?: 'Mutation', resendActivationLink: boolean };

export type ActivateUserMutationVariables = Exact<{
  token: Scalars['String'];
}>;


export type ActivateUserMutation = { __typename?: 'Mutation', activateUser: boolean };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type ConferencesQueryVariables = Exact<{
  year: Scalars['Int'];
}>;


export type ConferencesQuery = { __typename?: 'Query', conferences: { __typename?: 'ConferenceConnection', year: number, edges: Array<{ __typename?: 'ConferenceEdge', cursor: any, node: { __typename?: 'Conference', id: any, name: string, slug: string, description: string, logo: { __typename?: 'File', id: any, path: string, clientSideUrl: string, serverSideUrl: string }, dates: { __typename?: 'ImportantDates', start: any, end: any } } } | null>, pageInfo: { __typename?: 'ConferencePageInfo', hasNextPage: boolean, endCursor: any } } };

export type AttendeeFragmentFragment = { __typename?: 'Attendee', id: string, conference: { __typename?: 'Conference', id: any, name: string, logo: { __typename?: 'File', id: any, path: string } }, user: { __typename?: 'User', id: any, name: string, email: string, organisation: string }, ticket: { __typename?: 'Ticket', withSubmission: boolean, online: boolean }, invoice: { __typename?: 'Invoice', payer: { __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, issuer: { __typename?: 'ConferenceBilling', name: string, ICO: string, DIC: string, ICDPH: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string }, stamp: { __typename?: 'File', id: any, path: string } }, body: { __typename?: 'InvoiceData', type: string, issueDate: any, vatDate: any, dueDate: any, price: number, vat: number, body: string, comment: string } }, submissions: Array<{ __typename?: 'Submission', id: string, name: string, abstract: string, keywords: Array<string>, createdAt: any, updatedAt: any, conference: { __typename?: 'Conference', id: any, name: string }, section: { __typename?: 'Section', id: string, name: string }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, translations: Array<{ __typename?: 'SubmissionTranslation', language: string, name: string, abstract: string, keywords: Array<string> }>, file?: { __typename?: 'File', id: any, path: string, clientSideUrl: string, serverSideUrl: string } | null }> };

export type AttendeesToCsvExportQueryVariables = Exact<{
  conferenceId: Scalars['ObjectId'];
}>;


export type AttendeesToCsvExportQuery = { __typename?: 'Query', attendeesToCsvExport: Array<{ __typename?: 'Attendee', id: string, conference: { __typename?: 'Conference', id: any, name: string, logo: { __typename?: 'File', id: any, path: string } }, user: { __typename?: 'User', id: any, name: string, email: string, organisation: string }, ticket: { __typename?: 'Ticket', withSubmission: boolean, online: boolean }, invoice: { __typename?: 'Invoice', payer: { __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, issuer: { __typename?: 'ConferenceBilling', name: string, ICO: string, DIC: string, ICDPH: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string }, stamp: { __typename?: 'File', id: any, path: string } }, body: { __typename?: 'InvoiceData', type: string, issueDate: any, vatDate: any, dueDate: any, price: number, vat: number, body: string, comment: string } }, submissions: Array<{ __typename?: 'Submission', id: string, name: string, abstract: string, keywords: Array<string>, createdAt: any, updatedAt: any, conference: { __typename?: 'Conference', id: any, name: string }, section: { __typename?: 'Section', id: string, name: string }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, translations: Array<{ __typename?: 'SubmissionTranslation', language: string, name: string, abstract: string, keywords: Array<string> }>, file?: { __typename?: 'File', id: any, path: string, clientSideUrl: string, serverSideUrl: string } | null }> }> };

export type AttendeeQueryVariables = Exact<{
  id: Scalars['ObjectId'];
}>;


export type AttendeeQuery = { __typename?: 'Query', attendee: { __typename?: 'Attendee', id: string, conference: { __typename?: 'Conference', id: any, name: string, logo: { __typename?: 'File', id: any, path: string } }, user: { __typename?: 'User', id: any, name: string, email: string, organisation: string }, ticket: { __typename?: 'Ticket', withSubmission: boolean, online: boolean }, invoice: { __typename?: 'Invoice', payer: { __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, issuer: { __typename?: 'ConferenceBilling', name: string, ICO: string, DIC: string, ICDPH: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string }, stamp: { __typename?: 'File', id: any, path: string } }, body: { __typename?: 'InvoiceData', type: string, issueDate: any, vatDate: any, dueDate: any, price: number, vat: number, body: string, comment: string } }, submissions: Array<{ __typename?: 'Submission', id: string, name: string, abstract: string, keywords: Array<string>, createdAt: any, updatedAt: any, conference: { __typename?: 'Conference', id: any, name: string }, section: { __typename?: 'Section', id: string, name: string }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, translations: Array<{ __typename?: 'SubmissionTranslation', language: string, name: string, abstract: string, keywords: Array<string> }>, file?: { __typename?: 'File', id: any, path: string, clientSideUrl: string, serverSideUrl: string } | null }> } };

export type SearchAttendeeQueryVariables = Exact<{
  conferenceId: Scalars['ObjectId'];
  text: Scalars['String'];
}>;


export type SearchAttendeeQuery = { __typename?: 'Query', searchAttendee: Array<{ __typename?: 'Attendee', id: string, conference: { __typename?: 'Conference', id: any, name: string, logo: { __typename?: 'File', id: any, path: string } }, user: { __typename?: 'User', id: any, name: string, email: string, organisation: string }, ticket: { __typename?: 'Ticket', withSubmission: boolean, online: boolean }, invoice: { __typename?: 'Invoice', payer: { __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, issuer: { __typename?: 'ConferenceBilling', name: string, ICO: string, DIC: string, ICDPH: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string }, stamp: { __typename?: 'File', id: any, path: string } }, body: { __typename?: 'InvoiceData', type: string, issueDate: any, vatDate: any, dueDate: any, price: number, vat: number, body: string, comment: string } }, submissions: Array<{ __typename?: 'Submission', id: string, name: string, abstract: string, keywords: Array<string>, createdAt: any, updatedAt: any, conference: { __typename?: 'Conference', id: any, name: string }, section: { __typename?: 'Section', id: string, name: string }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, translations: Array<{ __typename?: 'SubmissionTranslation', language: string, name: string, abstract: string, keywords: Array<string> }>, file?: { __typename?: 'File', id: any, path: string, clientSideUrl: string, serverSideUrl: string } | null }> }> };

export type ConferenceQueryVariables = Exact<{
  slug: Scalars['String'];
}>;


export type ConferenceQuery = { __typename?: 'Query', conference: { __typename?: 'Conference', id: any, name: string, slug: string, description: string, isAdmin: boolean, logo: { __typename?: 'File', id: any, path: string, clientSideUrl: string, serverSideUrl: string }, dates: { __typename?: 'ImportantDates', start: any, end: any, regEnd?: any | null }, sections: Array<{ __typename?: 'Section', id: string, name: string, description: string, languages: Array<string>, submissions: Array<{ __typename?: 'Submission', id: string, name: string, file?: { __typename?: 'File', id: any, path: string, clientSideUrl: string, serverSideUrl: string } | null }>, translations: Array<{ __typename?: 'SectionTranslation', name: string, description: string, language: string }> }>, tickets: Array<{ __typename?: 'Ticket', id: string, name: string, description: string, price: number, withSubmission: boolean, online: boolean }>, attending?: { __typename?: 'Attendee', id: string, conference: { __typename?: 'Conference', id: any, name: string, logo: { __typename?: 'File', id: any, path: string } }, user: { __typename?: 'User', id: any, name: string, email: string, organisation: string }, ticket: { __typename?: 'Ticket', withSubmission: boolean, online: boolean }, invoice: { __typename?: 'Invoice', payer: { __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, issuer: { __typename?: 'ConferenceBilling', name: string, ICO: string, DIC: string, ICDPH: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string }, stamp: { __typename?: 'File', id: any, path: string } }, body: { __typename?: 'InvoiceData', type: string, issueDate: any, vatDate: any, dueDate: any, price: number, vat: number, body: string, comment: string } }, submissions: Array<{ __typename?: 'Submission', id: string, name: string, abstract: string, keywords: Array<string>, createdAt: any, updatedAt: any, conference: { __typename?: 'Conference', id: any, name: string }, section: { __typename?: 'Section', id: string, name: string }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, translations: Array<{ __typename?: 'SubmissionTranslation', language: string, name: string, abstract: string, keywords: Array<string> }>, file?: { __typename?: 'File', id: any, path: string, clientSideUrl: string, serverSideUrl: string } | null }> } | null } };

export type ConferenceAttendeesQueryVariables = Exact<{
  slug: Scalars['String'];
  after?: InputMaybe<Scalars['ObjectId']>;
  first?: InputMaybe<Scalars['Int']>;
}>;


export type ConferenceAttendeesQuery = { __typename?: 'Query', conference: { __typename?: 'Conference', id: any, attendeesCount: number, sections: Array<{ __typename?: 'Section', id: string, name: string, description: string, languages: Array<string> }>, attendees: { __typename?: 'AttendeeConnection', edges: Array<{ __typename?: 'AttendeeEdge', cursor: any, node: { __typename?: 'Attendee', id: string, conference: { __typename?: 'Conference', id: any, name: string, logo: { __typename?: 'File', id: any, path: string } }, user: { __typename?: 'User', id: any, name: string, email: string, organisation: string }, ticket: { __typename?: 'Ticket', withSubmission: boolean, online: boolean }, invoice: { __typename?: 'Invoice', payer: { __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, issuer: { __typename?: 'ConferenceBilling', name: string, ICO: string, DIC: string, ICDPH: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string }, stamp: { __typename?: 'File', id: any, path: string } }, body: { __typename?: 'InvoiceData', type: string, issueDate: any, vatDate: any, dueDate: any, price: number, vat: number, body: string, comment: string } }, submissions: Array<{ __typename?: 'Submission', id: string, name: string, abstract: string, keywords: Array<string>, createdAt: any, updatedAt: any, conference: { __typename?: 'Conference', id: any, name: string }, section: { __typename?: 'Section', id: string, name: string }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, translations: Array<{ __typename?: 'SubmissionTranslation', language: string, name: string, abstract: string, keywords: Array<string> }>, file?: { __typename?: 'File', id: any, path: string, clientSideUrl: string, serverSideUrl: string } | null }> } } | null>, pageInfo: { __typename?: 'AttendeePageInfo', hasNextPage: boolean, endCursor: any } } } };

export type AddTicketMutationVariables = Exact<{
  id: Scalars['ObjectId'];
  data: TicketInput;
}>;


export type AddTicketMutation = { __typename?: 'Mutation', addTicket: { __typename?: 'Conference', id: any, tickets: Array<{ __typename?: 'Ticket', id: string, name: string, description: string, price: number, withSubmission: boolean, online: boolean }> } };

export type RemoveTicketMutationVariables = Exact<{
  id: Scalars['ObjectId'];
  ticketId: Scalars['ObjectId'];
}>;


export type RemoveTicketMutation = { __typename?: 'Mutation', removeTicket: { __typename?: 'Conference', id: any, tickets: Array<{ __typename?: 'Ticket', id: string, name: string, description: string, price: number, withSubmission: boolean, online: boolean }> } };

export type UpdateConferenceUserMutationVariables = Exact<{
  data: ConferenceUserInput;
}>;


export type UpdateConferenceUserMutation = { __typename?: 'Mutation', updateConferenceUser?: { __typename?: 'User', id: any, titlesBefore?: string | null, name: string, titlesAfter?: string | null, email: string, organisation: string, telephone: string, role: Role, verified: boolean, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } | null };

export type CreateConferenceMutationVariables = Exact<{
  data: ConferenceInput;
}>;


export type CreateConferenceMutation = { __typename?: 'Mutation', createConference: { __typename?: 'Conference', id: any, name: string, description: string, slug: string, createdAt: any, updatedAt: any, logo: { __typename?: 'File', id: any, path: string }, dates: { __typename?: 'ImportantDates', start: any, end: any }, billing: { __typename?: 'ConferenceBilling', name: string, ICO: string, DIC: string, ICDPH: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string }, stamp: { __typename?: 'File', id: any, path: string } }, translations: Array<{ __typename?: 'ConferenceTranslation', language: string, name: string, description: string, logo: { __typename?: 'File', id: any, path: string } }> } };

export type AddAttendeeMutationVariables = Exact<{
  data: AttendeeInput;
}>;


export type AddAttendeeMutation = { __typename?: 'Mutation', addAttendee: { __typename?: 'Attendee', id: string, conference: { __typename?: 'Conference', id: any, name: string, logo: { __typename?: 'File', id: any, path: string } }, user: { __typename?: 'User', id: any, name: string, email: string, organisation: string }, ticket: { __typename?: 'Ticket', withSubmission: boolean, online: boolean }, invoice: { __typename?: 'Invoice', payer: { __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, issuer: { __typename?: 'ConferenceBilling', name: string, ICO: string, DIC: string, ICDPH: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string }, stamp: { __typename?: 'File', id: any, path: string } }, body: { __typename?: 'InvoiceData', type: string, issueDate: any, vatDate: any, dueDate: any, price: number, vat: number, body: string, comment: string } }, submissions: Array<{ __typename?: 'Submission', id: string, name: string, abstract: string, keywords: Array<string>, createdAt: any, updatedAt: any, conference: { __typename?: 'Conference', id: any, name: string }, section: { __typename?: 'Section', id: string, name: string }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, translations: Array<{ __typename?: 'SubmissionTranslation', language: string, name: string, abstract: string, keywords: Array<string> }>, file?: { __typename?: 'File', id: any, path: string, clientSideUrl: string, serverSideUrl: string } | null }> } };

export type RemoveAttendeeMutationVariables = Exact<{
  id: Scalars['ObjectId'];
}>;


export type RemoveAttendeeMutation = { __typename?: 'Mutation', removeAttendee: { __typename?: 'Attendee', id: string, conference: { __typename?: 'Conference', id: any, name: string, logo: { __typename?: 'File', id: any, path: string } }, user: { __typename?: 'User', id: any, name: string, email: string, organisation: string }, ticket: { __typename?: 'Ticket', withSubmission: boolean, online: boolean }, invoice: { __typename?: 'Invoice', payer: { __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, issuer: { __typename?: 'ConferenceBilling', name: string, ICO: string, DIC: string, ICDPH: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string }, stamp: { __typename?: 'File', id: any, path: string } }, body: { __typename?: 'InvoiceData', type: string, issueDate: any, vatDate: any, dueDate: any, price: number, vat: number, body: string, comment: string } }, submissions: Array<{ __typename?: 'Submission', id: string, name: string, abstract: string, keywords: Array<string>, createdAt: any, updatedAt: any, conference: { __typename?: 'Conference', id: any, name: string }, section: { __typename?: 'Section', id: string, name: string }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, translations: Array<{ __typename?: 'SubmissionTranslation', language: string, name: string, abstract: string, keywords: Array<string> }>, file?: { __typename?: 'File', id: any, path: string, clientSideUrl: string, serverSideUrl: string } | null }> } };

export type UpdateInvoiceMutationVariables = Exact<{
  id: Scalars['ObjectId'];
  data: InvoiceInput;
}>;


export type UpdateInvoiceMutation = { __typename?: 'Mutation', updateInvoice: { __typename?: 'Attendee', id: string, conference: { __typename?: 'Conference', id: any, name: string, logo: { __typename?: 'File', id: any, path: string } }, user: { __typename?: 'User', id: any, name: string, email: string, organisation: string }, ticket: { __typename?: 'Ticket', withSubmission: boolean, online: boolean }, invoice: { __typename?: 'Invoice', payer: { __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, issuer: { __typename?: 'ConferenceBilling', name: string, ICO: string, DIC: string, ICDPH: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string }, stamp: { __typename?: 'File', id: any, path: string } }, body: { __typename?: 'InvoiceData', type: string, issueDate: any, vatDate: any, dueDate: any, price: number, vat: number, body: string, comment: string } }, submissions: Array<{ __typename?: 'Submission', id: string, name: string, abstract: string, keywords: Array<string>, createdAt: any, updatedAt: any, conference: { __typename?: 'Conference', id: any, name: string }, section: { __typename?: 'Section', id: string, name: string }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, translations: Array<{ __typename?: 'SubmissionTranslation', language: string, name: string, abstract: string, keywords: Array<string> }>, file?: { __typename?: 'File', id: any, path: string, clientSideUrl: string, serverSideUrl: string } | null }> } };

export type UploadFileMutationVariables = Exact<{
  type: FileType;
  file: Scalars['Upload'];
}>;


export type UploadFileMutation = { __typename?: 'Mutation', uploadFile: { __typename?: 'File', id: any, name: string, path: string } };

export type DeleteFileMutationVariables = Exact<{
  id: Scalars['ObjectId'];
}>;


export type DeleteFileMutation = { __typename?: 'Mutation', deleteFile: { __typename?: 'File', id: any, name: string, path: string } };

export type GrantFragment = { __typename?: 'Grant', id: string, name: string, type: GrantType, start: any, end: any, createdAt: any, updatedAt: any };

export type CreateGrantMutationVariables = Exact<{
  data: GrantInput;
}>;


export type CreateGrantMutation = { __typename?: 'Mutation', createGrant: { __typename?: 'Grant', id: string, name: string, type: GrantType, start: any, end: any, createdAt: any, updatedAt: any } };

export type DeleteGrantMutationVariables = Exact<{
  id: Scalars['ObjectId'];
}>;


export type DeleteGrantMutation = { __typename?: 'Mutation', deleteGrant: boolean };

export type AddApprovedBudgetMutationVariables = Exact<{
  id: Scalars['ObjectId'];
  data: BudgetInput;
}>;


export type AddApprovedBudgetMutation = { __typename?: 'Mutation', addApprovedBudget: { __typename?: 'Grant', id: string, name: string, type: GrantType, start: any, end: any, createdAt: any, updatedAt: any, announcements: Array<{ __typename?: 'Announcement', id: string, name: string, text: string, files?: Array<string> | null, updatedAt: any } | null>, budgets: Array<{ __typename?: 'Budget', year: any, createdAt: any, updatedAt: any, approved: { __typename?: 'Approved', material: number, services: number, travel: number, indirect: number, salaries: number }, spent?: { __typename?: 'Spent', material: number, services: number, travel: number, indirect: number, salaries: number } | null, members: Array<{ __typename?: 'Member', hours: number, isMain: boolean, createdAt: any, updatedAt: any, user: { __typename?: 'User', id: any, name: string, email: string } } | null> } | null> } };

export type AddSpentBudgetMutationVariables = Exact<{
  id: Scalars['ObjectId'];
  data: BudgetInput;
}>;


export type AddSpentBudgetMutation = { __typename?: 'Mutation', addSpentBudget: { __typename?: 'Grant', id: string, name: string, type: GrantType, start: any, end: any, createdAt: any, updatedAt: any, announcements: Array<{ __typename?: 'Announcement', id: string, name: string, text: string, files?: Array<string> | null } | null>, budgets: Array<{ __typename?: 'Budget', year: any, createdAt: any, updatedAt: any, approved: { __typename?: 'Approved', material: number, services: number, travel: number, indirect: number, salaries: number }, spent?: { __typename?: 'Spent', material: number, services: number, travel: number, indirect: number, salaries: number } | null, members: Array<{ __typename?: 'Member', hours: number, isMain: boolean, createdAt: any, updatedAt: any, user: { __typename?: 'User', id: any, name: string, email: string } } | null> } | null> } };

export type AddMemberMutationVariables = Exact<{
  id: Scalars['ObjectId'];
  year: Scalars['DateTime'];
  data: MemberInput;
}>;


export type AddMemberMutation = { __typename?: 'Mutation', addMember: { __typename?: 'Grant', id: string, name: string, type: GrantType, start: any, end: any, createdAt: any, updatedAt: any, announcements: Array<{ __typename?: 'Announcement', id: string, name: string, text: string, files?: Array<string> | null } | null>, budgets: Array<{ __typename?: 'Budget', year: any, createdAt: any, updatedAt: any, approved: { __typename?: 'Approved', material: number, services: number, travel: number, indirect: number, salaries: number }, spent?: { __typename?: 'Spent', material: number, services: number, travel: number, indirect: number, salaries: number } | null, members: Array<{ __typename?: 'Member', hours: number, isMain: boolean, createdAt: any, updatedAt: any, user: { __typename?: 'User', id: any, name: string, email: string } } | null> } | null> } };

export type DeleteMemberMutationVariables = Exact<{
  id: Scalars['ObjectId'];
  year: Scalars['DateTime'];
  user: Scalars['ObjectId'];
}>;


export type DeleteMemberMutation = { __typename?: 'Mutation', deleteMember: { __typename?: 'Grant', id: string, name: string, type: GrantType, start: any, end: any, createdAt: any, updatedAt: any, announcements: Array<{ __typename?: 'Announcement', id: string, name: string, text: string, files?: Array<string> | null } | null>, budgets: Array<{ __typename?: 'Budget', year: any, createdAt: any, updatedAt: any, approved: { __typename?: 'Approved', material: number, services: number, travel: number, indirect: number, salaries: number }, spent?: { __typename?: 'Spent', material: number, services: number, travel: number, indirect: number, salaries: number } | null, members: Array<{ __typename?: 'Member', hours: number, isMain: boolean, createdAt: any, updatedAt: any, user: { __typename?: 'User', id: any, name: string, email: string } } | null> } | null> } };

export type DeleteBudgetMutationVariables = Exact<{
  id: Scalars['ObjectId'];
  year: Scalars['DateTime'];
}>;


export type DeleteBudgetMutation = { __typename?: 'Mutation', deleteBudget: { __typename?: 'Grant', id: string, name: string, type: GrantType, start: any, end: any, createdAt: any, updatedAt: any, announcements: Array<{ __typename?: 'Announcement', id: string, name: string, text: string, files?: Array<string> | null } | null>, budgets: Array<{ __typename?: 'Budget', year: any, createdAt: any, updatedAt: any, approved: { __typename?: 'Approved', material: number, services: number, travel: number, indirect: number, salaries: number }, spent?: { __typename?: 'Spent', material: number, services: number, travel: number, indirect: number, salaries: number } | null, members: Array<{ __typename?: 'Member', hours: number, isMain: boolean, createdAt: any, updatedAt: any, user: { __typename?: 'User', id: any, name: string, email: string } } | null> } | null> } };

export type GrantsQueryVariables = Exact<{
  after?: InputMaybe<Scalars['ObjectId']>;
  first?: InputMaybe<Scalars['Int']>;
}>;


export type GrantsQuery = { __typename?: 'Query', grants: { __typename?: 'GrantConnection', edges: Array<{ __typename?: 'GrantEdge', cursor: any, node: { __typename?: 'Grant', id: string, name: string, type: GrantType, start: any, end: any } } | null>, pageInfo: { __typename?: 'GrantPageInfo', endCursor: any, hasNextPage: boolean } } };

export type GrantQueryVariables = Exact<{
  id: Scalars['ObjectId'];
}>;


export type GrantQuery = { __typename?: 'Query', grant: { __typename?: 'Grant', id: string, name: string, type: GrantType, start: any, end: any, createdAt: any, updatedAt: any, announcements: Array<{ __typename?: 'Announcement', id: string, name: string, text: string, files?: Array<string> | null, updatedAt: any } | null>, budgets: Array<{ __typename?: 'Budget', year: any, createdAt: any, updatedAt: any, approved: { __typename?: 'Approved', material: number, services: number, travel: number, indirect: number, salaries: number }, spent?: { __typename?: 'Spent', material: number, services: number, travel: number, indirect: number, salaries: number } | null, members: Array<{ __typename?: 'Member', hours: number, isMain: boolean, createdAt: any, updatedAt: any, user: { __typename?: 'User', id: any, name: string, email: string } } | null> } | null> } };

export type GrantTextSearchQueryVariables = Exact<{
  text: Scalars['String'];
}>;


export type GrantTextSearchQuery = { __typename?: 'Query', grantTextSearch: Array<{ __typename?: 'Grant', id: string, name: string, type: GrantType }> };

export type SectionQueryVariables = Exact<{
  id: Scalars['ObjectId'];
}>;


export type SectionQuery = { __typename?: 'Query', section: { __typename?: 'Section', id: string, name: string, description: string, languages: Array<string>, createdAt: any, updatedAt: any } };

export type CreateSectionMutationVariables = Exact<{
  id: Scalars['ObjectId'];
  data: SectionInput;
}>;


export type CreateSectionMutation = { __typename?: 'Mutation', createSection: { __typename?: 'Section', id: string, name: string, description: string, languages: Array<string>, createdAt: any, updatedAt: any } };

export type UpdateSectionMutationVariables = Exact<{
  id: Scalars['ObjectId'];
  data: SectionInput;
}>;


export type UpdateSectionMutation = { __typename?: 'Mutation', updateSection: { __typename?: 'Section', id: string, name: string, description: string, languages: Array<string>, createdAt: any, updatedAt: any } };

export type DeleteSectionMutationVariables = Exact<{
  id: Scalars['ObjectId'];
}>;


export type DeleteSectionMutation = { __typename?: 'Mutation', deleteSection: boolean };

export type SubmissionQueryVariables = Exact<{
  id: Scalars['ObjectId'];
}>;


export type SubmissionQuery = { __typename?: 'Query', submission: { __typename?: 'Submission', id: string, name: string, abstract: string, keywords: Array<string>, updatedAt: any, conference: { __typename?: 'Conference', id: any }, section: { __typename?: 'Section', id: string, name: string }, authors: Array<{ __typename?: 'User', name: string, email: string }>, file?: { __typename?: 'File', id: any, clientSideUrl: string } | null, translations: Array<{ __typename?: 'SubmissionTranslation', language: string, name: string, abstract: string, keywords: Array<string> }> } };

export type AddSubmissionMutationVariables = Exact<{
  data: SubmissionInput;
}>;


export type AddSubmissionMutation = { __typename?: 'Mutation', addSubmission: { __typename?: 'Submission', id: string, name: string, abstract: string, keywords: Array<string>, updatedAt: any, section: { __typename?: 'Section', id: string, name: string }, authors: Array<{ __typename?: 'User', name: string, email: string }>, translations: Array<{ __typename?: 'SubmissionTranslation', language: string, name: string, abstract: string, keywords: Array<string> }> } };

export type UpdateSubmissionMutationVariables = Exact<{
  id: Scalars['ObjectId'];
  data: SubmissionInput;
}>;


export type UpdateSubmissionMutation = { __typename?: 'Mutation', updateSubmission: { __typename?: 'Submission', id: string, name: string, abstract: string, keywords: Array<string>, updatedAt: any, section: { __typename?: 'Section', id: string, name: string }, authors: Array<{ __typename?: 'User', name: string, email: string }>, translations: Array<{ __typename?: 'SubmissionTranslation', language: string, name: string, abstract: string, keywords: Array<string> }> } };

export type DeleteSubmissionMutationVariables = Exact<{
  id: Scalars['ObjectId'];
}>;


export type DeleteSubmissionMutation = { __typename?: 'Mutation', deleteSubmission: { __typename?: 'Submission', id: string, file?: { __typename?: 'File', id: any } | null } };

export type AddSubmissionFileMutationVariables = Exact<{
  id: Scalars['ObjectId'];
  file: FileInput;
}>;


export type AddSubmissionFileMutation = { __typename?: 'Mutation', addSubmissionFile: { __typename?: 'Submission', id: string, file?: { __typename?: 'File', id: any, clientSideUrl: string } | null } };

export type DeleteSubmissionFileMutationVariables = Exact<{
  id: Scalars['ObjectId'];
  file: FileInput;
}>;


export type DeleteSubmissionFileMutation = { __typename?: 'Mutation', deleteSubmissionFile: { __typename?: 'Submission', id: string, file?: { __typename?: 'File', id: any } | null } };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ObjectId'];
  data: UserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'User', organisation: string, telephone: string, id: any, titlesBefore?: string | null, name: string, titlesAfter?: string | null, email: string, role: Role, verified: boolean, createdAt: any, updatedAt: any, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } };

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['ObjectId'];
}>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser: boolean };

export type UserTextSearchQueryVariables = Exact<{
  text: Scalars['String'];
}>;


export type UserTextSearchQuery = { __typename?: 'Query', userTextSearch: Array<{ __typename?: 'User', id: any, name: string, email: string }> };

export type UsersQueryVariables = Exact<{
  after?: InputMaybe<Scalars['ObjectId']>;
  first?: InputMaybe<Scalars['Int']>;
}>;


export type UsersQuery = { __typename?: 'Query', users: { __typename?: 'UserConnection', edges: Array<{ __typename?: 'UserEdge', cursor: any, node: { __typename?: 'User', organisation: string, id: any, titlesBefore?: string | null, name: string, titlesAfter?: string | null, email: string, role: Role, verified: boolean, createdAt: any, updatedAt: any } } | null>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor: any } } };

export type GrantInfoFragment = { __typename?: 'GrantInfo', hours: number, availableYears: Array<any | null>, grants: Array<{ __typename?: 'Grant', id: string, name: string, type: GrantType, start: any, end: any, createdAt: any, updatedAt: any } | null> };

export type UserQueryVariables = Exact<{
  id: Scalars['ObjectId'];
  year?: InputMaybe<Scalars['DateTime']>;
}>;


export type UserQuery = { __typename?: 'Query', user: { __typename?: 'User', organisation: string, telephone: string, id: any, titlesBefore?: string | null, name: string, titlesAfter?: string | null, email: string, role: Role, verified: boolean, createdAt: any, updatedAt: any, grants: { __typename?: 'GrantInfo', hours: number, availableYears: Array<any | null>, grants: Array<{ __typename?: 'Grant', id: string, name: string, type: GrantType, start: any, end: any, createdAt: any, updatedAt: any } | null> } } };

export const UserFragmentDoc = gql`
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
    `;
export const AttendeeFragmentFragmentDoc = gql`
    fragment AttendeeFragment on Attendee {
  id
  conference {
    id
    name
    logo {
      id
      path
    }
  }
  user {
    id
    name
    email
    organisation
  }
  ticket {
    withSubmission
    online
  }
  invoice {
    payer {
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
    issuer {
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
      variableSymbol
      IBAN
      SWIFT
      stamp {
        id
        path
      }
    }
    body {
      type
      issueDate
      vatDate
      dueDate
      price
      vat
      body
      comment
    }
  }
  submissions {
    id
    name
    abstract
    keywords
    conference {
      id
      name
    }
    section {
      id
      name
    }
    authors {
      id
      name
      email
    }
    translations {
      language
      name
      abstract
      keywords
    }
    file {
      id
      path
      clientSideUrl
      serverSideUrl
    }
    createdAt
    updatedAt
  }
}
    `;
export const GrantFragmentDoc = gql`
    fragment Grant on Grant {
  id
  name
  type
  start
  end
  createdAt
  updatedAt
}
    `;
export const GrantInfoFragmentDoc = gql`
    fragment GrantInfo on GrantInfo {
  grants {
    ...Grant
  }
  hours
  availableYears
}
    ${GrantFragmentDoc}`;
export const AnnouncementsDocument = gql`
    query announcements($after: ObjectId, $first: Int = 20) {
  announcements(after: $after, first: $first) {
    edges {
      cursor
      node {
        id
        name
        text
        files
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
    `;

/**
 * __useAnnouncementsQuery__
 *
 * To run a query within a React component, call `useAnnouncementsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAnnouncementsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAnnouncementsQuery({
 *   variables: {
 *      after: // value for 'after'
 *      first: // value for 'first'
 *   },
 * });
 */
export function useAnnouncementsQuery(baseOptions?: Apollo.QueryHookOptions<AnnouncementsQuery, AnnouncementsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AnnouncementsQuery, AnnouncementsQueryVariables>(AnnouncementsDocument, options);
      }
export function useAnnouncementsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AnnouncementsQuery, AnnouncementsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AnnouncementsQuery, AnnouncementsQueryVariables>(AnnouncementsDocument, options);
        }
export type AnnouncementsQueryHookResult = ReturnType<typeof useAnnouncementsQuery>;
export type AnnouncementsLazyQueryHookResult = ReturnType<typeof useAnnouncementsLazyQuery>;
export type AnnouncementsQueryResult = Apollo.QueryResult<AnnouncementsQuery, AnnouncementsQueryVariables>;
export const AnnouncementDocument = gql`
    query announcement($id: ObjectId!) {
  announcement(id: $id) {
    id
    name
    text
    files
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useAnnouncementQuery__
 *
 * To run a query within a React component, call `useAnnouncementQuery` and pass it any options that fit your needs.
 * When your component renders, `useAnnouncementQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAnnouncementQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useAnnouncementQuery(baseOptions: Apollo.QueryHookOptions<AnnouncementQuery, AnnouncementQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AnnouncementQuery, AnnouncementQueryVariables>(AnnouncementDocument, options);
      }
export function useAnnouncementLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AnnouncementQuery, AnnouncementQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AnnouncementQuery, AnnouncementQueryVariables>(AnnouncementDocument, options);
        }
export type AnnouncementQueryHookResult = ReturnType<typeof useAnnouncementQuery>;
export type AnnouncementLazyQueryHookResult = ReturnType<typeof useAnnouncementLazyQuery>;
export type AnnouncementQueryResult = Apollo.QueryResult<AnnouncementQuery, AnnouncementQueryVariables>;
export const CreateAnnouncementDocument = gql`
    mutation createAnnouncement($data: AnnouncementInput!) {
  createAnnouncement(data: $data) {
    id
    name
    text
    files
    createdAt
    updatedAt
  }
}
    `;
export type CreateAnnouncementMutationFn = Apollo.MutationFunction<CreateAnnouncementMutation, CreateAnnouncementMutationVariables>;

/**
 * __useCreateAnnouncementMutation__
 *
 * To run a mutation, you first call `useCreateAnnouncementMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAnnouncementMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAnnouncementMutation, { data, loading, error }] = useCreateAnnouncementMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateAnnouncementMutation(baseOptions?: Apollo.MutationHookOptions<CreateAnnouncementMutation, CreateAnnouncementMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateAnnouncementMutation, CreateAnnouncementMutationVariables>(CreateAnnouncementDocument, options);
      }
export type CreateAnnouncementMutationHookResult = ReturnType<typeof useCreateAnnouncementMutation>;
export type CreateAnnouncementMutationResult = Apollo.MutationResult<CreateAnnouncementMutation>;
export type CreateAnnouncementMutationOptions = Apollo.BaseMutationOptions<CreateAnnouncementMutation, CreateAnnouncementMutationVariables>;
export const UpdateAnnouncementDocument = gql`
    mutation updateAnnouncement($id: ObjectId!, $data: AnnouncementInput!) {
  updateAnnouncement(id: $id, data: $data) {
    id
    name
    text
    files
    createdAt
    updatedAt
  }
}
    `;
export type UpdateAnnouncementMutationFn = Apollo.MutationFunction<UpdateAnnouncementMutation, UpdateAnnouncementMutationVariables>;

/**
 * __useUpdateAnnouncementMutation__
 *
 * To run a mutation, you first call `useUpdateAnnouncementMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAnnouncementMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAnnouncementMutation, { data, loading, error }] = useUpdateAnnouncementMutation({
 *   variables: {
 *      id: // value for 'id'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateAnnouncementMutation(baseOptions?: Apollo.MutationHookOptions<UpdateAnnouncementMutation, UpdateAnnouncementMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateAnnouncementMutation, UpdateAnnouncementMutationVariables>(UpdateAnnouncementDocument, options);
      }
export type UpdateAnnouncementMutationHookResult = ReturnType<typeof useUpdateAnnouncementMutation>;
export type UpdateAnnouncementMutationResult = Apollo.MutationResult<UpdateAnnouncementMutation>;
export type UpdateAnnouncementMutationOptions = Apollo.BaseMutationOptions<UpdateAnnouncementMutation, UpdateAnnouncementMutationVariables>;
export const DeleteAnnouncementDocument = gql`
    mutation deleteAnnouncement($id: ObjectId!) {
  deleteAnnouncement(id: $id) {
    id
    name
    text
    files
    createdAt
    updatedAt
  }
}
    `;
export type DeleteAnnouncementMutationFn = Apollo.MutationFunction<DeleteAnnouncementMutation, DeleteAnnouncementMutationVariables>;

/**
 * __useDeleteAnnouncementMutation__
 *
 * To run a mutation, you first call `useDeleteAnnouncementMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAnnouncementMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAnnouncementMutation, { data, loading, error }] = useDeleteAnnouncementMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteAnnouncementMutation(baseOptions?: Apollo.MutationHookOptions<DeleteAnnouncementMutation, DeleteAnnouncementMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteAnnouncementMutation, DeleteAnnouncementMutationVariables>(DeleteAnnouncementDocument, options);
      }
export type DeleteAnnouncementMutationHookResult = ReturnType<typeof useDeleteAnnouncementMutation>;
export type DeleteAnnouncementMutationResult = Apollo.MutationResult<DeleteAnnouncementMutation>;
export type DeleteAnnouncementMutationOptions = Apollo.BaseMutationOptions<DeleteAnnouncementMutation, DeleteAnnouncementMutationVariables>;
export const LoginDocument = gql`
    mutation login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
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
    ${UserFragmentDoc}`;
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
    query me($year: DateTime) {
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
    grants(year: $year) {
      ...GrantInfo
    }
  }
}
    ${UserFragmentDoc}
${GrantInfoFragmentDoc}`;

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
 *      year: // value for 'year'
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
export const ForgotPasswordDocument = gql`
    query forgotPassword($email: String!) {
  forgotPassword(email: $email)
}
    `;

/**
 * __useForgotPasswordQuery__
 *
 * To run a query within a React component, call `useForgotPasswordQuery` and pass it any options that fit your needs.
 * When your component renders, `useForgotPasswordQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useForgotPasswordQuery({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useForgotPasswordQuery(baseOptions: Apollo.QueryHookOptions<ForgotPasswordQuery, ForgotPasswordQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ForgotPasswordQuery, ForgotPasswordQueryVariables>(ForgotPasswordDocument, options);
      }
export function useForgotPasswordLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ForgotPasswordQuery, ForgotPasswordQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ForgotPasswordQuery, ForgotPasswordQueryVariables>(ForgotPasswordDocument, options);
        }
export type ForgotPasswordQueryHookResult = ReturnType<typeof useForgotPasswordQuery>;
export type ForgotPasswordLazyQueryHookResult = ReturnType<typeof useForgotPasswordLazyQuery>;
export type ForgotPasswordQueryResult = Apollo.QueryResult<ForgotPasswordQuery, ForgotPasswordQueryVariables>;
export const PasswordResetDocument = gql`
    mutation passwordReset($data: PasswordInput!) {
  passwordReset(data: $data) {
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
    ${UserFragmentDoc}`;
export type PasswordResetMutationFn = Apollo.MutationFunction<PasswordResetMutation, PasswordResetMutationVariables>;

/**
 * __usePasswordResetMutation__
 *
 * To run a mutation, you first call `usePasswordResetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePasswordResetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [passwordResetMutation, { data, loading, error }] = usePasswordResetMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function usePasswordResetMutation(baseOptions?: Apollo.MutationHookOptions<PasswordResetMutation, PasswordResetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PasswordResetMutation, PasswordResetMutationVariables>(PasswordResetDocument, options);
      }
export type PasswordResetMutationHookResult = ReturnType<typeof usePasswordResetMutation>;
export type PasswordResetMutationResult = Apollo.MutationResult<PasswordResetMutation>;
export type PasswordResetMutationOptions = Apollo.BaseMutationOptions<PasswordResetMutation, PasswordResetMutationVariables>;
export const RegisterDocument = gql`
    mutation register($data: RegisterInput!) {
  register(data: $data) {
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
    ${UserFragmentDoc}`;
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
export const ResendActivationLinkDocument = gql`
    mutation resendActivationLink {
  resendActivationLink
}
    `;
export type ResendActivationLinkMutationFn = Apollo.MutationFunction<ResendActivationLinkMutation, ResendActivationLinkMutationVariables>;

/**
 * __useResendActivationLinkMutation__
 *
 * To run a mutation, you first call `useResendActivationLinkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResendActivationLinkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resendActivationLinkMutation, { data, loading, error }] = useResendActivationLinkMutation({
 *   variables: {
 *   },
 * });
 */
export function useResendActivationLinkMutation(baseOptions?: Apollo.MutationHookOptions<ResendActivationLinkMutation, ResendActivationLinkMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ResendActivationLinkMutation, ResendActivationLinkMutationVariables>(ResendActivationLinkDocument, options);
      }
export type ResendActivationLinkMutationHookResult = ReturnType<typeof useResendActivationLinkMutation>;
export type ResendActivationLinkMutationResult = Apollo.MutationResult<ResendActivationLinkMutation>;
export type ResendActivationLinkMutationOptions = Apollo.BaseMutationOptions<ResendActivationLinkMutation, ResendActivationLinkMutationVariables>;
export const ActivateUserDocument = gql`
    mutation activateUser($token: String!) {
  activateUser(token: $token)
}
    `;
export type ActivateUserMutationFn = Apollo.MutationFunction<ActivateUserMutation, ActivateUserMutationVariables>;

/**
 * __useActivateUserMutation__
 *
 * To run a mutation, you first call `useActivateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useActivateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [activateUserMutation, { data, loading, error }] = useActivateUserMutation({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useActivateUserMutation(baseOptions?: Apollo.MutationHookOptions<ActivateUserMutation, ActivateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ActivateUserMutation, ActivateUserMutationVariables>(ActivateUserDocument, options);
      }
export type ActivateUserMutationHookResult = ReturnType<typeof useActivateUserMutation>;
export type ActivateUserMutationResult = Apollo.MutationResult<ActivateUserMutation>;
export type ActivateUserMutationOptions = Apollo.BaseMutationOptions<ActivateUserMutation, ActivateUserMutationVariables>;
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
export const ConferencesDocument = gql`
    query conferences($year: Int!) {
  conferences(year: $year) {
    year
    edges {
      cursor
      node {
        id
        name
        slug
        description
        logo {
          id
          path
          clientSideUrl
          serverSideUrl
        }
        dates {
          start
          end
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    `;

/**
 * __useConferencesQuery__
 *
 * To run a query within a React component, call `useConferencesQuery` and pass it any options that fit your needs.
 * When your component renders, `useConferencesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useConferencesQuery({
 *   variables: {
 *      year: // value for 'year'
 *   },
 * });
 */
export function useConferencesQuery(baseOptions: Apollo.QueryHookOptions<ConferencesQuery, ConferencesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ConferencesQuery, ConferencesQueryVariables>(ConferencesDocument, options);
      }
export function useConferencesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ConferencesQuery, ConferencesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ConferencesQuery, ConferencesQueryVariables>(ConferencesDocument, options);
        }
export type ConferencesQueryHookResult = ReturnType<typeof useConferencesQuery>;
export type ConferencesLazyQueryHookResult = ReturnType<typeof useConferencesLazyQuery>;
export type ConferencesQueryResult = Apollo.QueryResult<ConferencesQuery, ConferencesQueryVariables>;
export const AttendeesToCsvExportDocument = gql`
    query attendeesToCsvExport($conferenceId: ObjectId!) {
  attendeesToCsvExport(conferenceId: $conferenceId) {
    ...AttendeeFragment
  }
}
    ${AttendeeFragmentFragmentDoc}`;

/**
 * __useAttendeesToCsvExportQuery__
 *
 * To run a query within a React component, call `useAttendeesToCsvExportQuery` and pass it any options that fit your needs.
 * When your component renders, `useAttendeesToCsvExportQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAttendeesToCsvExportQuery({
 *   variables: {
 *      conferenceId: // value for 'conferenceId'
 *   },
 * });
 */
export function useAttendeesToCsvExportQuery(baseOptions: Apollo.QueryHookOptions<AttendeesToCsvExportQuery, AttendeesToCsvExportQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AttendeesToCsvExportQuery, AttendeesToCsvExportQueryVariables>(AttendeesToCsvExportDocument, options);
      }
export function useAttendeesToCsvExportLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AttendeesToCsvExportQuery, AttendeesToCsvExportQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AttendeesToCsvExportQuery, AttendeesToCsvExportQueryVariables>(AttendeesToCsvExportDocument, options);
        }
export type AttendeesToCsvExportQueryHookResult = ReturnType<typeof useAttendeesToCsvExportQuery>;
export type AttendeesToCsvExportLazyQueryHookResult = ReturnType<typeof useAttendeesToCsvExportLazyQuery>;
export type AttendeesToCsvExportQueryResult = Apollo.QueryResult<AttendeesToCsvExportQuery, AttendeesToCsvExportQueryVariables>;
export const AttendeeDocument = gql`
    query attendee($id: ObjectId!) {
  attendee(id: $id) {
    ...AttendeeFragment
  }
}
    ${AttendeeFragmentFragmentDoc}`;

/**
 * __useAttendeeQuery__
 *
 * To run a query within a React component, call `useAttendeeQuery` and pass it any options that fit your needs.
 * When your component renders, `useAttendeeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAttendeeQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useAttendeeQuery(baseOptions: Apollo.QueryHookOptions<AttendeeQuery, AttendeeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AttendeeQuery, AttendeeQueryVariables>(AttendeeDocument, options);
      }
export function useAttendeeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AttendeeQuery, AttendeeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AttendeeQuery, AttendeeQueryVariables>(AttendeeDocument, options);
        }
export type AttendeeQueryHookResult = ReturnType<typeof useAttendeeQuery>;
export type AttendeeLazyQueryHookResult = ReturnType<typeof useAttendeeLazyQuery>;
export type AttendeeQueryResult = Apollo.QueryResult<AttendeeQuery, AttendeeQueryVariables>;
export const SearchAttendeeDocument = gql`
    query searchAttendee($conferenceId: ObjectId!, $text: String!) {
  searchAttendee(conferenceId: $conferenceId, text: $text) {
    ...AttendeeFragment
  }
}
    ${AttendeeFragmentFragmentDoc}`;

/**
 * __useSearchAttendeeQuery__
 *
 * To run a query within a React component, call `useSearchAttendeeQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchAttendeeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchAttendeeQuery({
 *   variables: {
 *      conferenceId: // value for 'conferenceId'
 *      text: // value for 'text'
 *   },
 * });
 */
export function useSearchAttendeeQuery(baseOptions: Apollo.QueryHookOptions<SearchAttendeeQuery, SearchAttendeeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchAttendeeQuery, SearchAttendeeQueryVariables>(SearchAttendeeDocument, options);
      }
export function useSearchAttendeeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchAttendeeQuery, SearchAttendeeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchAttendeeQuery, SearchAttendeeQueryVariables>(SearchAttendeeDocument, options);
        }
export type SearchAttendeeQueryHookResult = ReturnType<typeof useSearchAttendeeQuery>;
export type SearchAttendeeLazyQueryHookResult = ReturnType<typeof useSearchAttendeeLazyQuery>;
export type SearchAttendeeQueryResult = Apollo.QueryResult<SearchAttendeeQuery, SearchAttendeeQueryVariables>;
export const ConferenceDocument = gql`
    query conference($slug: String!) {
  conference(slug: $slug) {
    id
    name
    slug
    description
    logo {
      id
      path
      clientSideUrl
      serverSideUrl
    }
    dates {
      start
      end
      regEnd
    }
    sections {
      id
      name
      description
      languages
      submissions {
        id
        name
        file {
          id
          path
          clientSideUrl
          serverSideUrl
        }
      }
      translations {
        name
        description
        language
      }
    }
    tickets {
      id
      name
      description
      price
      withSubmission
      online
    }
    attending {
      ...AttendeeFragment
    }
    isAdmin
  }
}
    ${AttendeeFragmentFragmentDoc}`;

/**
 * __useConferenceQuery__
 *
 * To run a query within a React component, call `useConferenceQuery` and pass it any options that fit your needs.
 * When your component renders, `useConferenceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useConferenceQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useConferenceQuery(baseOptions: Apollo.QueryHookOptions<ConferenceQuery, ConferenceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ConferenceQuery, ConferenceQueryVariables>(ConferenceDocument, options);
      }
export function useConferenceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ConferenceQuery, ConferenceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ConferenceQuery, ConferenceQueryVariables>(ConferenceDocument, options);
        }
export type ConferenceQueryHookResult = ReturnType<typeof useConferenceQuery>;
export type ConferenceLazyQueryHookResult = ReturnType<typeof useConferenceLazyQuery>;
export type ConferenceQueryResult = Apollo.QueryResult<ConferenceQuery, ConferenceQueryVariables>;
export const ConferenceAttendeesDocument = gql`
    query conferenceAttendees($slug: String!, $after: ObjectId, $first: Int) {
  conference(slug: $slug) {
    id
    sections {
      id
      name
      description
      languages
    }
    attendeesCount
    attendees(after: $after, first: $first) {
      edges {
        cursor
        node {
          ...AttendeeFragment
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
    ${AttendeeFragmentFragmentDoc}`;

/**
 * __useConferenceAttendeesQuery__
 *
 * To run a query within a React component, call `useConferenceAttendeesQuery` and pass it any options that fit your needs.
 * When your component renders, `useConferenceAttendeesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useConferenceAttendeesQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *      after: // value for 'after'
 *      first: // value for 'first'
 *   },
 * });
 */
export function useConferenceAttendeesQuery(baseOptions: Apollo.QueryHookOptions<ConferenceAttendeesQuery, ConferenceAttendeesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ConferenceAttendeesQuery, ConferenceAttendeesQueryVariables>(ConferenceAttendeesDocument, options);
      }
export function useConferenceAttendeesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ConferenceAttendeesQuery, ConferenceAttendeesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ConferenceAttendeesQuery, ConferenceAttendeesQueryVariables>(ConferenceAttendeesDocument, options);
        }
export type ConferenceAttendeesQueryHookResult = ReturnType<typeof useConferenceAttendeesQuery>;
export type ConferenceAttendeesLazyQueryHookResult = ReturnType<typeof useConferenceAttendeesLazyQuery>;
export type ConferenceAttendeesQueryResult = Apollo.QueryResult<ConferenceAttendeesQuery, ConferenceAttendeesQueryVariables>;
export const AddTicketDocument = gql`
    mutation addTicket($id: ObjectId!, $data: TicketInput!) {
  addTicket(id: $id, data: $data) {
    id
    tickets {
      id
      name
      description
      price
      withSubmission
      online
    }
  }
}
    `;
export type AddTicketMutationFn = Apollo.MutationFunction<AddTicketMutation, AddTicketMutationVariables>;

/**
 * __useAddTicketMutation__
 *
 * To run a mutation, you first call `useAddTicketMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddTicketMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addTicketMutation, { data, loading, error }] = useAddTicketMutation({
 *   variables: {
 *      id: // value for 'id'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useAddTicketMutation(baseOptions?: Apollo.MutationHookOptions<AddTicketMutation, AddTicketMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddTicketMutation, AddTicketMutationVariables>(AddTicketDocument, options);
      }
export type AddTicketMutationHookResult = ReturnType<typeof useAddTicketMutation>;
export type AddTicketMutationResult = Apollo.MutationResult<AddTicketMutation>;
export type AddTicketMutationOptions = Apollo.BaseMutationOptions<AddTicketMutation, AddTicketMutationVariables>;
export const RemoveTicketDocument = gql`
    mutation removeTicket($id: ObjectId!, $ticketId: ObjectId!) {
  removeTicket(id: $id, ticketId: $ticketId) {
    id
    tickets {
      id
      name
      description
      price
      withSubmission
      online
    }
  }
}
    `;
export type RemoveTicketMutationFn = Apollo.MutationFunction<RemoveTicketMutation, RemoveTicketMutationVariables>;

/**
 * __useRemoveTicketMutation__
 *
 * To run a mutation, you first call `useRemoveTicketMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveTicketMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeTicketMutation, { data, loading, error }] = useRemoveTicketMutation({
 *   variables: {
 *      id: // value for 'id'
 *      ticketId: // value for 'ticketId'
 *   },
 * });
 */
export function useRemoveTicketMutation(baseOptions?: Apollo.MutationHookOptions<RemoveTicketMutation, RemoveTicketMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveTicketMutation, RemoveTicketMutationVariables>(RemoveTicketDocument, options);
      }
export type RemoveTicketMutationHookResult = ReturnType<typeof useRemoveTicketMutation>;
export type RemoveTicketMutationResult = Apollo.MutationResult<RemoveTicketMutation>;
export type RemoveTicketMutationOptions = Apollo.BaseMutationOptions<RemoveTicketMutation, RemoveTicketMutationVariables>;
export const UpdateConferenceUserDocument = gql`
    mutation updateConferenceUser($data: ConferenceUserInput!) {
  updateConferenceUser(data: $data) {
    id
    titlesBefore
    name
    titlesAfter
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
export const CreateConferenceDocument = gql`
    mutation createConference($data: ConferenceInput!) {
  createConference(data: $data) {
    id
    name
    description
    slug
    logo {
      id
      path
    }
    dates {
      start
      end
    }
    billing {
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
      variableSymbol
      IBAN
      SWIFT
      stamp {
        id
        path
      }
    }
    translations {
      language
      name
      description
      logo {
        id
        path
      }
    }
    createdAt
    updatedAt
  }
}
    `;
export type CreateConferenceMutationFn = Apollo.MutationFunction<CreateConferenceMutation, CreateConferenceMutationVariables>;

/**
 * __useCreateConferenceMutation__
 *
 * To run a mutation, you first call `useCreateConferenceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateConferenceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createConferenceMutation, { data, loading, error }] = useCreateConferenceMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateConferenceMutation(baseOptions?: Apollo.MutationHookOptions<CreateConferenceMutation, CreateConferenceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateConferenceMutation, CreateConferenceMutationVariables>(CreateConferenceDocument, options);
      }
export type CreateConferenceMutationHookResult = ReturnType<typeof useCreateConferenceMutation>;
export type CreateConferenceMutationResult = Apollo.MutationResult<CreateConferenceMutation>;
export type CreateConferenceMutationOptions = Apollo.BaseMutationOptions<CreateConferenceMutation, CreateConferenceMutationVariables>;
export const AddAttendeeDocument = gql`
    mutation addAttendee($data: AttendeeInput!) {
  addAttendee(data: $data) {
    ...AttendeeFragment
  }
}
    ${AttendeeFragmentFragmentDoc}`;
export type AddAttendeeMutationFn = Apollo.MutationFunction<AddAttendeeMutation, AddAttendeeMutationVariables>;

/**
 * __useAddAttendeeMutation__
 *
 * To run a mutation, you first call `useAddAttendeeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddAttendeeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addAttendeeMutation, { data, loading, error }] = useAddAttendeeMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useAddAttendeeMutation(baseOptions?: Apollo.MutationHookOptions<AddAttendeeMutation, AddAttendeeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddAttendeeMutation, AddAttendeeMutationVariables>(AddAttendeeDocument, options);
      }
export type AddAttendeeMutationHookResult = ReturnType<typeof useAddAttendeeMutation>;
export type AddAttendeeMutationResult = Apollo.MutationResult<AddAttendeeMutation>;
export type AddAttendeeMutationOptions = Apollo.BaseMutationOptions<AddAttendeeMutation, AddAttendeeMutationVariables>;
export const RemoveAttendeeDocument = gql`
    mutation removeAttendee($id: ObjectId!) {
  removeAttendee(id: $id) {
    ...AttendeeFragment
  }
}
    ${AttendeeFragmentFragmentDoc}`;
export type RemoveAttendeeMutationFn = Apollo.MutationFunction<RemoveAttendeeMutation, RemoveAttendeeMutationVariables>;

/**
 * __useRemoveAttendeeMutation__
 *
 * To run a mutation, you first call `useRemoveAttendeeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveAttendeeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeAttendeeMutation, { data, loading, error }] = useRemoveAttendeeMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRemoveAttendeeMutation(baseOptions?: Apollo.MutationHookOptions<RemoveAttendeeMutation, RemoveAttendeeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveAttendeeMutation, RemoveAttendeeMutationVariables>(RemoveAttendeeDocument, options);
      }
export type RemoveAttendeeMutationHookResult = ReturnType<typeof useRemoveAttendeeMutation>;
export type RemoveAttendeeMutationResult = Apollo.MutationResult<RemoveAttendeeMutation>;
export type RemoveAttendeeMutationOptions = Apollo.BaseMutationOptions<RemoveAttendeeMutation, RemoveAttendeeMutationVariables>;
export const UpdateInvoiceDocument = gql`
    mutation updateInvoice($id: ObjectId!, $data: InvoiceInput!) {
  updateInvoice(id: $id, data: $data) {
    ...AttendeeFragment
  }
}
    ${AttendeeFragmentFragmentDoc}`;
export type UpdateInvoiceMutationFn = Apollo.MutationFunction<UpdateInvoiceMutation, UpdateInvoiceMutationVariables>;

/**
 * __useUpdateInvoiceMutation__
 *
 * To run a mutation, you first call `useUpdateInvoiceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateInvoiceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateInvoiceMutation, { data, loading, error }] = useUpdateInvoiceMutation({
 *   variables: {
 *      id: // value for 'id'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateInvoiceMutation(baseOptions?: Apollo.MutationHookOptions<UpdateInvoiceMutation, UpdateInvoiceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateInvoiceMutation, UpdateInvoiceMutationVariables>(UpdateInvoiceDocument, options);
      }
export type UpdateInvoiceMutationHookResult = ReturnType<typeof useUpdateInvoiceMutation>;
export type UpdateInvoiceMutationResult = Apollo.MutationResult<UpdateInvoiceMutation>;
export type UpdateInvoiceMutationOptions = Apollo.BaseMutationOptions<UpdateInvoiceMutation, UpdateInvoiceMutationVariables>;
export const UploadFileDocument = gql`
    mutation uploadFile($type: FileType!, $file: Upload!) {
  uploadFile(type: $type, file: $file) {
    id
    name
    path
  }
}
    `;
export type UploadFileMutationFn = Apollo.MutationFunction<UploadFileMutation, UploadFileMutationVariables>;

/**
 * __useUploadFileMutation__
 *
 * To run a mutation, you first call `useUploadFileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadFileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadFileMutation, { data, loading, error }] = useUploadFileMutation({
 *   variables: {
 *      type: // value for 'type'
 *      file: // value for 'file'
 *   },
 * });
 */
export function useUploadFileMutation(baseOptions?: Apollo.MutationHookOptions<UploadFileMutation, UploadFileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UploadFileMutation, UploadFileMutationVariables>(UploadFileDocument, options);
      }
export type UploadFileMutationHookResult = ReturnType<typeof useUploadFileMutation>;
export type UploadFileMutationResult = Apollo.MutationResult<UploadFileMutation>;
export type UploadFileMutationOptions = Apollo.BaseMutationOptions<UploadFileMutation, UploadFileMutationVariables>;
export const DeleteFileDocument = gql`
    mutation deleteFile($id: ObjectId!) {
  deleteFile(id: $id) {
    id
    name
    path
  }
}
    `;
export type DeleteFileMutationFn = Apollo.MutationFunction<DeleteFileMutation, DeleteFileMutationVariables>;

/**
 * __useDeleteFileMutation__
 *
 * To run a mutation, you first call `useDeleteFileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteFileMutation, { data, loading, error }] = useDeleteFileMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteFileMutation(baseOptions?: Apollo.MutationHookOptions<DeleteFileMutation, DeleteFileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteFileMutation, DeleteFileMutationVariables>(DeleteFileDocument, options);
      }
export type DeleteFileMutationHookResult = ReturnType<typeof useDeleteFileMutation>;
export type DeleteFileMutationResult = Apollo.MutationResult<DeleteFileMutation>;
export type DeleteFileMutationOptions = Apollo.BaseMutationOptions<DeleteFileMutation, DeleteFileMutationVariables>;
export const CreateGrantDocument = gql`
    mutation createGrant($data: GrantInput!) {
  createGrant(data: $data) {
    ...Grant
  }
}
    ${GrantFragmentDoc}`;
export type CreateGrantMutationFn = Apollo.MutationFunction<CreateGrantMutation, CreateGrantMutationVariables>;

/**
 * __useCreateGrantMutation__
 *
 * To run a mutation, you first call `useCreateGrantMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGrantMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGrantMutation, { data, loading, error }] = useCreateGrantMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateGrantMutation(baseOptions?: Apollo.MutationHookOptions<CreateGrantMutation, CreateGrantMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateGrantMutation, CreateGrantMutationVariables>(CreateGrantDocument, options);
      }
export type CreateGrantMutationHookResult = ReturnType<typeof useCreateGrantMutation>;
export type CreateGrantMutationResult = Apollo.MutationResult<CreateGrantMutation>;
export type CreateGrantMutationOptions = Apollo.BaseMutationOptions<CreateGrantMutation, CreateGrantMutationVariables>;
export const DeleteGrantDocument = gql`
    mutation deleteGrant($id: ObjectId!) {
  deleteGrant(id: $id)
}
    `;
export type DeleteGrantMutationFn = Apollo.MutationFunction<DeleteGrantMutation, DeleteGrantMutationVariables>;

/**
 * __useDeleteGrantMutation__
 *
 * To run a mutation, you first call `useDeleteGrantMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteGrantMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteGrantMutation, { data, loading, error }] = useDeleteGrantMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteGrantMutation(baseOptions?: Apollo.MutationHookOptions<DeleteGrantMutation, DeleteGrantMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteGrantMutation, DeleteGrantMutationVariables>(DeleteGrantDocument, options);
      }
export type DeleteGrantMutationHookResult = ReturnType<typeof useDeleteGrantMutation>;
export type DeleteGrantMutationResult = Apollo.MutationResult<DeleteGrantMutation>;
export type DeleteGrantMutationOptions = Apollo.BaseMutationOptions<DeleteGrantMutation, DeleteGrantMutationVariables>;
export const AddApprovedBudgetDocument = gql`
    mutation addApprovedBudget($id: ObjectId!, $data: BudgetInput!) {
  addApprovedBudget(id: $id, data: $data) {
    ...Grant
    announcements {
      id
      name
      text
      files
      updatedAt
    }
    budgets {
      year
      approved {
        material
        services
        travel
        indirect
        salaries
      }
      spent {
        material
        services
        travel
        indirect
        salaries
      }
      members {
        user {
          id
          name
          email
        }
        hours
        isMain
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
}
    ${GrantFragmentDoc}`;
export type AddApprovedBudgetMutationFn = Apollo.MutationFunction<AddApprovedBudgetMutation, AddApprovedBudgetMutationVariables>;

/**
 * __useAddApprovedBudgetMutation__
 *
 * To run a mutation, you first call `useAddApprovedBudgetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddApprovedBudgetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addApprovedBudgetMutation, { data, loading, error }] = useAddApprovedBudgetMutation({
 *   variables: {
 *      id: // value for 'id'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useAddApprovedBudgetMutation(baseOptions?: Apollo.MutationHookOptions<AddApprovedBudgetMutation, AddApprovedBudgetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddApprovedBudgetMutation, AddApprovedBudgetMutationVariables>(AddApprovedBudgetDocument, options);
      }
export type AddApprovedBudgetMutationHookResult = ReturnType<typeof useAddApprovedBudgetMutation>;
export type AddApprovedBudgetMutationResult = Apollo.MutationResult<AddApprovedBudgetMutation>;
export type AddApprovedBudgetMutationOptions = Apollo.BaseMutationOptions<AddApprovedBudgetMutation, AddApprovedBudgetMutationVariables>;
export const AddSpentBudgetDocument = gql`
    mutation addSpentBudget($id: ObjectId!, $data: BudgetInput!) {
  addSpentBudget(id: $id, data: $data) {
    ...Grant
    announcements {
      id
      name
      text
      files
    }
    budgets {
      year
      approved {
        material
        services
        travel
        indirect
        salaries
      }
      spent {
        material
        services
        travel
        indirect
        salaries
      }
      members {
        user {
          id
          name
          email
        }
        hours
        isMain
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
}
    ${GrantFragmentDoc}`;
export type AddSpentBudgetMutationFn = Apollo.MutationFunction<AddSpentBudgetMutation, AddSpentBudgetMutationVariables>;

/**
 * __useAddSpentBudgetMutation__
 *
 * To run a mutation, you first call `useAddSpentBudgetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddSpentBudgetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addSpentBudgetMutation, { data, loading, error }] = useAddSpentBudgetMutation({
 *   variables: {
 *      id: // value for 'id'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useAddSpentBudgetMutation(baseOptions?: Apollo.MutationHookOptions<AddSpentBudgetMutation, AddSpentBudgetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddSpentBudgetMutation, AddSpentBudgetMutationVariables>(AddSpentBudgetDocument, options);
      }
export type AddSpentBudgetMutationHookResult = ReturnType<typeof useAddSpentBudgetMutation>;
export type AddSpentBudgetMutationResult = Apollo.MutationResult<AddSpentBudgetMutation>;
export type AddSpentBudgetMutationOptions = Apollo.BaseMutationOptions<AddSpentBudgetMutation, AddSpentBudgetMutationVariables>;
export const AddMemberDocument = gql`
    mutation addMember($id: ObjectId!, $year: DateTime!, $data: MemberInput!) {
  addMember(id: $id, year: $year, data: $data) {
    ...Grant
    announcements {
      id
      name
      text
      files
    }
    budgets {
      year
      approved {
        material
        services
        travel
        indirect
        salaries
      }
      spent {
        material
        services
        travel
        indirect
        salaries
      }
      members {
        user {
          id
          name
          email
        }
        hours
        isMain
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
}
    ${GrantFragmentDoc}`;
export type AddMemberMutationFn = Apollo.MutationFunction<AddMemberMutation, AddMemberMutationVariables>;

/**
 * __useAddMemberMutation__
 *
 * To run a mutation, you first call `useAddMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addMemberMutation, { data, loading, error }] = useAddMemberMutation({
 *   variables: {
 *      id: // value for 'id'
 *      year: // value for 'year'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useAddMemberMutation(baseOptions?: Apollo.MutationHookOptions<AddMemberMutation, AddMemberMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddMemberMutation, AddMemberMutationVariables>(AddMemberDocument, options);
      }
export type AddMemberMutationHookResult = ReturnType<typeof useAddMemberMutation>;
export type AddMemberMutationResult = Apollo.MutationResult<AddMemberMutation>;
export type AddMemberMutationOptions = Apollo.BaseMutationOptions<AddMemberMutation, AddMemberMutationVariables>;
export const DeleteMemberDocument = gql`
    mutation deleteMember($id: ObjectId!, $year: DateTime!, $user: ObjectId!) {
  deleteMember(id: $id, year: $year, user: $user) {
    ...Grant
    announcements {
      id
      name
      text
      files
    }
    budgets {
      year
      approved {
        material
        services
        travel
        indirect
        salaries
      }
      spent {
        material
        services
        travel
        indirect
        salaries
      }
      members {
        user {
          id
          name
          email
        }
        hours
        isMain
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
}
    ${GrantFragmentDoc}`;
export type DeleteMemberMutationFn = Apollo.MutationFunction<DeleteMemberMutation, DeleteMemberMutationVariables>;

/**
 * __useDeleteMemberMutation__
 *
 * To run a mutation, you first call `useDeleteMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteMemberMutation, { data, loading, error }] = useDeleteMemberMutation({
 *   variables: {
 *      id: // value for 'id'
 *      year: // value for 'year'
 *      user: // value for 'user'
 *   },
 * });
 */
export function useDeleteMemberMutation(baseOptions?: Apollo.MutationHookOptions<DeleteMemberMutation, DeleteMemberMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteMemberMutation, DeleteMemberMutationVariables>(DeleteMemberDocument, options);
      }
export type DeleteMemberMutationHookResult = ReturnType<typeof useDeleteMemberMutation>;
export type DeleteMemberMutationResult = Apollo.MutationResult<DeleteMemberMutation>;
export type DeleteMemberMutationOptions = Apollo.BaseMutationOptions<DeleteMemberMutation, DeleteMemberMutationVariables>;
export const DeleteBudgetDocument = gql`
    mutation deleteBudget($id: ObjectId!, $year: DateTime!) {
  deleteBudget(id: $id, year: $year) {
    ...Grant
    announcements {
      id
      name
      text
      files
    }
    budgets {
      year
      approved {
        material
        services
        travel
        indirect
        salaries
      }
      spent {
        material
        services
        travel
        indirect
        salaries
      }
      members {
        user {
          id
          name
          email
        }
        hours
        isMain
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
}
    ${GrantFragmentDoc}`;
export type DeleteBudgetMutationFn = Apollo.MutationFunction<DeleteBudgetMutation, DeleteBudgetMutationVariables>;

/**
 * __useDeleteBudgetMutation__
 *
 * To run a mutation, you first call `useDeleteBudgetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteBudgetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteBudgetMutation, { data, loading, error }] = useDeleteBudgetMutation({
 *   variables: {
 *      id: // value for 'id'
 *      year: // value for 'year'
 *   },
 * });
 */
export function useDeleteBudgetMutation(baseOptions?: Apollo.MutationHookOptions<DeleteBudgetMutation, DeleteBudgetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteBudgetMutation, DeleteBudgetMutationVariables>(DeleteBudgetDocument, options);
      }
export type DeleteBudgetMutationHookResult = ReturnType<typeof useDeleteBudgetMutation>;
export type DeleteBudgetMutationResult = Apollo.MutationResult<DeleteBudgetMutation>;
export type DeleteBudgetMutationOptions = Apollo.BaseMutationOptions<DeleteBudgetMutation, DeleteBudgetMutationVariables>;
export const GrantsDocument = gql`
    query grants($after: ObjectId, $first: Int = 20) {
  grants(after: $after, first: $first) {
    edges {
      cursor
      node {
        id
        name
        type
        start
        end
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
    `;

/**
 * __useGrantsQuery__
 *
 * To run a query within a React component, call `useGrantsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGrantsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGrantsQuery({
 *   variables: {
 *      after: // value for 'after'
 *      first: // value for 'first'
 *   },
 * });
 */
export function useGrantsQuery(baseOptions?: Apollo.QueryHookOptions<GrantsQuery, GrantsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GrantsQuery, GrantsQueryVariables>(GrantsDocument, options);
      }
export function useGrantsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GrantsQuery, GrantsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GrantsQuery, GrantsQueryVariables>(GrantsDocument, options);
        }
export type GrantsQueryHookResult = ReturnType<typeof useGrantsQuery>;
export type GrantsLazyQueryHookResult = ReturnType<typeof useGrantsLazyQuery>;
export type GrantsQueryResult = Apollo.QueryResult<GrantsQuery, GrantsQueryVariables>;
export const GrantDocument = gql`
    query grant($id: ObjectId!) {
  grant(id: $id) {
    ...Grant
    announcements {
      id
      name
      text
      files
      updatedAt
    }
    budgets {
      year
      approved {
        material
        services
        travel
        indirect
        salaries
      }
      spent {
        material
        services
        travel
        indirect
        salaries
      }
      members {
        user {
          id
          name
          email
        }
        hours
        isMain
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
}
    ${GrantFragmentDoc}`;

/**
 * __useGrantQuery__
 *
 * To run a query within a React component, call `useGrantQuery` and pass it any options that fit your needs.
 * When your component renders, `useGrantQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGrantQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGrantQuery(baseOptions: Apollo.QueryHookOptions<GrantQuery, GrantQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GrantQuery, GrantQueryVariables>(GrantDocument, options);
      }
export function useGrantLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GrantQuery, GrantQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GrantQuery, GrantQueryVariables>(GrantDocument, options);
        }
export type GrantQueryHookResult = ReturnType<typeof useGrantQuery>;
export type GrantLazyQueryHookResult = ReturnType<typeof useGrantLazyQuery>;
export type GrantQueryResult = Apollo.QueryResult<GrantQuery, GrantQueryVariables>;
export const GrantTextSearchDocument = gql`
    query grantTextSearch($text: String!) {
  grantTextSearch(text: $text) {
    id
    name
    type
  }
}
    `;

/**
 * __useGrantTextSearchQuery__
 *
 * To run a query within a React component, call `useGrantTextSearchQuery` and pass it any options that fit your needs.
 * When your component renders, `useGrantTextSearchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGrantTextSearchQuery({
 *   variables: {
 *      text: // value for 'text'
 *   },
 * });
 */
export function useGrantTextSearchQuery(baseOptions: Apollo.QueryHookOptions<GrantTextSearchQuery, GrantTextSearchQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GrantTextSearchQuery, GrantTextSearchQueryVariables>(GrantTextSearchDocument, options);
      }
export function useGrantTextSearchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GrantTextSearchQuery, GrantTextSearchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GrantTextSearchQuery, GrantTextSearchQueryVariables>(GrantTextSearchDocument, options);
        }
export type GrantTextSearchQueryHookResult = ReturnType<typeof useGrantTextSearchQuery>;
export type GrantTextSearchLazyQueryHookResult = ReturnType<typeof useGrantTextSearchLazyQuery>;
export type GrantTextSearchQueryResult = Apollo.QueryResult<GrantTextSearchQuery, GrantTextSearchQueryVariables>;
export const SectionDocument = gql`
    query section($id: ObjectId!) {
  section(id: $id) {
    id
    name
    description
    languages
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useSectionQuery__
 *
 * To run a query within a React component, call `useSectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useSectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSectionQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSectionQuery(baseOptions: Apollo.QueryHookOptions<SectionQuery, SectionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SectionQuery, SectionQueryVariables>(SectionDocument, options);
      }
export function useSectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SectionQuery, SectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SectionQuery, SectionQueryVariables>(SectionDocument, options);
        }
export type SectionQueryHookResult = ReturnType<typeof useSectionQuery>;
export type SectionLazyQueryHookResult = ReturnType<typeof useSectionLazyQuery>;
export type SectionQueryResult = Apollo.QueryResult<SectionQuery, SectionQueryVariables>;
export const CreateSectionDocument = gql`
    mutation createSection($id: ObjectId!, $data: SectionInput!) {
  createSection(id: $id, data: $data) {
    id
    name
    description
    languages
    createdAt
    updatedAt
  }
}
    `;
export type CreateSectionMutationFn = Apollo.MutationFunction<CreateSectionMutation, CreateSectionMutationVariables>;

/**
 * __useCreateSectionMutation__
 *
 * To run a mutation, you first call `useCreateSectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSectionMutation, { data, loading, error }] = useCreateSectionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateSectionMutation(baseOptions?: Apollo.MutationHookOptions<CreateSectionMutation, CreateSectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSectionMutation, CreateSectionMutationVariables>(CreateSectionDocument, options);
      }
export type CreateSectionMutationHookResult = ReturnType<typeof useCreateSectionMutation>;
export type CreateSectionMutationResult = Apollo.MutationResult<CreateSectionMutation>;
export type CreateSectionMutationOptions = Apollo.BaseMutationOptions<CreateSectionMutation, CreateSectionMutationVariables>;
export const UpdateSectionDocument = gql`
    mutation updateSection($id: ObjectId!, $data: SectionInput!) {
  updateSection(id: $id, data: $data) {
    id
    name
    description
    languages
    createdAt
    updatedAt
  }
}
    `;
export type UpdateSectionMutationFn = Apollo.MutationFunction<UpdateSectionMutation, UpdateSectionMutationVariables>;

/**
 * __useUpdateSectionMutation__
 *
 * To run a mutation, you first call `useUpdateSectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSectionMutation, { data, loading, error }] = useUpdateSectionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateSectionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSectionMutation, UpdateSectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSectionMutation, UpdateSectionMutationVariables>(UpdateSectionDocument, options);
      }
export type UpdateSectionMutationHookResult = ReturnType<typeof useUpdateSectionMutation>;
export type UpdateSectionMutationResult = Apollo.MutationResult<UpdateSectionMutation>;
export type UpdateSectionMutationOptions = Apollo.BaseMutationOptions<UpdateSectionMutation, UpdateSectionMutationVariables>;
export const DeleteSectionDocument = gql`
    mutation deleteSection($id: ObjectId!) {
  deleteSection(id: $id)
}
    `;
export type DeleteSectionMutationFn = Apollo.MutationFunction<DeleteSectionMutation, DeleteSectionMutationVariables>;

/**
 * __useDeleteSectionMutation__
 *
 * To run a mutation, you first call `useDeleteSectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSectionMutation, { data, loading, error }] = useDeleteSectionMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteSectionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteSectionMutation, DeleteSectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteSectionMutation, DeleteSectionMutationVariables>(DeleteSectionDocument, options);
      }
export type DeleteSectionMutationHookResult = ReturnType<typeof useDeleteSectionMutation>;
export type DeleteSectionMutationResult = Apollo.MutationResult<DeleteSectionMutation>;
export type DeleteSectionMutationOptions = Apollo.BaseMutationOptions<DeleteSectionMutation, DeleteSectionMutationVariables>;
export const SubmissionDocument = gql`
    query submission($id: ObjectId!) {
  submission(id: $id) {
    id
    name
    abstract
    keywords
    conference {
      id
    }
    section {
      id
      name
    }
    authors {
      name
      email
    }
    file {
      id
      clientSideUrl
    }
    updatedAt
    translations {
      language
      name
      abstract
      keywords
    }
  }
}
    `;

/**
 * __useSubmissionQuery__
 *
 * To run a query within a React component, call `useSubmissionQuery` and pass it any options that fit your needs.
 * When your component renders, `useSubmissionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubmissionQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSubmissionQuery(baseOptions: Apollo.QueryHookOptions<SubmissionQuery, SubmissionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SubmissionQuery, SubmissionQueryVariables>(SubmissionDocument, options);
      }
export function useSubmissionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SubmissionQuery, SubmissionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SubmissionQuery, SubmissionQueryVariables>(SubmissionDocument, options);
        }
export type SubmissionQueryHookResult = ReturnType<typeof useSubmissionQuery>;
export type SubmissionLazyQueryHookResult = ReturnType<typeof useSubmissionLazyQuery>;
export type SubmissionQueryResult = Apollo.QueryResult<SubmissionQuery, SubmissionQueryVariables>;
export const AddSubmissionDocument = gql`
    mutation addSubmission($data: SubmissionInput!) {
  addSubmission(data: $data) {
    id
    name
    abstract
    keywords
    section {
      id
      name
    }
    authors {
      name
      email
    }
    updatedAt
    translations {
      language
      name
      abstract
      keywords
    }
  }
}
    `;
export type AddSubmissionMutationFn = Apollo.MutationFunction<AddSubmissionMutation, AddSubmissionMutationVariables>;

/**
 * __useAddSubmissionMutation__
 *
 * To run a mutation, you first call `useAddSubmissionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddSubmissionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addSubmissionMutation, { data, loading, error }] = useAddSubmissionMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useAddSubmissionMutation(baseOptions?: Apollo.MutationHookOptions<AddSubmissionMutation, AddSubmissionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddSubmissionMutation, AddSubmissionMutationVariables>(AddSubmissionDocument, options);
      }
export type AddSubmissionMutationHookResult = ReturnType<typeof useAddSubmissionMutation>;
export type AddSubmissionMutationResult = Apollo.MutationResult<AddSubmissionMutation>;
export type AddSubmissionMutationOptions = Apollo.BaseMutationOptions<AddSubmissionMutation, AddSubmissionMutationVariables>;
export const UpdateSubmissionDocument = gql`
    mutation updateSubmission($id: ObjectId!, $data: SubmissionInput!) {
  updateSubmission(id: $id, data: $data) {
    id
    name
    abstract
    keywords
    section {
      id
      name
    }
    authors {
      name
      email
    }
    updatedAt
    translations {
      language
      name
      abstract
      keywords
    }
  }
}
    `;
export type UpdateSubmissionMutationFn = Apollo.MutationFunction<UpdateSubmissionMutation, UpdateSubmissionMutationVariables>;

/**
 * __useUpdateSubmissionMutation__
 *
 * To run a mutation, you first call `useUpdateSubmissionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSubmissionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSubmissionMutation, { data, loading, error }] = useUpdateSubmissionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateSubmissionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSubmissionMutation, UpdateSubmissionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSubmissionMutation, UpdateSubmissionMutationVariables>(UpdateSubmissionDocument, options);
      }
export type UpdateSubmissionMutationHookResult = ReturnType<typeof useUpdateSubmissionMutation>;
export type UpdateSubmissionMutationResult = Apollo.MutationResult<UpdateSubmissionMutation>;
export type UpdateSubmissionMutationOptions = Apollo.BaseMutationOptions<UpdateSubmissionMutation, UpdateSubmissionMutationVariables>;
export const DeleteSubmissionDocument = gql`
    mutation deleteSubmission($id: ObjectId!) {
  deleteSubmission(id: $id) {
    id
    file {
      id
    }
  }
}
    `;
export type DeleteSubmissionMutationFn = Apollo.MutationFunction<DeleteSubmissionMutation, DeleteSubmissionMutationVariables>;

/**
 * __useDeleteSubmissionMutation__
 *
 * To run a mutation, you first call `useDeleteSubmissionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSubmissionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSubmissionMutation, { data, loading, error }] = useDeleteSubmissionMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteSubmissionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteSubmissionMutation, DeleteSubmissionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteSubmissionMutation, DeleteSubmissionMutationVariables>(DeleteSubmissionDocument, options);
      }
export type DeleteSubmissionMutationHookResult = ReturnType<typeof useDeleteSubmissionMutation>;
export type DeleteSubmissionMutationResult = Apollo.MutationResult<DeleteSubmissionMutation>;
export type DeleteSubmissionMutationOptions = Apollo.BaseMutationOptions<DeleteSubmissionMutation, DeleteSubmissionMutationVariables>;
export const AddSubmissionFileDocument = gql`
    mutation addSubmissionFile($id: ObjectId!, $file: FileInput!) {
  addSubmissionFile(id: $id, file: $file) {
    id
    file {
      id
      clientSideUrl
    }
  }
}
    `;
export type AddSubmissionFileMutationFn = Apollo.MutationFunction<AddSubmissionFileMutation, AddSubmissionFileMutationVariables>;

/**
 * __useAddSubmissionFileMutation__
 *
 * To run a mutation, you first call `useAddSubmissionFileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddSubmissionFileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addSubmissionFileMutation, { data, loading, error }] = useAddSubmissionFileMutation({
 *   variables: {
 *      id: // value for 'id'
 *      file: // value for 'file'
 *   },
 * });
 */
export function useAddSubmissionFileMutation(baseOptions?: Apollo.MutationHookOptions<AddSubmissionFileMutation, AddSubmissionFileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddSubmissionFileMutation, AddSubmissionFileMutationVariables>(AddSubmissionFileDocument, options);
      }
export type AddSubmissionFileMutationHookResult = ReturnType<typeof useAddSubmissionFileMutation>;
export type AddSubmissionFileMutationResult = Apollo.MutationResult<AddSubmissionFileMutation>;
export type AddSubmissionFileMutationOptions = Apollo.BaseMutationOptions<AddSubmissionFileMutation, AddSubmissionFileMutationVariables>;
export const DeleteSubmissionFileDocument = gql`
    mutation deleteSubmissionFile($id: ObjectId!, $file: FileInput!) {
  deleteSubmissionFile(id: $id, file: $file) {
    id
    file {
      id
    }
  }
}
    `;
export type DeleteSubmissionFileMutationFn = Apollo.MutationFunction<DeleteSubmissionFileMutation, DeleteSubmissionFileMutationVariables>;

/**
 * __useDeleteSubmissionFileMutation__
 *
 * To run a mutation, you first call `useDeleteSubmissionFileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSubmissionFileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSubmissionFileMutation, { data, loading, error }] = useDeleteSubmissionFileMutation({
 *   variables: {
 *      id: // value for 'id'
 *      file: // value for 'file'
 *   },
 * });
 */
export function useDeleteSubmissionFileMutation(baseOptions?: Apollo.MutationHookOptions<DeleteSubmissionFileMutation, DeleteSubmissionFileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteSubmissionFileMutation, DeleteSubmissionFileMutationVariables>(DeleteSubmissionFileDocument, options);
      }
export type DeleteSubmissionFileMutationHookResult = ReturnType<typeof useDeleteSubmissionFileMutation>;
export type DeleteSubmissionFileMutationResult = Apollo.MutationResult<DeleteSubmissionFileMutation>;
export type DeleteSubmissionFileMutationOptions = Apollo.BaseMutationOptions<DeleteSubmissionFileMutation, DeleteSubmissionFileMutationVariables>;
export const UpdateUserDocument = gql`
    mutation updateUser($id: ObjectId!, $data: UserInput!) {
  updateUser(id: $id, data: $data) {
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
    ${UserFragmentDoc}`;
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
export const DeleteUserDocument = gql`
    mutation deleteUser($id: ObjectId!) {
  deleteUser(id: $id)
}
    `;
export type DeleteUserMutationFn = Apollo.MutationFunction<DeleteUserMutation, DeleteUserMutationVariables>;

/**
 * __useDeleteUserMutation__
 *
 * To run a mutation, you first call `useDeleteUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserMutation, { data, loading, error }] = useDeleteUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteUserMutation(baseOptions?: Apollo.MutationHookOptions<DeleteUserMutation, DeleteUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteUserMutation, DeleteUserMutationVariables>(DeleteUserDocument, options);
      }
export type DeleteUserMutationHookResult = ReturnType<typeof useDeleteUserMutation>;
export type DeleteUserMutationResult = Apollo.MutationResult<DeleteUserMutation>;
export type DeleteUserMutationOptions = Apollo.BaseMutationOptions<DeleteUserMutation, DeleteUserMutationVariables>;
export const UserTextSearchDocument = gql`
    query userTextSearch($text: String!) {
  userTextSearch(text: $text) {
    id
    name
    email
  }
}
    `;

/**
 * __useUserTextSearchQuery__
 *
 * To run a query within a React component, call `useUserTextSearchQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserTextSearchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserTextSearchQuery({
 *   variables: {
 *      text: // value for 'text'
 *   },
 * });
 */
export function useUserTextSearchQuery(baseOptions: Apollo.QueryHookOptions<UserTextSearchQuery, UserTextSearchQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UserTextSearchQuery, UserTextSearchQueryVariables>(UserTextSearchDocument, options);
      }
export function useUserTextSearchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UserTextSearchQuery, UserTextSearchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UserTextSearchQuery, UserTextSearchQueryVariables>(UserTextSearchDocument, options);
        }
export type UserTextSearchQueryHookResult = ReturnType<typeof useUserTextSearchQuery>;
export type UserTextSearchLazyQueryHookResult = ReturnType<typeof useUserTextSearchLazyQuery>;
export type UserTextSearchQueryResult = Apollo.QueryResult<UserTextSearchQuery, UserTextSearchQueryVariables>;
export const UsersDocument = gql`
    query users($after: ObjectId, $first: Int = 20) {
  users(after: $after, first: $first) {
    edges {
      cursor
      node {
        ...User
        organisation
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    ${UserFragmentDoc}`;

/**
 * __useUsersQuery__
 *
 * To run a query within a React component, call `useUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUsersQuery({
 *   variables: {
 *      after: // value for 'after'
 *      first: // value for 'first'
 *   },
 * });
 */
export function useUsersQuery(baseOptions?: Apollo.QueryHookOptions<UsersQuery, UsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UsersQuery, UsersQueryVariables>(UsersDocument, options);
      }
export function useUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UsersQuery, UsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UsersQuery, UsersQueryVariables>(UsersDocument, options);
        }
export type UsersQueryHookResult = ReturnType<typeof useUsersQuery>;
export type UsersLazyQueryHookResult = ReturnType<typeof useUsersLazyQuery>;
export type UsersQueryResult = Apollo.QueryResult<UsersQuery, UsersQueryVariables>;
export const UserDocument = gql`
    query user($id: ObjectId!, $year: DateTime) {
  user(id: $id) {
    ...User
    organisation
    telephone
    grants(year: $year) {
      ...GrantInfo
    }
  }
}
    ${UserFragmentDoc}
${GrantInfoFragmentDoc}`;

/**
 * __useUserQuery__
 *
 * To run a query within a React component, call `useUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserQuery({
 *   variables: {
 *      id: // value for 'id'
 *      year: // value for 'year'
 *   },
 * });
 */
export function useUserQuery(baseOptions: Apollo.QueryHookOptions<UserQuery, UserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UserQuery, UserQueryVariables>(UserDocument, options);
      }
export function useUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UserQuery, UserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UserQuery, UserQueryVariables>(UserDocument, options);
        }
export type UserQueryHookResult = ReturnType<typeof useUserQuery>;
export type UserLazyQueryHookResult = ReturnType<typeof useUserLazyQuery>;
export type UserQueryResult = Apollo.QueryResult<UserQuery, UserQueryVariables>;