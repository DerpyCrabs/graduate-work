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

const sortUsers = (users) => {
  let copyUsers = users.slice()
  copyUsers.sort((a, b) => (a.email > b.email ? 1 : -1))
  return copyUsers
}

const REGISTER_USER = gql`
  mutation register_user($email: String!, $password: String!) {
    signup(email: $email, password: $password)
  }
`

function RegisterUserDialogButton() {
  const [registerUser] = useMutation(REGISTER_USER)
  const [showDialog, setShowDialog] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const registerHandler = () => {
    registerUser({
      refetchQueries: [{ query: USERS_QUERY }],
      variables: { email, password },
    })
    setEmail('')
    setPassword('')
    setShowDialog(false)
  }

  return (
    <>
      <Dialog onClose={() => setShowDialog(false)} open={showDialog}>
        <DialogTitle>Регистрация пользователя</DialogTitle>
        <TextField
          label='Электронная почта'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label='Пароль'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant='contained' color='primary' onClick={registerHandler}>
          Зарегистрировать
        </Button>
      </Dialog>
      <Button
        color='primary'
        variant='contained'
        onClick={() => setShowDialog(true)}
      >
        Зарегистрировать пользователя
      </Button>
    </>
  )
}

export default function Users() {
  const { loading, data } = useQuery(USERS_QUERY)
  const [changeRole] = useMutation(CHANGE_ROLE)
  const changeRoleHandler = (email) => (e) => {
    changeRole({
      refetchQueries: [{ query: USERS_QUERY }],
      variables: { email, role: e.target.value },
    })
  }

  return (
    <div>
      <h3>Пользователи</h3>
      {loading ? (
        <div>loading</div>
      ) : (
        <Paper style={{ padding: 10 }}>
          <RegisterUserDialogButton />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Электронная почта</TableCell>
                <TableCell>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortUsers(data.users).map(({ email, role }) => (
                <TableRow>
                  <TableCell>{email}</TableCell>
                  <TableCell>
                    <Select value={role} onChange={changeRoleHandler(email)}>
                      <MenuItem value='student'>Участник</MenuItem>
                      <MenuItem value='teacher'>Преподаватель</MenuItem>
                      <MenuItem value='admin'>Администратор</MenuItem>
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
