import { gql } from '@apollo/client';

export const GET_PAYMENTS = gql`
  query GetPayments($enrollmentId: ID, $status: PaymentStatus) {
    payments(enrollmentId: $enrollmentId, status: $status) {
      id
      enrollmentId
      amount
      currency
      method
      status
      paidAt
      transactionId
      checkoutUrl
      receiptUrl
      createdAt
      updatedAt
      enrollment {
        id
        status
        batch {
          id
          name
          feeAmount
        }
        profile {
          id
          user {
            id
            firstName
            lastName
            email
          }
        }
      }
    }
  }
`;

export const GET_PAYMENT = gql`
  query GetPayment($id: ID!) {
    payment(id: $id) {
      id
      enrollmentId
      amount
      currency
      method
      status
      paidAt
      transactionId
      checkoutUrl
      receiptUrl
      createdAt
      updatedAt
      enrollment {
        id
        status
        batch {
          id
          name
          feeAmount
        }
        profile {
          id
          user {
            id
            firstName
            lastName
            email
          }
        }
      }
    }
  }
`;

export const MAKE_PAYMENT = gql`
  mutation MakePayment($enrollmentId: ID!) {
    makePayment(enrollmentId: $enrollmentId) {
      id
      enrollmentId
      amount
      currency
      method
      status
      paidAt
      transactionId
      checkoutUrl
      receiptUrl
      createdAt
      updatedAt
    }
  }
`;

export const CANCEL_PAYMENT = gql`
  mutation CancelPayment($id: ID!) {
    cancelPayment(id: $id) {
      id
      enrollmentId
      amount
      currency
      method
      status
      paidAt
      transactionId
      checkoutUrl
      receiptUrl
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PAYMENT = gql`
  mutation DeletePayment($id: ID!) {
    deletePayment(id: $id)
  }
`;
