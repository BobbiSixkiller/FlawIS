/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

/**
 * User role inside the FLAWIS system
 */
export enum Role {
  Admin = "Admin",
  Basic = "Basic",
}

/**
 * New user input data
 */
export interface RegisterInput {
  password: string;
  name: string;
  email: string;
  organisation: string;
  telephone: string;
}

/**
 * User update input data
 */
export interface UserInput {
  name: string;
  email: string;
  organisation: string;
  telephone: string;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
