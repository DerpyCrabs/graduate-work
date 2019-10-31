import React, { Suspense } from 'react'
import { ApolloProvider, useQuery } from '@apollo/react-hooks'
import client from './apollo-client'
import Login from './pages/login'
import Signup from './pages/signup'
import { Router } from '@reach/router'
import gql from 'graphql-tag'
import Index from './pages/index'

const AdminApp = () => {
  const { data } = useQuery(
    gql`
      {
        token @client
      }
    `
  )
  return (
      <Suspense fallback={<div>loading...</div>}>
        <Router>
          {data.token ? <Index path="/" /> : <Login path="/" />}
          <Signup path="/signup" />
        </Router>
      </Suspense>
  )
}

const App = () => {
  return (
    <ApolloProvider client={client}>
      <AdminApp className="is-primary is-bold hero is-fullheight" />
    </ApolloProvider>
  )
}

export default App
