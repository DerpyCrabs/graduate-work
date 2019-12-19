import React from 'react'
import {
  Tabs,
  Tab,
  Grid,
  Paper,
  Typography,
  AppBar,
  Button,
  Toolbar
} from '@material-ui/core'
import { Link } from '@reach/router'

function TestDescription({ test }) {
  return (
    <Paper
      style={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {test}
      <div style={{ flexGrow: 1 }} />
      <AppBar style={{ position: 'unset' }}>
        <Toolbar>
          <Typography>Completed: No</Typography>
          <div style={{ flexGrow: 1 }} />
          <Button color='inherit' component={Link} to={`/${test}`}>
            Begin test
          </Button>
        </Toolbar>
      </AppBar>
    </Paper>
  )
}

export default function TestList() {
  const tabs = ['test1', 'test2']
  const [tab, setTab] = React.useState(tabs[0])
  return (
    <Grid container>
      <Grid item xs={3}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          orientation='vertical'
          variant='scrollable'
        >
          {tabs.map(tab => (
            <Tab value={tab} label={tab} />
          ))}
        </Tabs>
      </Grid>
      <Grid item xs={9}>
        {tabs.map(tab2 => tab === tab2 && <TestDescription test={tab2} />)}
      </Grid>
    </Grid>
  )
}
