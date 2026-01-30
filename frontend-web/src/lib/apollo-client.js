import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// Get your GraphQL endpoint
const GRAPHQL_URI = import.meta.env.VITE_GRAPHQL_URI || 'https://brittny-reprehensible-joel.ngrok-free.dev/graphql';

// Create HTTP link
const httpLink = createHttpLink({
  uri: GRAPHQL_URI,
  // Don't use credentials: 'include' unless backend properly supports CORS
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      // Auto-logout on authentication errors
      if (message.includes('Unauthorized') || message.includes('Authentication') || message.includes('invalid token')) {
        console.log('Authentication error detected, clearing localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  // Return headers with token if available
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Combine links
const link = from([errorLink, authLink, httpLink]);

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