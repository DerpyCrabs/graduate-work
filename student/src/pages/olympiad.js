import React from 'react'
import {
  Tabs,
  Tab,
  Grid,
  Paper,
  Typography,
  AppBar,
  Button,
  Toolbar,
} from '@material-ui/core'
import { Link, Router } from '@reach/router'
import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import Editor from './editor'
import TestDesc from '../components/test-description'
import SolutionSubmit from '../components/solution-submit'

const getParticipant = (olympiad, email) =>
  olympiad.participants.find((p) =>
    p.users.map((u) => u.user.email).includes(email)
  )

const getSubmittedAnswers = (olympiad, participant_id, test_id) =>
  olympiad.participants
    .find((p) => p.id === participant_id)
    .test_answers.filter((ta) => ta.test.id === test_id)

function TestDescription({ test }) {
  return (
    <Paper
      style={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: 10, flexGrow: 1 }}>
        <TestDesc test={test} />
      </div>
      <AppBar style={{ position: 'unset' }}>
        <Toolbar>
          <div style={{ flexGrow: 1 }} />
          <Button color='inherit' component={Link} to={`test-${test.id}`}>
            Начать задание
          </Button>
        </Toolbar>
      </AppBar>
    </Paper>
  )
}

function TestList({ olympiad }) {
  const { loading, data } = useQuery(
    gql`
      {
        me {
          email
        }
      }
    `
  )

  const [tab, setTab] = React.useState(
    olympiad.tests.length !== 0 ? olympiad.tests[0].test.name : ''
  )
  if (loading) {
    return null
  }
  if (olympiad.tests.length === 0) {
    return (
      <div>
        Эта олимпиада не содержит заданий. Обратитесь к организатору для
        разъяснения ситуации.
      </div>
    )
  }
  const p = getParticipant(olympiad, data.me.email)
  return (
    <Grid container>
      <Grid item xs={3} style={{ display: 'flex', flexDirection: 'column' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          orientation='vertical'
          variant='scrollable'
        >
          {olympiad.tests.map((test) => (
            <Tab
              value={test.test.name}
              label={test.test.name}
              style={{
                backgroundColor:
                  getSubmittedAnswers(olympiad, p.id, test.test.id).length !== 0
                    ? 'lightgreen'
                    : 'white',
              }}
            />
          ))}
        </Tabs>
        <div style={{ flexGrow: 1 }} />
        <SolutionSubmit olympiad={olympiad} email={data.me.email} />
      </Grid>
      <Grid item xs={9}>
        {olympiad.tests.map(
          (test) =>
            tab === test.test.name && <TestDescription test={test.test} />
        )}
      </Grid>
    </Grid>
  )
}

export default function Olympiad({ olympiad }) {
  return (
    <Router>
      <TestList olympiad={olympiad} path='/' />
      {olympiad.tests.map((test) => (
        <Editor
          path={`/test-${test.test.id}`}
          olympiad={olympiad}
          test={test}
        />
      ))}
    </Router>
  )
}
