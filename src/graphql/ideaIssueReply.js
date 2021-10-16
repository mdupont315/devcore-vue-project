import gql from "graphql-tag";

// eslint-disable-next-line
export const IDEA_ISSUE_REPLY_FRAGMENT = gql`
  fragment ideaIssueReplyFields on IdeaIssueReply {
    id
    issueId
    ideaId
    ideaIssueId
    description
    createdAt
    author {
      id
      firstName
      lastName
      companyRoleId
      avatarUrl
      yearlyCosts
    }
  }
`;

export const ISSUE_REPLY_FULL_FRAGMENT = gql`
  fragment ideaIssueReplyFullFields on IdeaIssueReply {
    ...ideaIssueReplyFields
  }
  ${IDEA_ISSUE_REPLY_FRAGMENT}
`;

export const IDEA_ISSUE_REPLY = {
  findAll: gql`
    query ideaIssueReplyFindAll($filter: Filter) {
      ideaIssueReplyFindAll(filter: $filter) {
        ...ideaIssueReplyFields
      }
    }
    ${IDEA_ISSUE_REPLY_FRAGMENT}
  `,
  findById: gql`
    query ideaIssueReplyFindById($id: ID!) {
      ideaIssueReplyFindById(id: $id) {
        ...ideaIssueReplyFullFields
      }
    }
    ${ISSUE_REPLY_FULL_FRAGMENT}
  `,
  create: gql`
    mutation ideaIssueReplyCreate($input: IdeaIssueReplyCreateInput!) {
      ideaIssueReplyCreate(input: $input) {
        ...ideaIssueReplyFullFields
      }
    }
    ${ISSUE_REPLY_FULL_FRAGMENT}
  `,
  update: gql`
    mutation ideaIssueReplyUpdate($id: ID!, $input: IdeaIssueReplyUpdateInput!) {
      ideaIssueReplyUpdate(id: $id, input: $input) {
        ...ideaIssueReplyFullFields
      }
    }
    ${ISSUE_REPLY_FULL_FRAGMENT}
  `,

  delete: gql`
    mutation ideaIssueReplyDelete($id: ID!) {
      ideaIssueReplyDelete(id: $id)
    }
  `,


};
