import gql from "graphql-tag";

// eslint-disable-next-line
export const ISSUE_REPLY_FRAGMENT = gql`
  fragment issueReplyFields on IssueReply {
    id
    issueId
    description
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
  fragment issueReplyFullFields on IssueReply {
    ...issueReplyFields
  }
  ${ISSUE_REPLY_FRAGMENT}
`;

export const ISSUE_REPLY = {
  findAll: gql`
    query issueReplyFindAll($filter: Filter) {
      issueReplyFindAll(filter: $filter) {
        ...issueReplyFields
      }
    }
    ${ISSUE_REPLY_FRAGMENT}
  `,
  findById: gql`
    query issueReplyFindById($id: ID!) {
      issueReplyFindById(id: $id) {
        ...issueReplyFullFields
      }
    }
    ${ISSUE_REPLY_FULL_FRAGMENT}
  `,
  create: gql`
    mutation issueReplyCreate($input: IssueReplyCreateInput!) {
      issueReplyCreate(input: $input) {
        ...issueReplyFullFields
      }
    }
    ${ISSUE_REPLY_FULL_FRAGMENT}
  `,
  update: gql`
    mutation issueReplyUpdate($id: ID!, $input: IssueReplyUpdateInput!) {
      issueReplyUpdate(id: $id, input: $input) {
        ...issueReplyFullFields
      }
    }
    ${ISSUE_REPLY_FULL_FRAGMENT}
  `,

  delete: gql`
    mutation issueReplyDelete($id: ID!) {
      issueReplyDelete(id: $id)
    }
  `,


};
