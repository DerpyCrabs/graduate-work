import React from 'react'
import Head from 'next/head'
import Nav from '../components/nav'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'

const Home = () => {
  const { data } = useQuery(
    gql`
      {
        plugins {
          list {
            name
          }
        }
      }
    `
  )
  return (
    <div>
      <Head>
        <title>Home</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      {JSON.stringify(data)}

      <Nav />
    </div>
  )
}

export default Home
