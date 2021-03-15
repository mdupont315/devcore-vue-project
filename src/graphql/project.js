import gql from 'graphql-tag';
import {
    META_FRAGMENT
} from './meta';
// eslint-disable-next-line
export const PROJECT_FRAGMENT = gql `
    fragment projectFields on Project{
      id,
      name,
      description,
      createdAt,
      updatedAt,
      status,
      budget,
      type,
      evaluationType,
      evaluationIntervalUnit,
      evaluationIntervalAmount,
      totalLosses,
      totalGains,
      consolidatedValue,
      processId
      stages{
            id
            status
            processStageId
            totalGains,
            totalLosses,
            consolidatedValue,
            totalEvaluations
            processStage{
                id
                title
            }
            ideas{
                id,
                ideaId
                title
            }
      }
      stats {
        totalGains
        totalLosses
        consolidatedValue
        totalEvaluations
        stages {
            id
            totalGains
            totalLosses
            consolidatedValue
            totalEvaluations
        }
    }

      _metadata{
          ...metaFields
      }
    }
    ${META_FRAGMENT}
`;

export const PROJECT_FULL_FRAGMENT = gql `
    fragment projectFullFields on Project{
        ...projectFields,
        companyTools{
          id,
        }
        users{
            id
        }
        tools{
          id,
          toolId,
          stageId
        }
        ideas{
            id,
            ideaId,
            title,
            projectId
            stageId
            processStageId
            totalGains,
            totalLosses,
            consolidatedValue,
            totalEvaluations
        }
        issues{
            id
            title
            description
            totalValue
            projectStageId
        }
        companyTools{
            id
            toolId,
        }
        stages{
            id
            status
            processStageId
            processStage{
                id
                title
            }
            ideas{
                id,
                ideaId
                title
            }

      }
    }
    ${PROJECT_FRAGMENT}
`;



export const PROJECT = {
    findAll: gql `
        query projectFindAll($filter:Filter){
            projectFindAll(filter:$filter){
                ...projectFields
            }
        }
        ${PROJECT_FRAGMENT}
    `,
    findById: gql `
      query projectFindById($id:ID!){
        projectFindById(id:$id){
                ...projectFullFields
            }
        }
        ${PROJECT_FULL_FRAGMENT}
    `,
    create: gql `
        mutation projectCreate($input:ProjectCreateInput!){
            projectCreate(input:$input){
                ...projectFullFields
            }
        }
        ${PROJECT_FULL_FRAGMENT}
    `,
    update: gql `
        mutation projectUpdate($id:ID!, $input:ProjectUpdateInput!){
            projectUpdate(id:$id, input:$input){
                ...projectFullFields
            }
        }
        ${PROJECT_FULL_FRAGMENT}
    `,
    nextStage: gql `
        mutation projectNextStage($id:ID!){
            projectNextStage(id:$id){
                    ...projectFullFields
                }
            }
            ${PROJECT_FULL_FRAGMENT}
        `,
    completeStage: gql `
        mutation projectCompleteStage($id:ID!, $stageId:[ID!]){
            projectCompleteStage(id:$id, stageId:$stageId){
                    ...projectFullFields
                }
            }
            ${PROJECT_FULL_FRAGMENT}
        `,
    delete: gql `
        mutation projectDelete($id:ID!){
            projectDelete(id:$id)
        }
    `,
}
