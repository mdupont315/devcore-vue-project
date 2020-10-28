import gql from 'graphql-tag';

// eslint-disable-next-line
const ROLE_FRAGMENT = gql `
    fragment roleFields on Role{
      id,
      name,
      createdAt,
      updatedAt,
    }
`;

const ROLE_FULL_FRAGMENT = gql `
    fragment roleFullFields on Role{
        ...roleFields,
    }
    ${ROLE_FRAGMENT}
`;



export const ROLE = {
    findAll: gql `
        query roleFindAll($filter:Filter){
            roleFindAll(filter:$filter){
                ...roleFields
            }
        }
        ${ROLE_FRAGMENT}
    `,
    findById: gql `
      query roleFindById($id:ID!){
        roleFindById(id:$id){
                ...roleFullFields
            }
        }
        ${ROLE_FULL_FRAGMENT}
    `,

}