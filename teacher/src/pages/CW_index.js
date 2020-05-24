import React from 'react'
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Select,
  DialogActions,
  Grid,
  MenuItem,
} from '@material-ui/core'
import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-python'
import 'ace-builds/src-noconflict/mode-c_cpp'
import 'ace-builds/src-noconflict/mode-clojure'
import 'ace-builds/src-noconflict/mode-rust'
import 'ace-builds/src-noconflict/theme-github'

export default function CWIndex() {
  const queue = [
    {
      student: 'student1@mail.ru',
      added: 1587360003,
      language: 'Clojure',
      stage: 'Проверено',
      errors: [],
      test: 'Числа Фиббоначи',
      code: `(def fib-seq-cat
  (lazy-cat [0 1] (map + (rest fib-seq-cat) fib-seq-cat)))

(last (take (Int/parseInt (read-line)) fib-seq-cat))`,
    },
    {
      student: 'student2@mail.ru',
      added: 1587360264,
      language: 'C++',
      stage: 'Компиляция',
      errors: [],
      test: 'Стандартный вывод',
      code: '',
    },
    {
      student: 'student1@mail.ru',
      added: 1587360367,
      language: 'C++',
      stage: 'Проверено',
      errors: ['Ожидалось "Hello", вывод "hello"'],
      test: 'Стандартный вывод',
      code: '',
    },
  ]
  return (
    <Paper>
      <Grid container spacing={2} style={{ margin: '10px' }}>
        <Grid item>
          <Button variant='contained' color='primary'>
            Сценарии тестирования
          </Button>
        </Grid>
        <Grid item>
          <AddWork />
        </Grid>
      </Grid>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Студент</TableCell>
            <TableCell>Дата добавления</TableCell>
            <TableCell>Сценарий</TableCell>
            <TableCell>Язык программирования</TableCell>
            <TableCell>Этап</TableCell>
            <TableCell>Ошибки</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {queue.map(
            ({ student, added, language, test, stage, errors, code }) => (
              <TableRow>
                <TableCell>{student}</TableCell>
                <TableCell>{new Date(added * 1000).toLocaleString()}</TableCell>
                <TableCell>{test}</TableCell>
                <TableCell>{language}</TableCell>
                <TableCell>{stage}</TableCell>
                <TableCell>
                  {stage === 'Проверено'
                    ? errors.length === 0
                      ? 'Нет ошибок'
                      : errors.join(';')
                    : 'Еще не проверено'}
                </TableCell>
                <TableCell>
                  <StudentCode code={code} student={student} />
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </Paper>
  )
}

function AddWork() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button
        color='primary'
        variant='contained'
        onClick={(_) => setOpen(true)}
      >
        Добавить решение на проверку
      </Button>

      <Dialog onClose={(_) => setOpen(false)} open={open}>
        <DialogTitle>Добавление задачи по проверку</DialogTitle>
        <DialogContent>
          <div style={{ marginBottom: '5px' }}>
            <TextField label='Студент' />
          </div>
          <div style={{ marginBottom: '5px' }}>
            Сценарий:{' '}
            <Select value='1'>
              <MenuItem value='1'>Числа Фиббоначи</MenuItem>
            </Select>
          </div>
          <div style={{ marginBottom: '5px' }}>
            Язык:{' '}
            <Select value='Rust'>
              <MenuItem value='JS'>JavaScript</MenuItem>
              <MenuItem value='C'>C++</MenuItem>
              <MenuItem value='Python'>Python</MenuItem>
              <MenuItem value='Clojure'>Clojure</MenuItem>
              <MenuItem value='Rust'>Rust</MenuItem>
            </Select>
          </div>
          <div style={{ marginBottom: '5px' }}>
            <Button variant='contained'>Выбрать файл с решением</Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button>Добавить</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
function StudentCode({ student, code }) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button
        color='primary'
        variant='contained'
        onClick={(_) => setOpen(true)}
      >
        Решение
      </Button>

      <Dialog onClose={(_) => setOpen(false)} open={open}>
        <DialogTitle>Решение {student}</DialogTitle>
        <DialogContent style={{ maxWidth: '900px' }}>
          <AceEditor
            mode='clojure'
            theme='github'
            value={code}
            fontSize={14}
            name='unique_id'
            height='700px'
            width='900px'
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
