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
} from '@material-ui/core'

const WORK_QUERY = gql`
  {
    work_queue {
      queue {
        id
        type {
          id
          language
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
          }
        }
        stage
        errors
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

  const setCountHandler = (count) => {
    set_count({
      variables: { count },
      refetchQueries: [{ query: THREAD_QUERY }],
    })
  }
  const threads = localStorage.getItem('threads')
  return (
    <div>
      {!loading && (
        <div>
          {'Число одновременных задач '}
          <Select
            value={data.threads.count}
            onChange={(e) => setCountHandler(e.target.value)}
          >
            {[...Array(parseInt(threads)).keys()].map((key) => (
              <MenuItem value={key + 1}>{key + 1}</MenuItem>
            ))}
          </Select>
        </div>
      )}
    </div>
  )
}

export default function WorkQueue() {
  const { loading, data } = useQuery(WORK_QUERY)
  return (
    <div>
      <h3>Очередь задач</h3>
      <br />
      {loading ? (
        <div>loading</div>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Язык программирования</TableCell>
                <TableCell>Этап</TableCell>
                <TableCell>Цепочка плагинов</TableCell>
                <TableCell>Ошибки</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.work_queue.queue.map(({ id, type, stage, errors }) => (
                <TableRow>
                  <TableCell>{id}</TableCell>
                  <TableCell>{type.language}</TableCell>
                  <TableCell>{stage}</TableCell>
                  <TableCell>
                    {type.pluginQueue.map((plugin) => plugin.name).join(', ')}
                  </TableCell>
                  <TableCell>{JSON.stringify(errors)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </div>
  )
}
