import gql from 'graphql-tag';
import {
    PROCESS_PHASE_FULL_FRAGMENT
} from './process_phase';
import {
    META_FRAGMENT
} from './meta';
// eslint-disable-next-line
export const PROCESS_OPERATION_FRAGMENT = gql `
    fragment processOperationFields on ProcessOperation{
      id,
      title,
      description,
      dOrder,
      stageId,
      stats{
          phases
          projects
          ideas
          toolIdeas
      }
    #  companyRoles{
   #       id,
  #        name,
   #       avatarUrl
   #   },
      phases{
          ...processPhaseFullFields,
      }
      updatedAt,
      createdAt,
      _metadata{
          ...metaFields
      }
    }
    ${META_FRAGMENT}
    ${PROCESS_PHASE_FULL_FRAGMENT}
`;

export const PROCESS_OPERATION_FULL_FRAGMENT = gql `
    fragment processOperationFullFields on ProcessOperation{
        ...processOperationFields,

    }
    ${PROCESS_OPERATION_FRAGMENT}
`;



export const PROCESS_OPERATION = {
    findAll: gql `
        query processOperationFindAll($filter:Filter){
            processOperationFindAll(filter:$filter){
                ...processOperationFields
            }
        }
        ${PROCESS_OPERATION_FRAGMENT}
    `,
    findById: gql `
      query processOperationFindById($id:ID!){
        processOperationFindById(id:$id){
                ...processOperationFullFields
            }
        }
        ${PROCESS_OPERATION_FULL_FRAGMENT}
    `,
    create: gql `
        mutation processOperationCreate($input:ProcessOperationCreateInput!){
            processOperationCreate(input:$input){
                ...processOperationFields
            }
        }
        ${PROCESS_OPERATION_FRAGMENT}
    `,
    update: gql `
        mutation processOperationUpdate($id:ID!, $input:ProcessOperationUpdateInput!){
            processOperationUpdate(id:$id, input:$input){
                ...processOperationFields
            }
        }
        ${PROCESS_OPERATION_FRAGMENT}
    `,
    updateOrder: gql `
        mutation processOperationUpdateOrder($input:ProcessOperationUpdateOrderInput!){
            processOperationUpdateOrder(input:$input){
                ...processOperationFields
            }
        }
        ${PROCESS_OPERATION_FRAGMENT}
    `,
    delete: gql `
        mutation processOperationDelete($id:ID!){
            processOperationDelete(id:$id)
        }
    `,
}
