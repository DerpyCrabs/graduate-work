import React from 'react'
import {
  Paper,
  Typography,
  Card,
  CardHeader,
  CardContent,
} from '@material-ui/core'
import LanguageUsage from '../components/language-usage'
import TestCompletion from '../components/test-completion'
import StudentActivity from '../components/student-activity'
import PluginExecutionTime from '../components/plugin-execution-time'

export default function Graphics() {
  const allowed = JSON.parse(localStorage.getItem('graphics'))
  if (!allowed) {
    return <div>Статистика не доступна для указанного лицензионного ключа</div>
  }
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
