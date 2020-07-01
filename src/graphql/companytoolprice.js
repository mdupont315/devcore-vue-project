import gql from 'graphql-tag';

// eslint-disable-next-line
export const COMPANY_TOOL_PRICE_FRAGMENT = gql `
    fragment companyToolPriceFields on CompanyToolPrice{
        id
        name
        yearlyCosts
        priceModel
        priceInterval
        parent{
                    id
                    name
                }
        price
        parentType
        parentId
        expiration
        createdAt
        updatedAt
    }
`;

export const COMPANY_TOOL_PRICE_FULL_FRAGMENT = gql `
    fragment companyToolPriceFullFields on CompanyToolPrice{
        ...companyToolPriceFields
    }
    ${COMPANY_TOOL_PRICE_FRAGMENT}
`;



export const COMPANY_TOOL_PRICE = {
    findAll: gql `
        query companyToolPriceFindAll($filter:Filter){
            companyToolPriceFindAll(filter:$filter){
                ...companyToolPriceFields
            }
        }
        ${COMPANY_TOOL_PRICE_FRAGMENT}
    `,
    findById: gql `
      query companyToolPriceFindById($id:ID!){
        companyToolPriceFindById(id:$id){
                ...companyToolPriceFullFields
            }
        }
        ${COMPANY_TOOL_PRICE_FULL_FRAGMENT}
    `,
    create: gql `
        mutation companyToolPriceCreate($input:CompanyToolPriceCreateInput!){
            companyToolPriceCreate(input:$input){
                ...companyToolPriceFullFields
            }
        }
        ${COMPANY_TOOL_PRICE_FULL_FRAGMENT}
    `,
    update: gql `
        mutation companyToolPriceUpdate($id:ID!, $input:CompanyToolPriceUpdateInput!){
            companyToolPriceUpdate(id:$id, input:$input){
                ...companyToolPriceFullFields
            }
        }
        ${COMPANY_TOOL_PRICE_FULL_FRAGMENT}
    `,
    changeStatus: gql `
        mutation companyToolPriceChangeStatus($input: CompanyToolPriceChangeStatusInput!){
            companyToolPriceChangeStatus(input:$input){
                ...companyToolPriceFullFields
            }
        }
        ${COMPANY_TOOL_PRICE_FULL_FRAGMENT}
    `,
    delete: gql `
        mutation companyToolPriceDelete($id:ID!){
            companyToolPriceDelete(id:$id)
        }
    `,
}