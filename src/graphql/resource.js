import gql from 'graphql-tag';
import {
    META_FRAGMENT
} from './meta';
// eslint-disable-next-line
export const RESOURCE_FRAGMENT = gql `
    fragment resourceFields on Resource{
      id,
      title,
      size,
      section,
      mimeType,
      displayType,
      properties,
      url,
      uri,
      _metadata{
        ...metaFields
      }
    }
    ${META_FRAGMENT}
`;

// export const IDEA_CONTENT_RESOURCES_FRAGMENT = gql `
//     fragment ideaContentResourceFields on IdeaContentResource{
//       uuid,
//       files {
//         ...resourceFields
//       }
//     }
//     ${RESOURCE_FRAGMENT}
// `;

