import { gql } from '@apollo/client';

export const GET_COURSE_MEETING_LINK = gql`
  mutation GetCourseMeetingLink($courseScheduleId: ID!) {
    getCourseMeetingLink(courseScheduleId: $courseScheduleId) {
      attendance {
        id
        courseScheduleId
        userId
        userType
        status
        attendanceDate
        createdAt
        updatedAt
      }
      meetingLink
      remainingTimeMinutes
    }
  }
`;
