import { Msg } from '../email.service';

interface Address {
  street: string;
  city: string;
  postal: string;
  country: string;
}

interface Billing {
  name: string;
  address: Address;
  ICO: string;
  DIC: string;
  ICDPH: string;
  variableSymbol?: string;
  IBAN?: string;
  SWIFT?: string;
  stampUrl?: string;
}

interface InvoiceBody {
  issueDate: Date;
  vatDate: Date;
  dueDate: Date;
  price: number;
  vat: number;
  body: string;
  comment: string;
}

interface Invoice {
  payer: Billing;
  issuer: Billing;
  body: InvoiceBody;
}

export interface InvoiceMsg extends Msg {
  conferenceName: string;
  conferenceLogo: string;
  invoice: Invoice;
}
