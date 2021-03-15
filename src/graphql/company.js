import gql from 'graphql-tag';

// eslint-disable-next-line
const COMPANY_FRAGMENT = gql `
    fragment companyFields on Company{
        id,
        name,
        logo,
        logoUrl,
        currencyCode,
        currency{
            code,
            name,
            symbol,
        }
    }
`;

const COMPANY_FULL_FRAGMENT = gql `
    fragment companyFullFields on Company{
        ...companyFields,

    }
    ${COMPANY_FRAGMENT}
`;



export const COMPANY = {
    findAll: gql `
        query companyFindAll($filter:Filter){
            companyFindAll(filter:$filter){
                ...companyFullFields
            }
        }
        ${COMPANY_FULL_FRAGMENT}
    `,
    findById: gql `
      query companyFindById($id:ID!){
        companyFindById(id:$id){
                ...companyFullFields
            }
        }
        ${COMPANY_FULL_FRAGMENT}
    `,
    create: gql `
        mutation companyCreate($input:CompanyCreateInput!){
            companyCreate(input:$input){
                ...companyFullFields
            }
        }
        ${COMPANY_FULL_FRAGMENT}
    `,
    update: gql `
        mutation companyUpdate($id:ID!, $input:CompanyUpdateInput!){
            companyUpdate(id:$id, input:$input){
                ...companyFullFields
            }
        }
        ${COMPANY_FULL_FRAGMENT}
    `,
    delete: gql `
        mutation companyDelete($id:ID!){
            companyDelete(id:$id)
        }
    `,
}
