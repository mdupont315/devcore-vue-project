import gql from 'graphql-tag';

// eslint-disable-next-line
const PRICE_MODEL_FRAGMENT = gql `
    fragment priceModelFields on PriceModel{
      id,
      name,
      createdAt,
      updatedAt,
    }
`;

const PRICE_MODEL_FULL_FRAGMENT = gql `
    fragment priceModelFullFields on PriceModel{
        ...priceModelFields,
    }
    ${PRICE_MODEL_FRAGMENT}
`;



export const PRICE_MODEL = {
    findAll: gql `
        query priceModelFindAll($filter:Filter){
            priceModelFindAll(filter:$filter){
                ...priceModelFields
            }
        }
        ${PRICE_MODEL_FRAGMENT}
    `,
    findById: gql `
      query priceModelFindById($id:ID!){
        priceModelFindById(id:$id){
                ...priceModelFullFields
            }
        }
        ${PRICE_MODEL_FULL_FRAGMENT}
    `,
    create: gql `
        mutation priceModelCreate($input:PriceModelInput!){
            priceModelCreate(input:$input){
                ...priceModelFields
            }
        }
        ${PRICE_MODEL_FRAGMENT}
    `,
    update: gql `
        mutation priceModelUpdate($id:ID!, $input:PriceModelInput!){
            priceModelUpdate(id:$id, input:$input){
                ...priceModelFields
            }
        }
        ${PRICE_MODEL_FRAGMENT}
    `,
    delete: gql `
        mutation priceModelDelete($id:ID!){
            priceModelDelete(id:$id)
        }
    `,
}