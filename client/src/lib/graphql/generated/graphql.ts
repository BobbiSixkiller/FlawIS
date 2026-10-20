/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
/** User access inside the FLAWIS system */
export enum Access {
  Admin = 'Admin',
  ConferenceAttendee = 'ConferenceAttendee',
  CourseAttendee = 'CourseAttendee',
  Organization = 'Organization',
  Student = 'Student'
}

export type AddressInput = {
  city: string;
  country: string;
  postal: string;
  street: string;
};

export type AttendeeFilterInput = {
  conferenceSlug: string;
  passive?: boolean | null | undefined;
  sectionIds?: Array<string | null | undefined>;
};

/** Conference registration input type */
export type AttendeeInput = {
  billing: BillingInput;
  conferenceId: string;
  initialSubmission?: SubmissionInput | null | undefined;
  ticketId: string;
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

export type BillingInput = {
  DIC?: string | null | undefined;
  IBAN?: string | null | undefined;
  ICDPH?: string | null | undefined;
  ICO?: string | null | undefined;
  SWIFT?: string | null | undefined;
  address: AddressInput;
  name: string;
  variableSymbol?: string | null | undefined;
};

export type CategoryInput = {
  name: string;
};

/** Conference input type */
export type ConferenceInput = {
  billing: BillingInput;
  dates: DatesInput;
  slug: string;
  translations: ConferenceTranslationInput;
};

export type ConferenceSortInput = {
  direction: SortDirection;
  field: ConferenceSortableField;
};

/** Sortable enum definition for conferences query */
export enum ConferenceSortableField {
  Id = 'ID'
}

export type ConferenceTranslationInput = {
  en: LocalizedConferenceInputs;
  sk: LocalizedConferenceInputs;
};

export type CourseAttendeeSortInput = {
  direction: SortDirection;
  field: CourseAttendeeSortableField;
};

/** Sortable enum definition for course attendees query */
export enum CourseAttendeeSortableField {
  Id = 'ID',
  Name = 'NAME'
}

export type CourseFilterInput = {
  categorySlugs?: Array<string | null | undefined>;
};

export type CourseInput = {
  billing?: BillingInput | null | undefined;
  categories: Array<string>;
  description: string;
  end: string | Date;
  /** Property describing dynamic registration form of a given course */
  formFields: Array<FormFieldInput>;
  maxAttendees: number;
  name: string;
  price: number;
  reachCourse?: ReachCourseConfigInput | null | undefined;
  registrationEnd: string | Date;
  start: string | Date;
  thumbnail?: string | null | undefined;
};

export type CourseSessionInput = {
  course: string;
  description?: string | null | undefined;
  end: string | Date;
  name: string;
  start: string | Date;
};

export type CourseSortInput = {
  direction: SortDirection;
  field: CourseSortableField;
};

/** Sortable enum definition for courses query */
export enum CourseSortableField {
  Id = 'ID',
  Name = 'NAME',
  RegistrationEnd = 'REGISTRATION_END'
}

export type DatesInput = {
  end: string | Date;
  regEnd?: string | Date | null | undefined;
  start: string | Date;
  submissionDeadline?: string | Date | null | undefined;
};

/** Current synchronization state of a Reach 360 enrollment. */
export enum ElearningProvisioningStatus {
  Enrolled = 'Enrolled',
  PendingInvitation = 'PendingInvitation',
  Revoked = 'Revoked',
  SyncFailed = 'SyncFailed'
}

/** Supported registration form field types */
export enum FieldType {
  FileUpload = 'FileUpload',
  RadioGroup = 'RadioGroup',
  Select = 'Select',
  Text = 'Text',
  Textarea = 'Textarea'
}

export type FormFieldInput = {
  helpText?: string | null | undefined;
  id?: string | null | undefined;
  label: string;
  maxFiles?: number | null | undefined;
  minFiles?: number | null | undefined;
  placeholder?: string | null | undefined;
  required: boolean;
  selectOptions?: Array<SelectOptionInput> | null | undefined;
  type: FieldType;
};

export type FormSubmissionInput = {
  answers: Record<string, unknown>;
  form: string;
  formVersion: number;
};

export type InternFilterInput = {
  endDate?: string | Date | null | undefined;
  internship?: string | null | undefined;
  startDate?: string | Date | null | undefined;
  status?: Array<Status> | null | undefined;
  user?: string | null | undefined;
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

export type InternshipFilterInput = {
  academicYear?: string | null | undefined;
  endDate?: string | Date | null | undefined;
  organizations?: Array<string> | null | undefined;
  startDate?: string | Date | null | undefined;
  user?: string | null | undefined;
};

export type InternshipInput = {
  description: string;
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

export type InvoiceDataInput = {
  body: string;
  comment: string;
  dueDate: string | Date;
  issueDate: string | Date;
  price: number;
  type: string;
  vat: number;
  vatDate: string | Date;
};

export type InvoiceInput = {
  body: InvoiceDataInput;
  issuer: BillingInput;
  payer: BillingInput;
};

/** The registration type that owns an invoice. */
export enum InvoiceOwnerType {
  ConferenceAttendee = 'CONFERENCE_ATTENDEE',
  CourseAttendee = 'COURSE_ATTENDEE'
}

export type LocalizedConferenceInputs = {
  logoUrl: string;
  name: string;
};

export type LocalizedSectionInputs = {
  name: string;
  topic: string;
};

export type LocalizedSubmissionInputs = {
  abstract: string;
  keywords: Array<string>;
  name: string;
};

export type LocalizedTicketInputs = {
  description: string;
  name: string;
};

/** Addresses of the organizations you want to invite to FlawIS/internships */
export type OrganizationEmailsInput = {
  emails: Array<string>;
};

export type PasswordInput = {
  password: string;
};

/** Language the speaker will be presenting his submission in */
export enum PresentationLng {
  Cz = 'CZ',
  En = 'EN',
  Sk = 'SK'
}

export type ReachCourseConfigInput = {
  courseId: string;
  launchUrl: string;
};

/** New user input data */
export type RegisterUserInput = {
  access?: Array<Access> | null | undefined;
  address?: AddressInput | null | undefined;
  avatarUrl?: string | null | undefined;
  cvUrl?: string | null | undefined;
  email: string;
  name: string;
  organization?: string | null | undefined;
  password: string;
  studyProgramme?: StudyProgramme | null | undefined;
  telephone?: string | null | undefined;
};

/** Section input type */
export type SectionInput = {
  conference: string;
  translations: SectionTranslationInput;
};

export type SectionTranslationInput = {
  en: LocalizedSectionInputs;
  sk: LocalizedSectionInputs;
};

export type SelectOptionInput = {
  text: string;
  value: string;
};

/** Intern during summer or winter or both terms */
export enum Semester {
  Both = 'Both',
  Summer = 'Summer',
  Winter = 'Winter'
}

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

/** Student user account StudyProgramme */
export enum StudyProgramme {
  Bachelor1 = 'Bachelor1',
  Bachelor2 = 'Bachelor2',
  Bachelor3 = 'Bachelor3',
  Master1 = 'Master1',
  Master2 = 'Master2'
}

export type SubmissionInput = {
  authors: Array<string | null | undefined>;
  conference: string;
  fileUrl?: string | null | undefined;
  presentationLng: PresentationLng;
  section: string;
  translations: SubmissionTranslationInput;
};

export type SubmissionSortInput = {
  direction: SortDirection;
  field: SubmissionSortableField;
};

/** Sortable enum definition for submissions query */
export enum SubmissionSortableField {
  Id = 'ID'
}

export type SubmissionTranslationInput = {
  en: LocalizedSubmissionInputs;
  sk: LocalizedSubmissionInputs;
};

export type TicketInput = {
  online: boolean;
  price: number;
  translations: TicketTranslationInput;
  withSubmission: boolean;
};

export type TicketTranslationInput = {
  en: LocalizedTicketInputs;
  sk: LocalizedTicketInputs;
};

export type UserFilterInput = {
  access?: Array<Access> | null | undefined;
};

/** FlawIS user base input */
export type UserInput = {
  access?: Array<Access> | null | undefined;
  address?: AddressInput | null | undefined;
  avatarUrl?: string | null | undefined;
  cvUrl?: string | null | undefined;
  email: string;
  name: string;
  organization?: string | null | undefined;
  password?: string | null | undefined;
  studyProgramme?: StudyProgramme | null | undefined;
  telephone?: string | null | undefined;
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

export type AttendeeFragment = { id: string, hasInvoice: boolean, createdAt: string, updatedAt: string, user:
    | { __typename: 'User', id: string, name: string, email: string, organization: string | null, telephone: string | null, access: Array<Access>, verified: boolean, createdAt: string, updatedAt: string, studyProgramme: StudyProgramme | null, cvUrl: string | null, avatarUrl: string | null, address: { street: string, city: string, postal: string, country: string } | null, billings: Array<{ name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } | null> }
    | { __typename: 'UserStub', id: string, name: string, email: string }
  , invoice: { body: { body: string, comment: string, dueDate: string, issueDate: string, price: number, type: string, vat: number, vatDate: string }, issuer: { name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, variableSymbol: string | null, IBAN: string | null, SWIFT: string | null, address: { street: string, city: string, postal: string, country: string } }, payer: { name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } } | null, ticket: { id: string, online: boolean, price: number, withSubmission: boolean, translations: { en: { name: string, description: string }, sk: { name: string, description: string } } }, submissions: Array<{ id: string, presentationLng: PresentationLng | null, fileUrl: string | null, createdAt: string, updatedAt: string, translations: { sk: { name: string, abstract: string, keywords: Array<string> }, en: { name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ id: string, name: string, email: string }>, conference: { id: string, slug: string }, section: { id: string, conference: { id: string, slug: string } | null, translations: { sk: { name: string, topic: string }, en: { name: string, topic: string } } } }>, conference: { slug: string, translations: { sk: { logoUrl: string }, en: { logoUrl: string } } } };

export type AttendeesQueryVariables = Exact<{
  after?: string | null | undefined;
  first?: number | null | undefined;
  filter?: AttendeeFilterInput | null | undefined;
  sort: Array<AttendeeSortInput | null | undefined> | AttendeeSortInput;
}>;


export type AttendeesQuery = { attendees: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, hasInvoice: boolean, createdAt: string, updatedAt: string, user:
          | { __typename: 'User', id: string, name: string, email: string, organization: string | null, telephone: string | null, access: Array<Access>, verified: boolean, createdAt: string, updatedAt: string, studyProgramme: StudyProgramme | null, cvUrl: string | null, avatarUrl: string | null, address: { street: string, city: string, postal: string, country: string } | null, billings: Array<{ name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } | null> }
          | { __typename: 'UserStub', id: string, name: string, email: string }
        , invoice: { body: { body: string, comment: string, dueDate: string, issueDate: string, price: number, type: string, vat: number, vatDate: string }, issuer: { name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, variableSymbol: string | null, IBAN: string | null, SWIFT: string | null, address: { street: string, city: string, postal: string, country: string } }, payer: { name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } } | null, ticket: { id: string, online: boolean, price: number, withSubmission: boolean, translations: { en: { name: string, description: string }, sk: { name: string, description: string } } }, submissions: Array<{ id: string, presentationLng: PresentationLng | null, fileUrl: string | null, createdAt: string, updatedAt: string, translations: { sk: { name: string, abstract: string, keywords: Array<string> }, en: { name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ id: string, name: string, email: string }>, conference: { id: string, slug: string }, section: { id: string, conference: { id: string, slug: string } | null, translations: { sk: { name: string, topic: string }, en: { name: string, topic: string } } } }>, conference: { slug: string, translations: { sk: { logoUrl: string }, en: { logoUrl: string } } } } } | null>, pageInfo: { endCursor: string | null, hasNextPage: boolean } } };

export type AttendeeQueryVariables = Exact<{
  id: string;
}>;


export type AttendeeQuery = { attendee: { id: string, hasInvoice: boolean, createdAt: string, updatedAt: string, user:
      | { __typename: 'User', id: string, name: string, email: string, organization: string | null, telephone: string | null, access: Array<Access>, verified: boolean, createdAt: string, updatedAt: string, studyProgramme: StudyProgramme | null, cvUrl: string | null, avatarUrl: string | null, address: { street: string, city: string, postal: string, country: string } | null, billings: Array<{ name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } | null> }
      | { __typename: 'UserStub', id: string, name: string, email: string }
    , invoice: { body: { body: string, comment: string, dueDate: string, issueDate: string, price: number, type: string, vat: number, vatDate: string }, issuer: { name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, variableSymbol: string | null, IBAN: string | null, SWIFT: string | null, address: { street: string, city: string, postal: string, country: string } }, payer: { name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } } | null, ticket: { id: string, online: boolean, price: number, withSubmission: boolean, translations: { en: { name: string, description: string }, sk: { name: string, description: string } } }, submissions: Array<{ id: string, presentationLng: PresentationLng | null, fileUrl: string | null, createdAt: string, updatedAt: string, translations: { sk: { name: string, abstract: string, keywords: Array<string> }, en: { name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ id: string, name: string, email: string }>, conference: { id: string, slug: string }, section: { id: string, conference: { id: string, slug: string } | null, translations: { sk: { name: string, topic: string }, en: { name: string, topic: string } } } }>, conference: { slug: string, translations: { sk: { logoUrl: string }, en: { logoUrl: string } } } } };

export type TextSearchAttendeeQueryVariables = Exact<{
  text: string;
  slug: string;
}>;


export type TextSearchAttendeeQuery = { textSearchAttendee: Array<{ id: string, user:
      | { id: string, name: string, email: string }
      | { id: string, name: string, email: string }
     }> };

export type UpdateInvoiceMutationVariables = Exact<{
  id: string;
  data: InvoiceInput;
}>;


export type UpdateInvoiceMutation = { updateInvoice: { message: string, data: { id: string, hasInvoice: boolean, createdAt: string, updatedAt: string, user:
        | { __typename: 'User', id: string, name: string, email: string, organization: string | null, telephone: string | null, access: Array<Access>, verified: boolean, createdAt: string, updatedAt: string, studyProgramme: StudyProgramme | null, cvUrl: string | null, avatarUrl: string | null, address: { street: string, city: string, postal: string, country: string } | null, billings: Array<{ name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } | null> }
        | { __typename: 'UserStub', id: string, name: string, email: string }
      , invoice: { body: { body: string, comment: string, dueDate: string, issueDate: string, price: number, type: string, vat: number, vatDate: string }, issuer: { name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, variableSymbol: string | null, IBAN: string | null, SWIFT: string | null, address: { street: string, city: string, postal: string, country: string } }, payer: { name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } } | null, ticket: { id: string, online: boolean, price: number, withSubmission: boolean, translations: { en: { name: string, description: string }, sk: { name: string, description: string } } }, submissions: Array<{ id: string, presentationLng: PresentationLng | null, fileUrl: string | null, createdAt: string, updatedAt: string, translations: { sk: { name: string, abstract: string, keywords: Array<string> }, en: { name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ id: string, name: string, email: string }>, conference: { id: string, slug: string }, section: { id: string, conference: { id: string, slug: string } | null, translations: { sk: { name: string, topic: string }, en: { name: string, topic: string } } } }>, conference: { slug: string, translations: { sk: { logoUrl: string }, en: { logoUrl: string } } } } } };

export type DeleteAttendeeMutationVariables = Exact<{
  id: string;
}>;


export type DeleteAttendeeMutation = { deleteAttendee: { message: string, data: { id: string, hasInvoice: boolean, createdAt: string, updatedAt: string, user:
        | { __typename: 'User', id: string, name: string, email: string, organization: string | null, telephone: string | null, access: Array<Access>, verified: boolean, createdAt: string, updatedAt: string, studyProgramme: StudyProgramme | null, cvUrl: string | null, avatarUrl: string | null, address: { street: string, city: string, postal: string, country: string } | null, billings: Array<{ name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } | null> }
        | { __typename: 'UserStub', id: string, name: string, email: string }
      , invoice: { body: { body: string, comment: string, dueDate: string, issueDate: string, price: number, type: string, vat: number, vatDate: string }, issuer: { name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, variableSymbol: string | null, IBAN: string | null, SWIFT: string | null, address: { street: string, city: string, postal: string, country: string } }, payer: { name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } } | null, ticket: { id: string, online: boolean, price: number, withSubmission: boolean, translations: { en: { name: string, description: string }, sk: { name: string, description: string } } }, submissions: Array<{ id: string, presentationLng: PresentationLng | null, fileUrl: string | null, createdAt: string, updatedAt: string, translations: { sk: { name: string, abstract: string, keywords: Array<string> }, en: { name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ id: string, name: string, email: string }>, conference: { id: string, slug: string }, section: { id: string, conference: { id: string, slug: string } | null, translations: { sk: { name: string, topic: string }, en: { name: string, topic: string } } } }>, conference: { slug: string, translations: { sk: { logoUrl: string }, en: { logoUrl: string } } } } } };

export type AddressFragment = { street: string, city: string, postal: string, country: string };

export type UserBillingFragment = { name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } };

export type UserFragment = { id: string, name: string, email: string, organization: string | null, telephone: string | null, access: Array<Access>, verified: boolean, createdAt: string, updatedAt: string, studyProgramme: StudyProgramme | null, cvUrl: string | null, avatarUrl: string | null, address: { street: string, city: string, postal: string, country: string } | null, billings: Array<{ name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } | null> };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { id: string, name: string, email: string, organization: string | null, telephone: string | null, access: Array<Access>, verified: boolean, createdAt: string, updatedAt: string, studyProgramme: StudyProgramme | null, cvUrl: string | null, avatarUrl: string | null, address: { street: string, city: string, postal: string, country: string } | null, billings: Array<{ name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } | null> } };

export type LoginMutationVariables = Exact<{
  email: string;
  password: string;
}>;


export type LoginMutation = { login: { message: string, data: { token: string, id: string, name: string, email: string, organization: string | null, telephone: string | null, access: Array<Access>, verified: boolean, createdAt: string, updatedAt: string, studyProgramme: StudyProgramme | null, cvUrl: string | null, avatarUrl: string | null, address: { street: string, city: string, postal: string, country: string } | null, billings: Array<{ name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } | null> } } };

export type GoogleSignInMutationVariables = Exact<{
  authCode: string;
  redirectUri: string;
}>;


export type GoogleSignInMutation = { googleSignIn: { message: string, data: { token: string, id: string, name: string, email: string, organization: string | null, telephone: string | null, access: Array<Access>, verified: boolean, createdAt: string, updatedAt: string, studyProgramme: StudyProgramme | null, cvUrl: string | null, avatarUrl: string | null, address: { street: string, city: string, postal: string, country: string } | null, billings: Array<{ name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } | null> } } };

export type ForgotPasswordQueryVariables = Exact<{
  email: string;
}>;


export type ForgotPasswordQuery = { forgotPassword: string };

export type PasswordResetMutationVariables = Exact<{
  data: PasswordInput;
}>;


export type PasswordResetMutation = { passwordReset: { message: string, data: { token: string, id: string, name: string, email: string, organization: string | null, telephone: string | null, access: Array<Access>, verified: boolean, createdAt: string, updatedAt: string, studyProgramme: StudyProgramme | null, cvUrl: string | null, avatarUrl: string | null, address: { street: string, city: string, postal: string, country: string } | null, billings: Array<{ name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } | null> } } };

export type RegisterMutationVariables = Exact<{
  data: RegisterUserInput;
}>;


export type RegisterMutation = { register: { message: string, data: { token: string, id: string, name: string, email: string, organization: string | null, telephone: string | null, access: Array<Access>, verified: boolean, createdAt: string, updatedAt: string, studyProgramme: StudyProgramme | null, cvUrl: string | null, avatarUrl: string | null, address: { street: string, city: string, postal: string, country: string } | null, billings: Array<{ name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } | null> } } };

export type ResendActivationLinkMutationVariables = Exact<{ [key: string]: never; }>;


export type ResendActivationLinkMutation = { resendActivationLink: string };

export type ActivateUserMutationVariables = Exact<{ [key: string]: never; }>;


export type ActivateUserMutation = { activateUser: { message: string, data: { token: string, id: string, name: string, email: string, organization: string | null, telephone: string | null, access: Array<Access>, verified: boolean, createdAt: string, updatedAt: string, studyProgramme: StudyProgramme | null, cvUrl: string | null, avatarUrl: string | null, address: { street: string, city: string, postal: string, country: string } | null, billings: Array<{ name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } | null> } } };

export type ImpersonateQueryVariables = Exact<{
  id: string;
}>;


export type ImpersonateQuery = { user: { id: string, access: Array<Access>, token: string } };

export type InvoiceFragment = { body: { body: string, comment: string, dueDate: string, issueDate: string, price: number, type: string, vat: number, vatDate: string }, issuer: { name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, variableSymbol: string | null, IBAN: string | null, SWIFT: string | null, address: { street: string, city: string, postal: string, country: string } }, payer: { name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } };

export type InvoiceBillingFragment = { name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, variableSymbol: string | null, IBAN: string | null, SWIFT: string | null, address: { street: string, city: string, postal: string, country: string } };

export type SectionFragment = { id: string, conference: { id: string, slug: string } | null, translations: { sk: { name: string, topic: string }, en: { name: string, topic: string } } };

export type TicketFragment = { id: string, online: boolean, price: number, withSubmission: boolean, translations: { en: { name: string, description: string }, sk: { name: string, description: string } } };

export type ConferenceListItemFragment = { id: string, slug: string, translations: { sk: { name: string, logoUrl: string }, en: { name: string, logoUrl: string } }, dates: { start: string, end: string, regEnd: string | null, submissionDeadline: string | null } };

export type ConferenceFragment = { createdAt: string, updatedAt: string, id: string, slug: string, translations: { sk: { name: string, logoUrl: string }, en: { name: string, logoUrl: string } }, dates: { start: string, end: string, regEnd: string | null, submissionDeadline: string | null } };

export type ConferenceRegistrationFragment = { createdAt: string, updatedAt: string, id: string, slug: string, sections: Array<{ id: string, conference: { id: string, slug: string } | null, translations: { sk: { name: string, topic: string }, en: { name: string, topic: string } } }>, tickets: Array<{ id: string, online: boolean, price: number, withSubmission: boolean, translations: { en: { name: string, description: string }, sk: { name: string, description: string } } }>, translations: { sk: { name: string, logoUrl: string }, en: { name: string, logoUrl: string } }, dates: { start: string, end: string, regEnd: string | null, submissionDeadline: string | null } };

export type ConferencesQueryVariables = Exact<{
  after?: string | null | undefined;
  first?: number | null | undefined;
  sort: Array<ConferenceSortInput | null | undefined> | ConferenceSortInput;
}>;


export type ConferencesQuery = { conferences: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, slug: string, translations: { sk: { name: string, logoUrl: string }, en: { name: string, logoUrl: string } }, dates: { start: string, end: string, regEnd: string | null, submissionDeadline: string | null } } } | null>, pageInfo: { endCursor: string | null, hasNextPage: boolean } } };

export type ConferenceQueryVariables = Exact<{
  slug: string;
}>;


export type ConferenceQuery = { conference: { createdAt: string, updatedAt: string, id: string, slug: string, sections: Array<{ id: string, conference: { id: string, slug: string } | null, translations: { sk: { name: string, topic: string }, en: { name: string, topic: string } } }>, tickets: Array<{ id: string, online: boolean, price: number, withSubmission: boolean, translations: { en: { name: string, description: string }, sk: { name: string, description: string } } }>, attending: { id: string, hasInvoice: boolean, ticket: { id: string, online: boolean, price: number, withSubmission: boolean, translations: { en: { name: string, description: string }, sk: { name: string, description: string } } }, submissions: Array<{ id: string, presentationLng: PresentationLng | null, fileUrl: string | null, createdAt: string, updatedAt: string, translations: { sk: { name: string, abstract: string, keywords: Array<string> }, en: { name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ id: string, name: string, email: string }>, conference: { id: string, slug: string }, section: { id: string, conference: { id: string, slug: string } | null, translations: { sk: { name: string, topic: string }, en: { name: string, topic: string } } } }> } | null, translations: { sk: { name: string, logoUrl: string }, en: { name: string, logoUrl: string } }, dates: { start: string, end: string, regEnd: string | null, submissionDeadline: string | null } } };

export type SubmissionFilesFragment = { totalCount: number, edges: Array<{ cursor: string, node: { id: string, fileUrl: string | null } } | null> };

export type ConferenceSectionsQueryVariables = Exact<{
  slug: string;
  after?: string | null | undefined;
  first?: number | null | undefined;
  sort: Array<SubmissionSortInput | null | undefined> | SubmissionSortInput;
}>;


export type ConferenceSectionsQuery = { conference: { id: string, translations: { sk: { name: string }, en: { name: string } }, sections: Array<{ id: string, submissions: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, fileUrl: string | null } } | null> }, conference: { id: string, slug: string } | null, translations: { sk: { name: string, topic: string }, en: { name: string, topic: string } } }> } };

