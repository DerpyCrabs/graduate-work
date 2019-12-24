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

// const ADD_WORK = gql`
//   mutation add_work($language: String!, $text: String!, $type_id: String!) {
//     work_queue {
//       add_work(language: $language, text: $text, type_id: $type_id) {
//         id
//       }
//     }
//   }
// `

export default function Tests() {
  const { loading, data } = useQuery(TESTS_QUERY)
  // const [showDialog, setShowDialog] = React.useState(false)
  // const [language, setLanguage] = React.useState('')
  // const [type, setType] = React.useState('')
  // const [text, setText] = React.useState('')
  // const [addWork] = useMutation(ADD_WORK)
  // const addWorkHandler = () => {
  //   addWork({
  //     refetchQueries: [{ query: WORK_QUERY }],
  //     variables: { language, type_id: type, text }
  //   })
  //   setLanguage('')
  //   setType('')
  //   setText('')
  //   setShowDialog(false)
  // }
  return (
    <div>
      <h3>Tests</h3>
      {/* <Dialog onClose={() => setShowDialog(false)} open={showDialog}>
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
      </Dialog> */}
      {loading ? <div>loading</div> : <Paper></Paper>}
    </div>
  )
}
