import gql from 'graphql-tag';

// eslint-disable-next-line
const TOOL_MODULE_FRAGMENT = gql `
    fragment toolModuleFields on ToolModule{
      id,
      name,
      toolId,
      createdAt,
      updatedAt,
    }
`;

const TOOL_MODULE_FULL_FRAGMENT = gql `
    fragment toolModuleFullFields on ToolModule{
        ...toolModuleFields,
        
    }
    ${TOOL_MODULE_FRAGMENT}
`;



export const TOOL_MODULE = {
    findAll: gql `
        query toolModuleFindAll($filter:Filter){
            toolModuleFindAll(filter:$filter){
                ...toolModuleFields
            }
        }
        ${TOOL_MODULE_FRAGMENT}
    `,
    findById: gql `
      query toolModuleFindById($id:ID!){
        toolModuleFindById(id:$id){
                ...toolModuleFullFields
            }
        }
        ${TOOL_MODULE_FULL_FRAGMENT}
    `,
    create: gql `
        mutation toolModuleCreate($input:ToolModuleInput!){
            toolModuleCreate(input:$input){
                ...toolModuleFields
            }
        }
        ${TOOL_MODULE_FRAGMENT}
    `,
    update: gql `
        mutation toolModuleUpdate($id:ID!, $input:ToolModuleInput!){
            toolModuleUpdate(id:$id, input:$input){
                ...toolModuleFields
            }
        }
        ${TOOL_MODULE_FRAGMENT}
    `,
    delete: gql `
        mutation toolModuleDelete($id:ID!){
            toolModuleDelete(id:$id)
        }
    `,
}