export type TextSearchConferenceQueryVariables = Exact<{
  text: string;
}>;


export type TextSearchConferenceQuery = { textSearchConference: Array<{ createdAt: string, updatedAt: string, id: string, slug: string, translations: { sk: { name: string, logoUrl: string }, en: { name: string, logoUrl: string } }, dates: { start: string, end: string, regEnd: string | null, submissionDeadline: string | null } }> };

export type CreateConferenceMutationVariables = Exact<{
  data: ConferenceInput;
}>;


export type CreateConferenceMutation = { createConference: { message: string } };

export type DeleteConferenceMutationVariables = Exact<{
  id: string;
}>;


export type DeleteConferenceMutation = { deleteConference: { message: string, data: { slug: string, translations: { sk: { logoUrl: string }, en: { logoUrl: string } } } } };

export type UpdateConferenceDatesMutationVariables = Exact<{
  slug: string;
  data: DatesInput;
}>;


export type UpdateConferenceDatesMutation = { updateConferenceDates: { message: string, data: { slug: string, translations: { sk: { name: string }, en: { name: string } } } } };

export type CreateSectionMutationVariables = Exact<{
  data: SectionInput;
}>;


export type CreateSectionMutation = { createSection: { message: string, data: { conference: { slug: string } | null } } };

export type UpdateSectionMutationVariables = Exact<{
  id: string;
  data: SectionInput;
}>;


