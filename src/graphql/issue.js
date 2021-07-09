import gql from "graphql-tag";
import { RESOURCE_FRAGMENT } from "./resource";
import { META_FRAGMENT } from "./meta";
// eslint-disable-next-line
export const ISSUE_FRAGMENT = gql`
  fragment issueFields on Issue {
    id
    title
    description
    status
    processId
    createdAt
    updatedAt
    type
    timeUnit
    timeValue
    anonymous
    moneyUnit
    moneyValue
    totalValue
    checked
    effectTemplateId
    project {
      id
      name
    }
    author {
      id
      firstName
      lastName
      companyRoleId
      avatarUrl
      yearlyCosts
    }
    parent {
      __typename
      ... on ProcessStage {
        id
        title
        dOrder
        description
        processId
      }
      ... on ProcessOperation {
        id
        title
        dOrder
        description
        processId
        stageId
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

export const ISSUE_FULL_FRAGMENT = gql`
  fragment issueFullFields on Issue {
    ...issueFields
  }
  ${ISSUE_FRAGMENT}
`;

export const ISSUE = {
  findAll: gql`
    query issueFindAll($filter: Filter) {
      issueFindAll(filter: $filter) {
        ...issueFields
      }
    }
    ${ISSUE_FRAGMENT}
  `,
  findById: gql`
    query issueFindById($id: ID!) {
      issueFindById(id: $id) {
        ...issueFullFields
      }
    }
    ${ISSUE_FULL_FRAGMENT}
  `,
  create: gql`
    mutation issueCreate($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        ...issueFullFields
      }
    }
    ${ISSUE_FULL_FRAGMENT}
  `,
  update: gql`
    mutation issueUpdate($id: ID!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        ...issueFullFields
      }
    }
    ${ISSUE_FULL_FRAGMENT}
  `,
  changeStatus: gql`
    mutation issueChangeStatus($id: ID!, $status: String!) {
      issueChangeStatus(id: $id, status: $status) {
        ...issueFullFields
      }
    }
    ${ISSUE_FULL_FRAGMENT}
  `,
  delete: gql`
    mutation issueDelete($id: ID!) {
      issueDelete(id: $id)
    }
  `,
  check: gql`
    mutation issueCheck($input: IssueCheckInput!) {
      issueCheck(input: $input)
    }
  `,
  setEffectTemplate: gql`
    mutation issueEffectTemplate($input: IssueTemplateInput) {
      issueEffectTemplate(input: $input) {
        ...issueFullFields
      }
    }
    ${ISSUE_FULL_FRAGMENT}
  `,
  deleteMany: gql`
    mutation deleteMany($ids: [ID!]!) {
      issueDeleteMany(ids: $ids)
    }
  `
};
