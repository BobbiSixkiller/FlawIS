/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserInput, Role } from "./../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: updateUser
// ====================================================

export interface updateUser_updateUser_billings_address {
  __typename: "Address";
  street: string;
  city: string;
  postal: string;
  country: string;
}

export interface updateUser_updateUser_billings {
  __typename: "Billing";
  id: any | null;
  name: string;
  address: updateUser_updateUser_billings_address;
  ICO: string;
  DIC: string;
  ICDPH: string;
  IBAN: string | null;
  SWIFT: string | null;
}

export interface updateUser_updateUser {
  __typename: "User";
  id: any;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  organisation: string;
  telephone: string | null;
  billings: updateUser_updateUser_billings[];
}

export interface updateUser {
  updateUser: updateUser_updateUser;
}

export interface updateUserVariables {
  id: any;
  data: UserInput;
}
