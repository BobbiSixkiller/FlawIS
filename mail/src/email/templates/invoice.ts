import { Msg } from '../email.service';

export interface Address {
  street: string;
  city: string;
  postal: string;
  country: string;
}

export interface Billing {
  name: string;
  address: Address;
  ICO?: string;
  DIC?: string;
  ICDPH?: string;
}

export interface InvoiceIssuer extends Billing {
  ICO: string;
  DIC: string;
  ICDPH: string;
  variableSymbol: string;
  IBAN: string;
  SWIFT: string;
}

export interface InvoiceBody {
  type: string;
  issueDate: Date;
  vatDate: Date;
  dueDate: Date;
  price: number;
  vat: number;
  body: string;
  comment: string;
}

export interface Invoice {
  payer: Billing;
  issuer: InvoiceIssuer;
  body: InvoiceBody;
}

export interface InvoiceMsg extends Msg {
  conferenceName: string;
  conferenceLogo: string;
  invoice: Invoice;
}