export type UpdateSectionMutation = { updateSection: { message: string, data: { conference: { slug: string } | null } } };

export type DeleteSectionMutationVariables = Exact<{
  id: string;
}>;


export type DeleteSectionMutation = { deleteSection: { message: string, data: { conference: { slug: string } | null } } };

export type CreateTicketMutationVariables = Exact<{
  slug: string;
  data: TicketInput;
}>;


export type CreateTicketMutation = { createTicket: { message: string } };

export type UpdateTicketMutationVariables = Exact<{
  slug: string;
  ticketId: string;
  data: TicketInput;
}>;


export type UpdateTicketMutation = { updateTicket: { message: string } };

export type DeleteTicketMutationVariables = Exact<{
  slug: string;
  ticketId: string;
}>;


export type DeleteTicketMutation = { deleteTicket: { message: string } };

export type AddAttendeeMutationVariables = Exact<{
  data: AttendeeInput;
}>;


export type AddAttendeeMutation = { addAttendee: { message: string, data: { slug: string } } };

export type CourseListItemFragment = { id: string, name: string, start: string, end: string, registrationEnd: string, thumbnail: string | null, hasElearning: boolean, categories: Array<{ id: string, name: string, slug: string }> };

export type CourseFragment = { maxAttendees: number, description: string, price: number, isPaid: boolean, createdAt: string, updatedAt: string, id: string, name: string, start: string, end: string, registrationEnd: string, thumbnail: string | null, hasElearning: boolean, registrationForm: { id: string, course: string, version: number, createdAt: string, updatedAt: string, fields: Array<{ id: string, type: FieldType, label: string, required: boolean, placeholder: string | null, helpText: string | null, minFiles: number | null, maxFiles: number | null, selectOptions: Array<{ value: string, text: string }> | null }> }, billing: { name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, variableSymbol: string | null, IBAN: string | null, SWIFT: string | null, address: { street: string, city: string, postal: string, country: string } } | null, attending: { id: string, hasInvoice: boolean, course: string, status: Status, elearningStatus: ElearningProvisioningStatus | null, createdAt: string, updatedAt: string, user: { id: string, name: string, email: string, telephone: string | null, organization: string, avatarUrl: string | null }, application: { form: string, formVersion: number, answers: Record<string, unknown> } } | null, categories: Array<{ id: string, name: string, slug: string }> };

export type FormFragment = { id: string, course: string, version: number, createdAt: string, updatedAt: string, fields: Array<{ id: string, type: FieldType, label: string, required: boolean, placeholder: string | null, helpText: string | null, minFiles: number | null, maxFiles: number | null, selectOptions: Array<{ value: string, text: string }> | null }> };

export type FormSubmissionFragment = { form: string, formVersion: number, answers: Record<string, unknown> };

export type CourseSessionFragment = { id: string, course: string, name: string, description: string | null, start: string, end: string, createdAt: string, updatedAt: string };

export type CourseAttendeeFragment = { id: string, hasInvoice: boolean, course: string, status: Status, elearningStatus: ElearningProvisioningStatus | null, createdAt: string, updatedAt: string, user: { id: string, name: string, email: string, telephone: string | null, organization: string, avatarUrl: string | null }, application: { form: string, formVersion: number, answers: Record<string, unknown> } };

export type AttendanceFragment = { attendee: { id: string, status: Status, elearningStatus: ElearningProvisioningStatus | null, elearningErrorCode: string | null, user: { name: string }, application: { form: string, formVersion: number, answers: Record<string, unknown> } }, attendanceRecords: Array<{ id: string, online: boolean | null, hoursAttended: number } | null> };

export type CategoryFragment = { id: string, name: string, slug: string };

export type CoursesQueryVariables = Exact<{
  after?: string | null | undefined;
  first?: number | null | undefined;
  sort: Array<CourseSortInput | null | undefined> | CourseSortInput;
  filter?: CourseFilterInput | null | undefined;
}>;


export type CoursesQuery = { courses: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, name: string, start: string, end: string, registrationEnd: string, thumbnail: string | null, hasElearning: boolean, categories: Array<{ id: string, name: string, slug: string }> } } | null>, pageInfo: { hasNextPage: boolean, endCursor: string | null }, availableCategories: Array<{ id: string, name: string, slug: string, count: number }> } };

