import { gql } from '@apollo/client';

// Get all feedbacks with pagination
export const GET_FEEDBACKS = gql`
  query Feedbacks($pagination: PaginationInput) {
    feedbacks(pagination: $pagination) {
      id
      userId
      context
      content
      rate
      isRead
      createdAt
      updatedAt
      user {
        id
        firstName
        lastName
        email
        role
      }
    }
  }
`;

// Get single feedback
export const GET_FEEDBACK = gql`
  query Feedback($id: ID!) {
    feedback(id: $id) {
      id
      userId
      context
      content
      rate
      isRead
      createdAt
      updatedAt
      user {
        id
        firstName
        lastName
        email
        role
      }
    }
  }
`;

// Submit feedback
export const SUBMIT_FEEDBACK_MUTATION = gql`
  mutation SubmitFeedback($input: SubmitFeedbackInput!) {
    submitFeedback(input: $input) {
      id
      userId
      context
      content
      rate
      isRead
      createdAt
      updatedAt
    }
  }
`;

// Submit feedback anonymously
export const SUBMIT_FEEDBACK_ANONYMOUSLY_MUTATION = gql`
  mutation SubmitFeedbackAnonymously($input: SubmitFeedbackInput!) {
    submitFeedbackAnonymously(input: $input) {
      id
      userId
      context
      content
      rate
      isRead
      createdAt
      updatedAt
    }
  }
`;

// Mark feedback as read
export const MARK_AS_READ_FEEDBACK_MUTATION = gql`
  mutation MarkAsReadFeedback($id: ID!) {
    markAsReadFeedback(id: $id) {
      id
      userId
      context
      content
      rate
      isRead
      createdAt
      updatedAt
    }
  }
`;

// Mark all feedbacks as read
export const MARK_AS_READ_ALL_FEEDBACKS_MUTATION = gql`
  mutation MarkAsReadAllFeedbacks {
    markAsReadAllFeedbacks
  }
`;

// Delete feedback
export const DELETE_FEEDBACK_MUTATION = gql`
  mutation DeleteFeedback($id: ID!) {
    deleteFeedback(id: $id)
  }
`;