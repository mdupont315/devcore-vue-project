import VueApollo from 'vue-apollo';
import ApolloClient from 'apollo-client';
//import { BatchHttpLink } from 'apollo-link-batch-http';
//import { WebSocketLink } from 'apollo-link-ws';
import {
    InMemoryCache,
    IntrospectionFragmentMatcher
} from 'apollo-cache-inmemory';
import {
    ApolloLink
} from 'apollo-link';
import {
    onError
} from "apollo-link-error";
import config from './config';
import EchoLink from './echolink';
import store from "@/store"
import {
    createUploadLink
} from 'apollo-upload-client';
import {
    showGraphqlErrorFromResponse
} from '../../lib/utils';


// import {
//     IntrospectionFragmentMatcher
// } from 'apollo-cache-inmemory';
import introspectionQueryResultData from '@/fragmentTypes.json';

const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData
});

const cache = new InMemoryCache({
    fragmentMatcher
});

//const cache = new InMemoryCache();

/*
const batchHttpLink = new BatchHttpLink({
  uri: config.graphqlEndpoint,
  credentials: 'include',
  fetch: async (uri, options) => {
    //add the auth token to the headers
    const token = store.getters['auth/access_token'];
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(uri, options);
  },
});*/

// eslint-disable-next-line
const errorLink = onError(({
    networkError
}) => {
    if (networkError) {
        showGraphqlErrorFromResponse(networkError);
    }
    /*if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ),
      );
    }
    if (networkError) console.log(`[Network error]: ${networkError}`);*/
    //console.log(networkError.statusCode + ' ' + networkError.name);

});

//allow file uploads (it's a terminating link, so it cannot be mixed)
// eslint-disable-next-line
const fileUploadLink = new createUploadLink({
    uri: config.graphqlEndpoint,
    credentials: 'include',
    fetch: async (uri, options) => {
        try {
            //add the auth token to the headers
            const token = store.getters['auth/access_token'];
            if (token) {
                options.headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(uri, options);
            if (response && response.headers && response.status != 500) {
                const userId = response.headers.get('X-User-Id');
                await store.dispatch('auth/checkSameUser', userId);
            }
            return response;
            //eslint-disable-next-line
        } catch (ex) {

            // console.log(JSON.stringify(ex))
            // Object.keys(ex).map(() => console.log)
            // throw ex;
        }
    },
    includeExtensions: true,
})

// const wsLink = new WebSocketLink({
//   uri: 'ws://localhost:3000/graphql',
//   options: {
//     reconnect: true,
//     // connectionParams: () => {
//     //   const token = 'asdfasdfasdfasdfasdfasfasdf';//store.getters['auth/access_token'];
//     //   console.log(token);
//     //   return {
//     //     authorization: `Bearer ${token}`,
//     //   }
//     // },
//   },
// });

// wsLink.subscriptionClient.use([{
//   applyMiddleware: async (options, next) => {
//     const token = store.getters['auth/access_token'];
//     if (token) {
//       options.Authorization = `Bearer ${token}`;
//     }
//     next()
//   },
// }]);

// const authMiddleware = new ApolloLink((operation, forward) => {
//   applyMiddleware:()=>
//   // Add the authorization to the headers for HTTP authentication
//   //add the auth token to the headers
//   const token = store.getters['auth/access_token'];

//   if (token) {
//     operation.setContext({
//       headers: {
//         authorization: `Bearer ${token}`,
//       },
//     });
//   }

//   // Add onto payload for WebSocket authentication
//   //(operation & { authToken: string | undefined }).authToken = token;


//   return (forward)(operation);
// });

// wsLink.subscriptionClient.use([authMiddleware]);

/*
//After the backend responds
const afterwareLink = new ApolloLink((operation, forward) => {
  return forward(operation).map(response => {
    const context = operation.getContext()
    console.log(context)
    const {
      response: { headers }
    } = context

    if (headers) {
      const refreshToken = headers.get('refreshToken')
      if (refreshToken) {
        localStorage.setItem(AUTH_TOKEN, refreshToken)
      }
    }


    return response
  })
})*/


//apollo links config
const apolloLinks = [];
config.allowSubscriptions = config.allowSubscriptions && store && store.getters["auth/access_token"];
//allow graphql subscriptions
if (config.allowSubscriptions) {
    const echoLink = new EchoLink();
    apolloLinks.push(echoLink);
}

apolloLinks.push(fileUploadLink);

export const apolloClient = new ApolloClient({
    link: ApolloLink.from(apolloLinks),
    cache,
    credentials: 'include',
    defaultOptions: {
        watchQuery: {
            errorPolicy: 'all',
            // fetchPolicy: 'cache-and-network',
            fetchPolicy: 'no-cache',
        },
        query: {
            // fetchPolicy: 'cache-and-network',
            fetchPolicy: 'no-cache',
            errorPolicy: 'all',
        },
    },
});



export const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
});