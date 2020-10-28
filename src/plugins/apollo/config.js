export default {
    graphqlEndpoint: process.env.VUE_APP_GRAPHQL_ENDPOINT,
    wsEndpoint: process.env.VUE_APP_GRAPHQL_SUBSCRIPTIONS_ENDPOINT,
    wsPort: process.env.VUE_APP_GRAPHQL_SUBSCRIPTIONS_PORT,
    allowSubscriptions: process.env.VUE_APP_GRAPHQL_SUBSCRIPTIONS_ENABLED === 'TRUE',
}