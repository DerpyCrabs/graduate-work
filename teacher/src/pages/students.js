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

const USERS_QUERY = gql`
  {
    users {
      email
      role
    }
  }
`

const sortUsers = users => {
  let copyUsers = users.slice()
  copyUsers.sort((a, b) => (a.email > b.email ? 1 : -1))
  return copyUsers
}

export default function Users() {
  const { loading, data } = useQuery(USERS_QUERY)

  return (
    <div>
      <h3>Users</h3>
      {loading ? (
        <div>loading</div>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortUsers(data.users).map(({ email }) => (
                <TableRow>
                  <TableCell>{email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </div>
  )
}
