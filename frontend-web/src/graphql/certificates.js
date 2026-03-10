import { gql } from '@apollo/client';

export const GET_CERTIFICATES = gql`
  query Certificates($batchId: ID!) {
    certificates(batchId: $batchId) {
      id
      skillId
      result
      createdAt
      updatedAt
      isDeleted
      deletedAt
      skill {
        finalResult
        enrollment {
          profile {
            user {
              id
              firstName
              lastName
              email
              password
              role
              isVerified
              createdAt
              updatedAt
              isDeleted
              deletedAt
            }
          }
        }
        speakingSkill {
          finalResult
        }
        readingSkill {
          finalResult
        }
        writingSkill {
          finalResult
        }
        listeningSkill {
          finalResult
        }
      }
    }
  }
`;