export type CourseQueryVariables = Exact<{
  id: string;
}>;


export type CourseQuery = { course: { maxAttendees: number, description: string, price: number, isPaid: boolean, createdAt: string, updatedAt: string, id: string, name: string, start: string, end: string, registrationEnd: string, thumbnail: string | null, hasElearning: boolean, elearningAccess: { status: ElearningProvisioningStatus, launchUrl: string | null } | null, registrationForm: { id: string, course: string, version: number, createdAt: string, updatedAt: string, fields: Array<{ id: string, type: FieldType, label: string, required: boolean, placeholder: string | null, helpText: string | null, minFiles: number | null, maxFiles: number | null, selectOptions: Array<{ value: string, text: string }> | null }> }, billing: { name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, variableSymbol: string | null, IBAN: string | null, SWIFT: string | null, address: { street: string, city: string, postal: string, country: string } } | null, attending: { id: string, hasInvoice: boolean, course: string, status: Status, elearningStatus: ElearningProvisioningStatus | null, createdAt: string, updatedAt: string, user: { id: string, name: string, email: string, telephone: string | null, organization: string, avatarUrl: string | null }, application: { form: string, formVersion: number, answers: Record<string, unknown> } } | null, categories: Array<{ id: string, name: string, slug: string }> } };

export type CourseReachConfigQueryVariables = Exact<{
  courseId: string;
}>;


export type CourseReachConfigQuery = { courseReachConfig: { courseId: string, launchUrl: string } | null };

export type AttendanceQueryVariables = Exact<{
  id: string;
  after?: string | null | undefined;
  first?: number | null | undefined;
  sort: Array<CourseAttendeeSortInput | null | undefined> | CourseAttendeeSortInput;
}>;


export type AttendanceQuery = { course: { attendance: { totalCount: number, pageInfo: { hasNextPage: boolean, endCursor: string | null }, edges: Array<{ cursor: string, node: { attendee: { id: string, status: Status, elearningStatus: ElearningProvisioningStatus | null, elearningErrorCode: string | null, user: { name: string }, application: { form: string, formVersion: number, answers: Record<string, unknown> } }, attendanceRecords: Array<{ id: string, online: boolean | null, hoursAttended: number } | null> } } | null>, sessions: Array<{ id: string, course: string, name: string, description: string | null, start: string, end: string, createdAt: string, updatedAt: string } | null> } } };

export type CreateCourseMutationVariables = Exact<{
  data: CourseInput;
}>;


export type CreateCourseMutation = { createCourse: { message: string, data: { maxAttendees: number, description: string, price: number, isPaid: boolean, createdAt: string, updatedAt: string, id: string, name: string, start: string, end: string, registrationEnd: string, thumbnail: string | null, hasElearning: boolean, registrationForm: { id: string, course: string, version: number, createdAt: string, updatedAt: string, fields: Array<{ id: string, type: FieldType, label: string, required: boolean, placeholder: string | null, helpText: string | null, minFiles: number | null, maxFiles: number | null, selectOptions: Array<{ value: string, text: string }> | null }> }, billing: { name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, variableSymbol: string | null, IBAN: string | null, SWIFT: string | null, address: { street: string, city: string, postal: string, country: string } } | null, attending: { id: string, hasInvoice: boolean, course: string, status: Status, elearningStatus: ElearningProvisioningStatus | null, createdAt: string, updatedAt: string, user: { id: string, name: string, email: string, telephone: string | null, organization: string, avatarUrl: string | null }, application: { form: string, formVersion: number, answers: Record<string, unknown> } } | null, categories: Array<{ id: string, name: string, slug: string }> } } };

export type DeleteCourseMutationVariables = Exact<{
  id: string;
}>;


export type DeleteCourseMutation = { deleteCourse: { message: string, data: { maxAttendees: number, description: string, price: number, isPaid: boolean, createdAt: string, updatedAt: string, id: string, name: string, start: string, end: string, registrationEnd: string, thumbnail: string | null, hasElearning: boolean, registrationForm: { id: string, course: string, version: number, createdAt: string, updatedAt: string, fields: Array<{ id: string, type: FieldType, label: string, required: boolean, placeholder: string | null, helpText: string | null, minFiles: number | null, maxFiles: number | null, selectOptions: Array<{ value: string, text: string }> | null }> }, billing: { name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, variableSymbol: string | null, IBAN: string | null, SWIFT: string | null, address: { street: string, city: string, postal: string, country: string } } | null, attending: { id: string, hasInvoice: boolean, course: string, status: Status, elearningStatus: ElearningProvisioningStatus | null, createdAt: string, updatedAt: string, user: { id: string, name: string, email: string, telephone: string | null, organization: string, avatarUrl: string | null }, application: { form: string, formVersion: number, answers: Record<string, unknown> } } | null, categories: Array<{ id: string, name: string, slug: string }> } } };

export type UpdateCourseMutationVariables = Exact<{
  id: string;
  data: CourseInput;
}>;


export type UpdateCourseMutation = { updateCourse: { message: string, data: { maxAttendees: number, description: string, price: number, isPaid: boolean, createdAt: string, updatedAt: string, id: string, name: string, start: string, end: string, registrationEnd: string, thumbnail: string | null, hasElearning: boolean, registrationForm: { id: string, course: string, version: number, createdAt: string, updatedAt: string, fields: Array<{ id: string, type: FieldType, label: string, required: boolean, placeholder: string | null, helpText: string | null, minFiles: number | null, maxFiles: number | null, selectOptions: Array<{ value: string, text: string }> | null }> }, billing: { name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, variableSymbol: string | null, IBAN: string | null, SWIFT: string | null, address: { street: string, city: string, postal: string, country: string } } | null, attending: { id: string, hasInvoice: boolean, course: string, status: Status, elearningStatus: ElearningProvisioningStatus | null, createdAt: string, updatedAt: string, user: { id: string, name: string, email: string, telephone: string | null, organization: string, avatarUrl: string | null }, application: { form: string, formVersion: number, answers: Record<string, unknown> } } | null, categories: Array<{ id: string, name: string, slug: string }> } } };

export type CreateCourseSessionMutationVariables = Exact<{
  data: CourseSessionInput;
}>;


export type CreateCourseSessionMutation = { createCourseSession: { message: string, data: { id: string, course: string, name: string, description: string | null, start: string, end: string, createdAt: string, updatedAt: string } } };

export type UpdateCourseSessionMutationVariables = Exact<{
  id: string;
  data: CourseSessionInput;
}>;


export type UpdateCourseSessionMutation = { updateCourseSession: { message: string, data: { id: string, course: string, name: string, description: string | null, start: string, end: string, createdAt: string, updatedAt: string } } };

export type DeleteCourseSessionMutationVariables = Exact<{
  id: string;
}>;


export type DeleteCourseSessionMutation = { deleteCourseSession: { message: string, data: { id: string, course: string, name: string, description: string | null, start: string, end: string, createdAt: string, updatedAt: string } } };

export type CreateCourseAttendeeMutationVariables = Exact<{
  courseId: string;
  application: FormSubmissionInput;
  billing?: BillingInput | null | undefined;
}>;


export type CreateCourseAttendeeMutation = { createCourseAttendee: { message: string, data: { id: string, hasInvoice: boolean, course: string, status: Status, elearningStatus: ElearningProvisioningStatus | null, createdAt: string, updatedAt: string, user: { id: string, name: string, email: string, telephone: string | null, organization: string, avatarUrl: string | null }, application: { form: string, formVersion: number, answers: Record<string, unknown> } } } };

export type UpdateCourseAttendeeMutationVariables = Exact<{
  id: string;
  application: FormSubmissionInput;
}>;


export type UpdateCourseAttendeeMutation = { updateCourseAttendee: { message: string, data: { id: string, hasInvoice: boolean, course: string, status: Status, elearningStatus: ElearningProvisioningStatus | null, createdAt: string, updatedAt: string, user: { id: string, name: string, email: string, telephone: string | null, organization: string, avatarUrl: string | null }, application: { form: string, formVersion: number, answers: Record<string, unknown> } } } };

export type DeleteCourseAttendeeMutationVariables = Exact<{
  id: string;
}>;


export type DeleteCourseAttendeeMutation = { deleteCourseAttendee: { message: string, data: { id: string, hasInvoice: boolean, course: string, status: Status, elearningStatus: ElearningProvisioningStatus | null, createdAt: string, updatedAt: string, user: { id: string, name: string, email: string, telephone: string | null, organization: string, avatarUrl: string | null }, application: { form: string, formVersion: number, answers: Record<string, unknown> } } } };

export type ChangeCourseAttendeeStatusMutationVariables = Exact<{
  id: string;
  status: Status;
}>;


export type ChangeCourseAttendeeStatusMutation = { changeCourseAttendeeStatus: { message: string, data: { id: string, hasInvoice: boolean, course: string, status: Status, elearningStatus: ElearningProvisioningStatus | null, createdAt: string, updatedAt: string, user: { id: string, name: string, email: string, telephone: string | null, organization: string, avatarUrl: string | null }, application: { form: string, formVersion: number, answers: Record<string, unknown> } } } };

export type SyncCourseElearningAccessMutationVariables = Exact<{
  attendeeId: string;
}>;


export type SyncCourseElearningAccessMutation = { syncCourseElearningAccess: { message: string, data: { id: string, hasInvoice: boolean, course: string, status: Status, elearningStatus: ElearningProvisioningStatus | null, createdAt: string, updatedAt: string, user: { id: string, name: string, email: string, telephone: string | null, organization: string, avatarUrl: string | null }, application: { form: string, formVersion: number, answers: Record<string, unknown> } } } };

export type UpdateAttendanceHoursMutationVariables = Exact<{
  id: string;
  hoursAttended: number;
}>;


export type UpdateAttendanceHoursMutation = { updateAttendanceHours: { message: string, data: { hoursAttended: number, online: boolean | null, session: { course: string } } } };

export type UpdateAttendanceOnlineMutationVariables = Exact<{
  id: string;
  online: boolean;
}>;


export type UpdateAttendanceOnlineMutation = { updateAttendanceOnline: { message: string, data: { hoursAttended: number, online: boolean | null, session: { course: string } } } };

