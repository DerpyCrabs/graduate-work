import React, { Suspense } from 'react'
import { ApolloProvider, useQuery } from '@apollo/react-hooks'
import client from './apollo-client'
import Login from './pages/login'
import { Router } from '@reach/router'
import gql from 'graphql-tag'
import Index from './pages/index'
import CssBaseline from '@material-ui/core/CssBaseline'

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
      <Router>{data.token ? <Index path='/*' /> : <Login path='/' />}</Router>
    </Suspense>
  )
}

const App = () => {
  return (
    <ApolloProvider client={client}>
      <CssBaseline>
        <AdminApp className='is-primary is-bold hero is-fullheight' />
      </CssBaseline>
    </ApolloProvider>
  )
}

export default App
