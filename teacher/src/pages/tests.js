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
  Typography,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  ExpansionPanelActions
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

const TESTS_QUERY = gql`
  {
    tests {
      id
      name
      description
      checks {
        input
        expected
      }
    }
  }
`

const ADD_TEST = gql`
  mutation add_test($name: String!, $description: String!) {
    tests {
      add_test(name: $name, description: $description) {
        name
      }
    }
  }
`

const REMOVE_TEST = gql`
  mutation remove_test($test_id: String!) {
    tests {
      remove_test(test_id: $test_id)
    }
  }
`

const ADD_CHECK = gql`
  mutation add_check($test_id: String!, $input: String!, $expected: String!) {
    tests {
      add_check(test_id: $test_id, input: $input, expected: $expected) {
        name
      }
    }
  }
`

const REMOVE_CHECK = gql`
  mutation remove_check(
    $test_id: String!
    $input: String!
    $expected: String!
  ) {
    tests {
      remove_check(test_id: $test_id, input: $input, expected: $expected) {
        name
      }
    }
  }
`

function AddCheckDialogButton({ test_id }) {
  const [addCheck] = useMutation(ADD_CHECK)
  const [showDialog, setShowDialog] = React.useState(false)
  const [input, setInput] = React.useState('')
  const [expected, setExpected] = React.useState('')
  const addCheckHandler = () => {
    addCheck({
      refetchQueries: [{ query: TESTS_QUERY }],
      variables: { test_id, input, expected }
    })
    setInput('')
    setExpected('')
    setShowDialog(false)
  }

  return (
    <>
      <Dialog onClose={() => setShowDialog(false)} open={showDialog}>
        <DialogTitle>Add check</DialogTitle>
        <TextField
          label='Input'
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <TextField
          label='Expected'
          value={expected}
          onChange={e => setExpected(e.target.value)}
        />
        <Button variant='contained' color='primary' onClick={addCheckHandler}>
          Add
        </Button>
      </Dialog>
      <Button size='small' onClick={() => setShowDialog(true)}>
        Add check
      </Button>
    </>
  )
}
function AddTestDialogButton() {
  const [addTest] = useMutation(ADD_TEST)
  const [showDialog, setShowDialog] = React.useState(false)
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const addTestHandler = () => {
    addTest({
      refetchQueries: [{ query: TESTS_QUERY }],
      variables: { name, description }
    })
    setName('')
    setDescription('')
    setShowDialog(false)
  }

  return (
    <>
      <Dialog onClose={() => setShowDialog(false)} open={showDialog}>
        <DialogTitle>Add test</DialogTitle>
        <TextField
          label='Name'
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <TextField
          label='Description'
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <TextField // TODO make it work
          label='Оценка в баллах'
          type='number'
          value={500}
          onChange={e => setDescription(e.target.value)}
        />
        <Button variant='contained' color='primary' onClick={addTestHandler}>
          Add
        </Button>
      </Dialog>
      <Button style={{ width: '100%' }} onClick={() => setShowDialog(true)}>
        Add test
      </Button>
    </>
  )
}
export default function Tests() {
  const { loading, data } = useQuery(TESTS_QUERY)
  const [removeTest] = useMutation(REMOVE_TEST)
  const [removeCheck] = useMutation(REMOVE_CHECK)
  const [addCheck] = useMutation(ADD_CHECK)
  const removeCheckHandler = (test_id, input, expected) => {
    removeCheck({
      variables: { test_id, input, expected },
      refetchQueries: [{ query: TESTS_QUERY }]
    })
  }
  const removeTestHandler = test_id => {
    removeTest({
      variables: { test_id },
      refetchQueries: [{ query: TESTS_QUERY }]
    })
  }
  return (
    <div>
      <h3>Tests</h3>
      {loading ? (
        <div>loading</div>
      ) : (
        <Paper>
          {data.tests.map(test => (
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='h6'>
                  {test.id} - {test.name}
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails style={{ flexDirection: 'column' }}>
                <Typography>{test.description}</Typography>
                <TextField // TODO make it work
                  label='Оценка в баллах'
                  type='number'
                  value={500}
                />
                <br />
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Input</TableCell>
                      <TableCell>Expected output</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {test.checks.map(check => (
                      <TableRow>
                        <TableCell>{check.input}</TableCell>
                        <TableCell>{check.expected}</TableCell>
                        <TableCell>
                          <Button
                            onClick={e =>
                              removeCheckHandler(
                                test.id,
                                check.input,
                                check.expected
                              )
                            }
                          >
                            X
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ExpansionPanelDetails>
              <ExpansionPanelActions>
                <AddCheckDialogButton test_id={test.id} />
                <Button size='small' onClick={e => removeTestHandler(test.id)}>
                  Remove test
                </Button>
              </ExpansionPanelActions>
            </ExpansionPanel>
          ))}
          <AddTestDialogButton />
        </Paper>
      )}
    </div>
  )
}
