import gql from 'graphql-tag';
import {
    PROCESS_OPERATION_FULL_FRAGMENT
} from './process_operation';
import {
    META_FRAGMENT
} from './meta';
// eslint-disable-next-line
export const PROCESS_STAGE_FRAGMENT = gql `
    fragment processStageFields on ProcessStage{
      id,
      title,
      dOrder,
      processId,
     # companyRoles{
     #     id,
     #     name,
     #     avatarUrl
     # },
    #  // companyRolesWithChild{
    #  //     id,
    #  //     name,
    #  //     avatarUrl,
   #   // },
      stats{
          operations
          phases
          projects
          ideas
          toolIdeas
          issues
      }
      updatedAt,
      createdAt,
      _metadata{
          ...metaFields
      }
    }
    ${META_FRAGMENT}
`;

export const PROCESS_STAGE_FULL_FRAGMENT = gql `
    fragment processStageFullFields on ProcessStage{
        ...processStageFields,

      operations{
          ...processOperationFullFields
      }
    }
    ${PROCESS_STAGE_FRAGMENT},
    ${PROCESS_OPERATION_FULL_FRAGMENT}
`;



export const PROCESS_STAGE = {
    findAll: gql `
        query processStageFindAll($filter:Filter){
            processStageFindAll(filter:$filter){
                ...processStageFields
            }
        }
        ${PROCESS_STAGE_FRAGMENT}
    `,
    findById: gql `
      query processStageFindById($id:ID!){
        processStageFindById(id:$id){
                ...processStageFullFields
            }
        }
        ${PROCESS_STAGE_FULL_FRAGMENT}
    `,
    create: gql `
        mutation processStageCreate($input:ProcessStageCreateInput!){
            processStageCreate(input:$input){
                ...processStageFields
            }
        }
        ${PROCESS_STAGE_FRAGMENT}
    `,
    update: gql `
        mutation processStageUpdate($id:ID!, $input:ProcessStageUpdateInput!){
            processStageUpdate(id:$id, input:$input){
                ...processStageFields
            }
        }
        ${PROCESS_STAGE_FRAGMENT}
    `,
    updateOrder: gql `
        mutation processStageUpdateOrder($input:ProcessStageUpdateOrderInput!){
            processStageUpdateOrder(input:$input){
                ...processStageFields
            }
        }
        ${PROCESS_STAGE_FRAGMENT}
    `,
    delete: gql `
        mutation processStageDelete($id:ID!){
            processStageDelete(id:$id)
        }
    `,
}
