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
    "fragment Attendee on Attendee {\n  id\n  user {\n    ... on User {\n      __typename\n      ...User\n    }\n    ... on AttendeeUser {\n      __typename\n      id\n      name\n      email\n    }\n  }\n  invoice {\n    ...Invoice\n  }\n  ticket {\n    ...Ticket\n  }\n  submissions {\n    ...Submission\n  }\n  conference {\n    slug\n    translations {\n      sk {\n        logoUrl\n      }\n      en {\n        logoUrl\n      }\n    }\n  }\n  createdAt\n  updatedAt\n}\n\nquery attendees($after: ObjectId, $first: Int, $conferenceSlug: String!, $passive: Boolean, $sectionIds: [ObjectId!]) {\n  attendees(\n    after: $after\n    first: $first\n    conferenceSlug: $conferenceSlug\n    passive: $passive\n    sectionIds: $sectionIds\n  ) {\n    totalCount\n    edges {\n      cursor\n      node {\n        ...Attendee\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nquery attendee($id: ObjectId!) {\n  attendee(id: $id) {\n    ...Attendee\n  }\n}\n\nquery attendeesCsvExport($slug: String!) {\n  attendeesCsvExport(slug: $slug) {\n    ...Attendee\n  }\n}\n\nquery textSearchAttendee($text: String!) {\n  textSearchAttendee(text: $text) {\n    id\n    user {\n      ... on AttendeeUser {\n        id\n        name\n        email\n      }\n      ... on User {\n        id\n        name\n        email\n      }\n    }\n  }\n}\n\nmutation updateInvoice($id: ObjectId!, $data: InvoiceInput!) {\n  updateInvoice(id: $id, data: $data) {\n    message\n    data {\n      ...Attendee\n    }\n  }\n}\n\nmutation deleteAttendee($id: ObjectId!) {\n  deleteAttendee(id: $id) {\n    message\n    data {\n      ...Attendee\n    }\n  }\n}\n\nmutation removeAuthor($id: ObjectId!, $authorId: ObjectId!) {\n  removeAuthor(id: $id, authorId: $authorId) {\n    message\n    data {\n      ...Submission\n    }\n  }\n}": types.AttendeeFragmentDoc,
    "fragment Address on Address {\n  street\n  city\n  postal\n  country\n}\n\nfragment Billing on Billing {\n  name\n  address {\n    ...Address\n  }\n  ICO\n  ICDPH\n  DIC\n}\n\nfragment User on User {\n  id\n  name\n  email\n  organization\n  telephone\n  role\n  verified\n  createdAt\n  updatedAt\n  billings {\n    ...Billing\n  }\n}\n\nquery me {\n  me {\n    ...User\n  }\n}\n\nmutation login($email: String!, $password: String!) {\n  login(email: $email, password: $password) {\n    message\n    data {\n      ...User\n      token\n    }\n  }\n}\n\nmutation googleSignIn($authCode: String!) {\n  googleSignIn(authCode: $authCode) {\n    message\n    data {\n      ...User\n      token\n    }\n  }\n}\n\nquery forgotPassword($email: String!) {\n  forgotPassword(email: $email)\n}\n\nmutation passwordReset($data: PasswordInput!) {\n  passwordReset(data: $data) {\n    message\n    data {\n      ...User\n      token\n    }\n  }\n}\n\nmutation register($data: RegisterInput!) {\n  register(data: $data) {\n    message\n    data {\n      ...User\n      token\n    }\n  }\n}\n\nmutation resendActivationLink {\n  resendActivationLink\n}\n\nmutation activateUser {\n  activateUser {\n    message\n    data {\n      ...User\n      token\n    }\n  }\n}\n\nquery impersonate($id: ObjectId!) {\n  user(id: $id) {\n    id\n    token\n  }\n}": types.AddressFragmentDoc,
    "fragment Invoice on Invoice {\n  body {\n    body\n    comment\n    dueDate\n    issueDate\n    price\n    type\n    vat\n    vatDate\n  }\n  issuer {\n    name\n    address {\n      ...Address\n    }\n    ICO\n    ICDPH\n    DIC\n    stampUrl\n    variableSymbol\n    IBAN\n    SWIFT\n  }\n  payer {\n    ...Billing\n  }\n}\n\nfragment Section on Section {\n  id\n  conference\n  translations {\n    sk {\n      name\n      topic\n    }\n    en {\n      name\n      topic\n    }\n  }\n}\n\nfragment Ticket on Ticket {\n  id\n  online\n  price\n  withSubmission\n  translations {\n    en {\n      name\n      description\n    }\n    sk {\n      name\n      description\n    }\n  }\n}\n\nfragment Conference on Conference {\n  id\n  slug\n  translations {\n    sk {\n      name\n      logoUrl\n    }\n    en {\n      name\n      logoUrl\n    }\n  }\n  dates {\n    start\n    end\n    regEnd\n    submissionDeadline\n  }\n  createdAt\n  updatedAt\n}\n\nfragment ConferenceRegistration on Conference {\n  ...Conference\n  sections {\n    ...Section\n  }\n  tickets {\n    ...Ticket\n  }\n}\n\nquery conferences($after: ObjectId, $first: Int) {\n  conferences(after: $after, first: $first) {\n    totalCount\n    edges {\n      cursor\n      node {\n        ...Conference\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nquery conference($slug: String!) {\n  conference(slug: $slug) {\n    ...Conference\n    sections {\n      ...Section\n    }\n    tickets {\n      ...Ticket\n    }\n    attending {\n      ...Attendee\n    }\n  }\n}\n\nquery textSearchConference($text: String!) {\n  textSearchConference(text: $text) {\n    ...Conference\n  }\n}\n\nmutation createConference($data: ConferenceInput!) {\n  createConference(data: $data) {\n    message\n  }\n}\n\nmutation deleteConference($id: ObjectId!) {\n  deleteConference(id: $id) {\n    message\n    data {\n      slug\n      translations {\n        sk {\n          logoUrl\n        }\n        en {\n          logoUrl\n        }\n      }\n      billing {\n        stampUrl\n      }\n    }\n  }\n}\n\nmutation updateConferenceDates($slug: String!, $data: DatesInput!) {\n  updateConferenceDates(slug: $slug, data: $data) {\n    message\n    data {\n      slug\n      translations {\n        sk {\n          name\n        }\n        en {\n          name\n        }\n      }\n    }\n  }\n}\n\nmutation createSection($data: SectionInput!) {\n  createSection(data: $data) {\n    message\n  }\n}\n\nmutation updateSection($id: ObjectId!, $data: SectionInput!) {\n  updateSection(id: $id, data: $data) {\n    message\n  }\n}\n\nmutation deleteSection($id: ObjectId!) {\n  deleteSection(id: $id)\n}\n\nmutation createTicket($slug: String!, $data: TicketInput!) {\n  createTicket(slug: $slug, data: $data) {\n    message\n  }\n}\n\nmutation updateTicket($slug: String!, $ticketId: ObjectId!, $data: TicketInput!) {\n  updateTicket(slug: $slug, ticketId: $ticketId, data: $data) {\n    message\n  }\n}\n\nmutation deleteTicket($slug: String!, $ticketId: ObjectId!) {\n  deleteTicket(slug: $slug, ticketId: $ticketId)\n}\n\nmutation addAttendee($data: AttendeeInput!) {\n  addAttendee(data: $data) {\n    message\n  }\n}": types.InvoiceFragmentDoc,
    "fragment Submission on Submission {\n  id\n  translations {\n    sk {\n      name\n      abstract\n      keywords\n    }\n    en {\n      name\n      abstract\n      keywords\n    }\n  }\n  authors {\n    id\n    name\n    email\n  }\n  fileUrl\n  conference {\n    id\n    slug\n  }\n  section {\n    ...Section\n  }\n  createdAt\n  updatedAt\n}\n\nquery submission($id: ObjectId!) {\n  submission(id: $id) {\n    ...Submission\n  }\n}\n\nmutation createSubmission($data: SubmissionInput!) {\n  createSubmission(data: $data) {\n    message\n    data {\n      ...Submission\n    }\n  }\n}\n\nmutation updateSubmission($id: ObjectId!, $data: SubmissionInput!) {\n  updateSubmission(id: $id, data: $data) {\n    message\n    data {\n      ...Submission\n    }\n  }\n}\n\nmutation deleteSubmission($id: ObjectId!) {\n  deleteSubmission(id: $id) {\n    message\n    data {\n      ...Submission\n    }\n  }\n}": types.SubmissionFragmentDoc,
    "query users($after: ObjectId, $first: Int) {\n  users(after: $after, first: $first) {\n    totalCount\n    edges {\n      cursor\n      node {\n        id\n        name\n        email\n        organization\n        verified\n        role\n        createdAt\n        updatedAt\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nquery user($id: ObjectId!) {\n  user(id: $id) {\n    ...User\n  }\n}\n\nquery textSearchUser($text: String!) {\n  textSearchUser(text: $text) {\n    id\n    name\n    email\n  }\n}\n\nmutation updateUser($id: ObjectId!, $data: UserInput!) {\n  updateUser(id: $id, data: $data) {\n    message\n    data {\n      ...User\n    }\n  }\n}\n\nmutation toggleVerifiedUser($id: ObjectId!) {\n  toggleVerifiedUser(id: $id) {\n    message\n    data {\n      ...User\n    }\n  }\n}\n\nmutation deleteUser($id: ObjectId!) {\n  deleteUser(id: $id) {\n    message\n    data {\n      ...User\n    }\n  }\n}": types.UsersDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment Attendee on Attendee {\n  id\n  user {\n    ... on User {\n      __typename\n      ...User\n    }\n    ... on AttendeeUser {\n      __typename\n      id\n      name\n      email\n    }\n  }\n  invoice {\n    ...Invoice\n  }\n  ticket {\n    ...Ticket\n  }\n  submissions {\n    ...Submission\n  }\n  conference {\n    slug\n    translations {\n      sk {\n        logoUrl\n      }\n      en {\n        logoUrl\n      }\n    }\n  }\n  createdAt\n  updatedAt\n}\n\nquery attendees($after: ObjectId, $first: Int, $conferenceSlug: String!, $passive: Boolean, $sectionIds: [ObjectId!]) {\n  attendees(\n    after: $after\n    first: $first\n    conferenceSlug: $conferenceSlug\n    passive: $passive\n    sectionIds: $sectionIds\n  ) {\n    totalCount\n    edges {\n      cursor\n      node {\n        ...Attendee\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nquery attendee($id: ObjectId!) {\n  attendee(id: $id) {\n    ...Attendee\n  }\n}\n\nquery attendeesCsvExport($slug: String!) {\n  attendeesCsvExport(slug: $slug) {\n    ...Attendee\n  }\n}\n\nquery textSearchAttendee($text: String!) {\n  textSearchAttendee(text: $text) {\n    id\n    user {\n      ... on AttendeeUser {\n        id\n        name\n        email\n      }\n      ... on User {\n        id\n        name\n        email\n      }\n    }\n  }\n}\n\nmutation updateInvoice($id: ObjectId!, $data: InvoiceInput!) {\n  updateInvoice(id: $id, data: $data) {\n    message\n    data {\n      ...Attendee\n    }\n  }\n}\n\nmutation deleteAttendee($id: ObjectId!) {\n  deleteAttendee(id: $id) {\n    message\n    data {\n      ...Attendee\n    }\n  }\n}\n\nmutation removeAuthor($id: ObjectId!, $authorId: ObjectId!) {\n  removeAuthor(id: $id, authorId: $authorId) {\n    message\n    data {\n      ...Submission\n    }\n  }\n}"): typeof import('./graphql').AttendeeFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment Address on Address {\n  street\n  city\n  postal\n  country\n}\n\nfragment Billing on Billing {\n  name\n  address {\n    ...Address\n  }\n  ICO\n  ICDPH\n  DIC\n}\n\nfragment User on User {\n  id\n  name\n  email\n  organization\n  telephone\n  role\n  verified\n  createdAt\n  updatedAt\n  billings {\n    ...Billing\n  }\n}\n\nquery me {\n  me {\n    ...User\n  }\n}\n\nmutation login($email: String!, $password: String!) {\n  login(email: $email, password: $password) {\n    message\n    data {\n      ...User\n      token\n    }\n  }\n}\n\nmutation googleSignIn($authCode: String!) {\n  googleSignIn(authCode: $authCode) {\n    message\n    data {\n      ...User\n      token\n    }\n  }\n}\n\nquery forgotPassword($email: String!) {\n  forgotPassword(email: $email)\n}\n\nmutation passwordReset($data: PasswordInput!) {\n  passwordReset(data: $data) {\n    message\n    data {\n      ...User\n      token\n    }\n  }\n}\n\nmutation register($data: RegisterInput!) {\n  register(data: $data) {\n    message\n    data {\n      ...User\n      token\n    }\n  }\n}\n\nmutation resendActivationLink {\n  resendActivationLink\n}\n\nmutation activateUser {\n  activateUser {\n    message\n    data {\n      ...User\n      token\n    }\n  }\n}\n\nquery impersonate($id: ObjectId!) {\n  user(id: $id) {\n    id\n    token\n  }\n}"): typeof import('./graphql').AddressFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment Invoice on Invoice {\n  body {\n    body\n    comment\n    dueDate\n    issueDate\n    price\n    type\n    vat\n    vatDate\n  }\n  issuer {\n    name\n    address {\n      ...Address\n    }\n    ICO\n    ICDPH\n    DIC\n    stampUrl\n    variableSymbol\n    IBAN\n    SWIFT\n  }\n  payer {\n    ...Billing\n  }\n}\n\nfragment Section on Section {\n  id\n  conference\n  translations {\n    sk {\n      name\n      topic\n    }\n    en {\n      name\n      topic\n    }\n  }\n}\n\nfragment Ticket on Ticket {\n  id\n  online\n  price\n  withSubmission\n  translations {\n    en {\n      name\n      description\n    }\n    sk {\n      name\n      description\n    }\n  }\n}\n\nfragment Conference on Conference {\n  id\n  slug\n  translations {\n    sk {\n      name\n      logoUrl\n    }\n    en {\n      name\n      logoUrl\n    }\n  }\n  dates {\n    start\n    end\n    regEnd\n    submissionDeadline\n  }\n  createdAt\n  updatedAt\n}\n\nfragment ConferenceRegistration on Conference {\n  ...Conference\n  sections {\n    ...Section\n  }\n  tickets {\n    ...Ticket\n  }\n}\n\nquery conferences($after: ObjectId, $first: Int) {\n  conferences(after: $after, first: $first) {\n    totalCount\n    edges {\n      cursor\n      node {\n        ...Conference\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nquery conference($slug: String!) {\n  conference(slug: $slug) {\n    ...Conference\n    sections {\n      ...Section\n    }\n    tickets {\n      ...Ticket\n    }\n    attending {\n      ...Attendee\n    }\n  }\n}\n\nquery textSearchConference($text: String!) {\n  textSearchConference(text: $text) {\n    ...Conference\n  }\n}\n\nmutation createConference($data: ConferenceInput!) {\n  createConference(data: $data) {\n    message\n  }\n}\n\nmutation deleteConference($id: ObjectId!) {\n  deleteConference(id: $id) {\n    message\n    data {\n      slug\n      translations {\n        sk {\n          logoUrl\n        }\n        en {\n          logoUrl\n        }\n      }\n      billing {\n        stampUrl\n      }\n    }\n  }\n}\n\nmutation updateConferenceDates($slug: String!, $data: DatesInput!) {\n  updateConferenceDates(slug: $slug, data: $data) {\n    message\n    data {\n      slug\n      translations {\n        sk {\n          name\n        }\n        en {\n          name\n        }\n      }\n    }\n  }\n}\n\nmutation createSection($data: SectionInput!) {\n  createSection(data: $data) {\n    message\n  }\n}\n\nmutation updateSection($id: ObjectId!, $data: SectionInput!) {\n  updateSection(id: $id, data: $data) {\n    message\n  }\n}\n\nmutation deleteSection($id: ObjectId!) {\n  deleteSection(id: $id)\n}\n\nmutation createTicket($slug: String!, $data: TicketInput!) {\n  createTicket(slug: $slug, data: $data) {\n    message\n  }\n}\n\nmutation updateTicket($slug: String!, $ticketId: ObjectId!, $data: TicketInput!) {\n  updateTicket(slug: $slug, ticketId: $ticketId, data: $data) {\n    message\n  }\n}\n\nmutation deleteTicket($slug: String!, $ticketId: ObjectId!) {\n  deleteTicket(slug: $slug, ticketId: $ticketId)\n}\n\nmutation addAttendee($data: AttendeeInput!) {\n  addAttendee(data: $data) {\n    message\n  }\n}"): typeof import('./graphql').InvoiceFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment Submission on Submission {\n  id\n  translations {\n    sk {\n      name\n      abstract\n      keywords\n    }\n    en {\n      name\n      abstract\n      keywords\n    }\n  }\n  authors {\n    id\n    name\n    email\n  }\n  fileUrl\n  conference {\n    id\n    slug\n  }\n  section {\n    ...Section\n  }\n  createdAt\n  updatedAt\n}\n\nquery submission($id: ObjectId!) {\n  submission(id: $id) {\n    ...Submission\n  }\n}\n\nmutation createSubmission($data: SubmissionInput!) {\n  createSubmission(data: $data) {\n    message\n    data {\n      ...Submission\n    }\n  }\n}\n\nmutation updateSubmission($id: ObjectId!, $data: SubmissionInput!) {\n  updateSubmission(id: $id, data: $data) {\n    message\n    data {\n      ...Submission\n    }\n  }\n}\n\nmutation deleteSubmission($id: ObjectId!) {\n  deleteSubmission(id: $id) {\n    message\n    data {\n      ...Submission\n    }\n  }\n}"): typeof import('./graphql').SubmissionFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query users($after: ObjectId, $first: Int) {\n  users(after: $after, first: $first) {\n    totalCount\n    edges {\n      cursor\n      node {\n        id\n        name\n        email\n        organization\n        verified\n        role\n        createdAt\n        updatedAt\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nquery user($id: ObjectId!) {\n  user(id: $id) {\n    ...User\n  }\n}\n\nquery textSearchUser($text: String!) {\n  textSearchUser(text: $text) {\n    id\n    name\n    email\n  }\n}\n\nmutation updateUser($id: ObjectId!, $data: UserInput!) {\n  updateUser(id: $id, data: $data) {\n    message\n    data {\n      ...User\n    }\n  }\n}\n\nmutation toggleVerifiedUser($id: ObjectId!) {\n  toggleVerifiedUser(id: $id) {\n    message\n    data {\n      ...User\n    }\n  }\n}\n\nmutation deleteUser($id: ObjectId!) {\n  deleteUser(id: $id) {\n    message\n    data {\n      ...User\n    }\n  }\n}"): typeof import('./graphql').UsersDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
