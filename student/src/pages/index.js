import React from 'react'
import { Link as ReachLink, Router } from '@reach/router'
import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import HomeIcon from '@material-ui/icons/Home'
import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import AppBar from '@material-ui/core/AppBar'
import {
  Tabs,
  Tab,
  TabPanel,
  Table,
  Grid,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@material-ui/core'
import { fade, makeStyles } from '@material-ui/core/styles'
import Results from './results'
import OlympiadParticipation from '../components/olympiad-participation'

const LOGOUT = gql`
  mutation logout {
    logout @client
  }
`

const OLYMPIADS_QUERY = gql`
  {
    me {
      email
    }
    olympiads {
      id
      name
      creator {
        email
      }
      start_at
      done_at
      recruitment_type
      teams
      stage
      tests {
        score_coefficient
        test {
          id
          name
          description
          checks {
            input
            expected
          }
        }
      }
      participants {
        id
        name
        users {
          user {
            email
          }
          consent
        }
        submitted_solutions {
          id
        }
      }
      leaderboard {
        place
        score
        participant {
          id
          name
          users {
            user {
              email
            }
          }
        }
      }
    }
  }
`

const UserProfile = () => {
  const { loading, data } = useQuery(
    gql`
      {
        me {
          email
        }
      }
    `
  )
  return <>{loading ? <div>Loading</div> : <>{data.me.email}</>}</>
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    height: '32px',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(1),
  },
  searchIcon: {
    width: theme.spacing(7),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  toolbarTitle: {
    flex: 1,
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 120,
      '&:focus': {
        width: 200,
      },
    },
  },
  button: {
    color: 'white',
  },
  homeIcon: {
    color: 'white',
    paddingLeft: '0px',
  },
}))

