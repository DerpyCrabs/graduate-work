import React from 'react'
import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-python'
import 'ace-builds/src-noconflict/mode-c_cpp'
import 'ace-builds/src-noconflict/mode-clojure'
import 'ace-builds/src-noconflict/mode-rust'
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
  MenuItem,
  Typography,
  Slider,
} from '@material-ui/core'
import TestDescription from '../components/test-description'
import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'

const SUBMIT = gql`
  mutation add_work($language: String!, $text: String!, $type_id: String!) {
    work_queue {
      add_work(language: $language, text: $text, type_id: $type_id) {
        id
      }
    }
  }
`
const RESULT_QUERY = gql`
  {
    work_queue {
      queue {
        id
        stage
        errors
      }
    }
  }
`
const lang = {
  JS: 'javascript',
  C: 'c_cpp',
  Clojure: 'clojure',
  Python: 'python',
  Rust: 'rust',
}
export default function Editor({ test }) {
  const [language, setLanguage] = React.useState('JS')
  const [fontSize, setFontSize] = React.useState(16)
  const [code, setCode] = React.useState('console.log("hello")')
  const [submitCode, { data: work_id }] = useMutation(SUBMIT)
  const { data } = useQuery(RESULT_QUERY, {
    pollInterval: 1000,
  })

  let errors = null
  let stage = null
  if (work_id) {
    console.log(data)
    const work = data.work_queue.queue.filter(
      (work) => work.id === work_id.work_queue.add_work.id
    )
    if (work.length === 1) {
      errors = work[0].errors
      stage = work[0].stage
    }
  }

  const handleSubmit = () => {
    submitCode({ variables: { text: code, language, type_id: test.id } })
  }

  return (
    <>
      <Grid container style={{ height: 'calc(100vh - 128px)' }}>
        <Grid item xs={6}>
          <AceEditor
            mode={lang[language]}
            theme='github'
            value={code}
            fontSize={fontSize}
            onChange={(s) => setCode(s)}
            name='unique_id'
            height='100%'
            width='100%'
          />
        </Grid>
        <Grid item xs={6} container direction='column'>
          <Grid
            item
            xs={6}
            style={{
              maxWidth: '100%',
              border: 'solid 1px black',
              borderTop: 0,
              borderRight: 0,
            }}
          >
            <Paper style={{ height: '100%', padding: 10 }}>
              <TestDescription test={test} />
            </Paper>
          </Grid>
          <Grid
            item
            xs={6}
            style={{
              maxWidth: '100%',
              border: 'solid 1px black',
              borderTop: 0,
              borderRight: 0,
              borderBottom: 0,
            }}
          >
            <Paper style={{ height: '100%', padding: 10 }}>
              {work_id && errors && stage && (
                <div>
                  {errors.length === 0 && stage === 'Done' ? (
                    <div>Задача решена</div>
                  ) : (
                    <div>
                      {stage === 'Done' ? (
                        <div>
                          Получено {errors.length} ошибок в {test.checks.length}{' '}
                          тестах
                        </div>
                      ) : (
                        <div>Этап проверки: {stage}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Paper>
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
            onChange={(e) => setLanguage(e.target.value)}
            style={{ color: 'white' }}
          >
            <MenuItem value='JS'>JavaScript</MenuItem>
            <MenuItem value='C'>C++</MenuItem>
            <MenuItem value='Python'>Python</MenuItem>
            <MenuItem value='Clojure'>Clojure</MenuItem>
            <MenuItem value='Rust'>Rust</MenuItem>
          </Select>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              paddingLeft: 16,
            }}
          >
            <Typography style={{ fontSize: 14, margin: 'auto' }} gutterBottom>
              Размер шрифта
            </Typography>
            <Slider
              value={fontSize}
              onChange={(e, v) => setFontSize(v)}
              step={2}
              min={12}
              max={24}
              style={{ color: 'white', width: 128 }}
            />
          </div>
          <div style={{ flexGrow: 1 }} />
          <Button edge='end' color='inherit' onClick={handleSubmit}>
            Отправить на проверку
          </Button>
        </Toolbar>
      </AppBar>
    </>
  )
}
