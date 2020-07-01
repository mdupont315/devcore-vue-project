import gql from 'graphql-tag';
import {
    PROCESS_STAGE_FULL_FRAGMENT
} from './process_stage';
import {
    META_FRAGMENT
} from './meta';

// eslint-disable-next-line
export const PROCESS_FRAGMENT = gql `
    fragment processFields on Process{
      id,
      title,
      stats{
          stages
          operations
          phases
          projects
          ideas
          toolIdeas
          issues
      }
      companyRoles{
          id,
          name,
          avatarUrl
      },
      createdAt,
      updatedAt,
      _metadata{
          ...metaFields
      }
    }
    ${META_FRAGMENT}
`;

export const PROCESS_FULL_FRAGMENT = gql `
    fragment processFullFields on Process{
        ...processFields,
        # users{
        #     id,
        #     firstName,
        #     lastName,
        #     avatarUrl,
        # }
        stages{
            ...processStageFullFields,
        }
    }
    ${PROCESS_STAGE_FULL_FRAGMENT}
    ${PROCESS_FRAGMENT},
`;



export const PROCESS = {
    findAll: gql `
        query processFindAll($filter:Filter){
            processFindAll(filter:$filter){
                ...processFields
            }
        }
        ${PROCESS_FRAGMENT}
    `,
    findById: gql `
      query processFindById($id:ID!){
        processFindById(id:$id){
                ...processFullFields
            }
        }
        ${PROCESS_FULL_FRAGMENT}
    `,
    create: gql `
        mutation processCreate($input:ProcessCreateInput!){
            processCreate(input:$input){
                ...processFullFields
            }
        }
        ${PROCESS_FULL_FRAGMENT}
    `,
    update: gql `
        mutation processUpdate($id:ID!, $input:ProcessUpdateInput!){
            processUpdate(id:$id, input:$input){
                ...processFullFields
            }
        }
        ${PROCESS_FULL_FRAGMENT}
    `,
    delete: gql `
        mutation processDelete($id:ID!){
            processDelete(id:$id)
        }
    `,
}