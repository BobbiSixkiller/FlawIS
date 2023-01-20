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
  createAnnouncement: Announcement;
  createConference: Conference;
  createGrant: Grant;
  createSection: Section;
  deleteAnnouncement: Scalars['Boolean'];
  deleteBudget: Grant;
  deleteConference: Scalars['Boolean'];
  deleteFile: Scalars['Boolean'];
  deleteGrant: Scalars['Boolean'];
  deleteMember: Grant;
  deleteSection: Scalars['Boolean'];
  deleteSubmission: Scalars['Boolean'];
  deleteUser: Scalars['Boolean'];
  login: User;
  logout: Scalars['Boolean'];
  passwordReset: User;
  register: User;
  removeAttendee: Scalars['Boolean'];
  resendActivationLink: Scalars['Boolean'];
  updateAnnouncement: Announcement;
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
  url: Scalars['String'];
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
  conference: Conference;
  conferences: Array<Conference>;
  forgotPassword: Scalars['String'];
  grant: Grant;
  grantTextSearch: Array<Grant>;
  grants: GrantConnection;
  me: User;
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


export type QueryGrantTextSearchArgs = {
  text: Scalars['String'];
};


export type QueryGrantsArgs = {
  after?: InputMaybe<Scalars['ObjectId']>;
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


export type QueryUserTextSearchArgs = {
  domain?: InputMaybe<Scalars['String']>;
  text: Scalars['String'];
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

export type AnnouncementFragment = { __typename?: 'Announcement', id: string, name: string, text: string, files?: Array<string> | null, createdAt: any, updatedAt: any };

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


export type DeleteAnnouncementMutation = { __typename?: 'Mutation', deleteAnnouncement: boolean };

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

export type ResendActivationLinkMutationVariables = Exact<{ [key: string]: never; }>;


export type ResendActivationLinkMutation = { __typename?: 'Mutation', resendActivationLink: boolean };

export type ActivateUserMutationVariables = Exact<{
  token: Scalars['String'];
}>;


export type ActivateUserMutation = { __typename?: 'Mutation', activateUser: boolean };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type UpdateConferenceUserMutationVariables = Exact<{
  data: ConferenceUserInput;
}>;


export type UpdateConferenceUserMutation = { __typename?: 'Mutation', updateConferenceUser: { __typename?: 'User', id: string, name: string, email: string, organisation: string, telephone: string, role: Role, verified: boolean, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, IBAN?: string | null, SWIFT?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } };

export type UploadFileMutationVariables = Exact<{
  type: FileType;
  file: Scalars['Upload'];
}>;


export type UploadFileMutation = { __typename?: 'Mutation', uploadFile: string };

export type DeleteFileMutationVariables = Exact<{
  url: Scalars['String'];
}>;


export type DeleteFileMutation = { __typename?: 'Mutation', deleteFile: boolean };

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


export type AddApprovedBudgetMutation = { __typename?: 'Mutation', addApprovedBudget: { __typename?: 'Grant', id: string, name: string, type: GrantType, start: any, end: any, createdAt: any, updatedAt: any, announcements: Array<{ __typename?: 'Announcement', id: string, name: string, text: string, files?: Array<string> | null } | null>, budgets: Array<{ __typename?: 'Budget', year: any, createdAt: any, updatedAt: any, approved: { __typename?: 'Approved', material: number, services: number, travel: number, indirect: number, salaries: number }, spent?: { __typename?: 'Spent', material: number, services: number, travel: number, indirect: number, salaries: number } | null, members: Array<{ __typename?: 'Member', hours: number, isMain: boolean, createdAt: any, updatedAt: any, user: { __typename?: 'User', id: string, name: string, email: string } } | null> } | null> } };

export type AddSpentBudgetMutationVariables = Exact<{
  id: Scalars['ObjectId'];
  data: BudgetInput;
}>;


export type AddSpentBudgetMutation = { __typename?: 'Mutation', addSpentBudget: { __typename?: 'Grant', id: string, name: string, type: GrantType, start: any, end: any, createdAt: any, updatedAt: any, announcements: Array<{ __typename?: 'Announcement', id: string, name: string, text: string, files?: Array<string> | null } | null>, budgets: Array<{ __typename?: 'Budget', year: any, createdAt: any, updatedAt: any, approved: { __typename?: 'Approved', material: number, services: number, travel: number, indirect: number, salaries: number }, spent?: { __typename?: 'Spent', material: number, services: number, travel: number, indirect: number, salaries: number } | null, members: Array<{ __typename?: 'Member', hours: number, isMain: boolean, createdAt: any, updatedAt: any, user: { __typename?: 'User', id: string, name: string, email: string } } | null> } | null> } };

export type AddMemberMutationVariables = Exact<{
  id: Scalars['ObjectId'];
  year: Scalars['DateTime'];
  data: MemberInput;
}>;


export type AddMemberMutation = { __typename?: 'Mutation', addMember: { __typename?: 'Grant', id: string, name: string, type: GrantType, start: any, end: any, createdAt: any, updatedAt: any, announcements: Array<{ __typename?: 'Announcement', id: string, name: string, text: string, files?: Array<string> | null } | null>, budgets: Array<{ __typename?: 'Budget', year: any, createdAt: any, updatedAt: any, approved: { __typename?: 'Approved', material: number, services: number, travel: number, indirect: number, salaries: number }, spent?: { __typename?: 'Spent', material: number, services: number, travel: number, indirect: number, salaries: number } | null, members: Array<{ __typename?: 'Member', hours: number, isMain: boolean, createdAt: any, updatedAt: any, user: { __typename?: 'User', id: string, name: string, email: string } } | null> } | null> } };

export type DeleteMemberMutationVariables = Exact<{
  id: Scalars['ObjectId'];
  year: Scalars['DateTime'];
  user: Scalars['ObjectId'];
}>;


export type DeleteMemberMutation = { __typename?: 'Mutation', deleteMember: { __typename?: 'Grant', id: string, name: string, type: GrantType, start: any, end: any, createdAt: any, updatedAt: any, announcements: Array<{ __typename?: 'Announcement', id: string, name: string, text: string, files?: Array<string> | null } | null>, budgets: Array<{ __typename?: 'Budget', year: any, createdAt: any, updatedAt: any, approved: { __typename?: 'Approved', material: number, services: number, travel: number, indirect: number, salaries: number }, spent?: { __typename?: 'Spent', material: number, services: number, travel: number, indirect: number, salaries: number } | null, members: Array<{ __typename?: 'Member', hours: number, isMain: boolean, createdAt: any, updatedAt: any, user: { __typename?: 'User', id: string, name: string, email: string } } | null> } | null> } };

export type DeleteBudgetMutationVariables = Exact<{
  id: Scalars['ObjectId'];
  year: Scalars['DateTime'];
}>;


export type DeleteBudgetMutation = { __typename?: 'Mutation', deleteBudget: { __typename?: 'Grant', id: string, name: string, type: GrantType, start: any, end: any, createdAt: any, updatedAt: any, announcements: Array<{ __typename?: 'Announcement', id: string, name: string, text: string, files?: Array<string> | null } | null>, budgets: Array<{ __typename?: 'Budget', year: any, createdAt: any, updatedAt: any, approved: { __typename?: 'Approved', material: number, services: number, travel: number, indirect: number, salaries: number }, spent?: { __typename?: 'Spent', material: number, services: number, travel: number, indirect: number, salaries: number } | null, members: Array<{ __typename?: 'Member', hours: number, isMain: boolean, createdAt: any, updatedAt: any, user: { __typename?: 'User', id: string, name: string, email: string } } | null> } | null> } };

export type GrantsQueryVariables = Exact<{
  after?: InputMaybe<Scalars['ObjectId']>;
  first?: InputMaybe<Scalars['Int']>;
}>;


export type GrantsQuery = { __typename?: 'Query', grants: { __typename?: 'GrantConnection', edges: Array<{ __typename?: 'GrantEdge', cursor: any, node: { __typename?: 'Grant', id: string, name: string, type: GrantType, start: any, end: any } } | null>, pageInfo: { __typename?: 'GrantPageInfo', endCursor: any, hasNextPage: boolean } } };

export type GrantQueryVariables = Exact<{
  id: Scalars['ObjectId'];
}>;


export type GrantQuery = { __typename?: 'Query', grant: { __typename?: 'Grant', id: string, name: string, type: GrantType, start: any, end: any, createdAt: any, updatedAt: any, announcements: Array<{ __typename?: 'Announcement', id: string, name: string, text: string, files?: Array<string> | null } | null>, budgets: Array<{ __typename?: 'Budget', year: any, createdAt: any, updatedAt: any, approved: { __typename?: 'Approved', material: number, services: number, travel: number, indirect: number, salaries: number }, spent?: { __typename?: 'Spent', material: number, services: number, travel: number, indirect: number, salaries: number } | null, members: Array<{ __typename?: 'Member', hours: number, isMain: boolean, createdAt: any, updatedAt: any, user: { __typename?: 'User', id: string, name: string, email: string } } | null> } | null> } };

export type GrantTextSearchQueryVariables = Exact<{
  text: Scalars['String'];
}>;


export type GrantTextSearchQuery = { __typename?: 'Query', grantTextSearch: Array<{ __typename?: 'Grant', id: string, name: string, type: GrantType }> };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ObjectId'];
  data: UserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'User', id: string, name: string, email: string, role: Role, verified: boolean, organisation: string, telephone: string, billings: Array<{ __typename?: 'Billing', name: string, ICO: string, DIC: string, ICDPH: string, IBAN?: string | null, SWIFT?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } };

export type UserTextSearchQueryVariables = Exact<{
  text: Scalars['String'];
}>;


export type UserTextSearchQuery = { __typename?: 'Query', userTextSearch: Array<{ __typename?: 'User', id: string, name: string }> };

export const AnnouncementFragmentDoc = gql`
    fragment Announcement on Announcement {
  id
  name
  text
  files
  createdAt
  updatedAt
}
    `;
export const AnnouncementsDocument = gql`
    query announcements($after: ObjectId, $first: Int = 20) {
  announcements(after: $after, first: $first) {
    edges {
      cursor
      node {
        ...Announcement
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
    ${AnnouncementFragmentDoc}`;

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
    ...Announcement
  }
}
    ${AnnouncementFragmentDoc}`;

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
    ...Announcement
  }
}
    ${AnnouncementFragmentDoc}`;
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
    ...Announcement
  }
}
    ${AnnouncementFragmentDoc}`;
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
  deleteAnnouncement(id: $id)
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
export const UploadFileDocument = gql`
    mutation uploadFile($type: FileType!, $file: Upload!) {
  uploadFile(type: $type, file: $file)
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
    mutation deleteFile($url: String!) {
  deleteFile(url: $url)
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
 *      url: // value for 'url'
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
    id
    name
    type
    start
    end
    createdAt
    updatedAt
  }
}
    `;
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
    id
    name
    type
    start
    end
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
    createdAt
    updatedAt
  }
}
    `;
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
    id
    name
    type
    start
    end
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
    createdAt
    updatedAt
  }
}
    `;
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
    id
    name
    type
    start
    end
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
    createdAt
    updatedAt
  }
}
    `;
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
    id
    name
    type
    start
    end
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
    createdAt
    updatedAt
  }
}
    `;
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
    id
    name
    type
    start
    end
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
    createdAt
    updatedAt
  }
}
    `;
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
    id
    name
    type
    start
    end
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
    createdAt
    updatedAt
  }
}
    `;

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
export const UserTextSearchDocument = gql`
    query userTextSearch($text: String!) {
  userTextSearch(text: $text) {
    id
    name
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