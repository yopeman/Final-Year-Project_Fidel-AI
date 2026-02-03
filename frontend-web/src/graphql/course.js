import { gql } from '@apollo/client';

// Get all courses
export const GET_COURSES = gql`
  query Courses {
    courses {
      id
      name
      description
      createdAt
      updatedAt
      isDeleted
      deletedAt
      materials {
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
`;

// Get course by ID
export const GET_COURSE = gql`
  query Course($id: ID!) {
    course(id: $id) {
      id
      name
      description
      createdAt
      updatedAt
      isDeleted
      deletedAt
      materials {
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
`;

// Create new course
export const CREATE_COURSE = gql`
  mutation CreateCourse($input: CreateCourseInput!) {
    createCourse(input: $input) {
      id
      name
      description
      createdAt
      updatedAt
      isDeleted
      deletedAt
    }
  }
`;

// Update course
export const UPDATE_COURSE = gql`
  mutation UpdateCourse($id: ID!, $input: UpdateCourseInput!) {
    updateCourse(id: $id, input: $input) {
      id
      name
      description
      createdAt
      updatedAt
      isDeleted
      deletedAt
    }
  }
`;

// Delete course
export const DELETE_COURSE = gql`
  mutation DeleteCourse($id: ID!) {
    deleteCourse(id: $id)
  }
`;

// Get materials for a course
export const GET_MATERIALS = gql`
  query Materials($courseId: ID) {
    materials(courseId: $courseId) {
      id
      name
      description
      createdAt
      updatedAt
      isDeleted
      deletedAt
      files {
        id
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

// Get material by ID
export const GET_MATERIAL = gql`
  query Material($id: ID!) {
    material(id: $id) {
      id
      name
      description
      createdAt
      updatedAt
      isDeleted
      deletedAt
      files {
        id
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

// Add material to course
export const ADD_MATERIAL = gql`
  mutation AddMaterial($input: AddMaterialInput!) {
    addMaterial(input: $input) {
      id
      name
      description
      createdAt
      updatedAt
      isDeleted
      deletedAt
    }
  }
`;

// Update material
export const UPDATE_MATERIAL = gql`
  mutation UpdateMaterial($id: ID!, $input: UpdateMaterialInput!) {
    changeMaterial(id: $id, input: $input) {
      id
      name
      description
      createdAt
      updatedAt
      isDeleted
      deletedAt
    }
  }
`;

// Delete material
export const DELETE_MATERIAL = gql`
  mutation DeleteMaterial($id: ID!) {
    deleteMaterial(id: $id)
  }
`;

// Get material files
export const GET_MATERIAL_FILES = gql`
  query MaterialFiles($materialId: ID!) {
    materialFiles(materialId: $materialId) {
      id
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
`;

// Get material file by ID
export const GET_MATERIAL_FILE = gql`
  query MaterialFile($id: ID!) {
    materialFile(id: $id) {
      id
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
`;

// Upload material file
export const UPLOAD_MATERIAL_FILE = gql`
  mutation UploadMaterialFile($materialId: ID!, $file: Upload!) {
    uploadMaterialFile(materialId: $materialId, file: $file) {
      id
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
`;

// Delete material file
export const DELETE_MATERIAL_FILE = gql`
  mutation DeleteMaterialFile($id: ID!) {
    deleteMaterialFile(id: $id)
  }
`;
