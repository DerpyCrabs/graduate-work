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
} from '@material-ui/core'
import { fade, makeStyles } from '@material-ui/core/styles'
import Results from './results'

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
      (o.recruitment_type === 'Open' ||
        o.participants.map((p) => p.name).includes(data.me.email))
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
  // Add team support and team creation
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
                  {olympiad.recruitment_type === 'Open' &&
                  olympiad.teams === 1 &&
                  olympiad.participants
                    .map((p) => p.name)
                    .includes(data.me.email) ? (
                    <Button disabled>Заявка на участие подана</Button>
                  ) : (
                    <Button variant='contained'>
                      Подать заявку на участие
                    </Button>
                  )}
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
                    <Results id={5} />
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
