import gql from "graphql-tag";

export const ISSUE_EFFECT_TEMPLATE_FRAGMENT = gql`
  fragment issueEffectTemplateFields on IssueEffectTemplate {
    id
    effectId
    effectTime
    effectValue
    companyRoleId
    processId
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
  }
`;

export const ISSUE_EFFECT_TEMPLATE = {
  create: gql`
    mutation issueEffectTemplateCreate($input: IssueEffectTemplateCreateInput) {
      issueEffectTemplateCreate(input: $input) {
        ...issueEffectTemplateFields
      }
    }
    ${ISSUE_EFFECT_TEMPLATE_FRAGMENT}
  `,
  update: gql`
    mutation issueEffectTemplateUpdate(
      $id: ID!
      $input: IssueEffectTemplateUpdateInput
    ) {
      issueEffectTemplateUpdate(id: $id, input: $input) {
        ...issueEffectTemplateFields
      }
    }
    ${ISSUE_EFFECT_TEMPLATE_FRAGMENT}
  `,
  deleteManyTemplate: gql`
    mutation issueEffectTemplateDeleteMany($ids: [ID!]!) {
      issueEffectTemplateDeleteMany(ids: $ids)
    }
  `,
  deleteTemplate: gql`
    mutation issueEffectTemplateDelete($id: ID!) {
      issueEffectTemplateDelete(id: $id)
    }
  `
};
