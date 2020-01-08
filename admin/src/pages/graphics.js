import React from 'react'
import {
  Paper,
  Typography,
  Card,
  CardHeader,
  CardContent
} from '@material-ui/core'
import LanguageUsage from '../components/language-usage'
import TestCompletion from '../components/test-completion'
import PluginExecutionTime from '../components/plugin-execution-time'

export default function Graphics() {
  const allowed = JSON.parse(localStorage.getItem('graphics'))
  if (!allowed) {
    return <div>Graphics are not allowed by your license</div>
  }
  return (
    <div style={{ padding: 5, display: 'flex', flexDirection: 'column' }}>
      <Card style={{ margin: 5 }}>
        <CardHeader title='Language usage' />
        <CardContent>
          <LanguageUsage />
        </CardContent>
      </Card>
      <Card style={{ margin: 5 }}>
        <CardHeader title='Test completion' />
        <CardContent>
          <TestCompletion />
        </CardContent>
      </Card>
      <Card style={{ margin: 5 }}>
        <CardHeader title='Student activity' />
        <CardContent>lang usage</CardContent>
      </Card>
      <Card style={{ margin: 5 }}>
        <CardHeader title='Average plugin execution time' />
        <CardContent>
          <PluginExecutionTime />
        </CardContent>
      </Card>
    </div>
  )
}
