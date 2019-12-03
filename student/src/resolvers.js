import gql from 'graphql-tag'
import client from './apollo-client'
import { navigate } from '@reach/router'

export const defaults = { token: localStorage.getItem('token') }
export const resolvers = {
  Mutation: {
    login: async (_, { email, password }, { cache }) => {
      const query = gql`
        mutation login($email: String!, $password: String!) {
          login(email: $email, password: $password)
        }
      `
      let { data, error } = await client.mutate({
        mutation: query,
        variables: { email, password }
      })
      if (error) {
        throw new Error(`Failed to login: ${error}`)
      }
      cache.writeData({ data: { token: data.login } })
      localStorage.setItem('token', data.login)
      return data.login
    },
    logout: async (_, __, { cache }) => {
      cache.reset()
      cache.writeData({ data: { token: '' } })
      localStorage.setItem('token', '')
      await navigate('/')
      return ''
    }
  }
}
