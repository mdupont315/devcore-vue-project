import gql from "graphql-tag";

// eslint-disable-next-line


export const COMPANY_TOOL_FRAGMENT = gql`
  fragment companyToolFields on CompanyTool {
    id
    name
    type
    toolId
    createdAt
    updatedAt
    __typename
  }
`;

export const COMPANY_TOOL_FULL_FRAGMENT = gql`
  fragment companyToolFullFields on CompanyTool {
    id
    name
    yearlyCosts
    type
    modulesCount
    toolId
    createdAt
    updatedAt
    modules {
      id
      name
      status
      yearlyCosts
      prices {
        id
        name
        yearlyCosts
        priceModel
        priceInterval
        price
        parentType
        parentId
        parent {
          id
          name
        }
        expiration
        createdAt
        updatedAt
      }
    }
  }
`;
/*
export const COMPANY_TOOL_FULL_FRAGMENT = gql `
    fragment companyToolFullFields on CompanyTool{
        ...companyToolFields,
        modules{
            id
            name
            status
            yearlyCosts
            prices{
                id
                name
                yearlyCosts
                priceModel
                priceInterval
                price
                parentType
                parentId
                parent{
                    id
                    name
                }
                expiration
                createdAt
                updatedAt
            }
        }

    }
 ${COMPANY_TOOL_FRAGMENT} */
export const COMPANY_TOOL = {
  findAll: gql`
    query companyToolFindAll($filter: Filter) {
      companyToolFindAll(filter: $filter) {
        ...companyToolFullFields
      }
    }
    ${COMPANY_TOOL_FULL_FRAGMENT}
  `,
  findById: gql`
    query companyToolFindById($id: ID!) {
      companyToolFindById(id: $id) {
        ...companyToolFullFields
      }
    }
    ${COMPANY_TOOL_FULL_FRAGMENT}
  `,
  create: gql`
    mutation companyToolCreate($input: CompanyToolCreateInput!) {
      companyToolCreate(input: $input) {
        ...companyToolFullFields
      }
    }
    ${COMPANY_TOOL_FULL_FRAGMENT}
  `,
  // update: gql`
  //  mutation companyToolUpdate($id: ID!, $input: CompanyToolUpdateInput!) {
  //    companyToolUpdate(id: $id, input: $input) {
  //      ...companyToolFullFields
  //    }
  //  }
  //  ${COMPANY_TOOL_FULL_FRAGMENT}
  //`,
  update: gql`
    mutation companyToolUpdate($id: ID!, $input: CompanyToolUpdateInput!) {
      companyToolUpdate(id: $id, input: $input) {
        ...companyToolFields
      }
    }
    ${COMPANY_TOOL_FRAGMENT}
  `,
  changeStatus: gql`
    mutation companyToolChangeStatus($input: CompanyToolChangeStatusInput!) {
      companyToolChangeStatus(input: $input) {
        ...companyToolFullFields
      }
    }
    ${COMPANY_TOOL_FULL_FRAGMENT}
  `,
  delete: gql`
    mutation companyToolDelete($id: ID!) {
      companyToolDelete(id: $id)
    }
  `
};
