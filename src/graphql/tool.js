import gql from 'graphql-tag';

// eslint-disable-next-line
const TOOL_FRAGMENT = gql `
    fragment toolFields on Tool{
      id,
      name,
    #  yearlyCosts,
    #   areaId,
    #   companyId,
    #   productsCount,
    #   area{
    #     id,
    #     name,
    #   },
      createdAt,
      updatedAt,
    }
`;

const TOOL_FULL_FRAGMENT = gql `
    fragment toolFullFields on Tool{
        ...toolFields,
        # products{
        #     id,
        #     name,
        #     toolId,
        #     categoryId,
        #     category {
        #         name,
        #         id
        #     },
        #     priceModelId,
        #     priceModel {
        #         name,
        #         id
        #     }
        #     quantity,
        #     unitYearlyCosts,
        #     createdAt,
        #     updatedAt,
        # }
    }
    ${TOOL_FRAGMENT}
`;



export const TOOL = {
    findAll: gql `
        query toolFindAll($filter:Filter){
            toolFindAll(filter:$filter){
                ...toolFields
            }
        }
        ${TOOL_FRAGMENT}
    `,
    findById: gql `
      query toolFindById($id:ID!){
        toolFindById(id:$id){
                ...toolFullFields
            }
        }
        ${TOOL_FULL_FRAGMENT}
    `,
    create: gql `
        mutation toolCreate($input:ToolInput!){
            toolCreate(input:$input){
                ...toolFields
            }
        }
        ${TOOL_FRAGMENT}
    `,
    update: gql `
        mutation toolUpdate($id:ID!, $input:ToolInput!){
            toolUpdate(id:$id, input:$input){
                ...toolFields
            }
        }
        ${TOOL_FRAGMENT}
    `,
    delete: gql `
        mutation toolDelete($id:ID!){
            toolDelete(id:$id)
        }
    `,
}