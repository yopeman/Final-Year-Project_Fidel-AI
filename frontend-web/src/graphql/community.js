import { gql } from '@apollo/client';

// Community Queries
export const GET_COMMUNITIES = gql`
  query GetCommunities($batchId: ID) {
    communities(batchId: $batchId) {
      id
      batchId
      userId
      content
      isEdited
      createdAt
      updatedAt
      isDeleted
      deletedAt
      batch {
        id
        name
      }
      user {
        id
        firstName
        lastName
        email
        role
      }
      reactions {
        id
        userId
        communityId
        reactionType
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
      comments {
        id
        communityId
        userId
        content
        isEdited
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
        reactions {
          id
          userId
          commentId
          reactionType
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
      attachments {
        id
        communityId
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
`;

export const GET_COMMUNITY = gql`
  query GetCommunity($id: ID!) {
    community(id: $id) {
      id
      batchId
      userId
      content
      isEdited
      createdAt
      updatedAt
      isDeleted
      deletedAt
      batch {
        id
        name
      }
      user {
        id
        firstName
        lastName
        email
        role
      }
      reactions {
        id
        userId
        communityId
        reactionType
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
      comments {
        id
        communityId
        userId
        content
        isEdited
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
        reactions {
          id
          userId
          commentId
          reactionType
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
      attachments {
        id
        communityId
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
`;

// Community Mutations
export const POST_COMMUNITY = gql`
  mutation PostCommunity($batchId: ID!, $content: String!) {
    postCommunity(batchId: $batchId, content: $content) {
      id
      batchId
      userId
      content
      isEdited
      createdAt
      updatedAt
      isDeleted
      deletedAt
      batch {
        id
        name
      }
      user {
        id
        firstName
        lastName
        email
        role
      }
      reactions {
        id
        userId
        communityId
        reactionType
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
      comments {
        id
        communityId
        userId
        content
        isEdited
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
        reactions {
          id
          userId
          commentId
          reactionType
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
      attachments {
        id
        communityId
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
`;

export const UPDATE_COMMUNITY = gql`
  mutation UpdateCommunity($id: ID!, $content: String!) {
    updateCommunity(id: $id, content: $content) {
      id
      batchId
      userId
      content
      isEdited
      createdAt
      updatedAt
      isDeleted
      deletedAt
      batch {
        id
        name
      }
      user {
        id
        firstName
        lastName
        email
        role
      }
      reactions {
        id
        userId
        communityId
        reactionType
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
      comments {
        id
        communityId
        userId
        content
        isEdited
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
        reactions {
          id
          userId
          commentId
          reactionType
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
      attachments {
        id
        communityId
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
`;

export const DELETE_COMMUNITY = gql`
  mutation DeleteCommunity($id: ID!) {
    deleteCommunity(id: $id)
  }
`;

// Community Reactions
export const POST_COMMUNITY_REACTION = gql`
  mutation PostCommunityReaction($communityId: ID!, $reactionType: ReactionType!) {
    postCommunityReaction(communityId: $communityId, reactionType: $reactionType) {
      id
      userId
      communityId
      reactionType
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
      community {
        id
        content
      }
    }
  }
`;

export const UPDATE_COMMUNITY_REACTION = gql`
  mutation UpdateCommunityReaction($id: ID!, $reactionType: ReactionType!) {
    updateCommunityReaction(id: $id, reactionType: $reactionType) {
      id
      userId
      communityId
      reactionType
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
      community {
        id
        content
      }
    }
  }
`;

export const DELETE_COMMUNITY_REACTION = gql`
  mutation DeleteCommunityReaction($id: ID!) {
    deleteCommunityReaction(id: $id)
  }
`;

// Comment Mutations
export const POST_COMMENT = gql`
  mutation PostComment($communityId: ID!, $content: String!) {
    postComment(communityId: $communityId, content: $content) {
      id
      communityId
      userId
      content
      isEdited
      createdAt
      updatedAt
      isDeleted
      deletedAt
      community {
        id
        content
      }
      user {
        id
        firstName
        lastName
        email
        role
      }
      reactions {
        id
        userId
        commentId
        reactionType
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

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($id: ID!, $content: String!) {
    updateComment(id: $id, content: $content) {
      id
      communityId
      userId
      content
      isEdited
      createdAt
      updatedAt
      isDeleted
      deletedAt
      community {
        id
        content
      }
      user {
        id
        firstName
        lastName
        email
        role
      }
      reactions {
        id
        userId
        commentId
        reactionType
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

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id)
  }
`;

// Attachment Mutations
export const DELETE_ATTACHMENT = gql`
  mutation DeleteAttachment($id: ID!) {
    deleteAttachment(id: $id)
  }
`;

// Community Subscription
export const COMMUNITY_UPDATED = gql`
  subscription CommunityUpdated($batchId: ID!) {
    communityUpdated(batchId: $batchId) {
      id
      batchId
      userId
      content
      isEdited
      createdAt
      updatedAt
      isDeleted
      deletedAt
      batch {
        id
        name
      }
      user {
        id
        firstName
        lastName
        email
        role
      }
      reactions {
        id
        userId
        communityId
        reactionType
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
      comments {
        id
        communityId
        userId
        content
        isEdited
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
        reactions {
          id
          userId
          commentId
          reactionType
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
      attachments {
        id
        communityId
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
`;