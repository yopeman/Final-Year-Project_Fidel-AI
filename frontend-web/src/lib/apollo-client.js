import { ApolloClient, InMemoryCache, createHttpLink, from, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import useAuthStore from '../store/authStore';

// Get your GraphQL endpoint
export const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://brittny-reprehensible-joel.ngrok-free.dev'
const GRAPHQL_URI = `${BASE_URL}/graphql`;
const WS_GRAPHQL_URI = GRAPHQL_URI.replace('https', 'ws');

// Create HTTP link
const httpLink = createHttpLink({
  uri: GRAPHQL_URI,
});

// Create WebSocket link
const wsLink = new GraphQLWsLink(createClient({
  url: WS_GRAPHQL_URI,
  connectionParams: () => {
    const { token } = useAuthStore.getState();
    return {
      Authorization: token ? `Bearer ${token}` : '',
    };
  },
}));

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      // Auto-logout on authentication errors
      if (message.includes('Unauthorized') || message.includes('Authentication') || message.includes('invalid token')) {
        console.log('Authentication error detected, clearing store');
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    
    // Handle 400 Bad Request errors
    if (networkError.statusCode === 400) {
      console.error('Backend returned 400 Bad Request. Check your GraphQL query/mutation.');
    }
  }
});

// Auth link to add token to headers
const authLink = setContext((_, { headers }) => {
  // Get token from store
  const { token } = useAuthStore.getState();
  
  // Return headers with token if available
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Combine HTTP links
const httpCombinedLink = from([errorLink, authLink, httpLink]);

// Split link based on operation type
const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpCombinedLink
);

// Cache configuration
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        me: {
          merge(existing, incoming) {
            return incoming;
          },
        },
        // Add other cache policies as needed
      },
    },
  },
});

// Create Apollo Client instance
const client = new ApolloClient({
  link: link,
  cache: cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network', // Good for real-time updates
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only', // Always fetch fresh data for queries
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  // Enable Apollo DevTools in development
  connectToDevTools: process.env.NODE_ENV === 'development',
});

export default client;