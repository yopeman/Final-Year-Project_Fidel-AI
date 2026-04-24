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

// Skill Test Queries and Mutations
export const GET_TUTOR_ASSIGNED_STUDENTS = gql`
  query TutorAssignedStudents($batchId: ID!) {
    tutorAssignedStudents(batchId: $batchId) {
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
      skill {
        id
        enrollmentId
        instructorId
        finalResult
        createdAt
        updatedAt
        isDeleted
        deletedAt
        speakingSkill {
          id
          skillId
          pronunciation
          fluency
          grammar
          vocabulary
          coherence
          finalResult
          createdAt
          updatedAt
          isDeleted
          deletedAt
        }
        readingSkill {
          id
          skillId
          comprehension
          speed
          vocabulary
          finalResult
          createdAt
          updatedAt
          isDeleted
          deletedAt
        }
        writingSkill {
          id
          skillId
          coherence
          grammar
          vocabulary
          punctuation
          finalResult
          createdAt
          updatedAt
          isDeleted
          deletedAt
        }
        listeningSkill {
          id
          skillId
          comprehension
          retention
          interpretation
          finalResult
          createdAt
          updatedAt
          isDeleted
          deletedAt
        }
        certificate {
          id
          skillId
          result
          createdAt
          updatedAt
          isDeleted
          deletedAt
        }
      }
    }
  }
`;

export const GET_EXAM_LINK = gql`
  query GetExamLink($enrollmentId: ID!) {
    getExamLink(enrollmentId: $enrollmentId)
  }
`;

export const CREATE_SKILL = gql`
  mutation CreateSkill($input: CreateSkillInput!) {
    createSkill(input: $input) {
      id
      enrollmentId
      instructorId
      finalResult
      createdAt
      updatedAt
      isDeleted
      deletedAt
      enrollment {
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
      instructor {
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
      certificate {
        id
        skillId
        result
        createdAt
        updatedAt
        isDeleted
        deletedAt
      }
      speakingSkill {
        id
        skillId
        pronunciation
        fluency
        grammar
        vocabulary
        coherence
        finalResult
        createdAt
        updatedAt
        isDeleted
        deletedAt
      }
      readingSkill {
        id
        skillId
        comprehension
        speed
        vocabulary
        finalResult
        createdAt
        updatedAt
        isDeleted
        deletedAt
      }
      writingSkill {
        id
        skillId
        coherence
        grammar
        vocabulary
        punctuation
        finalResult
        createdAt
        updatedAt
        isDeleted
        deletedAt
      }
      listeningSkill {
        id
        skillId
        comprehension
        retention
        interpretation
        finalResult
        createdAt
        updatedAt
        isDeleted
        deletedAt
      }
    }
  }
`;

export const UPDATE_SKILL = gql`
  mutation UpdateSkill($id: ID!, $input: UpdateSkillInput!) {
    updateSkill(id: $id, input: $input) {
      id
      enrollmentId
      instructorId
      finalResult
      createdAt
      updatedAt
      isDeleted
      deletedAt
      enrollment {
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
      instructor {
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
      certificate {
        id
        skillId
        result
        createdAt
        updatedAt
        isDeleted
        deletedAt
      }
      speakingSkill {
        id
        skillId
        pronunciation
        fluency
        grammar
        vocabulary
        coherence
        finalResult
        createdAt
        updatedAt
        isDeleted
        deletedAt
      }
      readingSkill {
        id
        skillId
        comprehension
        speed
        vocabulary
        finalResult
        createdAt
        updatedAt
        isDeleted
        deletedAt
      }
      writingSkill {
        id
        skillId
        coherence
        grammar
        vocabulary
        punctuation
        finalResult
        createdAt
        updatedAt
        isDeleted
        deletedAt
      }
      listeningSkill {
        id
        skillId
        comprehension
        retention
        interpretation
        finalResult
        createdAt
        updatedAt
        isDeleted
        deletedAt
      }
    }
  }
`;

export const SEND_EXAM_LINK = gql`
  mutation SendExamLink($input: SendExamLinkInput!) {
    sendExamLink(input: $input)
  }
`;

export const GENERATE_CERTIFICATE = gql`
  mutation GenerateCertificate($input: GenerateCertificateInput!) {
    generateCertificate(input: $input) {
      id
      skillId
      result
      certificateHtml
      createdAt
      updatedAt
      isDeleted
      deletedAt
      skill {
        id
        enrollmentId
        instructorId
        finalResult
        createdAt
        updatedAt
        isDeleted
        deletedAt
      }
    }
  }
`;

export const GET_CERTIFICATE = gql`
  query GetCertificate($certificateId: ID!) {
    certificate(id: $certificateId) {
      id
      skillId
      result
      certificateHtml
      createdAt
      updatedAt
      isDeleted
      deletedAt
    }
  }
`;

export const DELETE_CERTIFICATE = gql`
  mutation DeleteCertificate($id: ID!) {
    deleteCertificate(id: $id)
  }
`;
