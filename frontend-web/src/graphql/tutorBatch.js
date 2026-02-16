import { gql } from '@apollo/client';

// Tutor Batch Queries - based on the provided Me query structure
export const GET_TUTOR_BATCHES = gql`
  query Me {
    me {
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
            enrollments {
              id
              profileId
              batchId
              enrollmentDate
              completionDate
              status
              createdAt
              updatedAt
              isDeleted
              deletedAt
              profile {
                id
                userId
                ageRange
                proficiency
                nativeLanguage
                learningGoal
                targetDuration
                durationUnit
                constraints
                aiLearningPlan
                createdAt
                updatedAt
                isDeleted
                deletedAt
                user {
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
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Additional batch queries for detailed operations
export const GET_BATCH_ENROLLMENTS = gql`
  query GetBatchEnrollments($batchId: ID!) {
    enrollments(batchId: $batchId) {
      id
      profileId
      batchId
      enrollmentDate
      completionDate
      status
      createdAt
      updatedAt
      isDeleted
      deletedAt
      profile {
        id
        userId
        ageRange
        proficiency
        nativeLanguage
        learningGoal
        targetDuration
        durationUnit
        constraints
        aiLearningPlan
        createdAt
        updatedAt
        isDeleted
        deletedAt
        user {
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
      quizResults {
        id
        enrollmentId
        quizId
        score
        createdAt
        updatedAt
        isDeleted
        deletedAt
        quiz {
          id
          question
          answer
          type
          createdAt
          updatedAt
          isDeleted
          deletedAt
        }
      }
      skillResults {
        id
        enrollmentId
        skillId
        score
        createdAt
        updatedAt
        isDeleted
        deletedAt
        skillTest {
          id
          evaluatorId
          type
          createdAt
          updatedAt
          isDeleted
          deletedAt
          evaluator {
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
          }
        }
      }
      payments {
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
        isDeleted
        deletedAt
      }
      certificates {
        id
        enrollmentId
        result
        certificateHtml
        createdAt
        updatedAt
        isDeleted
        deletedAt
      }
    }
  }
`;

export const GET_BATCH_ATTENDANCE = gql`
  query GetBatchAttendance($batchId: ID!) {
    attendances(batchId: $batchId) {
      id
      courseScheduleId
      userId
      userType
      status
      attendanceDate
      createdAt
      updatedAt
      isDeleted
      deletedAt
      courseSchedule {
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
        batchCourse {
          id
          batchId
          courseId
          createdAt
          updatedAt
          isDeleted
          deletedAt
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
          course {
            id
            name
            description
            createdAt
            updatedAt
            isDeleted
            deletedAt
          }
        }
      }
      user {
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
      }
    }
  }
`;

// Batch Management Mutations
export const UPDATE_ENROLLMENT_STATUS = gql`
  mutation UpdateEnrollmentStatus($id: ID!, $input: UpdateEnrollmentInput!) {
    updateEnrollment(id: $id, input: $input) {
      id
      profileId
      batchId
      enrollmentDate
      completionDate
      status
      createdAt
      updatedAt
      isDeleted
      deletedAt
      profile {
        id
        userId
        ageRange
        proficiency
        nativeLanguage
        learningGoal
        targetDuration
        durationUnit
        constraints
        aiLearningPlan
        createdAt
        updatedAt
        isDeleted
        deletedAt
        user {
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
    }
  }
`;

export const MARK_ATTENDANCE = gql`
  mutation MarkAttendance($courseScheduleId: ID!) {
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
        isDeleted
        deletedAt
      }
      meetingLink
      remainingTimeMinutes
    }
  }
`;

export const MARK_BATCH_ATTENDANCE = gql`
  mutation MarkBatchAttendance($batchId: ID!) {
    getBatchMeetingLink(batchId: $batchId) {
      attendance {
        id
        courseScheduleId
        userId
        userType
        status
        attendanceDate
        createdAt
        updatedAt
        isDeleted
        deletedAt
      }
      meetingLink
      remainingTimeMinutes
    }
  }
`;

// Meeting Link Query
export const GET_BATCH_MEETING_LINK = gql`
  mutation GetBatchMeetingLink($batchId: ID!) {
    getBatchMeetingLink(batchId: $batchId) {
      attendance {
        id
        courseScheduleId
        userId
        userType
        status
        attendanceDate
        createdAt
        updatedAt
        isDeleted
        deletedAt
      }
      meetingLink
      remainingTimeMinutes
    }
  }
`;

// Helper queries for batch statistics
export const GET_BATCH_STATISTICS = gql`
  query GetBatchStatistics($batchId: ID!) {
    batch(id: $batchId) {
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
      enrollments {
        id
        profileId
        batchId
        enrollmentDate
        completionDate
        status
        createdAt
        updatedAt
        isDeleted
        deletedAt
        profile {
          id
          userId
          ageRange
          proficiency
          nativeLanguage
          learningGoal
          targetDuration
          durationUnit
          constraints
          aiLearningPlan
          createdAt
          updatedAt
          isDeleted
          deletedAt
          user {
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
          }
        }
      }
    }
  }
`;