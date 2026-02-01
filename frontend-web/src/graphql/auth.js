import { gql } from '@apollo/client';

// Register mutation - NO role field in frontend
export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      success
      message
      user {
        id
        email
        role
        firstName
        lastName
        profileImage
        createdAt
      }
    }
  }
`;

// Login mutation
export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        role
        firstName
        lastName
        profileImage
        createdAt
      }
    }
  }
`;

// Get current user
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      email
      role
      firstName
      lastName
      profileImage
      createdAt
    }
  }
`;

// Forgot password
export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      success
      message
    }
  }
`;

// Reset password
export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) {
      success
      message
    }
  }
`;

// Logout (if your backend supports it)
export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

// Update profile
export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      success
      message
      user {
        id
        email
        role
        firstName
        lastName
        profileImage
        createdAt
      }
    }
  }
`;

// Check if email exists
export const CHECK_EMAIL_EXISTS = gql`
  query CheckEmailExists($email: String!) {
    checkEmailExists(email: $email) {
      exists
    }
  }
`;