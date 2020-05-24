import gql from 'graphql-tag'
import React from 'react'
import { useMutation, useQuery } from '@apollo/react-hooks'
import {
  Button,
  Dialog,
  DialogTitle,
  ExpansionPanel,
  ExpansionPanelActions,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
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

const ADD_CHECK = gql`
  mutation add_check($test_id: String!, $input: String!, $expected: String!) {
    tests {
      add_check(test_id: $test_id, input: $input, expected: $expected)
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
      remove_check(test_id: $test_id, input: $input, expected: $expected)
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
      variables: { test_id, input, expected },
    })
    setInput('')
    setExpected('')
    setShowDialog(false)
  }

  return (
    <>
      <Dialog onClose={() => setShowDialog(false)} open={showDialog}>
        <DialogTitle>Добавление проверки</DialogTitle>
        <TextField
          label='Ввод'
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <TextField
          label='Ожидаемый вывод'
          value={expected}
          onChange={(e) => setExpected(e.target.value)}
        />
        <Button variant='contained' color='primary' onClick={addCheckHandler}>
          Добавить
        </Button>
      </Dialog>
      <Button size='small' onClick={() => setShowDialog(true)}>
        Добавить проверку
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
      variables: { name, description },
    })
    setName('')
    setDescription('')
    setShowDialog(false)
  }

  return (
    <>
      <Dialog onClose={() => setShowDialog(false)} open={showDialog}>
        <DialogTitle>Добавление задания</DialogTitle>
        <TextField
          label='Название'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label='Описание'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button variant='contained' color='primary' onClick={addTestHandler}>
          Добавить
        </Button>
      </Dialog>
      <Button style={{ width: '100%' }} onClick={() => setShowDialog(true)}>
        Добавить задание
      </Button>
    </>
  )
}
export default function Tests() {
  const { loading, data } = useQuery(TESTS_QUERY)
  const [removeCheck] = useMutation(REMOVE_CHECK)
  const [addCheck] = useMutation(ADD_CHECK)
  const removeCheckHandler = (test_id, input, expected) => {
    removeCheck({
      variables: { test_id, input, expected },
      refetchQueries: [{ query: TESTS_QUERY }],
    })
  }
  return (
    <div>
      <h3>Задания</h3>
      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <Paper>
          {data.tests.map((test) => (
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='h6'>
                  {test.id} - {test.name}
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails style={{ flexDirection: 'column' }}>
                <Typography>{test.description}</Typography>
                <br />
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ввод</TableCell>
                      <TableCell>Ожидаемый вывод</TableCell>
                      <TableCell>Максимальное время</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {test.checks.map((check, i) => (
                      <TableRow>
                        <TableCell>{check.input}</TableCell>
                        <TableCell>{check.expected}</TableCell>
                        <TableCell>{i == 0 ? '0:05' : '0:30'}</TableCell>
                        <TableCell>
                          <Button
                            onClick={(e) =>
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
              </ExpansionPanelActions>
            </ExpansionPanel>
          ))}
          <AddTestDialogButton />
        </Paper>
      )}
    </div>
  )
}
