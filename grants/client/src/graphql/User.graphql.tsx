import { gql } from "@apollo/client";

export const UPDATE_USER = gql`
  mutation updateUser($id: ObjectId!, $data: UserInput!) {
    updateUser(id: $id, data: $data) {
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
