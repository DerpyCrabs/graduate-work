import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Paper,
  Typography,
} from '@material-ui/core'
import LanguageUsage from '../components/language-usage'
import PluginExecutionTime from '../components/plugin-execution-time'
import StudentActivity from '../components/student-activity'
import TestCompletion from '../components/test-completion'

export default function Graphics() {
  return (
    <div style={{ padding: 5, display: 'flex', flexDirection: 'column' }}>
      <Card style={{ margin: 5 }}>
        <CardHeader title='Использование языков программирования' />
        <CardContent>
          <LanguageUsage />
        </CardContent>
      </Card>
      <Card style={{ margin: 5 }}>
        <CardHeader title='Выполнение заданий' />
        <CardContent>
          <TestCompletion />
        </CardContent>
      </Card>
      <Card style={{ margin: 5 }}>
        <CardHeader title='Активность участников' />
        <CardContent>
          <StudentActivity />
        </CardContent>
      </Card>
      <Card style={{ margin: 5 }}>
        <CardHeader title='Среднее время выполнения плагинов' />
        <CardContent>
          <PluginExecutionTime />
        </CardContent>
      </Card>
    </div>
  )
}
