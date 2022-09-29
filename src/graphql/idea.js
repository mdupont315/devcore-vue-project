import gql from "graphql-tag";
import { RESOURCE_FRAGMENT, IDEA_CONTENT_RESOURCES_FRAGMENT } from "./resource";
import { META_FRAGMENT } from "./meta";
// eslint-disable-next-line
export const IDEA_FRAGMENT = gql`
  fragment ideaFields on Idea {
    id
    title
    description
    status
    processId
    parentId
    parentType
    version
    type
    totalEvaluations
    evaluationSum
    anonymous
    createdAt
    updatedAt
    replied
    uuid
    companyToolIds
    companyRoleIds
 #   companyRoles{
 #     id,
 #     name,
 #     avatarUrl
 # },
    ideaContentId
    comments {
      id
      description,
      type,
    }
    stats {
      problems
      improvements
      evaluations
    }
    companyToolId
    tool {
      id
      name
    }
    author {
      id
      firstName
      lastName
      avatarUrl
    }
    parent {
      __typename
      ... on ProcessStage {
        id
        title
        dOrder
        description
        processId
      #  companyRoles {
      #    id,
       #   name,
       #   avatarUrl
      #  }
      }
      ... on ProcessOperation {
        id
        title
        dOrder
        description
        processId
        stageId
      #  companyRoles {
       #   id,
      #    name,
      #    avatarUrl
     #   }
        stage {
          id
          title
        }
      }
      ... on ProcessPhase {
        id
        title
        dOrder
        description
        processId
        operationId
        operation {
          id
          title
          stageId
          stage {
            id
            title
          }
        }
      }
    }
    files {
      ...resourceFields
    }
    _metadata {
      ...metaFields
    }
  }
  ${META_FRAGMENT}
  ${RESOURCE_FRAGMENT}
`;


export const IDEA_FULL_FRAGMENT = gql`
  fragment ideaFullFields on Idea {
    ...ideaFields
    problems {
      id
      title
      description
      createdAt
      updatedAt
      anonymous
      replied
      comments {
        id
        description,
        type,
        createdAt
      }
      files {
        ...resourceFields
      }
      author {
        id
        firstName
        lastName
        avatarUrl
      }
    }
    improvements {
      id
      title
      description
      createdAt
      updatedAt
      anonymous
      replied
      comments {
        id
        description,
        type,
        createdAt
      }
      files {
        ...resourceFields
      }
      author {
        id
        firstName
        lastName
        avatarUrl
      }
    }
  }
  ${IDEA_FRAGMENT}
`;


export const IDEA_RESOURCE_FRAGMENT = gql`
  fragment ideaResourceFields on IdeaResource {
    id
    contentId
    uuid
    files {
      ...resourceFields
    }
  }
  ${META_FRAGMENT}
  ${RESOURCE_FRAGMENT}`;

export const IDEA = {
  findAll: gql`
    query ideaFindAll($filter: Filter) {
      ideaFindAll(filter: $filter) {
        ...ideaFields
      }
    }
    ${IDEA_FRAGMENT}
  `,
  findById: gql`
    query ideaFindById($id: ID!) {
      ideaFindById(id: $id) {
        ...ideaFullFields
      }
    }
    ${IDEA_FULL_FRAGMENT}
  `,
  create: gql`
    mutation ideaCreate($input: IdeaCreateInput!) {
      ideaCreate(input: $input) {
        ...ideaFullFields
      }
    }
    ${IDEA_FULL_FRAGMENT}
  `,
  update: gql`
    mutation ideaUpdate($id: ID!, $input: IdeaUpdateInput!) {
      ideaUpdate(id: $id, input: $input) {
        ...ideaFullFields
      }
    }
    ${IDEA_FULL_FRAGMENT}
  `,
  setResources: gql`
    mutation ideaResources($input: IdeaResourceInput!) {
      ideaResources(input: $input) {
        ...ideaResourceFields
      }
    }
    ${IDEA_RESOURCE_FRAGMENT}
  `,
  changeStatus: gql`
    mutation ideaChangeStatus($input: IdeaChangeStatusInput!) {
      ideaChangeStatus(input: $input) {
        ...ideaFullFields
      }
    }
    ${IDEA_FULL_FRAGMENT}
  `,
  delete: gql`
    mutation ideaDelete($id: ID!) {
      ideaDelete(id: $id)
    }
  `,
  deleteImprovement: gql`
    mutation ideaImprovementDelete($id: ID!) {
      ideaImprovementDelete(id: $id)
    }
  `,
  closeFeedback: gql`
    mutation ideaCloseFeedback($id: ID!) {
      ideaCloseFeedback(id: $id) {
        ...ideaFullFields
      }
    }
    ${IDEA_FULL_FRAGMENT}
  `,
  closeImprovementFeedback: gql`
  mutation ideaImprovementCloseFeedback($input: IdeaImprovementCloseInput!) {
    ideaImprovementCloseFeedback(input: $input) {
      ...ideaFullFields
    }
  }
  ${IDEA_FULL_FRAGMENT}
`
};
