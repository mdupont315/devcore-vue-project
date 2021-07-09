import gql from "graphql-tag";
import { META_FRAGMENT } from "./meta";
// eslint-disable-next-line
export const ISSUE_EFFECT_FRAGMENT = gql`
  fragment issueEffectFields on IssueEffect {
    id
    title
    measureUnit
    effectTime
    effectValue
    createdAt
    updatedAt
    issueActiveIds
    processId
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
    _metadata {
      ...metaFields
    }
  }
  ${META_FRAGMENT}
`;

export const ISSUE_EFFECT_FULL_FRAGMENT = gql`
  fragment issueEffectFullFields on IssueEffect {
    ...issueEffectFields
  }
  ${ISSUE_EFFECT_FRAGMENT}
`;

export const ISSUE_EFFECT = {
  findAll: gql`
    query issueEffectFindAll($filter: Filter) {
      issueEffectFindAll(filter: $filter) {
        ...issueEffectFullFields
      }
    }
    ${ISSUE_EFFECT_FULL_FRAGMENT}
  `,
 create: gql`
  mutation issueEffectCreate($input: IssueEffectTemplateCreateInput) {
    issueEffectCreate(input: $input) {
      ...issueEffectFullFields
    }
  }
  ${ISSUE_EFFECT_FULL_FRAGMENT}
`
};
