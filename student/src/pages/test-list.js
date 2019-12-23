import React from 'react'
import {
  Tabs,
  Tab,
  Grid,
  Paper,
  Typography,
  AppBar,
  Button,
  Toolbar
} from '@material-ui/core'
import { Link, Router } from '@reach/router'
import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import Editor from './editor'

const TESTS_QUERY = gql`
  {
    tests {
      id
      name
      description
      checks {
        expected
        input
      }
    }
  }
`

function TestDescription({ test }) {
  return (
    <Paper
      style={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <h3>{test.name}</h3>
      {test.description}
      <div style={{ flexGrow: 1 }} />
      <AppBar style={{ position: 'unset' }}>
        <Toolbar>
          <Typography>Completed: No</Typography>
          <div style={{ flexGrow: 1 }} />
          <Button color='inherit' component={Link} to={`/test-${test.id}`}>
            Begin test
          </Button>
        </Toolbar>
      </AppBar>
    </Paper>
  )
}

function TestList({ testList }) {
  const [tab, setTab] = React.useState(testList[0].name)
  return (
    <Grid container>
      <Grid item xs={3}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          orientation='vertical'
          variant='scrollable'
        >
          {testList.map(test => (
            <Tab value={test.name} label={test.name} />
          ))}
        </Tabs>
      </Grid>
      <Grid item xs={9}>
        {testList.map(
          test => tab === test.name && <TestDescription test={test} />
        )}
      </Grid>
    </Grid>
  )
}

export default function Tests() {
  const { loading, data } = useQuery(TESTS_QUERY)
  if (loading) {
    return <div>Loading</div>
  }
  return (
    <Router>
      <TestList testList={data.tests} path='/' />
      {data.tests.map(test => (
        <Editor path={`/test-${test.id}`} test={test} />
      ))}
    </Router>
  )
}
