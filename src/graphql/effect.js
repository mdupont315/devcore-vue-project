import gql from "graphql-tag";
import { META_FRAGMENT } from "./meta";
import { ISSUE_EFFECT_TEMPLATE_FRAGMENT } from "./effectTemplate";
// eslint-disable-next-line
export const ISSUE_EFFECT_FRAGMENT = gql`
  fragment issueEffectFields on IssueEffect {
    id
    title
    effectTime
    effectValue
    createdAt
    updatedAt
    issueActiveId
    processId
    effectId
    status
    author {
      id
      firstName
      lastName
      companyRoleId
      avatarUrl
      yearlyCosts
    }

    templates {
      ...issueEffectTemplateFields
    }
    _metadata {
      ...metaFields
    }
  }
  ${META_FRAGMENT}
  ${ISSUE_EFFECT_TEMPLATE_FRAGMENT}
`;

export const ISSUE_EFFECT_FULL_FRAGMENT = gql`
  fragment issueEffectFullFields on IssueEffect {
    ...issueEffectFields
    templates {
      id
    }
  }
  ${ISSUE_EFFECT_FRAGMENT}
`;

export const ISSUE_EFFECT = {
  findAll: gql`
    query issueEffectFindAll($filter: Filter) {
      issueEffectFindAll(filter: $filter) {
        ...issueEffectFields
      }
    }
    ${ISSUE_EFFECT_FRAGMENT}
  `,
  findById: gql`
    query issueEffectFindById($id: ID!) {
      issueEffectFindById(id: $id) {
        ...issueEffectFullFields
      }
    }
    ${ISSUE_EFFECT_FULL_FRAGMENT}
  `,
  create: gql`
    mutation issueEffectCreate($input: IssueEffectCreateInput) {
      issueEffectCreate(input: $input) {
        ...issueEffectFields
      }
    }
    ${ISSUE_EFFECT_FRAGMENT}
  `,
  update: gql`
    mutation issueEffectUpdate($id: ID!, $input: IssueEffectUpdateInput) {
      issueEffectUpdate(id: $id, input: $input) {
        ...issueEffectFields
      }
    }
    ${ISSUE_EFFECT_FRAGMENT}
  `,
  delete: gql`
    mutation issueEffectDelete($id: ID!) {
      issueEffectDelete(id: $id) {
        id
      }
    }
  `
};
