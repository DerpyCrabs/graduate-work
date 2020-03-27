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
  TextField,
  Button,
  Select,
  MenuItem,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  ExpansionPanelActions,
  Typography,
  FormControl,
  FormControlGroup,
  Radio,
  RadioGroup,
  FormControlLabel,
  DialogContent,
  DialogActions
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import AddCircle from '@material-ui/icons/AddCircle'
import RemoveCircle from '@material-ui/icons/RemoveCircle'
import DateFnsUtils from '@date-io/date-fns'
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'

export default function Olympiads() {
  const olympiads = [
    {
      name: 'Олимпиада',
      participants: [
        { name: 'Участник 1', place: 1 },
        { name: 'Участник 2', place: 2 }
      ],
      starts: '18:00 20 сентября 2020',
      ends: '19:00 20 сентября 2020',
      creator: 'Проверяющий 2',
      stage: 'ожидает проверки',
      type: 'open',
      ended: true
    },
    {
      name: 'Олимпиада 2',
      participants: [{ name: 'Участник 1' }, { name: 'Участник 2' }],
      starts: '18:00 21 сентября 2020',
      ends: '19:00 21 сентября 2020',
      creator: 'derpycrabs@gmail.com',
      stage: 'еще не началась',
      type: 'closed',
      ended: false
    }
  ]
  return (
    <div style={{ padding: 10 }}>
      <CreateOlympiadDialog />
      <Paper>
        {olympiads.map(olympiad => (
          <ExpansionPanel>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>
                {olympiad.name} - {olympiad.stage}
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails style={{ flexDirection: 'column' }}>
              <Typography>
                Время начала: {olympiad.starts} <br />
                Время окончания: {olympiad.ends} <br />
                Создатель: {olympiad.creator} <br />
                Количество участников: {olympiad.participants.length}
                <br />
                Количество проверяющих: 2 <br />
                Количество заданий: 5<br />
                {!olympiad.ended && (
                  <div>
                    Набор участников:{' '}
                    <FormControl component='fieldset'>
                      <RadioGroup row value={olympiad.type}>
                        <FormControlLabel
                          value='open'
                          control={<Radio />}
                          labelPlacement='start'
                          label='открытый'
                        />
                        <FormControlLabel
                          value='closed'
                          control={<Radio />}
                          labelPlacement='start'
                          label='по приглашениям'
                        />
                      </RadioGroup>
                    </FormControl>
                  </div>
                )}
              </Typography>
            </ExpansionPanelDetails>
            <ExpansionPanelActions>
              {olympiad.ended || <Tests />}
              {olympiad.ended ? <Scores /> : <Students />}
              {olympiad.creator === 'derpycrabs@gmail.com' ? (
                <Collaborators />
              ) : null}
              {olympiad.ended && (
                <Button size='small' color='secondary'>
                  Закончить проверку
                </Button>
              )}
            </ExpansionPanelActions>
          </ExpansionPanel>
        ))}
      </Paper>
    </div>
  )
}

function CreateOlympiadDialog() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button
        variant='contained'
        onClick={_ => setOpen(true)}
        style={{ width: '100%', marginBottom: 10 }}
      >
        Начать новую олимпиаду
      </Button>

      <Dialog onClose={_ => setOpen(false)} open={open}>
        <DialogTitle>Новая олимпиада</DialogTitle>
        <DialogContent>
          Название: <TextField />
          <br />
          Время начала:{' '}
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DateTimePicker value={new Date()} />
          </MuiPickersUtilsProvider>
          <br />
          Время окончания:{' '}
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DateTimePicker value={new Date()} />
          </MuiPickersUtilsProvider>
          <br />
          Набор участников:{' '}
          <FormControl component='fieldset'>
            <RadioGroup row value={'open'}>
              <FormControlLabel
                value='open'
                control={<Radio />}
                labelPlacement='start'
                label='открытый'
              />
              <FormControlLabel
                value='closed'
                control={<Radio />}
                labelPlacement='start'
                label='по приглашениям'
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={_ => setOpen(false)}>Отменить</Button>
          <Button>Начать</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
