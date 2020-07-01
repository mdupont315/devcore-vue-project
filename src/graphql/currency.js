import gql from 'graphql-tag';
import {
    META_FRAGMENT
} from './meta';
// eslint-disable-next-line
const CURRENCY_FRAGMENT = gql `
    fragment currencyFields on Currency{
      name,
      code,
      symbol,
      createdAt
      updatedAt
      _metadata{
          ...metaFields
      }
    }
    ${META_FRAGMENT}
`;


export const CURRENCY = {
    findAll: gql `
        query currencyFindAll($filter:Filter){
            currencyFindAll(filter:$filter){
                ...currencyFields
            }
        }
        ${CURRENCY_FRAGMENT}
    `,

}