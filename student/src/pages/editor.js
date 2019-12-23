import React from 'react'
import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-python'
import 'ace-builds/src-noconflict/mode-c_cpp'
import 'ace-builds/src-noconflict/theme-github'
import SettingsIcon from '@material-ui/icons/Settings'
import {
  Grid,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Select,
  MenuItem
} from '@material-ui/core'

export default function Editor({ test }) {
  const [language, setLanguage] = React.useState('javascript')
  const [code, setCode] = React.useState('console.log("hello")')

  return (
    <>
      <Grid container style={{ height: 'calc(100vh - 128px)' }}>
        <Grid item xs={6}>
          <AceEditor
            mode={language}
            theme='github'
            value={code}
            onChange={s => setCode(s)}
            name='unique_id'
            height='100%'
            width='100%'
          />
        </Grid>
        <Grid item xs={6} container direction='column'>
          <Grid item xs={6} style={{ maxWidth: '100%' }}>
            <Paper>Program output</Paper>
          </Grid>
          <Grid item xs={6} style={{ maxWidth: '100%' }}>
            <Paper>Test results</Paper>
          </Grid>
        </Grid>
      </Grid>
      <AppBar
        position='fixed'
        color='primary'
        style={{ top: 'auto', bottom: 0 }}
      >
        <Toolbar>
          <Select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            style={{ color: 'white' }}
          >
            <MenuItem value='javascript'>JavaScript</MenuItem>
            <MenuItem value='c_cpp'>C++</MenuItem>
            <MenuItem value='python'>Python</MenuItem>
          </Select>
          <div style={{ flexGrow: 1 }} />
          <Button edge='end' color='inherit'>
            Run
          </Button>
          <Button edge='end' color='inherit'>
            Test
          </Button>
        </Toolbar>
      </AppBar>
    </>
  )
}