function Students({ id }) {
  const participants = [
    { name: 'Участник 1', invited: null },
    { name: 'Участник 2', invited: 'Учитель 1' }
  ]
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button size='small' onClick={_ => setOpen(true)}>
        Участники
      </Button>

      <Dialog onClose={_ => setOpen(false)} open={open}>
        <DialogTitle>Участники олимпиады</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Имя</TableCell>
                <TableCell>Приглашен?</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {participants.map(({ name, invited }) => (
                <TableRow key={name}>
                  <TableCell>{name}</TableCell>
                  <TableCell>
                    {invited ? <span>{invited}</span> : <span>Нет</span>}
                  </TableCell>
                  <TableCell>
                    <Button color='secondary'>Исключить</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <InviteStudent />
        </DialogActions>
      </Dialog>
    </>
  )
}
function InviteStudent({ id }) {
  const participants = [
    { name: 'Участник 1', invited: false },
    { name: 'Участник 2', invited: true }
  ]
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button size='small' onClick={_ => setOpen(true)}>
        Пригласить участника
      </Button>

      <Dialog onClose={_ => setOpen(false)} open={open}>
        <DialogTitle>Приглашение участника</DialogTitle>
        <DialogContent>
          <Table>
            <TableBody>
              {participants.map(({ name, invited }) => (
                <TableRow key={name}>
                  <TableCell>{name}</TableCell>
                  <TableCell>
                    {invited ? (
                      <Button disabled>Приглашен</Button>
                    ) : (
                      <Button color='primary'>Пригласить</Button>
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
function Collaborators({ id }) {
  const collaborators = [{ name: 'Проверяющий 1' }, { name: 'Проверяющий 2' }]
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button size='small' onClick={_ => setOpen(true)}>
        Проверяющие
      </Button>

      <Dialog onClose={_ => setOpen(false)} open={open}>
        <DialogTitle>Проверяющие олимпиады</DialogTitle>
        <DialogContent>
          <Table>
            <TableBody>
              {collaborators.map(({ name }) => (
                <TableRow key={name}>
                  <TableCell>{name}</TableCell>
                  <TableCell>
                    <Button color='secondary'>Отобрать права</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <InviteCollaborator />
        </DialogActions>
      </Dialog>
    </>
  )
}
function InviteCollaborator({ id }) {
  const colloborators = [
    { name: 'Проверяющий 1', invited: false },
    { name: 'Проверяющий 2', invited: true }
  ]
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button size='small' onClick={_ => setOpen(true)}>
        Пригласить проверяющих
      </Button>

      <Dialog onClose={_ => setOpen(false)} open={open}>
        <DialogTitle>Приглашение проверяющих</DialogTitle>
        <DialogContent>
          <Table>
            <TableBody>
              {colloborators.map(({ name, invited }) => (
                <TableRow key={name}>
                  <TableCell>{name}</TableCell>
                  <TableCell>
                    {invited ? (
                      <Button disabled>Приглашен</Button>
                    ) : (
                      <Button color='primary'>Пригласить</Button>
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

function Scores({ id }) {
  const scores = [
    { name: 'Студент 1', score: 500, place: 1 },
    { name: 'Студент 2', score: 550, place: 2 },
    { name: 'Студент 3', score: 600, place: 3 }
  ]

  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button size='small' onClick={_ => setOpen(true)}>
        Решения участников
      </Button>

      <Dialog onClose={_ => setOpen(false)} open={open}>
        <DialogTitle>Решения участников</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Имя</TableCell>
                <TableCell>Баллы</TableCell>
                <TableCell>Предварительное место</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scores.map(({ name, score, place }) => (
                <TableRow key={name}>
                  <TableCell>{name}</TableCell>
                  <TableCell>{score}</TableCell>
                  <TableCell>{place}</TableCell>
                  <TableCell>
                    <Review />
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

function Tests({ id }) {
  const tests = [
    {
      name: 'Консольный ввод',
      description: 'Описание задания',
      added: false,
      checks: [
        { input: 5, expected: 5 },
        { input: 10, expected: 10 }
      ]
    },
    {
      name: 'Числа Фиббоначи',
      description: 'Описание задания',
      added: true,
      checks: [
        { input: 5, expected: 5 },
        { input: 10, expected: 10 }
      ]
    }
  ]
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button size='small' onClick={_ => setOpen(true)}>
        Задания
      </Button>

      <Dialog onClose={_ => setOpen(false)} open={open}>
        <DialogTitle>Задания олимпиады</DialogTitle>
        <DialogContent>
          {tests.map(test => (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <ExpansionPanel style={{ flexGrow: 1 }}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant='h6' style={{ fontSize: '1rem' }}>
                    {test.name}
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails style={{ flexDirection: 'column' }}>
                  <Typography>{test.description}</Typography>
                  <br />
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Input</TableCell>
                        <TableCell>Expected output</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {test.checks.map(check => (
                        <TableRow>
                          <TableCell>{check.input}</TableCell>
                          <TableCell>{check.expected}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <div>
                <Button>{test.added ? <RemoveCircle /> : <AddCircle />}</Button>
              </div>
            </div>
          ))}
        </DialogContent>
      </Dialog>
    </>
  )
}

function Review({ id }) {
  const tests = [
    {
      name: 'Консольный ввод',
      code: 'some code',
      score: 0,
      checks: [
        { input: 5, expected: 5, actual: 7 },
        { input: 10, expected: 10, actual: 10 }
      ]
    },
    {
      name: 'Числа Фиббоначи',
      code: 'some code 2',
      score: 500,
      checks: [
        { input: 5, expected: 10, actual: 5 },
        { input: 10, expected: 10, actual: 10 }
      ]
    }
  ]
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button color='primary' onClick={_ => setOpen(true)}>
        Решение
      </Button>

      <Dialog onClose={_ => setOpen(false)} open={open}>
        <DialogTitle>Решение студента "Студент 1"</DialogTitle>
        <DialogContent>
          {tests.map(test => (
            <ExpansionPanel style={{ flexGrow: 1 }}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='h6' style={{ fontSize: '1rem' }}>
                  Задание "{test.name}"{' - '}
                  {test.score === 0 ? 'решено не верно' : 'решено верно'}
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails style={{ flexDirection: 'column' }}>
                <Typography>Код решения:</Typography>
                <Typography>{test.code}</Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ввод</TableCell>
                      <TableCell>Ожидаемый вывод</TableCell>
                      <TableCell>Вывод программы</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {test.checks.map(check => (
                      <TableRow>
                        <TableCell>{check.input}</TableCell>
                        <TableCell>{check.expected}</TableCell>
                        <TableCell>{check.actual}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TextField
                  value={test.score}
                  type='number'
                  label='Баллы за задание'
                />
              </ExpansionPanelDetails>
            </ExpansionPanel>
          ))}
        </DialogContent>
      </Dialog>
    </>
  )
}
