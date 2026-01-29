import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://brittny-reprehensible-joel.ngrok-free.dev/graphql',
  cache: new InMemoryCache(),
  headers: {
    'Authorization': localStorage.getItem('token') 
      ? `Bearer ${localStorage.getItem('token')}` 
      : ''
  }
});

export default client;