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

export type AcademicYear = {
  __typename?: 'AcademicYear';
  academicYear: Scalars['String']['output'];
  count: Scalars['Int']['output'];
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
  user: UserStubUnion;
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
  cursor: Scalars['String']['output'];
  node: Attendee;
};

export type AttendeeFilterInput = {
  conferenceSlug: Scalars['String']['input'];
  passive?: InputMaybe<Scalars['Boolean']['input']>;
  sectionIds?: Array<InputMaybe<Scalars['ObjectId']['input']>>;
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
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type AttendeeSortInput = {
  direction: SortDirection;
  field: AttendeeSortableField;
};

/** Sortable enum definition for attendees query */
export enum AttendeeSortableField {
  Id = 'ID',
  Name = 'NAME'
}

/** Billing information */
export type Billing = {
  __typename?: 'Billing';
  DIC?: Maybe<Scalars['String']['output']>;
  ICDPH?: Maybe<Scalars['String']['output']>;
  ICO?: Maybe<Scalars['String']['output']>;
  address: Address;
  name: Scalars['String']['output'];
};

/** Course category */
export type Category = {
  __typename?: 'Category';
  id: Scalars['ObjectId']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

/** Conference model type */
export type Conference = {
  __typename?: 'Conference';
  attendeesCount: Scalars['Int']['output'];
  attending?: Maybe<Attendee>;
  billing: FlawBilling;
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
  totalCount: Scalars['Int']['output'];
};

export type ConferenceEdge = {
  __typename?: 'ConferenceEdge';
  cursor: Scalars['String']['output'];
  node: Conference;
};

/** Conference input type */
export type ConferenceInput = {
  billing: FlawBillingInput;
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
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type ConferenceSortInput = {
  direction: SortDirection;
  field: ConferenceSortableField;
};

/** Sortable enum definition for conferences query */
export enum ConferenceSortableField {
  Id = 'ID'
}

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
  /** Logourl transformed with regards to staging/production env */
  logoUrlEnv: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type Course = {
  __typename?: 'Course';
  billing?: Maybe<FlawBilling>;
  categories: Array<Category>;
  createdAt: Scalars['DateTimeISO']['output'];
  /** String representation of HTML describing the course */
  description: Scalars['String']['output'];
  id: Scalars['ObjectId']['output'];
  isPaid: Scalars['Boolean']['output'];
  maxAttendees: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  price: Scalars['Int']['output'];
  procurer?: Maybe<UserStub>;
  updatedAt: Scalars['DateTimeISO']['output'];
};

export type CourseConnection = {
  __typename?: 'CourseConnection';
  edges: Array<Maybe<CourseEdge>>;
  pageInfo: CoursePageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CourseEdge = {
  __typename?: 'CourseEdge';
  cursor: Scalars['String']['output'];
  node: Course;
};

export type CourseFilterInput = {
  categoryIds?: Array<InputMaybe<Scalars['ObjectId']['input']>>;
};

export type CourseInput = {
  billing?: InputMaybe<FlawBillingInput>;
  categoryIds: Array<Scalars['ObjectId']['input']>;
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
  price: Scalars['Int']['input'];
};

export type CourseMutationResponse = IMutationResponse & {
  __typename?: 'CourseMutationResponse';
  data: Course;
  message: Scalars['String']['output'];
};

export type CoursePageInfo = {
  __typename?: 'CoursePageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type CourseSortInput = {
  direction: SortDirection;
  field: CourseSortableField;
};

/** Sortable enum definition for courses query */
export enum CourseSortableField {
  Id = 'ID',
  Name = 'NAME'
}

export type DatesInput = {
  end: Scalars['DateTimeISO']['input'];
  regEnd?: InputMaybe<Scalars['DateTimeISO']['input']>;
  start: Scalars['DateTimeISO']['input'];
  submissionDeadline?: InputMaybe<Scalars['DateTimeISO']['input']>;
};

/** Flaw billing information */
export type FlawBilling = {
  __typename?: 'FlawBilling';
  DIC: Scalars['String']['output'];
  IBAN: Scalars['String']['output'];
  ICDPH: Scalars['String']['output'];
  ICO: Scalars['String']['output'];
  SWIFT: Scalars['String']['output'];
  address: Address;
  name: Scalars['String']['output'];
  variableSymbol: Scalars['String']['output'];
};

export type FlawBillingInput = {
  DIC: Scalars['String']['input'];
  IBAN: Scalars['String']['input'];
  ICDPH: Scalars['String']['input'];
  ICO: Scalars['String']['input'];
  SWIFT: Scalars['String']['input'];
  address: AddressInput;
  name: Scalars['String']['input'];
  variableSymbol: Scalars['String']['input'];
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

/** Ovject type representing student who applies for an internship */
export type Intern = {
  __typename?: 'Intern';
  createdAt: Scalars['DateTimeISO']['output'];
  fileUrls: Array<Scalars['String']['output']>;
  id: Scalars['ObjectId']['output'];
  internship: Scalars['ObjectId']['output'];
  organization: Scalars['String']['output'];
  organizationFeedbackUrl?: Maybe<Scalars['String']['output']>;
  status: Status;
  updatedAt: Scalars['DateTimeISO']['output'];
  user: StudentReference;
};

/** InternConnection type enabling cursor based pagination */
export type InternConnection = {
  __typename?: 'InternConnection';
  edges: Array<Maybe<InternEdge>>;
  pageInfo: InternPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type InternEdge = {
  __typename?: 'InternEdge';
  cursor: Scalars['String']['output'];
  node: Intern;
};

export type InternFilterInput = {
  endDate?: InputMaybe<Scalars['DateTimeISO']['input']>;
  internship?: InputMaybe<Scalars['ObjectId']['input']>;
  startDate?: InputMaybe<Scalars['DateTimeISO']['input']>;
  status?: InputMaybe<Array<Status>>;
  user?: InputMaybe<Scalars['ObjectId']['input']>;
};

export type InternMutationResponse = IMutationResponse & {
  __typename?: 'InternMutationResponse';
  data: Intern;
  message: Scalars['String']['output'];
};

export type InternPageInfo = {
  __typename?: 'InternPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type InternSortInput = {
  direction: SortDirection;
  field: InternSortableField;
};

/** Sortable enum definition for interns query */
export enum InternSortableField {
  Id = 'ID',
  Name = 'NAME'
}

/** Internship object type */
export type Internship = {
  __typename?: 'Internship';
  academicYear: Scalars['String']['output'];
  applicationsCount: Scalars['Int']['output'];
  createdAt: Scalars['DateTimeISO']['output'];
  /** String representation of internship listing's HTML page */
  description: Scalars['String']['output'];
  id: Scalars['ObjectId']['output'];
  myApplication?: Maybe<Intern>;
  organization: Scalars['String']['output'];
  updatedAt: Scalars['DateTimeISO']['output'];
  user: Scalars['ObjectId']['output'];
};

/** InternshipConnection type enabling cursor based pagination */
export type InternshipConnection = {
  __typename?: 'InternshipConnection';
  academicYears: Array<AcademicYear>;
  edges: Array<Maybe<InternshipEdge>>;
  organizations: Array<OrganizationCount>;
  pageInfo: InternshipPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type InternshipEdge = {
  __typename?: 'InternshipEdge';
  cursor: Scalars['String']['output'];
  node: Internship;
};

export type InternshipFilterInput = {
  academicYear?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTimeISO']['input']>;
  organizations?: InputMaybe<Array<Scalars['String']['input']>>;
  startDate?: InputMaybe<Scalars['DateTimeISO']['input']>;
  user?: InputMaybe<Scalars['ObjectId']['input']>;
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
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type InternshipSortInput = {
  direction: SortDirection;
  field: InternshipSortableField;
};

/** Sortable enum definition for interships query */
export enum InternshipSortableField {
  CreartedAt = 'CREARTED_AT',
  HasApplication = 'HAS_APPLICATION',
  Organization = 'ORGANIZATION'
}

/** Invoice entity subdocument type */
export type Invoice = {
  __typename?: 'Invoice';
  body: InvoiceData;
  issuer: FlawBilling;
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
  issuer: FlawBillingInput;
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
  /** Adds currently logged in user as the co-author of a submission */
  acceptAuthorInvite: SubmissionMutationResponse;
  activateUser: UserMutationResponse;
  addAttendee: ConferenceMutationResponse;
  changeInternStatus: InternMutationResponse;
  createConference: ConferenceMutationResponse;
  createCourse: CourseMutationResponse;
  createIntern: InternMutationResponse;
  createInternship: InternshipMutationResponse;
  createSection: SectionMutationResponse;
  createSubmission: SubmissionMutationResponse;
  createTicket: ConferenceMutationResponse;
  deleteAttendee: AttendeeMutationResponse;
  deleteConference: ConferenceMutationResponse;
  deleteCourse: CourseMutationResponse;
  deleteIntern: InternMutationResponse;
  deleteInternship: InternshipMutationResponse;
  deleteSection: SectionMutationResponse;
  deleteSubmission: SubmissionMutationResponse;
  deleteTicket: ConferenceMutationResponse;
  deleteUser: UserMutationResponse;
  googleSignIn: UserMutationResponse;
  inviteUsers: Scalars['String']['output'];
  login: UserMutationResponse;
  passwordReset: UserMutationResponse;
  register: UserMutationResponse;
  removeAuthor: SubmissionMutationResponse;
  resendActivationLink: Scalars['String']['output'];
  toggleVerifiedUser: UserMutationResponse;
  updateConferenceDates: ConferenceMutationResponse;
  updateCourse: CourseMutationResponse;
  updateInternFiles: InternMutationResponse;
  updateInternship: InternshipMutationResponse;
  updateInvoice: AttendeeMutationResponse;
  updateOrgFeedback: InternMutationResponse;
  updateSection: SectionMutationResponse;
  updateSubmission: SubmissionMutationResponse;
  updateTicket: ConferenceMutationResponse;
  updateUser: UserMutationResponse;
};


export type MutationAddAttendeeArgs = {
  data: AttendeeInput;
};


export type MutationChangeInternStatusArgs = {
  id: Scalars['ObjectId']['input'];
  status: Status;
};


export type MutationCreateConferenceArgs = {
  data: ConferenceInput;
};


export type MutationCreateCourseArgs = {
  data: CourseInput;
};


export type MutationCreateInternArgs = {
  fileUrls: Array<InputMaybe<Scalars['String']['input']>>;
  internshipId: Scalars['ObjectId']['input'];
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


export type MutationDeleteCourseArgs = {
  id: Scalars['ObjectId']['input'];
};


export type MutationDeleteInternArgs = {
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


export type MutationInviteUsersArgs = {
  input: OrganizationEmailsInput;
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
  verified: Scalars['Boolean']['input'];
};


export type MutationUpdateConferenceDatesArgs = {
  data: DatesInput;
  slug: Scalars['String']['input'];
};


export type MutationUpdateCourseArgs = {
  data: CourseInput;
  id: Scalars['ObjectId']['input'];
};


export type MutationUpdateInternFilesArgs = {
  fileUrls: Array<InputMaybe<Scalars['String']['input']>>;
  id: Scalars['ObjectId']['input'];
};


export type MutationUpdateInternshipArgs = {
  id: Scalars['ObjectId']['input'];
  input: InternshipInput;
};


export type MutationUpdateInvoiceArgs = {
  data: InvoiceInput;
  id: Scalars['ObjectId']['input'];
};


export type MutationUpdateOrgFeedbackArgs = {
  fileUrl?: InputMaybe<Scalars['String']['input']>;
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

export type OrganizationCount = {
  __typename?: 'OrganizationCount';
  count: Scalars['Int']['output'];
  organization: Scalars['String']['output'];
};

/** Addresses of the organizations you want to invite to FlawIS/internships */
export type OrganizationEmailsInput = {
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
  course: Course;
  courses: CourseConnection;
  forgotPassword: Scalars['String']['output'];
  intern: Intern;
  interns: InternConnection;
  internsExport: Array<Maybe<Intern>>;
  internship: Internship;
  internships: InternshipConnection;
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
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<AttendeeFilterInput>;
  first?: Scalars['Int']['input'];
  sort: Array<InputMaybe<AttendeeSortInput>>;
};


export type QueryAttendeesCsvExportArgs = {
  slug: Scalars['String']['input'];
};


export type QueryConferenceArgs = {
  slug: Scalars['String']['input'];
};


export type QueryConferencesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: Scalars['Int']['input'];
  sort: Array<InputMaybe<ConferenceSortInput>>;
};


export type QueryCourseArgs = {
  id: Scalars['ObjectId']['input'];
};


export type QueryCoursesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<CourseFilterInput>;
  first?: Scalars['Int']['input'];
  sort: Array<InputMaybe<CourseSortInput>>;
};


export type QueryForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type QueryInternArgs = {
  id: Scalars['ObjectId']['input'];
};


export type QueryInternsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<InternFilterInput>;
  first?: Scalars['Int']['input'];
  sort: Array<InputMaybe<InternSortInput>>;
};


export type QueryInternshipArgs = {
  id: Scalars['ObjectId']['input'];
};


export type QueryInternshipsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<InternshipFilterInput>;
  first?: Scalars['Int']['input'];
  sort: Array<InputMaybe<InternshipSortInput>>;
};


export type QuerySubmissionArgs = {
  id: Scalars['ObjectId']['input'];
};


export type QueryTextSearchAttendeeArgs = {
  slug: Scalars['String']['input'];
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
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<UserFilterInput>;
  first?: Scalars['Int']['input'];
  sort: Array<InputMaybe<UserSortInput>>;
};

/** New user input data */
export type RegisterUserInput = {
  access?: InputMaybe<Array<Access>>;
  address?: InputMaybe<AddressInput>;
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
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
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<SubmissionFilterInput>;
  first?: Scalars['Int']['input'];
  sort: Array<InputMaybe<SubmissionSortInput>>;
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

/** Ascending/descending direction of the sort field */
export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

/** Intern status */
export enum Status {
  Accepted = 'Accepted',
  Applied = 'Applied',
  Eligible = 'Eligible',
  Rejected = 'Rejected'
}

/** User stub type */
export type StudentReference = {
  __typename?: 'StudentReference';
  address: Address;
  avatarUrl?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  /** User document id */
  id: Scalars['ObjectId']['output'];
  name: Scalars['String']['output'];
  studyProgramme: StudyProgramme;
  telephone: Scalars['String']['output'];
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
  cursor: Scalars['String']['output'];
  node: Submission;
};

export type SubmissionFilterInput = {
  conferenceId?: InputMaybe<Scalars['ObjectId']['input']>;
  sectionIds?: InputMaybe<Array<Scalars['ObjectId']['input']>>;
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
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type SubmissionSortInput = {
  direction: SortDirection;
  field: SubmissionSortableField;
};

/** Sortable enum definition for submissions query */
export enum SubmissionSortableField {
  Id = 'ID'
}

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
  address?: Maybe<Address>;
  avatarUrlEnv?: Maybe<Scalars['String']['output']>;
  billings: Array<Maybe<Billing>>;
  createdAt: Scalars['DateTimeISO']['output'];
  cvUrlEnv?: Maybe<Scalars['String']['output']>;
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
  cursor: Scalars['String']['output'];
  node: User;
};

export type UserFilterInput = {
  access?: InputMaybe<Array<Access>>;
};

/** FlawIS user base input */
export type UserInput = {
  access?: InputMaybe<Array<Access>>;
  address?: InputMaybe<AddressInput>;
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
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
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type UserSortInput = {
  direction: SortDirection;
  field: UserSortableField;
};

/** Sortable enum definition for users query */
export enum UserSortableField {
  Id = 'ID',
  Name = 'NAME'
}

export type UserStub = {
  __typename?: 'UserStub';
  email: Scalars['String']['output'];
  id: Scalars['ObjectId']['output'];
  name: Scalars['String']['output'];
};

export type UserStubUnion = User | UserStub;

export type AttendeeFragment = { __typename?: 'Attendee', id: any, createdAt: any, updatedAt: any, user: { __typename: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrlEnv?: string | null, avatarUrlEnv?: string | null, address?: { __typename?: 'Address', street: string, city: string, postal: string, country: string } | null, billings: Array<{ __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } | { __typename: 'UserStub', id: any, name: string, email: string }, invoice: { __typename?: 'Invoice', body: { __typename?: 'InvoiceData', body: string, comment: string, dueDate: any, issueDate: any, price: number, type: string, vat: number, vatDate: any }, issuer: { __typename?: 'FlawBilling', name: string, ICO: string, ICDPH: string, DIC: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, payer: { __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } }, ticket: { __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } }, submissions: Array<{ __typename?: 'Submission', id: any, presentationLng?: PresentationLng | null, fileUrl?: string | null, createdAt: any, updatedAt: any, translations: { __typename?: 'SubmissionTranslation', sk: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> }, en: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, conference: { __typename?: 'Conference', id: any, slug: string }, section: { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } } }>, conference: { __typename?: 'Conference', slug: string, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', logoUrlEnv: string }, en: { __typename?: 'ConferenceTranslations', logoUrlEnv: string } } } };

export type AttendeesQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  filter?: InputMaybe<AttendeeFilterInput>;
  sort: Array<InputMaybe<AttendeeSortInput>> | InputMaybe<AttendeeSortInput>;
}>;


export type AttendeesQuery = { __typename?: 'Query', attendees: { __typename?: 'AttendeeConnection', totalCount: number, edges: Array<{ __typename?: 'AttendeeEdge', cursor: string, node: { __typename?: 'Attendee', id: any, createdAt: any, updatedAt: any, user: { __typename: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrlEnv?: string | null, avatarUrlEnv?: string | null, address?: { __typename?: 'Address', street: string, city: string, postal: string, country: string } | null, billings: Array<{ __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } | { __typename: 'UserStub', id: any, name: string, email: string }, invoice: { __typename?: 'Invoice', body: { __typename?: 'InvoiceData', body: string, comment: string, dueDate: any, issueDate: any, price: number, type: string, vat: number, vatDate: any }, issuer: { __typename?: 'FlawBilling', name: string, ICO: string, ICDPH: string, DIC: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, payer: { __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } }, ticket: { __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } }, submissions: Array<{ __typename?: 'Submission', id: any, presentationLng?: PresentationLng | null, fileUrl?: string | null, createdAt: any, updatedAt: any, translations: { __typename?: 'SubmissionTranslation', sk: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> }, en: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, conference: { __typename?: 'Conference', id: any, slug: string }, section: { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } } }>, conference: { __typename?: 'Conference', slug: string, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', logoUrlEnv: string }, en: { __typename?: 'ConferenceTranslations', logoUrlEnv: string } } } } } | null>, pageInfo: { __typename?: 'AttendeePageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type AttendeeQueryVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type AttendeeQuery = { __typename?: 'Query', attendee: { __typename?: 'Attendee', id: any, createdAt: any, updatedAt: any, user: { __typename: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrlEnv?: string | null, avatarUrlEnv?: string | null, address?: { __typename?: 'Address', street: string, city: string, postal: string, country: string } | null, billings: Array<{ __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } | { __typename: 'UserStub', id: any, name: string, email: string }, invoice: { __typename?: 'Invoice', body: { __typename?: 'InvoiceData', body: string, comment: string, dueDate: any, issueDate: any, price: number, type: string, vat: number, vatDate: any }, issuer: { __typename?: 'FlawBilling', name: string, ICO: string, ICDPH: string, DIC: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, payer: { __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } }, ticket: { __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } }, submissions: Array<{ __typename?: 'Submission', id: any, presentationLng?: PresentationLng | null, fileUrl?: string | null, createdAt: any, updatedAt: any, translations: { __typename?: 'SubmissionTranslation', sk: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> }, en: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, conference: { __typename?: 'Conference', id: any, slug: string }, section: { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } } }>, conference: { __typename?: 'Conference', slug: string, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', logoUrlEnv: string }, en: { __typename?: 'ConferenceTranslations', logoUrlEnv: string } } } } };

export type AttendeesCsvExportQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type AttendeesCsvExportQuery = { __typename?: 'Query', attendeesCsvExport: Array<{ __typename?: 'Attendee', id: any, createdAt: any, updatedAt: any, user: { __typename: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrlEnv?: string | null, avatarUrlEnv?: string | null, address?: { __typename?: 'Address', street: string, city: string, postal: string, country: string } | null, billings: Array<{ __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } | { __typename: 'UserStub', id: any, name: string, email: string }, invoice: { __typename?: 'Invoice', body: { __typename?: 'InvoiceData', body: string, comment: string, dueDate: any, issueDate: any, price: number, type: string, vat: number, vatDate: any }, issuer: { __typename?: 'FlawBilling', name: string, ICO: string, ICDPH: string, DIC: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, payer: { __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } }, ticket: { __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } }, submissions: Array<{ __typename?: 'Submission', id: any, presentationLng?: PresentationLng | null, fileUrl?: string | null, createdAt: any, updatedAt: any, translations: { __typename?: 'SubmissionTranslation', sk: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> }, en: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, conference: { __typename?: 'Conference', id: any, slug: string }, section: { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } } }>, conference: { __typename?: 'Conference', slug: string, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', logoUrlEnv: string }, en: { __typename?: 'ConferenceTranslations', logoUrlEnv: string } } } }> };

export type TextSearchAttendeeQueryVariables = Exact<{
  text: Scalars['String']['input'];
  slug: Scalars['String']['input'];
}>;


export type TextSearchAttendeeQuery = { __typename?: 'Query', textSearchAttendee: Array<{ __typename?: 'Attendee', id: any, user: { __typename?: 'User', id: any, name: string, email: string } | { __typename?: 'UserStub', id: any, name: string, email: string } }> };

export type UpdateInvoiceMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
  data: InvoiceInput;
}>;


export type UpdateInvoiceMutation = { __typename?: 'Mutation', updateInvoice: { __typename?: 'AttendeeMutationResponse', message: string, data: { __typename?: 'Attendee', id: any, createdAt: any, updatedAt: any, user: { __typename: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrlEnv?: string | null, avatarUrlEnv?: string | null, address?: { __typename?: 'Address', street: string, city: string, postal: string, country: string } | null, billings: Array<{ __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } | { __typename: 'UserStub', id: any, name: string, email: string }, invoice: { __typename?: 'Invoice', body: { __typename?: 'InvoiceData', body: string, comment: string, dueDate: any, issueDate: any, price: number, type: string, vat: number, vatDate: any }, issuer: { __typename?: 'FlawBilling', name: string, ICO: string, ICDPH: string, DIC: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, payer: { __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } }, ticket: { __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } }, submissions: Array<{ __typename?: 'Submission', id: any, presentationLng?: PresentationLng | null, fileUrl?: string | null, createdAt: any, updatedAt: any, translations: { __typename?: 'SubmissionTranslation', sk: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> }, en: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, conference: { __typename?: 'Conference', id: any, slug: string }, section: { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } } }>, conference: { __typename?: 'Conference', slug: string, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', logoUrlEnv: string }, en: { __typename?: 'ConferenceTranslations', logoUrlEnv: string } } } } } };

export type DeleteAttendeeMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type DeleteAttendeeMutation = { __typename?: 'Mutation', deleteAttendee: { __typename?: 'AttendeeMutationResponse', message: string, data: { __typename?: 'Attendee', id: any, createdAt: any, updatedAt: any, user: { __typename: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrlEnv?: string | null, avatarUrlEnv?: string | null, address?: { __typename?: 'Address', street: string, city: string, postal: string, country: string } | null, billings: Array<{ __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } | { __typename: 'UserStub', id: any, name: string, email: string }, invoice: { __typename?: 'Invoice', body: { __typename?: 'InvoiceData', body: string, comment: string, dueDate: any, issueDate: any, price: number, type: string, vat: number, vatDate: any }, issuer: { __typename?: 'FlawBilling', name: string, ICO: string, ICDPH: string, DIC: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, payer: { __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } }, ticket: { __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } }, submissions: Array<{ __typename?: 'Submission', id: any, presentationLng?: PresentationLng | null, fileUrl?: string | null, createdAt: any, updatedAt: any, translations: { __typename?: 'SubmissionTranslation', sk: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> }, en: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, conference: { __typename?: 'Conference', id: any, slug: string }, section: { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } } }>, conference: { __typename?: 'Conference', slug: string, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', logoUrlEnv: string }, en: { __typename?: 'ConferenceTranslations', logoUrlEnv: string } } } } } };

export type AddressFragment = { __typename?: 'Address', street: string, city: string, postal: string, country: string };

export type BillingFragment = { __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } };

export type UserFragment = { __typename?: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrlEnv?: string | null, avatarUrlEnv?: string | null, address?: { __typename?: 'Address', street: string, city: string, postal: string, country: string } | null, billings: Array<{ __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrlEnv?: string | null, avatarUrlEnv?: string | null, address?: { __typename?: 'Address', street: string, city: string, postal: string, country: string } | null, billings: Array<{ __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } };

export type LoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'UserMutationResponse', message: string, data: { __typename?: 'User', token: string, id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrlEnv?: string | null, avatarUrlEnv?: string | null, address?: { __typename?: 'Address', street: string, city: string, postal: string, country: string } | null, billings: Array<{ __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } } };

export type GoogleSignInMutationVariables = Exact<{
  authCode: Scalars['String']['input'];
}>;


export type GoogleSignInMutation = { __typename?: 'Mutation', googleSignIn: { __typename?: 'UserMutationResponse', message: string, data: { __typename?: 'User', token: string, id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrlEnv?: string | null, avatarUrlEnv?: string | null, address?: { __typename?: 'Address', street: string, city: string, postal: string, country: string } | null, billings: Array<{ __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } } };

export type ForgotPasswordQueryVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type ForgotPasswordQuery = { __typename?: 'Query', forgotPassword: string };

export type PasswordResetMutationVariables = Exact<{
  data: PasswordInput;
}>;


export type PasswordResetMutation = { __typename?: 'Mutation', passwordReset: { __typename?: 'UserMutationResponse', message: string, data: { __typename?: 'User', token: string, id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrlEnv?: string | null, avatarUrlEnv?: string | null, address?: { __typename?: 'Address', street: string, city: string, postal: string, country: string } | null, billings: Array<{ __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } } };

export type RegisterMutationVariables = Exact<{
  data: RegisterUserInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'UserMutationResponse', message: string, data: { __typename?: 'User', token: string, id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrlEnv?: string | null, avatarUrlEnv?: string | null, address?: { __typename?: 'Address', street: string, city: string, postal: string, country: string } | null, billings: Array<{ __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } } };

export type ResendActivationLinkMutationVariables = Exact<{ [key: string]: never; }>;


export type ResendActivationLinkMutation = { __typename?: 'Mutation', resendActivationLink: string };

export type ActivateUserMutationVariables = Exact<{ [key: string]: never; }>;


export type ActivateUserMutation = { __typename?: 'Mutation', activateUser: { __typename?: 'UserMutationResponse', message: string, data: { __typename?: 'User', token: string, id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrlEnv?: string | null, avatarUrlEnv?: string | null, address?: { __typename?: 'Address', street: string, city: string, postal: string, country: string } | null, billings: Array<{ __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } } };

export type ImpersonateQueryVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type ImpersonateQuery = { __typename?: 'Query', user: { __typename?: 'User', id: any, access: Array<Access>, token: string } };

export type InvoiceFragment = { __typename?: 'Invoice', body: { __typename?: 'InvoiceData', body: string, comment: string, dueDate: any, issueDate: any, price: number, type: string, vat: number, vatDate: any }, issuer: { __typename?: 'FlawBilling', name: string, ICO: string, ICDPH: string, DIC: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, payer: { __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } };

export type SectionFragment = { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } };

export type TicketFragment = { __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } };

export type ConferenceFragment = { __typename?: 'Conference', id: any, slug: string, createdAt: any, updatedAt: any, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', name: string, logoUrlEnv: string }, en: { __typename?: 'ConferenceTranslations', name: string, logoUrlEnv: string } }, dates: { __typename?: 'ImportantDates', start: any, end: any, regEnd?: any | null, submissionDeadline?: any | null } };

export type ConferenceRegistrationFragment = { __typename?: 'Conference', id: any, slug: string, createdAt: any, updatedAt: any, sections: Array<{ __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } }>, tickets: Array<{ __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } }>, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', name: string, logoUrlEnv: string }, en: { __typename?: 'ConferenceTranslations', name: string, logoUrlEnv: string } }, dates: { __typename?: 'ImportantDates', start: any, end: any, regEnd?: any | null, submissionDeadline?: any | null } };

export type ConferencesQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort: Array<InputMaybe<ConferenceSortInput>> | InputMaybe<ConferenceSortInput>;
}>;


export type ConferencesQuery = { __typename?: 'Query', conferences: { __typename?: 'ConferenceConnection', totalCount: number, edges: Array<{ __typename?: 'ConferenceEdge', cursor: string, node: { __typename?: 'Conference', id: any, slug: string, createdAt: any, updatedAt: any, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', name: string, logoUrlEnv: string }, en: { __typename?: 'ConferenceTranslations', name: string, logoUrlEnv: string } }, dates: { __typename?: 'ImportantDates', start: any, end: any, regEnd?: any | null, submissionDeadline?: any | null } } } | null>, pageInfo: { __typename?: 'ConferencePageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type ConferenceQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type ConferenceQuery = { __typename?: 'Query', conference: { __typename?: 'Conference', id: any, slug: string, createdAt: any, updatedAt: any, sections: Array<{ __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } }>, tickets: Array<{ __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } }>, attending?: { __typename?: 'Attendee', id: any, createdAt: any, updatedAt: any, user: { __typename: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrlEnv?: string | null, avatarUrlEnv?: string | null, address?: { __typename?: 'Address', street: string, city: string, postal: string, country: string } | null, billings: Array<{ __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } | { __typename: 'UserStub', id: any, name: string, email: string }, invoice: { __typename?: 'Invoice', body: { __typename?: 'InvoiceData', body: string, comment: string, dueDate: any, issueDate: any, price: number, type: string, vat: number, vatDate: any }, issuer: { __typename?: 'FlawBilling', name: string, ICO: string, ICDPH: string, DIC: string, variableSymbol: string, IBAN: string, SWIFT: string, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } }, payer: { __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } }, ticket: { __typename?: 'Ticket', id: any, online: boolean, price: number, withSubmission: boolean, translations: { __typename?: 'TicketTranslation', en: { __typename?: 'TicketTranslations', name: string, description: string }, sk: { __typename?: 'TicketTranslations', name: string, description: string } } }, submissions: Array<{ __typename?: 'Submission', id: any, presentationLng?: PresentationLng | null, fileUrl?: string | null, createdAt: any, updatedAt: any, translations: { __typename?: 'SubmissionTranslation', sk: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> }, en: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, conference: { __typename?: 'Conference', id: any, slug: string }, section: { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } } }>, conference: { __typename?: 'Conference', slug: string, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', logoUrlEnv: string }, en: { __typename?: 'ConferenceTranslations', logoUrlEnv: string } } } } | null, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', name: string, logoUrlEnv: string }, en: { __typename?: 'ConferenceTranslations', name: string, logoUrlEnv: string } }, dates: { __typename?: 'ImportantDates', start: any, end: any, regEnd?: any | null, submissionDeadline?: any | null } } };

export type SubmissionFilesFragment = { __typename?: 'SubmissionConnection', totalCount: number, edges: Array<{ __typename?: 'SubmissionEdge', cursor: string, node: { __typename?: 'Submission', id: any, fileUrl?: string | null } } | null> };

export type ConferenceSectionsQueryVariables = Exact<{
  slug: Scalars['String']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort: Array<InputMaybe<SubmissionSortInput>> | InputMaybe<SubmissionSortInput>;
}>;


export type ConferenceSectionsQuery = { __typename?: 'Query', conference: { __typename?: 'Conference', id: any, sections: Array<{ __typename?: 'Section', id: string, submissions: { __typename?: 'SubmissionConnection', totalCount: number, edges: Array<{ __typename?: 'SubmissionEdge', cursor: string, node: { __typename?: 'Submission', id: any, fileUrl?: string | null } } | null> }, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } }> } };

export type TextSearchConferenceQueryVariables = Exact<{
  text: Scalars['String']['input'];
}>;


export type TextSearchConferenceQuery = { __typename?: 'Query', textSearchConference: Array<{ __typename?: 'Conference', id: any, slug: string, createdAt: any, updatedAt: any, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', name: string, logoUrlEnv: string }, en: { __typename?: 'ConferenceTranslations', name: string, logoUrlEnv: string } }, dates: { __typename?: 'ImportantDates', start: any, end: any, regEnd?: any | null, submissionDeadline?: any | null } }> };

export type CreateConferenceMutationVariables = Exact<{
  data: ConferenceInput;
}>;


export type CreateConferenceMutation = { __typename?: 'Mutation', createConference: { __typename?: 'ConferenceMutationResponse', message: string } };

export type DeleteConferenceMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type DeleteConferenceMutation = { __typename?: 'Mutation', deleteConference: { __typename?: 'ConferenceMutationResponse', message: string, data: { __typename?: 'Conference', slug: string, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', logoUrlEnv: string }, en: { __typename?: 'ConferenceTranslations', logoUrlEnv: string } } } } };

export type UpdateConferenceDatesMutationVariables = Exact<{
  slug: Scalars['String']['input'];
  data: DatesInput;
}>;


export type UpdateConferenceDatesMutation = { __typename?: 'Mutation', updateConferenceDates: { __typename?: 'ConferenceMutationResponse', message: string, data: { __typename?: 'Conference', slug: string, translations: { __typename?: 'ConferenceTranslation', sk: { __typename?: 'ConferenceTranslations', name: string }, en: { __typename?: 'ConferenceTranslations', name: string } } } } };

export type CreateSectionMutationVariables = Exact<{
  data: SectionInput;
}>;


export type CreateSectionMutation = { __typename?: 'Mutation', createSection: { __typename?: 'SectionMutationResponse', message: string, data: { __typename?: 'Section', conference?: { __typename?: 'Conference', slug: string } | null } } };

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


export type DeleteTicketMutation = { __typename?: 'Mutation', deleteTicket: { __typename?: 'ConferenceMutationResponse', message: string } };

export type AddAttendeeMutationVariables = Exact<{
  data: AttendeeInput;
}>;


export type AddAttendeeMutation = { __typename?: 'Mutation', addAttendee: { __typename?: 'ConferenceMutationResponse', message: string, data: { __typename?: 'Conference', slug: string } } };

export type CourseFragment = { __typename?: 'Course', id: any, name: string, description: string, price: number, isPaid: boolean, createdAt: any, updatedAt: any };

export type CoursesQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort: Array<InputMaybe<CourseSortInput>> | InputMaybe<CourseSortInput>;
}>;


export type CoursesQuery = { __typename?: 'Query', courses: { __typename?: 'CourseConnection', totalCount: number, edges: Array<{ __typename?: 'CourseEdge', cursor: string, node: { __typename?: 'Course', id: any, name: string, description: string, price: number, isPaid: boolean, createdAt: any, updatedAt: any } } | null>, pageInfo: { __typename?: 'CoursePageInfo', hasNextPage: boolean, endCursor?: string | null } } };

export type CreateCourseMutationVariables = Exact<{
  data: CourseInput;
}>;


export type CreateCourseMutation = { __typename?: 'Mutation', createCourse: { __typename?: 'CourseMutationResponse', message: string, data: { __typename?: 'Course', id: any, name: string, description: string, price: number, isPaid: boolean, createdAt: any, updatedAt: any } } };

export type ApplicationFragment = { __typename?: 'Intern', id: any, fileUrls: Array<string>, organizationFeedbackUrl?: string | null, status: Status, createdAt: any, updatedAt: any, user: { __typename?: 'StudentReference', id: any, name: string, email: string, studyProgramme: StudyProgramme, telephone: string, avatarUrl?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } };

export type InternshipsQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  filter?: InputMaybe<InternshipFilterInput>;
  sort: Array<InputMaybe<InternshipSortInput>> | InputMaybe<InternshipSortInput>;
}>;


export type InternshipsQuery = { __typename?: 'Query', internships: { __typename?: 'InternshipConnection', totalCount: number, academicYears: Array<{ __typename?: 'AcademicYear', academicYear: string, count: number }>, organizations: Array<{ __typename?: 'OrganizationCount', organization: string, count: number }>, edges: Array<{ __typename?: 'InternshipEdge', cursor: string, node: { __typename?: 'Internship', id: any, organization: string, description: string, applicationsCount: number, academicYear: string, myApplication?: { __typename?: 'Intern', id: any, fileUrls: Array<string>, organizationFeedbackUrl?: string | null, status: Status, createdAt: any, updatedAt: any, user: { __typename?: 'StudentReference', id: any, name: string, email: string, studyProgramme: StudyProgramme, telephone: string, avatarUrl?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } } | null } } | null>, pageInfo: { __typename?: 'InternshipPageInfo', hasNextPage: boolean, endCursor?: string | null } } };

export type InternshipQueryVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type InternshipQuery = { __typename?: 'Query', internship: { __typename?: 'Internship', id: any, user: any, organization: string, description: string, updatedAt: any, createdAt: any, applicationsCount: number, myApplication?: { __typename?: 'Intern', id: any, fileUrls: Array<string>, organizationFeedbackUrl?: string | null, status: Status, createdAt: any, updatedAt: any, user: { __typename?: 'StudentReference', id: any, name: string, email: string, studyProgramme: StudyProgramme, telephone: string, avatarUrl?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } } | null } };

export type CreateInternshipMutationVariables = Exact<{
  input: InternshipInput;
}>;


export type CreateInternshipMutation = { __typename?: 'Mutation', createInternship: { __typename?: 'InternshipMutationResponse', message: string } };

export type UpdateInternshipMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
  input: InternshipInput;
}>;


export type UpdateInternshipMutation = { __typename?: 'Mutation', updateInternship: { __typename?: 'InternshipMutationResponse', message: string, data: { __typename?: 'Internship', id: any } } };

export type DeleteInternshipMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type DeleteInternshipMutation = { __typename?: 'Mutation', deleteInternship: { __typename?: 'InternshipMutationResponse', message: string, data: { __typename?: 'Internship', id: any } } };

export type InternsExportQueryVariables = Exact<{ [key: string]: never; }>;


export type InternsExportQuery = { __typename?: 'Query', internsExport: Array<{ __typename?: 'Intern', organization: string, status: Status, user: { __typename?: 'StudentReference', email: string, name: string, studyProgramme: StudyProgramme, telephone: string } } | null> };

export type InternsQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  filter?: InputMaybe<InternFilterInput>;
  sort: Array<InputMaybe<InternSortInput>> | InputMaybe<InternSortInput>;
}>;


export type InternsQuery = { __typename?: 'Query', interns: { __typename?: 'InternConnection', totalCount: number, edges: Array<{ __typename?: 'InternEdge', cursor: string, node: { __typename?: 'Intern', id: any, fileUrls: Array<string>, organizationFeedbackUrl?: string | null, status: Status, createdAt: any, updatedAt: any, user: { __typename?: 'StudentReference', id: any, name: string, email: string, studyProgramme: StudyProgramme, telephone: string, avatarUrl?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } } } | null>, pageInfo: { __typename?: 'InternPageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type InternQueryVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type InternQuery = { __typename?: 'Query', intern: { __typename?: 'Intern', id: any, fileUrls: Array<string>, organizationFeedbackUrl?: string | null, status: Status, createdAt: any, updatedAt: any, user: { __typename?: 'StudentReference', id: any, name: string, email: string, studyProgramme: StudyProgramme, telephone: string, avatarUrl?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } } };

export type CreateInternMutationVariables = Exact<{
  fileUrls: Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>;
  internshipId: Scalars['ObjectId']['input'];
}>;


export type CreateInternMutation = { __typename?: 'Mutation', createIntern: { __typename?: 'InternMutationResponse', message: string } };

export type UpdateInternFilesMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
  fileUrls: Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateInternFilesMutation = { __typename?: 'Mutation', updateInternFiles: { __typename?: 'InternMutationResponse', message: string, data: { __typename?: 'Intern', internship: any } } };

export type UpdateOrgFeedbackMutationVariables = Exact<{
  fileUrl?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ObjectId']['input'];
}>;


export type UpdateOrgFeedbackMutation = { __typename?: 'Mutation', updateOrgFeedback: { __typename?: 'InternMutationResponse', message: string, data: { __typename?: 'Intern', internship: any } } };

export type DeleteInternMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type DeleteInternMutation = { __typename?: 'Mutation', deleteIntern: { __typename?: 'InternMutationResponse', message: string, data: { __typename?: 'Intern', internship: any } } };

export type ChangeInternStatusMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
  status: Status;
}>;


export type ChangeInternStatusMutation = { __typename?: 'Mutation', changeInternStatus: { __typename?: 'InternMutationResponse', message: string, data: { __typename?: 'Intern', internship: any } } };

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

export type AcceptAuthorInviteMutationVariables = Exact<{ [key: string]: never; }>;


export type AcceptAuthorInviteMutation = { __typename?: 'Mutation', acceptAuthorInvite: { __typename?: 'SubmissionMutationResponse', message: string, data: { __typename?: 'Submission', id: any, presentationLng?: PresentationLng | null, fileUrl?: string | null, createdAt: any, updatedAt: any, translations: { __typename?: 'SubmissionTranslation', sk: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> }, en: { __typename?: 'SubmissionTranslationContent', name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ __typename?: 'User', id: any, name: string, email: string }>, conference: { __typename?: 'Conference', id: any, slug: string }, section: { __typename?: 'Section', id: string, conference?: { __typename?: 'Conference', id: any, slug: string } | null, translations: { __typename?: 'SectionTranslation', sk: { __typename?: 'SectionTranslations', name: string, topic: string }, en: { __typename?: 'SectionTranslations', name: string, topic: string } } } } } };

export type UsersQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  filter?: InputMaybe<UserFilterInput>;
  sort: Array<InputMaybe<UserSortInput>> | InputMaybe<UserSortInput>;
}>;


export type UsersQuery = { __typename?: 'Query', users: { __typename?: 'UserConnection', totalCount: number, edges: Array<{ __typename?: 'UserEdge', cursor: string, node: { __typename?: 'User', id: any, name: string, email: string, organization?: string | null, verified: boolean, access: Array<Access>, createdAt: any, updatedAt: any } } | null>, pageInfo: { __typename?: 'UserPageInfo', endCursor?: string | null, hasNextPage: boolean } } };

export type UserQueryVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type UserQuery = { __typename?: 'Query', user: { __typename?: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrlEnv?: string | null, avatarUrlEnv?: string | null, address?: { __typename?: 'Address', street: string, city: string, postal: string, country: string } | null, billings: Array<{ __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } };

export type TextSearchUserQueryVariables = Exact<{
  text: Scalars['String']['input'];
}>;


export type TextSearchUserQuery = { __typename?: 'Query', textSearchUser: Array<{ __typename?: 'User', id: any, name: string, email: string }> };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
  data: UserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'UserMutationResponse', message: string, data: { __typename?: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrlEnv?: string | null, avatarUrlEnv?: string | null, address?: { __typename?: 'Address', street: string, city: string, postal: string, country: string } | null, billings: Array<{ __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } } };

export type ToggleVerifiedUserMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
  verified: Scalars['Boolean']['input'];
}>;


export type ToggleVerifiedUserMutation = { __typename?: 'Mutation', toggleVerifiedUser: { __typename?: 'UserMutationResponse', message: string, data: { __typename?: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrlEnv?: string | null, avatarUrlEnv?: string | null, address?: { __typename?: 'Address', street: string, city: string, postal: string, country: string } | null, billings: Array<{ __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } } };

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['ObjectId']['input'];
}>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser: { __typename?: 'UserMutationResponse', message: string, data: { __typename?: 'User', id: any, name: string, email: string, organization?: string | null, telephone?: string | null, access: Array<Access>, verified: boolean, createdAt: any, updatedAt: any, studyProgramme?: StudyProgramme | null, cvUrlEnv?: string | null, avatarUrlEnv?: string | null, address?: { __typename?: 'Address', street: string, city: string, postal: string, country: string } | null, billings: Array<{ __typename?: 'Billing', name: string, ICO?: string | null, ICDPH?: string | null, DIC?: string | null, address: { __typename?: 'Address', street: string, city: string, postal: string, country: string } } | null> } } };

export type InviteUsersMutationVariables = Exact<{
  input: OrganizationEmailsInput;
}>;


export type InviteUsersMutation = { __typename?: 'Mutation', inviteUsers: string };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: DocumentTypeDecoration<TResult, TVariables>['__apiType'];
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
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
  address {
    ...Address
  }
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrlEnv
  avatarUrlEnv
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
    ... on UserStub {
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
        logoUrlEnv
      }
      en {
        logoUrlEnv
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
  address {
    ...Address
  }
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrlEnv
  avatarUrlEnv
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
      logoUrlEnv
    }
    en {
      name
      logoUrlEnv
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
      logoUrlEnv
    }
    en {
      name
      logoUrlEnv
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
export const CourseFragmentDoc = new TypedDocumentString(`
    fragment Course on Course {
  id
  name
  description
  price
  isPaid
  createdAt
  updatedAt
}
    `, {"fragmentName":"Course"}) as unknown as TypedDocumentString<CourseFragment, unknown>;
export const ApplicationFragmentDoc = new TypedDocumentString(`
    fragment Application on Intern {
  id
  user {
    id
    name
    email
    studyProgramme
    telephone
    avatarUrl
    address {
      ...Address
    }
  }
  fileUrls
  organizationFeedbackUrl
  status
  createdAt
  updatedAt
}
    fragment Address on Address {
  street
  city
  postal
  country
}`, {"fragmentName":"Application"}) as unknown as TypedDocumentString<ApplicationFragment, unknown>;
export const AttendeesDocument = new TypedDocumentString(`
    query attendees($after: String, $first: Int, $filter: AttendeeFilterInput, $sort: [AttendeeSortInput]!) {
  attendees(after: $after, first: $first, filter: $filter, sort: $sort) {
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
    ... on UserStub {
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
        logoUrlEnv
      }
      en {
        logoUrlEnv
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
  address {
    ...Address
  }
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrlEnv
  avatarUrlEnv
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
    ... on UserStub {
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
        logoUrlEnv
      }
      en {
        logoUrlEnv
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
  address {
    ...Address
  }
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrlEnv
  avatarUrlEnv
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
    ... on UserStub {
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
        logoUrlEnv
      }
      en {
        logoUrlEnv
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
  address {
    ...Address
  }
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrlEnv
  avatarUrlEnv
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
    query textSearchAttendee($text: String!, $slug: String!) {
  textSearchAttendee(text: $text, slug: $slug) {
    id
    user {
      ... on UserStub {
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
    ... on UserStub {
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
        logoUrlEnv
      }
      en {
        logoUrlEnv
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
  address {
    ...Address
  }
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrlEnv
  avatarUrlEnv
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
    ... on UserStub {
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
        logoUrlEnv
      }
      en {
        logoUrlEnv
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
  address {
    ...Address
  }
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrlEnv
  avatarUrlEnv
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
  address {
    ...Address
  }
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrlEnv
  avatarUrlEnv
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
  address {
    ...Address
  }
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrlEnv
  avatarUrlEnv
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
  address {
    ...Address
  }
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrlEnv
  avatarUrlEnv
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
  address {
    ...Address
  }
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrlEnv
  avatarUrlEnv
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
  address {
    ...Address
  }
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrlEnv
  avatarUrlEnv
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
  address {
    ...Address
  }
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrlEnv
  avatarUrlEnv
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
    query conferences($after: String, $first: Int, $sort: [ConferenceSortInput]!) {
  conferences(after: $after, first: $first, sort: $sort) {
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
      logoUrlEnv
    }
    en {
      name
      logoUrlEnv
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
    ... on UserStub {
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
        logoUrlEnv
      }
      en {
        logoUrlEnv
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
  address {
    ...Address
  }
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrlEnv
  avatarUrlEnv
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
      logoUrlEnv
    }
    en {
      name
      logoUrlEnv
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
    query conferenceSections($slug: String!, $after: String, $first: Int, $sort: [SubmissionSortInput]!) {
  conference(slug: $slug) {
    id
    sections {
      ...Section
      submissions(first: $first, after: $after, sort: $sort) {
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
      logoUrlEnv
    }
    en {
      name
      logoUrlEnv
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
          logoUrlEnv
        }
        en {
          logoUrlEnv
        }
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
    data {
      conference {
        slug
      }
    }
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
  deleteTicket(slug: $slug, ticketId: $ticketId) {
    message
  }
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
export const CoursesDocument = new TypedDocumentString(`
    query courses($after: String, $first: Int, $sort: [CourseSortInput]!) {
  courses(after: $after, first: $first, sort: $sort) {
    totalCount
    edges {
      cursor
      node {
        ...Course
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    fragment Course on Course {
  id
  name
  description
  price
  isPaid
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<CoursesQuery, CoursesQueryVariables>;
export const CreateCourseDocument = new TypedDocumentString(`
    mutation createCourse($data: CourseInput!) {
  createCourse(data: $data) {
    message
    data {
      ...Course
    }
  }
}
    fragment Course on Course {
  id
  name
  description
  price
  isPaid
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<CreateCourseMutation, CreateCourseMutationVariables>;
export const InternshipsDocument = new TypedDocumentString(`
    query internships($after: String, $first: Int, $filter: InternshipFilterInput, $sort: [InternshipSortInput]!) {
  internships(after: $after, first: $first, filter: $filter, sort: $sort) {
    totalCount
    academicYears {
      academicYear
      count
    }
    organizations {
      organization
      count
    }
    edges {
      cursor
      node {
        id
        organization
        description
        applicationsCount
        academicYear
        myApplication {
          ...Application
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    fragment Address on Address {
  street
  city
  postal
  country
}
fragment Application on Intern {
  id
  user {
    id
    name
    email
    studyProgramme
    telephone
    avatarUrl
    address {
      ...Address
    }
  }
  fileUrls
  organizationFeedbackUrl
  status
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<InternshipsQuery, InternshipsQueryVariables>;
export const InternshipDocument = new TypedDocumentString(`
    query internship($id: ObjectId!) {
  internship(id: $id) {
    id
    user
    organization
    description
    updatedAt
    createdAt
    applicationsCount
    myApplication {
      ...Application
    }
  }
}
    fragment Address on Address {
  street
  city
  postal
  country
}
fragment Application on Intern {
  id
  user {
    id
    name
    email
    studyProgramme
    telephone
    avatarUrl
    address {
      ...Address
    }
  }
  fileUrls
  organizationFeedbackUrl
  status
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<InternshipQuery, InternshipQueryVariables>;
export const CreateInternshipDocument = new TypedDocumentString(`
    mutation createInternship($input: InternshipInput!) {
  createInternship(input: $input) {
    message
  }
}
    `) as unknown as TypedDocumentString<CreateInternshipMutation, CreateInternshipMutationVariables>;
export const UpdateInternshipDocument = new TypedDocumentString(`
    mutation updateInternship($id: ObjectId!, $input: InternshipInput!) {
  updateInternship(id: $id, input: $input) {
    message
    data {
      id
    }
  }
}
    `) as unknown as TypedDocumentString<UpdateInternshipMutation, UpdateInternshipMutationVariables>;
export const DeleteInternshipDocument = new TypedDocumentString(`
    mutation deleteInternship($id: ObjectId!) {
  deleteInternship(id: $id) {
    message
    data {
      id
    }
  }
}
    `) as unknown as TypedDocumentString<DeleteInternshipMutation, DeleteInternshipMutationVariables>;
export const InternsExportDocument = new TypedDocumentString(`
    query internsExport {
  internsExport {
    user {
      email
      name
      studyProgramme
      telephone
    }
    organization
    status
  }
}
    `) as unknown as TypedDocumentString<InternsExportQuery, InternsExportQueryVariables>;
export const InternsDocument = new TypedDocumentString(`
    query interns($after: String, $first: Int, $filter: InternFilterInput, $sort: [InternSortInput]!) {
  interns(after: $after, first: $first, filter: $filter, sort: $sort) {
    totalCount
    edges {
      cursor
      node {
        ...Application
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
    fragment Address on Address {
  street
  city
  postal
  country
}
fragment Application on Intern {
  id
  user {
    id
    name
    email
    studyProgramme
    telephone
    avatarUrl
    address {
      ...Address
    }
  }
  fileUrls
  organizationFeedbackUrl
  status
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<InternsQuery, InternsQueryVariables>;
export const InternDocument = new TypedDocumentString(`
    query intern($id: ObjectId!) {
  intern(id: $id) {
    ...Application
  }
}
    fragment Address on Address {
  street
  city
  postal
  country
}
fragment Application on Intern {
  id
  user {
    id
    name
    email
    studyProgramme
    telephone
    avatarUrl
    address {
      ...Address
    }
  }
  fileUrls
  organizationFeedbackUrl
  status
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<InternQuery, InternQueryVariables>;
export const CreateInternDocument = new TypedDocumentString(`
    mutation createIntern($fileUrls: [String]!, $internshipId: ObjectId!) {
  createIntern(fileUrls: $fileUrls, internshipId: $internshipId) {
    message
  }
}
    `) as unknown as TypedDocumentString<CreateInternMutation, CreateInternMutationVariables>;
export const UpdateInternFilesDocument = new TypedDocumentString(`
    mutation updateInternFiles($id: ObjectId!, $fileUrls: [String]!) {
  updateInternFiles(id: $id, fileUrls: $fileUrls) {
    message
    data {
      internship
    }
  }
}
    `) as unknown as TypedDocumentString<UpdateInternFilesMutation, UpdateInternFilesMutationVariables>;
export const UpdateOrgFeedbackDocument = new TypedDocumentString(`
    mutation updateOrgFeedback($fileUrl: String, $id: ObjectId!) {
  updateOrgFeedback(id: $id, fileUrl: $fileUrl) {
    message
    data {
      internship
    }
  }
}
    `) as unknown as TypedDocumentString<UpdateOrgFeedbackMutation, UpdateOrgFeedbackMutationVariables>;
export const DeleteInternDocument = new TypedDocumentString(`
    mutation deleteIntern($id: ObjectId!) {
  deleteIntern(id: $id) {
    message
    data {
      internship
    }
  }
}
    `) as unknown as TypedDocumentString<DeleteInternMutation, DeleteInternMutationVariables>;
export const ChangeInternStatusDocument = new TypedDocumentString(`
    mutation changeInternStatus($id: ObjectId!, $status: Status!) {
  changeInternStatus(id: $id, status: $status) {
    message
    data {
      internship
    }
  }
}
    `) as unknown as TypedDocumentString<ChangeInternStatusMutation, ChangeInternStatusMutationVariables>;
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
export const AcceptAuthorInviteDocument = new TypedDocumentString(`
    mutation acceptAuthorInvite {
  acceptAuthorInvite {
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
}`) as unknown as TypedDocumentString<AcceptAuthorInviteMutation, AcceptAuthorInviteMutationVariables>;
export const UsersDocument = new TypedDocumentString(`
    query users($after: String, $first: Int, $filter: UserFilterInput, $sort: [UserSortInput]!) {
  users(after: $after, first: $first, filter: $filter, sort: $sort) {
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
  address {
    ...Address
  }
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrlEnv
  avatarUrlEnv
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
  address {
    ...Address
  }
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrlEnv
  avatarUrlEnv
}`) as unknown as TypedDocumentString<UpdateUserMutation, UpdateUserMutationVariables>;
export const ToggleVerifiedUserDocument = new TypedDocumentString(`
    mutation toggleVerifiedUser($id: ObjectId!, $verified: Boolean!) {
  toggleVerifiedUser(id: $id, verified: $verified) {
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
  address {
    ...Address
  }
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrlEnv
  avatarUrlEnv
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
  address {
    ...Address
  }
  verified
  createdAt
  updatedAt
  billings {
    ...Billing
  }
  studyProgramme
  cvUrlEnv
  avatarUrlEnv
}`) as unknown as TypedDocumentString<DeleteUserMutation, DeleteUserMutationVariables>;
export const InviteUsersDocument = new TypedDocumentString(`
    mutation inviteUsers($input: OrganizationEmailsInput!) {
  inviteUsers(input: $input)
}
    `) as unknown as TypedDocumentString<InviteUsersMutation, InviteUsersMutationVariables>;