export type CategoriesQueryVariables = Exact<{
  search?: string | null | undefined;
}>;


export type CategoriesQuery = { categories: Array<{ id: string, name: string, slug: string }> };

export type CreateCategoryMutationVariables = Exact<{
  data: CategoryInput;
}>;


export type CreateCategoryMutation = { createCategory: { message: string, data: { id: string, name: string, slug: string } } };

export type UpdateCategoryMutationVariables = Exact<{
  id: string;
  data: CategoryInput;
}>;


export type UpdateCategoryMutation = { updateCategory: { message: string, data: { id: string, name: string, slug: string } } };

export type DeleteCategoryMutationVariables = Exact<{
  id: string;
}>;


export type DeleteCategoryMutation = { deleteCategory: { message: string, data: { id: string, name: string, slug: string } } };

export type ApplicationFragment = { id: string, organization: string, fileUrls: Array<string>, organizationFeedbackUrl: string | null, status: Status, semester: Semester | null, createdAt: string, updatedAt: string, user: { id: string, name: string, email: string, studyProgramme: StudyProgramme, telephone: string, avatarUrl: string | null, address: { street: string, city: string, postal: string, country: string } } };

export type InternshipsQueryVariables = Exact<{
  after?: string | null | undefined;
  first?: number | null | undefined;
  filter?: InternshipFilterInput | null | undefined;
  sort: Array<InternshipSortInput | null | undefined> | InternshipSortInput;
}>;


export type InternshipsQuery = { internships: { totalCount: number, academicYears: Array<{ academicYear: string, count: number }>, organizations: Array<{ organization: string, count: number }>, edges: Array<{ cursor: string, node: { id: string, organization: string, description: string, applicationsCount: number, academicYear: string, myApplication: { id: string, organization: string, fileUrls: Array<string>, organizationFeedbackUrl: string | null, status: Status, semester: Semester | null, createdAt: string, updatedAt: string, user: { id: string, name: string, email: string, studyProgramme: StudyProgramme, telephone: string, avatarUrl: string | null, address: { street: string, city: string, postal: string, country: string } } } | null } } | null>, pageInfo: { hasNextPage: boolean, endCursor: string | null } } };

export type InternshipQueryVariables = Exact<{
  id: string;
}>;


export type InternshipQuery = { internship: { id: string, user: string, organization: string, description: string, updatedAt: string, createdAt: string, applicationsCount: number, myApplication: { id: string, organization: string, fileUrls: Array<string>, organizationFeedbackUrl: string | null, status: Status, semester: Semester | null, createdAt: string, updatedAt: string, user: { id: string, name: string, email: string, studyProgramme: StudyProgramme, telephone: string, avatarUrl: string | null, address: { street: string, city: string, postal: string, country: string } } } | null } };

export type InternshipAcademicYearsQueryVariables = Exact<{
  after?: string | null | undefined;
}>;


export type InternshipAcademicYearsQuery = { internships: { edges: Array<{ node: { id: string, academicYear: string } } | null>, pageInfo: { endCursor: string | null, hasNextPage: boolean } } };

export type CreateInternshipMutationVariables = Exact<{
  input: InternshipInput;
}>;


export type CreateInternshipMutation = { createInternship: { message: string, data: { id: string } } };

export type UpdateInternshipMutationVariables = Exact<{
  id: string;
  input: InternshipInput;
}>;


export type UpdateInternshipMutation = { updateInternship: { message: string, data: { id: string } } };

export type DeleteInternshipMutationVariables = Exact<{
  id: string;
}>;


export type DeleteInternshipMutation = { deleteInternship: { message: string, data: { id: string } } };

export type InternsQueryVariables = Exact<{
  after?: string | null | undefined;
  first?: number | null | undefined;
  filter?: InternFilterInput | null | undefined;
  sort: Array<InternSortInput | null | undefined> | InternSortInput;
}>;


export type InternsQuery = { interns: { totalCount: number, edges: Array<{ cursor: string, node: { internship: string, id: string, organization: string, fileUrls: Array<string>, organizationFeedbackUrl: string | null, status: Status, semester: Semester | null, createdAt: string, updatedAt: string, user: { id: string, name: string, email: string, studyProgramme: StudyProgramme, telephone: string, avatarUrl: string | null, address: { street: string, city: string, postal: string, country: string } } } } | null>, pageInfo: { endCursor: string | null, hasNextPage: boolean } } };

export type InternQueryVariables = Exact<{
  id: string;
}>;


export type InternQuery = { intern: { id: string, organization: string, fileUrls: Array<string>, organizationFeedbackUrl: string | null, status: Status, semester: Semester | null, createdAt: string, updatedAt: string, user: { id: string, name: string, email: string, studyProgramme: StudyProgramme, telephone: string, avatarUrl: string | null, address: { street: string, city: string, postal: string, country: string } } } };

export type CreateInternMutationVariables = Exact<{
  fileUrls: Array<string | null | undefined> | string;
  internshipId: string;
  semester: Semester;
}>;


export type CreateInternMutation = { createIntern: { message: string } };

export type UpdateInternDataMutationVariables = Exact<{
  id: string;
  fileUrls: Array<string | null | undefined> | string;
  semester: Semester;
}>;


export type UpdateInternDataMutation = { updateInternData: { message: string, data: { internship: string } } };

export type UpdateOrgFeedbackMutationVariables = Exact<{
  fileUrl?: string | null | undefined;
  id: string;
}>;


export type UpdateOrgFeedbackMutation = { updateOrgFeedback: { message: string, data: { internship: string } } };

export type DeleteInternMutationVariables = Exact<{
  id: string;
}>;


export type DeleteInternMutation = { deleteIntern: { message: string, data: { internship: string } } };

export type ChangeInternStatusMutationVariables = Exact<{
  id: string;
  status: Status;
}>;


export type ChangeInternStatusMutation = { changeInternStatus: { message: string, data: { internship: string } } };

export type InvoiceQueryVariables = Exact<{
  ownerType: InvoiceOwnerType;
  attendeeId: string;
}>;


export type InvoiceQuery = { invoice: { body: { body: string, comment: string, dueDate: string, issueDate: string, price: number, type: string, vat: number, vatDate: string }, issuer: { name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, variableSymbol: string | null, IBAN: string | null, SWIFT: string | null, address: { street: string, city: string, postal: string, country: string } }, payer: { name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } } | null };

