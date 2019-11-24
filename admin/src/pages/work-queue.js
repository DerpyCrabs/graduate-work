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
  MenuItem
} from '@material-ui/core'

const WORK_QUERY = gql`
  {
    work_queue {
      queue {
        id
        language
        type {
          id
          pluginQueue {
            id
            enabled
            name
            stage
            version
            settings {
              key
              value
            }
            stats
          }
        }
        stage
        result {
          result
        }
      }
    }
  }
`

const ADD_WORK = gql`
  mutation add_work($language: String!, $text: String!, $type_id: String!) {
    work_queue {
      add_work(language: $language, text: $text, type_id: $type_id) {
        id
      }
    }
  }
`

const ThreadingSelect = () => {
  const THREAD_QUERY = gql`
    {
      threads {
        count
      }
    }
  `
  const { data, loading } = useQuery(THREAD_QUERY)
  const [set_count] = useMutation(
    gql`
      mutation set_count($count: Int!) {
        threads {
          set_count(count: $count)
        }
      }
    `
  )

  const setCountHandler = count => {
    set_count({
      variables: { count },
      refetchQueries: [{ query: THREAD_QUERY }]
    })
  }
  return (
    <div>
      {!loading && (
        <div>
          {'Thread count '}
          <Select
            value={data.threads.count}
            onChange={e => setCountHandler(e.target.value)}
          >
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
            <MenuItem value={4}>4</MenuItem>
          </Select>
        </div>
      )}
    </div>
  )
}

export default function WorkQueue() {
  const { loading, data } = useQuery(WORK_QUERY)
  const [showDialog, setShowDialog] = React.useState(false)
  const [language, setLanguage] = React.useState('')
  const [type, setType] = React.useState('')
  const [text, setText] = React.useState('')
  const [addWork] = useMutation(ADD_WORK)
  const addWorkHandler = () => {
    addWork({
      refetchQueries: [{ query: WORK_QUERY }],
      variables: { language, type_id: type, text }
    })
    setLanguage('')
    setType('')
    setText('')
    setShowDialog(false)
  }
  return (
    <div>
      <h3>Work Queue</h3>
      <Button
        variant='contained'
        color='primary'
        onClick={() => setShowDialog(true)}
      >
        Add work
      </Button>
      <ThreadingSelect />
      <Dialog onClose={() => setShowDialog(false)} open={showDialog}>
        <DialogTitle>Add work</DialogTitle>
        <TextField
          label='Language'
          value={language}
          onChange={e => setLanguage(e.target.value)}
        />
        <TextField
          label='Type'
          value={type}
          onChange={e => setType(e.target.value)}
        />
        <TextField
          label='Program text'
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <Button variant='contained' color='primary' onClick={addWorkHandler}>
          Add
        </Button>
      </Dialog>
      <br />
      {loading ? (
        <div>loading</div>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Language</TableCell>
                <TableCell>Stage</TableCell>
                <TableCell>Plugin Queue</TableCell>
                <TableCell>Result</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.work_queue.queue.map(
                ({ id, language, type, stage, result }) => (
                  <TableRow>
                    <TableCell>{id}</TableCell>
                    <TableCell>{language}</TableCell>
                    <TableCell>{stage}</TableCell>
                    <TableCell>
                      {type.pluginQueue.map(plugin => plugin.name).join(', ')}
                    </TableCell>
                    <TableCell>{JSON.stringify(result)}</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </div>
  )
}
