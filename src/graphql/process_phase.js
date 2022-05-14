import gql from 'graphql-tag';
import {
    META_FRAGMENT
} from './meta';
// eslint-disable-next-line
export const PROCESS_PHASE_FRAGMENT = gql `
    fragment processPhaseFields on ProcessPhase{
      id,
      title,
      description,
      dOrder,
      operationId,
      stats{
          projects
          ideas
          toolIdeas
      },
    #  companyRoles{
    #      id,
    #      name,
     #     avatarUrl
    #  },
      updatedAt,
      createdAt,
      _metadata{
          ...metaFields
      }
    }
    ${META_FRAGMENT}
`;

export const PROCESS_PHASE_FULL_FRAGMENT = gql `
    fragment processPhaseFullFields on ProcessPhase{
        ...processPhaseFields,
    }
    ${PROCESS_PHASE_FRAGMENT}
`;



export const PROCESS_PHASE = {
    findAll: gql `
        query processPhaseFindAll($filter:Filter){
            processPhaseFindAll(filter:$filter){
                ...processPhaseFields
            }
        }
        ${PROCESS_PHASE_FRAGMENT}
    `,
    findById: gql `
      query processPhaseFindById($id:ID!){
        processPhaseFindById(id:$id){
                ...processPhaseFullFields
            }
        }
        ${PROCESS_PHASE_FULL_FRAGMENT}
    `,
    create: gql `
        mutation processPhaseCreate($input:ProcessPhaseCreateInput!){
            processPhaseCreate(input:$input){
                ...processPhaseFields
            }
        }
        ${PROCESS_PHASE_FRAGMENT}
    `,
    update: gql `
        mutation processPhaseUpdate($id:ID!, $input:ProcessPhaseUpdateInput!){
            processPhaseUpdate(id:$id, input:$input){
                ...processPhaseFields
            }
        }
        ${PROCESS_PHASE_FRAGMENT}
    `,
    updateOrder: gql `
        mutation processPhaseUpdateOrder($input:ProcessPhaseUpdateOrderInput!){
            processPhaseUpdateOrder(input:$input){
                ...processPhaseFields
            }
        }
        ${PROCESS_PHASE_FRAGMENT}
    `,
    delete: gql `
        mutation processPhaseDelete($id:ID!){
            processPhaseDelete(id:$id)
        }
    `,
}
