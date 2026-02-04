import { gql } from '@apollo/client';

// Batch Queries
export const GET_BATCHES = gql`
  query GetBatches {
    batches {
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
      batchCourses {
        id
        courseId
        course {
          id
          name
          description
        }
      }
      enrollments {
        id
        profileId
        enrollmentDate
        status
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
      instructors {
        id
        userId
        role
        user {
          id
          firstName
          lastName
          email
        }
      }
    }
  }
`;

export const GET_BATCH = gql`
  query GetBatch($id: ID!) {
    batch(id: $id) {
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
      batchCourses {
        id
        courseId
        course {
          id
          name
          description
        }
      }
      enrollments {
        id
        profileId
        enrollmentDate
        status
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
      instructors {
        id
        userId
        role
        user {
          id
          firstName
          lastName
          email
        }
      }
    }
  }
`;

// Batch Mutations
export const CREATE_BATCH = gql`
  mutation CreateBatch($input: CreateBatchInput!) {
    createBatch(input: $input) {
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
`;

export const UPDATE_BATCH = gql`
  mutation UpdateBatch($id: ID!, $input: UpdateBatchInput!) {
    updateBatch(id: $id, input: $input) {
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
`;

export const DELETE_BATCH = gql`
  mutation DeleteBatch($id: ID!) {
    deleteBatch(id: $id)
  }
`;

// Batch Course Queries
export const GET_BATCH_COURSES = gql`
  query GetBatchCourses($batchId: ID!) {
    batchCourses(batchId: $batchId) {
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
      }
      course {
        id
        name
        description
      }
      schedules {
        id
        scheduleId
        createdAt
        updatedAt
        isDeleted
        deletedAt
        schedule {
          id
          dayOfWeek
          startTime
          endTime
        }
      }
      quizzes {
        id
        question
        answer
        type
        createdAt
        updatedAt
        isDeleted
        deletedAt
      }
      instructors {
        id
        userId
        role
        createdAt
        updatedAt
        isDeleted
        deletedAt
        user {
          id
          firstName
          lastName
          email
        }
      }
    }
  }
`;

export const GET_BATCH_COURSE = gql`
  query GetBatchCourse($id: ID!) {
    batchCourse(id: $id) {
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
      }
      course {
        id
        name
        description
      }
      schedules {
        id
        scheduleId
        createdAt
        updatedAt
        isDeleted
        deletedAt
        schedule {
          id
          dayOfWeek
          startTime
          endTime
        }
      }
      quizzes {
        id
        question
        answer
        type
        createdAt
        updatedAt
        isDeleted
        deletedAt
      }
      instructors {
        id
        userId
        role
        createdAt
        updatedAt
        isDeleted
        deletedAt
        user {
          id
          firstName
          lastName
          email
        }
      }
    }
  }
`;

// Batch Course Mutations
export const CREATE_BATCH_COURSE = gql`
  mutation CreateBatchCourse($input: CreateBatchCourseInput!) {
    createBatchCourse(input: $input) {
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
      }
      course {
        id
        name
        description
      }
    }
  }
`;

export const UPDATE_BATCH_COURSE = gql`
  mutation UpdateBatchCourse($id: ID!, $input: UpdateBatchCourseInput!) {
    updateBatchCourse(id: $id, input: $input) {
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
      }
      course {
        id
        name
        description
      }
    }
  }
`;

export const DELETE_BATCH_COURSE = gql`
  mutation DeleteBatchCourse($id: ID!) {
    deleteBatchCourse(id: $id)
  }
`;

// Instructor Queries
export const GET_INSTRUCTORS = gql`
  query GetInstructors($batchId: ID) {
    instructors(batchId: $batchId) {
      id
      userId
      batchCourseId
      role
      createdAt
      updatedAt
      isDeleted
      deletedAt
      user {
        id
        firstName
        lastName
        email
        isVerified
      }
      batchCourse {
        id
        batchId
        courseId
        batch {
          id
          name
        }
        course {
          id
          name
        }
      }
    }
  }
`;

export const GET_INSTRUCTOR = gql`
  query GetInstructor($id: ID!) {
    instructor(id: $id) {
      id
      userId
      batchCourseId
      role
      createdAt
      updatedAt
      isDeleted
      deletedAt
      user {
        id
        firstName
        lastName
        email
        isVerified
      }
      batchCourse {
        id
        batchId
        courseId
        batch {
          id
          name
        }
        course {
          id
          name
        }
      }
    }
  }
`;

