import { gql } from '@apollo/client';

export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    myNotifications {
      id
      userId
      title
      content
      isRead
      createdAt
      updatedAt
      isDeleted
      deletedAt
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

export const GET_NOTIFICATION = gql`
  query GetNotification($id: ID!) {
    notification(id: $id) {
      id
      userId
      title
      content
      isRead
      createdAt
      updatedAt
      isDeleted
      deletedAt
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

export const SEND_NOTIFICATION = gql`
  mutation SendNotification($input: SendNotificationInput!) {
    sendNotification(input: $input) {
      id
      userId
      title
      content
      isRead
      createdAt
      updatedAt
      isDeleted
      deletedAt
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

export const MARK_AS_READ_NOTIFICATION = gql`
  mutation MarkAsReadNotification($id: ID!) {
    markAsReadNotification(id: $id) {
      id
      userId
      title
      content
      isRead
      createdAt
      updatedAt
      isDeleted
      deletedAt
    }
  }
`;

export const MARK_AS_READ_ALL_NOTIFICATIONS = gql`
  mutation MarkAsReadAllNotifications {
    markAsReadAllNotifications
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`;