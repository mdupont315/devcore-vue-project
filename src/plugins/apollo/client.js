import VueApollo from "vue-apollo";
import ApolloClient from "apollo-client";
import {
  InMemoryCache,
  IntrospectionFragmentMatcher
} from "apollo-cache-inmemory";
import { ApolloLink } from "apollo-link";
import { createUploadLink } from "apollo-upload-client";
import config from "./config";
import store from "@/store";
import introspectionQueryResultData from "@/fragmentTypes.json";
import { showGraphqlErrorFromResponse } from "../../lib/utils";
import { onError } from "apollo-link-error";

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData
});

const cache = new InMemoryCache({
  fragmentMatcher
});

// eslint-disable-next-line
const errorLink = onError(({ networkError }) => {
  if (networkError) {
    showGraphqlErrorFromResponse(networkError);
  }
});

// allow file uploads (it's a terminating link, so it cannot be mixed)
// eslint-disable-next-line
const fileUploadLink = new createUploadLink({
  uri: config.graphqlEndpoint,
  credentials: "include",
  fetch: async (uri, options) => {
    try {
      // add the auth token to the headers
      const token = store.getters["auth/access_token"];

      if (token) {
        options.headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch(uri, options);
      if (response && response.headers && response.status != 500) {
        const userId = response.headers.get("X-User-Id");
        await store.dispatch("auth/checkSameUser", userId);
      }
      return response;
      // eslint-disable-next-line
    } catch (ex) {
      console.log(ex);
    }
  },
  includeExtensions: true
});

// apollo links config
const apolloLinks = [];
config.allowSubscriptions =
  config.allowSubscriptions && store && store.getters["auth/access_token"];
// allow graphql subscriptions


apolloLinks.push(fileUploadLink);

export const apolloClient = new ApolloClient({
  link: ApolloLink.from(apolloLinks),
  cache,
  credentials: "include",
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
      fetchPolicy: "network-only"
      //fetchPolicy: "no-cache"
    },
    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all"
    }
  }
});

export const apolloProvider = new VueApollo({
  defaultClient: apolloClient
});
