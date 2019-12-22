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

const CHANGE_ROLE = gql`
  mutation change_role($email: String!, $role: String!) {
    change_role(email: $email, role: $role)
  }
`

const sortUsers = users => {
  let copyUsers = users.slice()
  copyUsers.sort((a, b) => (a.email > b.email ? 1 : -1))
  return copyUsers
}

export default function Users() {
  const { loading, data } = useQuery(USERS_QUERY)
  const [changeRole] = useMutation(CHANGE_ROLE)
  const changeRoleHandler = email => e => {
    changeRole({
      refetchQueries: [{ query: USERS_QUERY }],
      variables: { email, role: e.target.value }
    })
  }

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
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortUsers(data.users).map(({ email, role }) => (
                <TableRow>
                  <TableCell>{email}</TableCell>
                  <TableCell>
                    <Select value={role} onChange={changeRoleHandler(email)}>
                      <MenuItem value='student'>Student</MenuItem>
                      <MenuItem value='teacher'>Teacher</MenuItem>
                      <MenuItem value='admin'>Admin</MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </div>
  )
}
