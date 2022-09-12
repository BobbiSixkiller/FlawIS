/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Role } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: login
// ====================================================

export interface login_login_billings_address {
  __typename: "Address";
  street: string;
  city: string;
  postal: string;
  country: string;
}

export interface login_login_billings {
  __typename: "Billing";
  id: any | null;
  name: string;
  address: login_login_billings_address;
  ICO: string;
  DIC: string;
  ICDPH: string;
  IBAN: string | null;
  SWIFT: string | null;
}

export interface login_login {
  __typename: "User";
  id: any;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  organisation: string;
  telephone: string | null;
  billings: login_login_billings[];
}

export interface login {
  login: login_login;
}

export interface loginVariables {
  email: string;
  password: string;
}