export type SubmissionFragment = { id: string, presentationLng: PresentationLng | null, fileUrl: string | null, createdAt: string, updatedAt: string, translations: { sk: { name: string, abstract: string, keywords: Array<string> }, en: { name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ id: string, name: string, email: string }>, conference: { id: string, slug: string }, section: { id: string, conference: { id: string, slug: string } | null, translations: { sk: { name: string, topic: string }, en: { name: string, topic: string } } } };

export type SubmissionQueryVariables = Exact<{
  id: string;
}>;


export type SubmissionQuery = { submission: { id: string, presentationLng: PresentationLng | null, fileUrl: string | null, createdAt: string, updatedAt: string, translations: { sk: { name: string, abstract: string, keywords: Array<string> }, en: { name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ id: string, name: string, email: string }>, conference: { id: string, slug: string }, section: { id: string, conference: { id: string, slug: string } | null, translations: { sk: { name: string, topic: string }, en: { name: string, topic: string } } } } };

export type SubmissionInviteQueryVariables = Exact<{
  token: string;
}>;


export type SubmissionInviteQuery = { submissionInvite: { id: string, presentationLng: PresentationLng | null, fileUrl: string | null, createdAt: string, updatedAt: string, translations: { sk: { name: string, abstract: string, keywords: Array<string> }, en: { name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ id: string, name: string, email: string }>, conference: { id: string, slug: string }, section: { id: string, conference: { id: string, slug: string } | null, translations: { sk: { name: string, topic: string }, en: { name: string, topic: string } } } } };

export type CreateSubmissionMutationVariables = Exact<{
  data: SubmissionInput;
}>;


export type CreateSubmissionMutation = { createSubmission: { message: string, data: { id: string, presentationLng: PresentationLng | null, fileUrl: string | null, createdAt: string, updatedAt: string, translations: { sk: { name: string, abstract: string, keywords: Array<string> }, en: { name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ id: string, name: string, email: string }>, conference: { id: string, slug: string }, section: { id: string, conference: { id: string, slug: string } | null, translations: { sk: { name: string, topic: string }, en: { name: string, topic: string } } } } } };

export type UpdateSubmissionMutationVariables = Exact<{
  id: string;
  data: SubmissionInput;
}>;


export type UpdateSubmissionMutation = { updateSubmission: { message: string, data: { id: string, presentationLng: PresentationLng | null, fileUrl: string | null, createdAt: string, updatedAt: string, translations: { sk: { name: string, abstract: string, keywords: Array<string> }, en: { name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ id: string, name: string, email: string }>, conference: { id: string, slug: string }, section: { id: string, conference: { id: string, slug: string } | null, translations: { sk: { name: string, topic: string }, en: { name: string, topic: string } } } } } };

export type DeleteSubmissionMutationVariables = Exact<{
  id: string;
}>;


export type DeleteSubmissionMutation = { deleteSubmission: { message: string, data: { id: string, presentationLng: PresentationLng | null, fileUrl: string | null, createdAt: string, updatedAt: string, translations: { sk: { name: string, abstract: string, keywords: Array<string> }, en: { name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ id: string, name: string, email: string }>, conference: { id: string, slug: string }, section: { id: string, conference: { id: string, slug: string } | null, translations: { sk: { name: string, topic: string }, en: { name: string, topic: string } } } } } };

export type RemoveAuthorMutationVariables = Exact<{
  id: string;
  authorId: string;
}>;


export type RemoveAuthorMutation = { removeAuthor: { message: string, data: { id: string, presentationLng: PresentationLng | null, fileUrl: string | null, createdAt: string, updatedAt: string, translations: { sk: { name: string, abstract: string, keywords: Array<string> }, en: { name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ id: string, name: string, email: string }>, conference: { id: string, slug: string }, section: { id: string, conference: { id: string, slug: string } | null, translations: { sk: { name: string, topic: string }, en: { name: string, topic: string } } } } } };

export type AcceptAuthorInviteMutationVariables = Exact<{ [key: string]: never; }>;


export type AcceptAuthorInviteMutation = { acceptAuthorInvite: { message: string, data: { id: string, presentationLng: PresentationLng | null, fileUrl: string | null, createdAt: string, updatedAt: string, translations: { sk: { name: string, abstract: string, keywords: Array<string> }, en: { name: string, abstract: string, keywords: Array<string> } }, authors: Array<{ id: string, name: string, email: string }>, conference: { id: string, slug: string }, section: { id: string, conference: { id: string, slug: string } | null, translations: { sk: { name: string, topic: string }, en: { name: string, topic: string } } } } } };

export type UsersQueryVariables = Exact<{
  after?: string | null | undefined;
  first?: number | null | undefined;
  filter?: UserFilterInput | null | undefined;
  sort: Array<UserSortInput | null | undefined> | UserSortInput;
}>;


export type UsersQuery = { users: { totalCount: number, edges: Array<{ cursor: string, node: { id: string, name: string, email: string, organization: string | null, verified: boolean, access: Array<Access>, createdAt: string, updatedAt: string } } | null>, pageInfo: { endCursor: string | null, hasNextPage: boolean } } };

export type UserQueryVariables = Exact<{
  id: string;
}>;


export type UserQuery = { user: { id: string, name: string, email: string, organization: string | null, telephone: string | null, access: Array<Access>, verified: boolean, createdAt: string, updatedAt: string, studyProgramme: StudyProgramme | null, cvUrl: string | null, avatarUrl: string | null, address: { street: string, city: string, postal: string, country: string } | null, billings: Array<{ name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } | null> } };

export type TextSearchUserQueryVariables = Exact<{
  text: string;
}>;


export type TextSearchUserQuery = { textSearchUser: Array<{ id: string, name: string, email: string }> };

export type UpdateUserMutationVariables = Exact<{
  id: string;
  data: UserInput;
}>;


export type UpdateUserMutation = { updateUser: { message: string, data: { id: string, name: string, email: string, organization: string | null, telephone: string | null, access: Array<Access>, verified: boolean, createdAt: string, updatedAt: string, studyProgramme: StudyProgramme | null, cvUrl: string | null, avatarUrl: string | null, address: { street: string, city: string, postal: string, country: string } | null, billings: Array<{ name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } | null> } } };

export type ToggleVerifiedUserMutationVariables = Exact<{
  id: string;
  verified: boolean;
}>;


export type ToggleVerifiedUserMutation = { toggleVerifiedUser: { message: string, data: { id: string, name: string, email: string, organization: string | null, telephone: string | null, access: Array<Access>, verified: boolean, createdAt: string, updatedAt: string, studyProgramme: StudyProgramme | null, cvUrl: string | null, avatarUrl: string | null, address: { street: string, city: string, postal: string, country: string } | null, billings: Array<{ name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } | null> } } };

export type DeleteUserMutationVariables = Exact<{
  id: string;
}>;


export type DeleteUserMutation = { deleteUser: { message: string, data: { id: string, name: string, email: string, organization: string | null, telephone: string | null, access: Array<Access>, verified: boolean, createdAt: string, updatedAt: string, studyProgramme: StudyProgramme | null, cvUrl: string | null, avatarUrl: string | null, address: { street: string, city: string, postal: string, country: string } | null, billings: Array<{ name: string, ICO: string | null, ICDPH: string | null, DIC: string | null, address: { street: string, city: string, postal: string, country: string } } | null> } } };

export type InviteUsersMutationVariables = Exact<{
  input: OrganizationEmailsInput;
}>;


export type InviteUsersMutation = { inviteUsers: string };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
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
export const UserBillingFragmentDoc = new TypedDocumentString(`
    fragment UserBilling on Billing {
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
}`, {"fragmentName":"UserBilling"}) as unknown as TypedDocumentString<UserBillingFragment, unknown>;
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
    ...UserBilling
  }
  studyProgramme
  cvUrl
  avatarUrl
}
    fragment Address on Address {
  street
  city
  postal
  country
}
fragment UserBilling on Billing {
  name
  address {
    ...Address
  }
  ICO
  ICDPH
  DIC
}`, {"fragmentName":"User"}) as unknown as TypedDocumentString<UserFragment, unknown>;
export const InvoiceBillingFragmentDoc = new TypedDocumentString(`
    fragment InvoiceBilling on Billing {
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
    fragment Address on Address {
  street
  city
  postal
  country
}`, {"fragmentName":"InvoiceBilling"}) as unknown as TypedDocumentString<InvoiceBillingFragment, unknown>;
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
    ...InvoiceBilling
  }
  payer {
    ...UserBilling
  }
}
    fragment Address on Address {
  street
  city
  postal
  country
}
fragment UserBilling on Billing {
  name
  address {
    ...Address
  }
  ICO
  ICDPH
  DIC
}
fragment InvoiceBilling on Billing {
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
  hasInvoice
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
fragment UserBilling on Billing {
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
    ...UserBilling
  }
  studyProgramme
  cvUrl
  avatarUrl
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
    ...InvoiceBilling
  }
  payer {
    ...UserBilling
  }
}
fragment InvoiceBilling on Billing {
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
export const ConferenceListItemFragmentDoc = new TypedDocumentString(`
    fragment ConferenceListItem on Conference {
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
}
    `, {"fragmentName":"ConferenceListItem"}) as unknown as TypedDocumentString<ConferenceListItemFragment, unknown>;
export const ConferenceFragmentDoc = new TypedDocumentString(`
    fragment Conference on Conference {
  ...ConferenceListItem
  createdAt
  updatedAt
}
    fragment ConferenceListItem on Conference {
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
}`, {"fragmentName":"Conference"}) as unknown as TypedDocumentString<ConferenceFragment, unknown>;
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
fragment ConferenceListItem on Conference {
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
}
fragment Conference on Conference {
  ...ConferenceListItem
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
export const CourseListItemFragmentDoc = new TypedDocumentString(`
    fragment CourseListItem on Course {
  id
  name
  categories {
    id
    name
    slug
  }
  start
  end
  registrationEnd
  thumbnail
  hasElearning
}
    `, {"fragmentName":"CourseListItem"}) as unknown as TypedDocumentString<CourseListItemFragment, unknown>;
export const FormFragmentDoc = new TypedDocumentString(`
    fragment Form on Form {
  id
  course
  version
  fields {
    id
    type
    label
    required
    placeholder
    helpText
    selectOptions {
      value
      text
    }
    minFiles
    maxFiles
  }
  createdAt
  updatedAt
}
    `, {"fragmentName":"Form"}) as unknown as TypedDocumentString<FormFragment, unknown>;
export const FormSubmissionFragmentDoc = new TypedDocumentString(`
    fragment FormSubmission on FormSubmission {
  form
  formVersion
  answers
}
    `, {"fragmentName":"FormSubmission"}) as unknown as TypedDocumentString<FormSubmissionFragment, unknown>;
export const CourseAttendeeFragmentDoc = new TypedDocumentString(`
    fragment CourseAttendee on CourseAttendee {
  id
  hasInvoice
  user {
    id
    name
    email
    telephone
    organization
    avatarUrl
  }
  course
  status
  elearningStatus
  application {
    ...FormSubmission
  }
  createdAt
  updatedAt
}
    fragment FormSubmission on FormSubmission {
  form
  formVersion
  answers
}`, {"fragmentName":"CourseAttendee"}) as unknown as TypedDocumentString<CourseAttendeeFragment, unknown>;
export const CourseFragmentDoc = new TypedDocumentString(`
    fragment Course on Course {
  ...CourseListItem
  registrationForm {
    ...Form
  }
  maxAttendees
  description
  price
  billing {
    ...InvoiceBilling
  }
  isPaid
  attending {
    ...CourseAttendee
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
fragment InvoiceBilling on Billing {
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
fragment CourseListItem on Course {
  id
  name
  categories {
    id
    name
    slug
  }
  start
  end
  registrationEnd
  thumbnail
  hasElearning
}
fragment Form on Form {
  id
  course
  version
  fields {
    id
    type
    label
    required
    placeholder
    helpText
    selectOptions {
      value
      text
    }
    minFiles
    maxFiles
  }
  createdAt
  updatedAt
}
fragment FormSubmission on FormSubmission {
  form
  formVersion
  answers
}
fragment CourseAttendee on CourseAttendee {
  id
  hasInvoice
  user {
    id
    name
    email
    telephone
    organization
    avatarUrl
  }
  course
  status
  elearningStatus
  application {
    ...FormSubmission
  }
  createdAt
  updatedAt
}`, {"fragmentName":"Course"}) as unknown as TypedDocumentString<CourseFragment, unknown>;
export const CourseSessionFragmentDoc = new TypedDocumentString(`
    fragment CourseSession on CourseSession {
  id
  course
  name
  description
  start
  end
  createdAt
  updatedAt
}
    `, {"fragmentName":"CourseSession"}) as unknown as TypedDocumentString<CourseSessionFragment, unknown>;
export const AttendanceFragmentDoc = new TypedDocumentString(`
    fragment Attendance on Attendance {
  attendee {
    id
    user {
      name
    }
    status
    elearningStatus
    elearningErrorCode
    application {
      ...FormSubmission
    }
  }
  attendanceRecords {
    id
    online
    hoursAttended
  }
}
    fragment FormSubmission on FormSubmission {
  form
  formVersion
  answers
}`, {"fragmentName":"Attendance"}) as unknown as TypedDocumentString<AttendanceFragment, unknown>;
export const CategoryFragmentDoc = new TypedDocumentString(`
    fragment Category on Category {
  id
  name
  slug
}
    `, {"fragmentName":"Category"}) as unknown as TypedDocumentString<CategoryFragment, unknown>;
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
  organization
  fileUrls
  organizationFeedbackUrl
  status
  semester
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
  hasInvoice
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
fragment UserBilling on Billing {
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
    ...UserBilling
  }
  studyProgramme
  cvUrl
  avatarUrl
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
    ...InvoiceBilling
  }
  payer {
    ...UserBilling
  }
}
fragment InvoiceBilling on Billing {
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
  hasInvoice
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
fragment UserBilling on Billing {
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
    ...UserBilling
  }
  studyProgramme
  cvUrl
  avatarUrl
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
    ...InvoiceBilling
  }
  payer {
    ...UserBilling
  }
}
fragment InvoiceBilling on Billing {
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
  hasInvoice
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
fragment UserBilling on Billing {
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
    ...UserBilling
  }
  studyProgramme
  cvUrl
  avatarUrl
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
    ...InvoiceBilling
  }
  payer {
    ...UserBilling
  }
}
fragment InvoiceBilling on Billing {
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
  hasInvoice
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
fragment UserBilling on Billing {
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
    ...UserBilling
  }
  studyProgramme
  cvUrl
  avatarUrl
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
    ...InvoiceBilling
  }
  payer {
    ...UserBilling
  }
}
fragment InvoiceBilling on Billing {
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
fragment UserBilling on Billing {
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
    ...UserBilling
  }
  studyProgramme
  cvUrl
  avatarUrl
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
fragment UserBilling on Billing {
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
    ...UserBilling
  }
  studyProgramme
  cvUrl
  avatarUrl
}`) as unknown as TypedDocumentString<LoginMutation, LoginMutationVariables>;
export const GoogleSignInDocument = new TypedDocumentString(`
    mutation googleSignIn($authCode: String!, $redirectUri: String!) {
  googleSignIn(authCode: $authCode, redirectUri: $redirectUri) {
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
fragment UserBilling on Billing {
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
    ...UserBilling
  }
  studyProgramme
  cvUrl
  avatarUrl
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
fragment UserBilling on Billing {
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
    ...UserBilling
  }
  studyProgramme
  cvUrl
  avatarUrl
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
fragment UserBilling on Billing {
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
    ...UserBilling
  }
  studyProgramme
  cvUrl
  avatarUrl
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
fragment UserBilling on Billing {
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
    ...UserBilling
  }
  studyProgramme
  cvUrl
  avatarUrl
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
        ...ConferenceListItem
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
    fragment ConferenceListItem on Conference {
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
      id
      hasInvoice
      ticket {
        ...Ticket
      }
      submissions {
        ...Submission
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
fragment ConferenceListItem on Conference {
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
}
fragment Conference on Conference {
  ...ConferenceListItem
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
    translations {
      sk {
        name
      }
      en {
        name
      }
    }
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
    fragment ConferenceListItem on Conference {
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
}
fragment Conference on Conference {
  ...ConferenceListItem
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
    query courses($after: String, $first: Int, $sort: [CourseSortInput]!, $filter: CourseFilterInput) {
  courses(after: $after, first: $first, sort: $sort, filter: $filter) {
    totalCount
    edges {
      cursor
      node {
        ...CourseListItem
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    availableCategories {
      id
      name
      slug
      count
    }
  }
}
    fragment CourseListItem on Course {
  id
  name
  categories {
    id
    name
    slug
  }
  start
  end
  registrationEnd
  thumbnail
  hasElearning
}`) as unknown as TypedDocumentString<CoursesQuery, CoursesQueryVariables>;
export const CourseDocument = new TypedDocumentString(`
    query course($id: ObjectId!) {
  course(id: $id) {
    ...Course
    elearningAccess {
      status
      launchUrl
    }
  }
}
    fragment Address on Address {
  street
  city
  postal
  country
}
fragment InvoiceBilling on Billing {
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
fragment CourseListItem on Course {
  id
  name
  categories {
    id
    name
    slug
  }
  start
  end
  registrationEnd
  thumbnail
  hasElearning
}
fragment Course on Course {
  ...CourseListItem
  registrationForm {
    ...Form
  }
  maxAttendees
  description
  price
  billing {
    ...InvoiceBilling
  }
  isPaid
  attending {
    ...CourseAttendee
  }
  createdAt
  updatedAt
}
fragment Form on Form {
  id
  course
  version
  fields {
    id
    type
    label
    required
    placeholder
    helpText
    selectOptions {
      value
      text
    }
    minFiles
    maxFiles
  }
  createdAt
  updatedAt
}
fragment FormSubmission on FormSubmission {
  form
  formVersion
  answers
}
fragment CourseAttendee on CourseAttendee {
  id
  hasInvoice
  user {
    id
    name
    email
    telephone
    organization
    avatarUrl
  }
  course
  status
  elearningStatus
  application {
    ...FormSubmission
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<CourseQuery, CourseQueryVariables>;
export const CourseReachConfigDocument = new TypedDocumentString(`
    query courseReachConfig($courseId: ObjectId!) {
  courseReachConfig(courseId: $courseId) {
    courseId
    launchUrl
  }
}
    `) as unknown as TypedDocumentString<CourseReachConfigQuery, CourseReachConfigQueryVariables>;
export const AttendanceDocument = new TypedDocumentString(`
    query attendance($id: ObjectId!, $after: String, $first: Int, $sort: [CourseAttendeeSortInput]!) {
  course(id: $id) {
    attendance(after: $after, first: $first, sort: $sort) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          ...Attendance
        }
      }
      sessions {
        ...CourseSession
      }
    }
  }
}
    fragment FormSubmission on FormSubmission {
  form
  formVersion
  answers
}
fragment CourseSession on CourseSession {
  id
  course
  name
  description
  start
  end
  createdAt
  updatedAt
}
fragment Attendance on Attendance {
  attendee {
    id
    user {
      name
    }
    status
    elearningStatus
    elearningErrorCode
    application {
      ...FormSubmission
    }
  }
  attendanceRecords {
    id
    online
    hoursAttended
  }
}`) as unknown as TypedDocumentString<AttendanceQuery, AttendanceQueryVariables>;
export const CreateCourseDocument = new TypedDocumentString(`
    mutation createCourse($data: CourseInput!) {
  createCourse(data: $data) {
    message
    data {
      ...Course
    }
  }
}
    fragment Address on Address {
  street
  city
  postal
  country
}
fragment InvoiceBilling on Billing {
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
fragment CourseListItem on Course {
  id
  name
  categories {
    id
    name
    slug
  }
  start
  end
  registrationEnd
  thumbnail
  hasElearning
}
fragment Course on Course {
  ...CourseListItem
  registrationForm {
    ...Form
  }
  maxAttendees
  description
  price
  billing {
    ...InvoiceBilling
  }
  isPaid
  attending {
    ...CourseAttendee
  }
  createdAt
  updatedAt
}
fragment Form on Form {
  id
  course
  version
  fields {
    id
    type
    label
    required
    placeholder
    helpText
    selectOptions {
      value
      text
    }
    minFiles
    maxFiles
  }
  createdAt
  updatedAt
}
fragment FormSubmission on FormSubmission {
  form
  formVersion
  answers
}
fragment CourseAttendee on CourseAttendee {
  id
  hasInvoice
  user {
    id
    name
    email
    telephone
    organization
    avatarUrl
  }
  course
  status
  elearningStatus
  application {
    ...FormSubmission
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<CreateCourseMutation, CreateCourseMutationVariables>;
export const DeleteCourseDocument = new TypedDocumentString(`
    mutation deleteCourse($id: ObjectId!) {
  deleteCourse(id: $id) {
    message
    data {
      ...Course
    }
  }
}
    fragment Address on Address {
  street
  city
  postal
  country
}
fragment InvoiceBilling on Billing {
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
fragment CourseListItem on Course {
  id
  name
  categories {
    id
    name
    slug
  }
  start
  end
  registrationEnd
  thumbnail
  hasElearning
}
fragment Course on Course {
  ...CourseListItem
  registrationForm {
    ...Form
  }
  maxAttendees
  description
  price
  billing {
    ...InvoiceBilling
  }
  isPaid
  attending {
    ...CourseAttendee
  }
  createdAt
  updatedAt
}
fragment Form on Form {
  id
  course
  version
  fields {
    id
    type
    label
    required
    placeholder
    helpText
    selectOptions {
      value
      text
    }
    minFiles
    maxFiles
  }
  createdAt
  updatedAt
}
fragment FormSubmission on FormSubmission {
  form
  formVersion
  answers
}
fragment CourseAttendee on CourseAttendee {
  id
  hasInvoice
  user {
    id
    name
    email
    telephone
    organization
    avatarUrl
  }
  course
  status
  elearningStatus
  application {
    ...FormSubmission
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<DeleteCourseMutation, DeleteCourseMutationVariables>;
export const UpdateCourseDocument = new TypedDocumentString(`
    mutation updateCourse($id: ObjectId!, $data: CourseInput!) {
  updateCourse(id: $id, data: $data) {
    message
    data {
      ...Course
    }
  }
}
    fragment Address on Address {
  street
  city
  postal
  country
}
fragment InvoiceBilling on Billing {
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
fragment CourseListItem on Course {
  id
  name
  categories {
    id
    name
    slug
  }
  start
  end
  registrationEnd
  thumbnail
  hasElearning
}
fragment Course on Course {
  ...CourseListItem
  registrationForm {
    ...Form
  }
  maxAttendees
  description
  price
  billing {
    ...InvoiceBilling
  }
  isPaid
  attending {
    ...CourseAttendee
  }
  createdAt
  updatedAt
}
fragment Form on Form {
  id
  course
  version
  fields {
    id
    type
    label
    required
    placeholder
    helpText
    selectOptions {
      value
      text
    }
    minFiles
    maxFiles
  }
  createdAt
  updatedAt
}
fragment FormSubmission on FormSubmission {
  form
  formVersion
  answers
}
fragment CourseAttendee on CourseAttendee {
  id
  hasInvoice
  user {
    id
    name
    email
    telephone
    organization
    avatarUrl
  }
  course
  status
  elearningStatus
  application {
    ...FormSubmission
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<UpdateCourseMutation, UpdateCourseMutationVariables>;
export const CreateCourseSessionDocument = new TypedDocumentString(`
    mutation createCourseSession($data: CourseSessionInput!) {
  createCourseSession(data: $data) {
    message
    data {
      ...CourseSession
    }
  }
}
    fragment CourseSession on CourseSession {
  id
  course
  name
  description
  start
  end
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<CreateCourseSessionMutation, CreateCourseSessionMutationVariables>;
export const UpdateCourseSessionDocument = new TypedDocumentString(`
    mutation updateCourseSession($id: ObjectId!, $data: CourseSessionInput!) {
  updateCourseSession(id: $id, data: $data) {
    message
    data {
      ...CourseSession
    }
  }
}
    fragment CourseSession on CourseSession {
  id
  course
  name
  description
  start
  end
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<UpdateCourseSessionMutation, UpdateCourseSessionMutationVariables>;
export const DeleteCourseSessionDocument = new TypedDocumentString(`
    mutation deleteCourseSession($id: ObjectId!) {
  deleteCourseSession(id: $id) {
    message
    data {
      ...CourseSession
    }
  }
}
    fragment CourseSession on CourseSession {
  id
  course
  name
  description
  start
  end
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<DeleteCourseSessionMutation, DeleteCourseSessionMutationVariables>;
export const CreateCourseAttendeeDocument = new TypedDocumentString(`
    mutation createCourseAttendee($courseId: ObjectId!, $application: FormSubmissionInput!, $billing: BillingInput) {
  createCourseAttendee(
    courseId: $courseId
    application: $application
    billing: $billing
  ) {
    message
    data {
      ...CourseAttendee
    }
  }
}
    fragment FormSubmission on FormSubmission {
  form
  formVersion
  answers
}
fragment CourseAttendee on CourseAttendee {
  id
  hasInvoice
  user {
    id
    name
    email
    telephone
    organization
    avatarUrl
  }
  course
  status
  elearningStatus
  application {
    ...FormSubmission
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<CreateCourseAttendeeMutation, CreateCourseAttendeeMutationVariables>;
export const UpdateCourseAttendeeDocument = new TypedDocumentString(`
    mutation updateCourseAttendee($id: ObjectId!, $application: FormSubmissionInput!) {
  updateCourseAttendee(id: $id, application: $application) {
    message
    data {
      ...CourseAttendee
    }
  }
}
    fragment FormSubmission on FormSubmission {
  form
  formVersion
  answers
}
fragment CourseAttendee on CourseAttendee {
  id
  hasInvoice
  user {
    id
    name
    email
    telephone
    organization
    avatarUrl
  }
  course
  status
  elearningStatus
  application {
    ...FormSubmission
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<UpdateCourseAttendeeMutation, UpdateCourseAttendeeMutationVariables>;
export const DeleteCourseAttendeeDocument = new TypedDocumentString(`
    mutation deleteCourseAttendee($id: ObjectId!) {
  deleteCourseAttendee(id: $id) {
    message
    data {
      ...CourseAttendee
    }
  }
}
    fragment FormSubmission on FormSubmission {
  form
  formVersion
  answers
}
fragment CourseAttendee on CourseAttendee {
  id
  hasInvoice
  user {
    id
    name
    email
    telephone
    organization
    avatarUrl
  }
  course
  status
  elearningStatus
  application {
    ...FormSubmission
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<DeleteCourseAttendeeMutation, DeleteCourseAttendeeMutationVariables>;
export const ChangeCourseAttendeeStatusDocument = new TypedDocumentString(`
    mutation changeCourseAttendeeStatus($id: ObjectId!, $status: Status!) {
  changeCourseAttendeeStatus(id: $id, status: $status) {
    message
    data {
      ...CourseAttendee
    }
  }
}
    fragment FormSubmission on FormSubmission {
  form
  formVersion
  answers
}
fragment CourseAttendee on CourseAttendee {
  id
  hasInvoice
  user {
    id
    name
    email
    telephone
    organization
    avatarUrl
  }
  course
  status
  elearningStatus
  application {
    ...FormSubmission
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<ChangeCourseAttendeeStatusMutation, ChangeCourseAttendeeStatusMutationVariables>;
export const SyncCourseElearningAccessDocument = new TypedDocumentString(`
    mutation syncCourseElearningAccess($attendeeId: ObjectId!) {
  syncCourseElearningAccess(attendeeId: $attendeeId) {
    message
    data {
      ...CourseAttendee
    }
  }
}
    fragment FormSubmission on FormSubmission {
  form
  formVersion
  answers
}
fragment CourseAttendee on CourseAttendee {
  id
  hasInvoice
  user {
    id
    name
    email
    telephone
    organization
    avatarUrl
  }
  course
  status
  elearningStatus
  application {
    ...FormSubmission
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<SyncCourseElearningAccessMutation, SyncCourseElearningAccessMutationVariables>;
export const UpdateAttendanceHoursDocument = new TypedDocumentString(`
    mutation updateAttendanceHours($id: ObjectId!, $hoursAttended: Float!) {
  updateAttendanceHours(id: $id, hoursAttended: $hoursAttended) {
    message
    data {
      hoursAttended
      online
      session {
        course
      }
    }
  }
}
    `) as unknown as TypedDocumentString<UpdateAttendanceHoursMutation, UpdateAttendanceHoursMutationVariables>;
export const UpdateAttendanceOnlineDocument = new TypedDocumentString(`
    mutation updateAttendanceOnline($id: ObjectId!, $online: Boolean!) {
  updateAttendanceOnline(id: $id, online: $online) {
    message
    data {
      hoursAttended
      online
      session {
        course
      }
    }
  }
}
    `) as unknown as TypedDocumentString<UpdateAttendanceOnlineMutation, UpdateAttendanceOnlineMutationVariables>;
export const CategoriesDocument = new TypedDocumentString(`
    query categories($search: String) {
  categories(search: $search) {
    ...Category
  }
}
    fragment Category on Category {
  id
  name
  slug
}`) as unknown as TypedDocumentString<CategoriesQuery, CategoriesQueryVariables>;
export const CreateCategoryDocument = new TypedDocumentString(`
    mutation createCategory($data: CategoryInput!) {
  createCategory(data: $data) {
    message
    data {
      ...Category
    }
  }
}
    fragment Category on Category {
  id
  name
  slug
}`) as unknown as TypedDocumentString<CreateCategoryMutation, CreateCategoryMutationVariables>;
export const UpdateCategoryDocument = new TypedDocumentString(`
    mutation updateCategory($id: ObjectId!, $data: CategoryInput!) {
  updateCategory(id: $id, data: $data) {
    message
    data {
      ...Category
    }
  }
}
    fragment Category on Category {
  id
  name
  slug
}`) as unknown as TypedDocumentString<UpdateCategoryMutation, UpdateCategoryMutationVariables>;
export const DeleteCategoryDocument = new TypedDocumentString(`
    mutation deleteCategory($id: ObjectId!) {
  deleteCategory(id: $id) {
    message
    data {
      ...Category
    }
  }
}
    fragment Category on Category {
  id
  name
  slug
}`) as unknown as TypedDocumentString<DeleteCategoryMutation, DeleteCategoryMutationVariables>;
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
  organization
  fileUrls
  organizationFeedbackUrl
  status
  semester
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
  organization
  fileUrls
  organizationFeedbackUrl
  status
  semester
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<InternshipQuery, InternshipQueryVariables>;
export const InternshipAcademicYearsDocument = new TypedDocumentString(`
    query internshipAcademicYears($after: String) {
  internships(after: $after, first: 100, sort: []) {
    edges {
      node {
        id
        academicYear
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
    `) as unknown as TypedDocumentString<InternshipAcademicYearsQuery, InternshipAcademicYearsQueryVariables>;
export const CreateInternshipDocument = new TypedDocumentString(`
    mutation createInternship($input: InternshipInput!) {
  createInternship(input: $input) {
    message
    data {
      id
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
export const InternsDocument = new TypedDocumentString(`
    query interns($after: String, $first: Int, $filter: InternFilterInput, $sort: [InternSortInput]!) {
  interns(after: $after, first: $first, filter: $filter, sort: $sort) {
    totalCount
    edges {
      cursor
      node {
        internship
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
  organization
  fileUrls
  organizationFeedbackUrl
  status
  semester
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
  organization
  fileUrls
  organizationFeedbackUrl
  status
  semester
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<InternQuery, InternQueryVariables>;
export const CreateInternDocument = new TypedDocumentString(`
    mutation createIntern($fileUrls: [String]!, $internshipId: ObjectId!, $semester: Semester!) {
  createIntern(
    fileUrls: $fileUrls
    internshipId: $internshipId
    semester: $semester
  ) {
    message
  }
}
    `) as unknown as TypedDocumentString<CreateInternMutation, CreateInternMutationVariables>;
export const UpdateInternDataDocument = new TypedDocumentString(`
    mutation updateInternData($id: ObjectId!, $fileUrls: [String]!, $semester: Semester!) {
  updateInternData(id: $id, fileUrls: $fileUrls, semester: $semester) {
    message
    data {
      internship
    }
  }
}
    `) as unknown as TypedDocumentString<UpdateInternDataMutation, UpdateInternDataMutationVariables>;
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
export const InvoiceDocument = new TypedDocumentString(`
    query invoice($ownerType: InvoiceOwnerType!, $attendeeId: ObjectId!) {
  invoice(ownerType: $ownerType, attendeeId: $attendeeId) {
    ...Invoice
  }
}
    fragment Address on Address {
  street
  city
  postal
  country
}
fragment UserBilling on Billing {
  name
  address {
    ...Address
  }
  ICO
  ICDPH
  DIC
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
    ...InvoiceBilling
  }
  payer {
    ...UserBilling
  }
}
fragment InvoiceBilling on Billing {
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
}`) as unknown as TypedDocumentString<InvoiceQuery, InvoiceQueryVariables>;
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
export const SubmissionInviteDocument = new TypedDocumentString(`
    query submissionInvite($token: String!) {
  submissionInvite(token: $token) {
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
}`) as unknown as TypedDocumentString<SubmissionInviteQuery, SubmissionInviteQueryVariables>;
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
fragment UserBilling on Billing {
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
    ...UserBilling
  }
  studyProgramme
  cvUrl
  avatarUrl
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
fragment UserBilling on Billing {
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
    ...UserBilling
  }
  studyProgramme
  cvUrl
  avatarUrl
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
fragment UserBilling on Billing {
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
    ...UserBilling
  }
  studyProgramme
  cvUrl
  avatarUrl
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
fragment UserBilling on Billing {
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
    ...UserBilling
  }
  studyProgramme
  cvUrl
  avatarUrl
}`) as unknown as TypedDocumentString<DeleteUserMutation, DeleteUserMutationVariables>;
export const InviteUsersDocument = new TypedDocumentString(`
    mutation inviteUsers($input: OrganizationEmailsInput!) {
  inviteUsers(input: $input)
}
    `) as unknown as TypedDocumentString<InviteUsersMutation, InviteUsersMutationVariables>;