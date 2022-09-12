import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id
      name
      email
      role
      active
      organisation
      telephone
      billings {
        id
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

export const ME = gql`
  query me {
    me {
      id
      name
      email
      organisation
      telephone
      role
      active
      billings {
        id
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

export const REGISTER = gql`
  mutation register($data: RegisterInput!) {
    register(data: $data) {
      id
      name
      email
      organisation
      telephone
      role
      active
      billings {
        id
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

export const LOG_OUT = gql`
  mutation logout {
    logout
  }
`;