// Instructor Mutations
export const CREATE_INSTRUCTOR = gql`
  mutation CreateInstructor($input: CreateBatchInstructorInput!) {
    createInstructor(input: $input) {
      id
      userId
      batchCourseId
      role
      createdAt
      updatedAt
      isDeleted
      deletedAt
      user {
        id
        firstName
        lastName
        email
        isVerified
      }
      batchCourse {
        id
        batchId
        courseId
        batch {
          id
          name
        }
        course {
          id
          name
        }
      }
    }
  }
`;

export const UPDATE_INSTRUCTOR = gql`
  mutation UpdateInstructor($id: ID!, $input: UpdateBatchInstructorInput!) {
    updateInstructor(id: $id, input: $input) {
      id
      userId
      batchCourseId
      role
      createdAt
      updatedAt
      isDeleted
      deletedAt
      user {
        id
        firstName
        lastName
        email
        isVerified
      }
      batchCourse {
        id
        batchId
        courseId
        batch {
          id
          name
        }
        course {
          id
          name
        }
      }
    }
  }
`;

export const DELETE_INSTRUCTOR = gql`
  mutation DeleteInstructor($id: ID!) {
    deleteInstructor(id: $id)
  }
`;

// Enrollment Queries
export const GET_ENROLLMENTS = gql`
  query GetEnrollments($batchId: ID!) {
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
        user {
          id
          firstName
          lastName
          email
          isVerified
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
          evaluator {
            id
            firstName
            lastName
            email
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

export const GET_ENROLLMENT = gql`
  query GetEnrollment($id: ID!) {
    enrollment(id: $id) {
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
        user {
          id
          firstName
          lastName
          email
          isVerified
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
          evaluator {
            id
            firstName
            lastName
            email
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

// Enrollment Mutations
export const CREATE_ENROLLMENT = gql`
  mutation CreateEnrollment($batchId: ID!) {
    createEnrollment(batchId: $batchId) {
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
        user {
          id
          firstName
          lastName
          email
          isVerified
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
      }
    }
  }
`;

export const UPDATE_ENROLLMENT = gql`
  mutation UpdateEnrollment($id: ID!, $input: UpdateEnrollmentInput!) {
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
        user {
          id
          firstName
          lastName
          email
          isVerified
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
      }
    }
  }
`;

export const DELETE_ENROLLMENT = gql`
  mutation DeleteEnrollment($id: ID!) {
    deleteEnrollment(id: $id)
  }
`;

// Course Schedule Queries
export const GET_COURSE_SCHEDULES = gql`
  query GetCourseSchedules($batchCourseId: ID) {
    courseSchedules(batchCourseId: $batchCourseId) {
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
        batch {
          id
          name
        }
        course {
          id
          name
        }
      }
      attendances {
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
        user {
          id
          firstName
          lastName
          email
          role
        }
      }
    }
  }
`;

export const GET_COURSE_SCHEDULE = gql`
  query GetCourseSchedule($id: ID!) {
    courseSchedule(id: $id) {
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
        batch {
          id
          name
        }
        course {
          id
          name
        }
      }
      attendances {
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
        user {
          id
          firstName
          lastName
          email
          role
        }
      }
    }
  }
`;

// Course Schedule Mutations
export const CREATE_COURSE_SCHEDULE = gql`
  mutation CreateCourseSchedule($input: CreateCourseScheduleInput!) {
    createCourseSchedule(input: $input) {
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
        batch {
          id
          name
        }
        course {
          id
          name
        }
      }
    }
  }
`;

export const UPDATE_COURSE_SCHEDULE = gql`
  mutation UpdateCourseSchedule($id: ID!, $input: UpdateCourseScheduleInput!) {
    updateCourseSchedule(id: $id, input: $input) {
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
        batch {
          id
          name
        }
        course {
          id
          name
        }
      }
    }
  }
`;

export const DELETE_COURSE_SCHEDULE = gql`
  mutation DeleteCourseSchedule($id: ID!) {
    deleteCourseSchedule(id: $id)
  }
`;