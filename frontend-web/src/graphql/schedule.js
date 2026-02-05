import { gql } from '@apollo/client';

export const GET_SCHEDULES = gql`
  query GetSchedules {
    schedules {
      id
      dayOfWeek
      startTime
      endTime
      createdAt
      updatedAt
    }
  }
`;

export const GET_SCHEDULE = gql`
  query GetSchedule($id: ID!) {
    schedule(id: $id) {
      id
      dayOfWeek
      startTime
      endTime
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_SCHEDULE = gql`
  mutation CreateSchedule($input: CreateScheduleInput!) {
    createSchedule(input: $input) {
      id
      dayOfWeek
      startTime
      endTime
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SCHEDULE = gql`
  mutation UpdateSchedule($id: ID!, $input: UpdateScheduleInput!) {
    updateSchedule(id: $id, input: $input) {
      id
      dayOfWeek
      startTime
      endTime
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_SCHEDULE = gql`
  mutation DeleteSchedule($id: ID!) {
    deleteSchedule(id: $id)
  }
`;