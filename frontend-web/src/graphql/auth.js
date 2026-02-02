import { gql } from '@apollo/client';

// Register mutation
export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input)
  }
`;

// Verify email
export const VERIFY_MUTATION = gql`
  mutation Verify($input: VerifyInput!) {
    verify(input: $input)
  }
`;

// Resend verification
export const RESEND_VERIFICATION_MUTATION = gql`
  mutation ResendVerification($input: ResendVerificationInput!) {
    resendVerification(input: $input)
  }
`;

// Login mutation
export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        firstName
        lastName
        email
        role
        isVerified
        createdAt
        updatedAt
      }
      accessToken
      refreshToken
    }
  }
`;

// Logout mutation
export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

// Refresh token
export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken
  }
`;

// Forgot password
export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgetPassword($input: ForgetPasswordInput!) {
    forgetPassword(input: $input)
  }
`;

// Password recovery
export const PASSWORD_RECOVERY_MUTATION = gql`
  mutation PasswordRecovery($input: PasswordRecoveryInput!) {
    passwordRecovery(input: $input) {
      user {
        id
        firstName
        lastName
        email
        role
        isVerified
        createdAt
        updatedAt
      }
      accessToken
      refreshToken
    }
  }
`;

// Get current user
export const GET_CURRENT_USER = gql`
  query Me {
    me {
      id
      firstName
      lastName
      email
      role
      isVerified
      createdAt
      updatedAt
      profile {
        id
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
      }
    }
  }
`;

// Get user by ID
export const GET_USER = gql`
  query User($id: ID!) {
    user(id: $id) {
      id
      firstName
      lastName
      email
      role
      isVerified
      createdAt
      updatedAt
    }
  }
`;

// Get users with pagination
export const GET_USERS = gql`
  query Users($pagination: PaginationInput) {
    users(pagination: $pagination) {
      id
      firstName
      lastName
      email
      role
      isVerified
      createdAt
      updatedAt
    }
  }
`;

// Update user (admin only)
export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      firstName
      lastName
      email
      role
      isVerified
      createdAt
      updatedAt
    }
  }
`;

// Update current user
export const UPDATE_ME_MUTATION = gql`
  mutation UpdateMe($input: UpdateMeInput!) {
    updateMe(input: $input) {
      id
      firstName
      lastName
      email
      role
      isVerified
      createdAt
      updatedAt
    }
  }
`;

// Delete user (admin only)
export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

// Delete current user
export const DELETE_ME_MUTATION = gql`
  mutation DeleteMe {
    deleteMe
  }
`;
