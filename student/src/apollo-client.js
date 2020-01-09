import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { resolvers, defaults } from './resolvers'
import { HttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context'

const httpLink = new HttpLink({
  uri: 'http://192.168.43.173:3000/graphql'
})

const cache = new InMemoryCache()

const authLink = setContext((_, { headers }) => {
  const token = window.localStorage.getItem('token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  }
})

const client = new ApolloClient({
  cache,
  link: authLink.concat(httpLink),
  resolvers
})

cache.writeData({data: defaults })
export default client
