import { gql } from '@apollo/client';

export const ME_QUERY = gql`
  query Me {
    me {
      id
      firstName
      lastName
      email
      password
      role
      isVerified
      accessToken
      refreshToken
      createdAt
      updatedAt
      isDeleted
      deletedAt
      batchInstructors {
        id
        userId
        batchCourseId
        role
        createdAt
        updatedAt
        isDeleted
        deletedAt
        batchCourse {
          id
          batchId
          courseId
          createdAt
          updatedAt
          isDeleted
          deletedAt
          course {
            id
            name
            description
            createdAt
            updatedAt
            isDeleted
            deletedAt
            materials {
              id
              courseId
              name
              description
              createdAt
              updatedAt
              isDeleted
              deletedAt
              files {
                id
                materialId
                fileName
                filePath
                fileExtension
                fileSize
                createdAt
                updatedAt
                isDeleted
                deletedAt
              }
            }
          }
          batch {
            id
            name
            description
            level
            language
            startDate
            endDate
            maxStudents
            status
            feeAmount
            createdAt
            updatedAt
            isDeleted
            deletedAt
          }
          schedules {
            id
            scheduleId
            batchCourseId
            createdAt
            updatedAt
            isDeleted
            deletedAt
            schedule {
              id
              dayOfWeek
              startTime
              endTime
              createdAt
              updatedAt
              isDeleted
              deletedAt
            }
          }
        }
      }
    }
  }
`;