const IndexPage = () => {
  const [tab, setTab] = React.useState('open')
  const { loading, data } = useQuery(OLYMPIADS_QUERY)
  if (loading) {
    return null
  }
  const openOlympiads = data.olympiads.filter(
    (o) =>
      o.stage === 'Created' &&
      ((o.teams === 1 &&
        (o.recruitment_type === 'Open' ||
          o.participants.map((p) => p.name).includes(data.me.email))) ||
        o.teams > 1)
  )
  const ongoingOlympiads = data.olympiads.filter(
    (o) =>
      o.stage === 'Ongoing' &&
      o.participants
        .map((p) => p.users.filter((u) => u.consent).map((u) => u.user.email))
        .flat()
        .includes(data.me.email)
  )
  const completeOlympiads = data.olympiads.filter(
    (o) =>
      (o.stage === 'Review' &&
        o.participants
          .filter((p) => p.submitted_solutions.length !== 0)
          .map((p) => p.users.filter((u) => u.consent).map((u) => u.user.email))
          .flat()
          .includes(data.me.email)) ||
      (o.stage === 'Ended' &&
        o.leaderboard
          .map((l) => l.participant.users.map((u) => u.user.email))
          .flat()
          .includes(data.me.email))
  )
  return (
    <Grid container>
      <Tabs
        centered
        style={{ flexGrow: 1 }}
        value={tab}
        onChange={(_, v) => setTab(v)}
      >
        <Tab value='open' label='Будущие олимпиады'></Tab>
        <Tab value='ongoing' label='Выполняемые'></Tab>
        <Tab value='completed' label='Завершенные'></Tab>
      </Tabs>
      {tab === 'open' && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Организатор</TableCell>
              <TableCell>Дата начала</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {openOlympiads.map((olympiad) => (
              <TableRow>
                <TableCell>{olympiad.name}</TableCell>
                <TableCell>{olympiad.creator.email}</TableCell>
                <TableCell>
                  {new Date(parseInt(olympiad.start_at)).toLocaleString()}
                </TableCell>
                <TableCell>
                  <OlympiadParticipation
                    olympiad={olympiad}
                    email={data.me.email}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {tab === 'ongoing' && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Организатор</TableCell>
              <TableCell>Дата окончания</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ongoingOlympiads.map((olympiad) => (
              <TableRow>
                <TableCell>{olympiad.name}</TableCell>
                <TableCell>{olympiad.creator.email}</TableCell>
                <TableCell>
                  {new Date(parseInt(olympiad.done_at)).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button variant='contained'>Перейти к выполнению</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {tab === 'completed' && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Организатор</TableCell>
              <TableCell>Результаты</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {completeOlympiads.map((olympiad) => (
              <TableRow>
                <TableCell>{olympiad.name}</TableCell>
                <TableCell>{olympiad.creator.email}</TableCell>
                <TableCell>
                  {olympiad.stage === 'Review' ? (
                    <div>Ожидание результатов</div>
                  ) : (
                    <Results olympiad={olympiad} email={data.me.email} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Grid>
  )
}
export const Apply = ({ olympiad }) => {
  const [apply] = useMutation(gql`
    mutation apply($olympiad_id: String!) {
      olympiads {
        apply(olympiad_id: $olympiad_id)
      }
    }
  `)
  const applyHandler = () => {
    apply({
      refetchQueries: [{ query: OLYMPIADS_QUERY }],
      variables: {
        olympiad_id: olympiad.id,
      },
    })
  }
  return (
    <Button variant='contained' onClick={applyHandler}>
      Подать заявку на участие
    </Button>
  )
}
export const AcceptInvite = ({ participant }) => {
  const [accept] = useMutation(gql`
    mutation accept($participant_id: String!) {
      olympiads {
        accept_invite(participant_id: $participant_id)
      }
    }
  `)
  const acceptHandler = () => {
    accept({
      refetchQueries: [{ query: OLYMPIADS_QUERY }],
      variables: {
        participant_id: participant,
      },
    })
  }
  return (
    <Button variant='contained' onClick={acceptHandler}>
      Принять приглашение на участие
    </Button>
  )
}
export const CreateTeam = ({ olympiad }) => {
  const [create] = useMutation(gql`
    mutation create($olympiad_id: String!, $name: String!) {
      olympiads {
        create_team(olympiad_id: $olympiad_id, name: $name)
      }
    }
  `)
  const [name, setName] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const createHandler = () => {
    create({
      refetchQueries: [{ query: OLYMPIADS_QUERY }],
      variables: {
        olympiad_id: olympiad.id,
        name,
      },
    })
    setOpen(false)
  }
  return (
    <>
      <Button variant='contained' onClick={(_) => setOpen(true)}>
        Создать команду
      </Button>
      <Dialog onClose={(_) => setOpen(false)} open={open}>
        <DialogTitle>Создание команды</DialogTitle>
        <DialogContent>
          Название команды:{' '}
          <TextField value={name} onChange={(e) => setName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={(_) => setOpen(false)}>Отменить</Button>
          <Button onClick={createHandler}>Создать</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
export function TeamInvite({ participant }) {
  const { loading, data } = useQuery(gql`
    {
      users {
        email
        role
      }
    }
  `)
  const [open, setOpen] = React.useState(false)
  const [invite] = useMutation(gql`
    mutation invite($participant_id: String!, $user_email: String!) {
      olympiads {
        invite_to_team(participant_id: $participant_id, user_email: $user_email)
      }
    }
  `)
  const inviteHandler = (email) => {
    invite({
      refetchQueries: [{ query: OLYMPIADS_QUERY }],
      variables: {
        participant_id: participant.id,
        user_email: email,
      },
    })
  }
  if (loading) {
    return null
  }
  return (
    <>
      <Button variant='contained' onClick={(_) => setOpen(true)}>
        Пригласить участников команды
      </Button>

      <Dialog onClose={(_) => setOpen(false)} open={open}>
        <DialogTitle>Приглашение участников команды</DialogTitle>
        <DialogContent>
          <Table>
            <TableBody>
              {data.users
                .filter((u) => u.role === 'student')
                .map(({ email }) => (
                  <TableRow key={email}>
                    <TableCell>{email}</TableCell>
                    <TableCell>
                      {participant.users
                        .map((u) => u.user.email)
                        .includes(email) ? (
                        participant.users.find((u) => u.user.email === email)
                          .consent ? (
                          <Button disabled>Принял приглашение</Button>
                        ) : (
                          <Button disabled>Приглашен</Button>
                        )
                      ) : (
                        <Button
                          color='primary'
                          onClick={(_) => inviteHandler(email)}
                        >
                          Пригласить
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </>
  )
}
const Index = () => {
  const [logout] = useMutation(LOGOUT)
  const [anchorEl, setAnchorEl] = React.useState(null)

  const classes = useStyles()

  function handleClickMenu(event) {
    setAnchorEl(event.currentTarget)
  }

  function handleCloseMenu() {
    setAnchorEl(null)
  }
  const handleLogout = () => {
    handleCloseMenu()
    logout()
  }
  return (
    <div>
      <AppBar position='static'>
        <Toolbar className={classes.toolbar}>
          <IconButton className={classes.homeIcon} component={ReachLink} to='/'>
            <HomeIcon />
          </IconButton>
          <Button
            className={classes.button}
            variant='outlined'
            size='small'
            onClick={handleClickMenu}
          >
            <React.Suspense fallback={<label>Loading...</label>}>
              <UserProfile />
            </React.Suspense>
          </Button>
          <Menu
            id='simple-menu'
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={handleLogout}>Выйти из аккаунта</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Router>
        <IndexPage path='/*' />
      </Router>
    </div>
  )
}
export default Index
