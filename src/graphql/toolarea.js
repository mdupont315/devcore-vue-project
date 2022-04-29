import gql from 'graphql-tag';

// eslint-disable-next-line
const TOOL_AREA_FRAGMENT = gql `
    fragment toolAreaFields on ToolArea{
      id,
      name,
      createdAt,
      updatedAt,
    }
`;

const TOOL_AREA_FULL_FRAGMENT = gql `
    fragment toolAreaFullFields on ToolArea{
        ...toolAreaFields,
    }
    ${TOOL_AREA_FRAGMENT}
`;



export const TOOL_AREA = {
    findAll: gql `
        query toolAreaFindAll($filter:Filter){
            toolAreaFindAll(filter:$filter){
                ...toolAreaFields
            }
        }
        ${TOOL_AREA_FRAGMENT}
    `,
    findById: gql `
      query toolAreaFindById($id:ID!){
        toolAreaFindById(id:$id){
                ...toolAreaFullFields
            }
        }
        ${TOOL_AREA_FULL_FRAGMENT}
    `,
    create: gql `
        mutation toolAreaCreate($input:ToolAreaInput!){
            toolAreaCreate(input:$input){
                ...toolAreaFields
            }
        }
        ${TOOL_AREA_FRAGMENT}
    `,
    update: gql `
        mutation toolAreaUpdate($id:ID!, $input:ToolAreaInput!){
            toolAreaUpdate(id:$id, input:$input){
                ...toolAreaFields
            }
        }
        ${TOOL_AREA_FRAGMENT}
    `,
    delete: gql `
        mutation toolAreaDelete($id:ID!){
            toolAreaDelete(id:$id)
        }
    `,
}