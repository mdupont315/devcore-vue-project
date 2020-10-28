import gql from 'graphql-tag';

// eslint-disable-next-line
const PRODUCT_CATEGORY_FRAGMENT = gql `
    fragment productCategoryFields on ProductCategory{
      id,
      name,
      createdAt,
      updatedAt,
    }
`;

const PRODUCT_CATEGORY_FULL_FRAGMENT = gql `
    fragment productCategoryFullFields on ProductCategory{
        ...productCategoryFields,
    }
    ${PRODUCT_CATEGORY_FRAGMENT}
`;



export const PRODUCT_CATEGORY = {
    findAll: gql `
        query productCategoryFindAll($filter:Filter){
            productCategoryFindAll(filter:$filter){
                ...productCategoryFields
            }
        }
        ${PRODUCT_CATEGORY_FRAGMENT}
    `,
    findById: gql `
      query productCategoryFindById($id:ID!){
        productCategoryFindById(id:$id){
                ...productCategoryFullFields
            }
        }
        ${PRODUCT_CATEGORY_FULL_FRAGMENT}
    `,
    create: gql `
        mutation productCategoryCreate($input:ProductCategoryInput!){
            productCategoryCreate(input:$input){
                ...productCategoryFields
            }
        }
        ${PRODUCT_CATEGORY_FRAGMENT}
    `,
    update: gql `
        mutation productCategoryUpdate($id:ID!, $input:ProductCategoryInput!){
            productCategoryUpdate(id:$id, input:$input){
                ...productCategoryFields
            }
        }
        ${PRODUCT_CATEGORY_FRAGMENT}
    `,
    delete: gql `
        mutation productCategoryDelete($id:ID!){
            productCategoryDelete(id:$id)
        }
    `,
}