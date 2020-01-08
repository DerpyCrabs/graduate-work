import React from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  TextField,
  Button,
  Select,
  MenuItem,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Typography
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

const TESTS_QUERY = gql`
  {
    users {
      email
      role
    }
    stats {
      test_completion {
        student_email
        done_at
        errors
        language
        test_name
        test_id
      }
    }
    tests {
      id
      name
    }
  }
`
function getTestCompletion(test, student, completions) {
  for (const completion of completions) {
    if (
      completion.student_email === student &&
      completion.test_id === test &&
      completion.errors === 0
    ) {
      return completion
    }
  }
  return null
}
function getStudentDoneTestsCount(tests, student, completions) {
  let count = 0
  for (const test of tests) {
    if (getTestCompletion(test.id, student, completions)) {
      count += 1
    }
  }
  return count
}
function TestCompletionTable({ student, data, tests }) {
  return (
    <div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Test name</TableCell>
            <TableCell>Completed?</TableCell>
            <TableCell>When?</TableCell>
            <TableCell>What language was used?</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tests.map(({ id, name }) => (
            <TableRow key={id}>
              <TableCell>{name}</TableCell>
              {(() => {
                const completion = getTestCompletion(id, student, data)
                if (completion) {
                  return (
                    <>
                      <TableCell>Yes</TableCell>
                      <TableCell>
                        {new Date(
                          parseInt(completion.done_at)
                        ).toLocaleString()}
                      </TableCell>
                      <TableCell>{completion.language}</TableCell>
                    </>
                  )
                } else {
                  return (
                    <>
                      <TableCell>No</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </>
                  )
                }
              })()}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
export default function Students() {
  const { loading, data } = useQuery(TESTS_QUERY)
  if (loading) {
    return <div>loading...</div>
  }

  const students = data.users
    .filter(user => user.role === 'student')
    .map(user => user.email)
  return (
    <div>
      <h3>Students progress</h3>
      {loading ? (
        <div>loading</div>
      ) : (
        <Paper>
          {students.map(student => (
            <ExpansionPanel key={student}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='h6'>
                  {student} - done{' '}
                  {getStudentDoneTestsCount(
                    data.tests,
                    student,
                    data.stats.test_completion
                  )}
                  /{data.tests.length} tests
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <TestCompletionTable
                  student={student}
                  data={data.stats.test_completion}
                  tests={data.tests}
                />
              </ExpansionPanelDetails>
            </ExpansionPanel>
          ))}
        </Paper>
      )}
    </div>
  )
}
