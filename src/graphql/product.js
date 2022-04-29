import gql from 'graphql-tag';

// eslint-disable-next-line
const PRODUCT_FRAGMENT = gql `
    fragment productFields on Product{
      id,
      name,
      unitYearlyCosts,
      toolId,
      categoryId,
      quantity,
      priceModelId,
      createdAt,
      updatedAt,
    }
`;

const PRODUCT_FULL_FRAGMENT = gql `
    fragment productFullFields on Product{
        ...productFields,
        
    }
    ${PRODUCT_FRAGMENT}
`;



export const PRODUCT = {
    findAll: gql `
        query productFindAll($filter:Filter){
            productFindAll(filter:$filter){
                ...productFields
            }
        }
        ${PRODUCT_FRAGMENT}
    `,
    findById: gql `
      query productFindById($id:ID!){
        productFindById(id:$id){
                ...productFullFields
            }
        }
        ${PRODUCT_FULL_FRAGMENT}
    `,
    create: gql `
        mutation productCreate($input:ProductInput!){
            productCreate(input:$input){
                ...productFields
            }
        }
        ${PRODUCT_FRAGMENT}
    `,
    update: gql `
        mutation productUpdate($id:ID!, $input:ProductInput!){
            productUpdate(id:$id, input:$input){
                ...productFields
            }
        }
        ${PRODUCT_FRAGMENT}
    `,
    delete: gql `
        mutation productDelete($id:ID!){
            productDelete(id:$id)
        }
    `,
}