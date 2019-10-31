import React from 'react'
import { Link as ReachLink } from '@reach/router'
import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import HomeIcon from '@material-ui/icons/Home'
import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import AppBar from '@material-ui/core/AppBar'

import { fade, makeStyles } from '@material-ui/core/styles'

const LOGOUT = gql`
  mutation logout {
    logout @client
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

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1,
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block'
    }
  },
  search: {
    position: 'relative',
    height: '32px',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25)
    },
    marginRight: theme.spacing(1)
  },
  searchIcon: {
    width: theme.spacing(7),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputRoot: {
    color: 'inherit'
  },
  toolbarTitle: {
    flex: 1
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 120,
      '&:focus': {
        width: 200
      }
    }
  },
  button: {
    color: 'white'
  },
  homeIcon: {
    color: 'white',
    paddingLeft: '0px'
  }
}))

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
    <AppBar position="static">
      <Toolbar className={classes.toolbar}>
        <IconButton className={classes.homeIcon} component={ReachLink} to="/">
          <HomeIcon />
        </IconButton>
        <Button
          className={classes.button}
          variant="outlined"
          size="small"
          onClick={handleClickMenu}
        >
          <React.Suspense fallback={<label>Loading...</label>}>
            <UserProfile />
          </React.Suspense>
        </Button>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
export default Index