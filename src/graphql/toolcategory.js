import gql from 'graphql-tag';
import {
    COMPANY_TOOL_FULL_FRAGMENT
} from './companytool';

// eslint-disable-next-line
const TOOL_CATEGORY_FRAGMENT = gql `
    fragment toolCategoryFields on ToolCategory{
      id,
      name,
      yearlyCosts,
      createdAt,
      updatedAt,
      toolsCount,
    }
`;

const TOOL_CATEGORY_FULL_FRAGMENT = gql `
    fragment toolCategoryFullFields on ToolCategory{
        ...toolCategoryFields
        tools{
            ...companyToolFullFields
        }
    }
    ${TOOL_CATEGORY_FRAGMENT}
    ${COMPANY_TOOL_FULL_FRAGMENT}
`;



export const TOOL_CATEGORY = {
    findAll: gql `
        query toolCategoryFindAll($filter:Filter){
            toolCategoryFindAll(filter:$filter){
                ...toolCategoryFields
            }
        }
        ${TOOL_CATEGORY_FRAGMENT}
    `,
    findById: gql `
      query toolCategoryFindById($id:ID!){
        toolCategoryFindById(id:$id){
                ...toolCategoryFullFields
            }
        }
        ${TOOL_CATEGORY_FULL_FRAGMENT}
    `,
    create: gql `
        mutation toolCategoryCreate($input:ToolCategoryCreateInput!){
            toolCategoryCreate(input:$input){
                ...toolCategoryFullFields
            }
        }
        ${TOOL_CATEGORY_FULL_FRAGMENT}
    `,
    update: gql `
        mutation toolCategoryUpdate($id:ID!, $input:ToolCategoryUpdateInput!){
            toolCategoryUpdate(id:$id, input:$input){
                ...toolCategoryFullFields
            }
        }
        ${TOOL_CATEGORY_FULL_FRAGMENT}
    `,
    delete: gql `
        mutation toolCategoryDelete($id:ID!){
            toolCategoryDelete(id:$id)
        }
    `,
}