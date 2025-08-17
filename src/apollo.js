import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import nhost from './nhost.js';

const httpLink = createHttpLink({
  uri: nhost.graphql.getUrl(),
});

const authLink = setContext(async (_, { headers }) => {
  const token = nhost.auth.getAccessToken();
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    
    // If it's an authentication error, try to refresh the token
    if (networkError.statusCode === 401) {
      console.log('Authentication error detected, attempting to refresh token...');
      return nhost.auth.refreshAccessToken().then(() => {
        // Retry the operation
        return forward(operation);
      });
    }
  }
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default client;

