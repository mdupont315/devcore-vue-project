import gql from 'graphql-tag';

// eslint-disable-next-line
export const COMPANY_TOOL_MODULE_FRAGMENT = gql `
    fragment companyToolModuleFields on CompanyToolModule{
      id,
      name,
      yearlyCosts,
    #   priceModel{
    #       id,
    #       name
    #   },
    #     priceModel,
    #   toolModuleId,
      companyToolId,
      createdAt,
      updatedAt,
    }
`;

export const COMPANY_TOOL_MODULE_FULL_FRAGMENT = gql `
    fragment companyToolModuleFullFields on CompanyToolModule{
        ...companyToolModuleFields,
       
    }
    ${COMPANY_TOOL_MODULE_FRAGMENT}
`;



export const COMPANY_TOOL_MODULE = {
    findAll: gql `
        query companyToolModuleFindAll($filter:Filter){
            companyToolModuleFindAll(filter:$filter){
                ...companyToolModuleFields
            }
        }
        ${COMPANY_TOOL_MODULE_FRAGMENT}
    `,
    findById: gql `
      query companyToolModuleFindById($id:ID!){
        companyToolModuleFindById(id:$id){
                ...companyToolModuleFullFields
            }
        }
        ${COMPANY_TOOL_MODULE_FULL_FRAGMENT}
    `,
    create: gql `
        mutation companyToolModuleCreate($input:CompanyToolModuleCreateInput!){
            companyToolModuleCreate(input:$input){
                ...companyToolModuleFullFields
            }
        }
        ${COMPANY_TOOL_MODULE_FULL_FRAGMENT}
    `,
    update: gql `
        mutation companyToolModuleUpdate($id:ID!, $input:CompanyToolModuleUpdateInput!){
            companyToolModuleUpdate(id:$id, input:$input){
                ...companyToolModuleFullFields
            }
        }
        ${COMPANY_TOOL_MODULE_FULL_FRAGMENT}
    `,
    delete: gql `
        mutation companyToolModuleDelete($id:ID!){
            companyToolModuleDelete(id:$id)
        }
    `,
}