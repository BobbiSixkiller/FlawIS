/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RegisterInput, Role } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: register
// ====================================================

export interface register_register_billings_address {
  __typename: "Address";
  street: string;
  city: string;
  postal: string;
  country: string;
}

export interface register_register_billings {
  __typename: "Billing";
  id: any | null;
  name: string;
  address: register_register_billings_address;
  ICO: string;
  DIC: string;
  ICDPH: string;
  IBAN: string | null;
  SWIFT: string | null;
}

export interface register_register {
  __typename: "User";
  id: any;
  name: string;
  email: string;
  organisation: string;
  telephone: string | null;
  role: Role;
  active: boolean;
  billings: register_register_billings[];
}

export interface register {
  register: register_register;
}

export interface registerVariables {
  data: RegisterInput;
}
