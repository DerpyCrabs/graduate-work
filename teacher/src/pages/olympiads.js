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
  DialogActions,
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import AddCircle from '@material-ui/icons/AddCircle'
import RemoveCircle from '@material-ui/icons/RemoveCircle'
import DateFnsUtils from '@date-io/date-fns'
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'

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
      collaborators {
        email
      }
      stage
      score_curve {
        min
        max
        points {
          place
          coefficient
        }
      }
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
        test_answers {
          id
          code
          test {
            id
            name
          }
        }
        submitted_solutions {
          id
          submitted_at
          answers {
            id
            code
            test {
              id
              name
            }
            score
          }
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

export default function Olympiads() {
  const { loading, data } = useQuery(OLYMPIADS_QUERY)
  const olympiads = loading
    ? []
    : data.olympiads.filter(
        (o) =>
          data.me.email === o.creator.email ||
          o.collaborators.map((c) => c.email).includes(data.me.email)
      )
  const [completeOlympiad] = useMutation(gql`
    mutation complete($olympiad_id: String!) {
      olympiads {
        complete_olympiad(olympiad_id: $olympiad_id)
      }
    }
  `)
  const handleCompleteOlympiad = (olympiad_id) => {
    completeOlympiad({
      refetchQueries: [{ query: OLYMPIADS_QUERY }],
      variables: { olympiad_id },
    })
  }
  const stageToString = (stage) => {
    switch (stage) {
      case 'Created':
        return 'Еще не началась'
        break
      case 'Ongoing':
        return 'В процессе прохождения'
        break
      case 'Review':
        return 'В процессе проверки'
        break
      case 'Ended':
        return 'Закончена'
        break
    }
  }
  return (
    <div style={{ padding: 10 }}>
      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <div>
          <CreateOlympiadDialog />
          <Paper>
            {olympiads.map((olympiad) => (
              <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant='h6'>
                    {olympiad.name} - {stageToString(olympiad.stage)}
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails style={{ flexDirection: 'column' }}>
                  <Typography>
                    Время начала:{' '}
                    {new Date(parseInt(olympiad.start_at)).toLocaleString()}{' '}
                    <br />
                    Время окончания:{' '}
                    {new Date(parseInt(olympiad.done_at)).toLocaleString()}{' '}
                    <br />
                    Создатель: {olympiad.creator.email} <br />
                    Количество участников:{' '}
                    {
                      olympiad.participants.filter((p) =>
                        p.users.every((u) => u.consent)
                      ).length
                    }
                    <br />
                    Количество проверяющих: {olympiad.collaborators.length}{' '}
                    <br />
                    Количество заданий: {olympiad.tests.length}
                    <br />
                    Число участников в командах: {olympiad.teams}
                    <br />
                    {!(olympiad.stage === 'Ended') && olympiad.teams === 1 && (
                      <div>
                        Набор участников:{' '}
                        {olympiad.recruitment_type === 'Open'
                          ? 'Открытый'
                          : 'По приглашениям'}
                      </div>
                    )}
                  </Typography>
                </ExpansionPanelDetails>
                <ExpansionPanelActions>
                  {olympiad.stage === 'Created' && <Tests />}
                  {olympiad.stage === 'Review' || olympiad.stage === 'Ended' ? (
                    <Leaderboard />
                  ) : (
                    <Students />
                  )}
                  {olympiad.creator.email === data.me.email &&
                  olympiad.stage !== 'Ended' ? (
                    <Collaborators olympiad={olympiad} />
                  ) : null}
                  {olympiad.stage === 'Review' && (
                    <Button
                      size='small'
                      color='secondary'
                      onClick={(_) => handleCompleteOlympiad(olympiad.id)}
                    >
                      Закончить проверку
                    </Button>
                  )}
                </ExpansionPanelActions>
              </ExpansionPanel>
            ))}
          </Paper>
        </div>
      )}
    </div>
  )
}

function CreateOlympiadDialog() {
  const [open, setOpen] = React.useState(false)
  const [createOlympiad] = useMutation(gql`
    mutation create_olympiad(
      $name: String!
      $start_at: String!
      $done_at: String!
      $recruitment_type: RecruitmentType!
      $teams: Int!
    ) {
      olympiads {
        create_olympiad(
          name: $name
          start_at: $start_at
          done_at: $done_at
          recruitment_type: $recruitment_type
          teams: $teams
        )
      }
    }
  `)
  const [name, setName] = React.useState('')
  const [start, setStart] = React.useState(new Date())
  const [done, setDone] = React.useState(new Date())
  const [teams, setTeams] = React.useState(1)
  const [recruitment, setRecruitment] = React.useState('Open')
  console.log(teams)

  const createOlympiadHandler = () => {
    createOlympiad({
      refetchQueries: [{ query: OLYMPIADS_QUERY }],
      variables: {
        name,
        start_at: (start.getTime() / 1000).toString(),
        done_at: (done.getTime() / 1000).toString(),
        recruitment_type: recruitment,
        teams,
      },
    })
    setOpen(false)
  }
  return (
    <>
      <Button
        variant='contained'
        onClick={(_) => setOpen(true)}
        style={{ width: '100%', marginBottom: 10 }}
      >
        Начать новую олимпиаду
      </Button>

      <Dialog onClose={(_) => setOpen(false)} open={open}>
        <DialogTitle>Новая олимпиада</DialogTitle>
        <DialogContent>
          Название:{' '}
          <TextField value={name} onChange={(e) => setName(e.target.value)} />
          <br />
          Время начала:{' '}
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DateTimePicker value={start} onChange={setStart} />
          </MuiPickersUtilsProvider>
          <br />
          Время окончания:{' '}
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DateTimePicker value={done} onChange={setDone} />
          </MuiPickersUtilsProvider>
          <br />
          Число людей в командах:
          <Select value={teams} onChange={(e) => setTeams(e.target.value)}>
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
            <MenuItem value={4}>4</MenuItem>
            <MenuItem value={5}>5</MenuItem>
          </Select>
          <br />
          {teams === 1 && (
            <>
              Набор участников:{' '}
              <FormControl component='fieldset'>
                <RadioGroup
                  row
                  value={recruitment}
                  onChange={(e) => setRecruitment(e.target.value)}
                >
                  <FormControlLabel
                    value='Open'
                    control={<Radio />}
                    labelPlacement='start'
                    label='открытый'
                  />
                  <FormControlLabel
                    value='Closed'
                    control={<Radio />}
                    labelPlacement='start'
                    label='по приглашениям'
                  />
                </RadioGroup>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={(_) => setOpen(false)}>Отменить</Button>
          <Button onClick={createOlympiadHandler}>Начать</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
function Students({ id }) {
  const participants = [
    { name: 'Участник 1', invited: null },
    { name: 'Участник 2', invited: 'Учитель 1' },
  ]
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button size='small' onClick={(_) => setOpen(true)}>
        Участники
      </Button>

      <Dialog onClose={(_) => setOpen(false)} open={open}>
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
    { name: 'Участник 2', invited: true },
  ]
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button size='small' onClick={(_) => setOpen(true)}>
        Пригласить участника
      </Button>

      <Dialog onClose={(_) => setOpen(false)} open={open}>
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
function Collaborators({ olympiad }) {
  const [open, setOpen] = React.useState(false)
  const [remove] = useMutation(gql`
    mutation remove_collaborator($olympiad_id: String!, $user_email: String!) {
      olympiads {
        remove_collaborator(olympiad_id: $olympiad_id, user_email: $user_email)
      }
    }
  `)
  const removeHandler = (email) => {
    remove({
      refetchQueries: [{ query: OLYMPIADS_QUERY }],
      variables: {
        olympiad_id: olympiad.id,
        user_email: email,
      },
    })
  }
  return (
    <>
      <Button size='small' onClick={(_) => setOpen(true)}>
        Проверяющие
      </Button>

      <Dialog onClose={(_) => setOpen(false)} open={open}>
        <DialogTitle>Проверяющие олимпиады</DialogTitle>
        <DialogContent>
          <Table>
            <TableBody>
              {olympiad.collaborators.map(({ email }) => (
                <TableRow key={email}>
                  <TableCell>{email}</TableCell>
                  <TableCell>
                    <Button
                      color='secondary'
                      onClick={(_) => removeHandler(email)}
                    >
                      Отобрать права
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <InviteCollaborator olympiad={olympiad} />
        </DialogActions>
      </Dialog>
    </>
  )
}
function InviteCollaborator({ olympiad }) {
  const { loading, data } = useQuery(gql`
    {
      users {
        email
        role
      }
    }
  `)
  const [open, setOpen] = React.useState(false)
  const [invite] = useMutation(gql`
    mutation invite_collaborator($olympiad_id: String!, $user_email: String!) {
      olympiads {
        invite_collaborator(olympiad_id: $olympiad_id, user_email: $user_email)
      }
    }
  `)
  const inviteHandler = (email) => {
    invite({
      refetchQueries: [{ query: OLYMPIADS_QUERY }],
      variables: {
        olympiad_id: olympiad.id,
        user_email: email,
      },
    })
  }
  if (loading) {
    return null
  }
  return (
    <>
      <Button size='small' onClick={(_) => setOpen(true)}>
        Пригласить проверяющих
      </Button>

      <Dialog onClose={(_) => setOpen(false)} open={open}>
        <DialogTitle>Приглашение проверяющих</DialogTitle>
        <DialogContent>
          <Table>
            <TableBody>
              {data.users
                .filter((u) => u.role === 'teacher')
                .map(({ email }) => (
                  <TableRow key={email}>
                    <TableCell>{email}</TableCell>
                    <TableCell>
                      {olympiad.collaborators
                        .map((u) => u.email)
                        .includes(email) ? (
                        <Button disabled>Приглашен</Button>
                      ) : (
                        <Button
                          color='primary'
                          onClick={(_) => inviteHandler(email)}
                        >
                          Пригласить
                        </Button>
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

function Leaderboard({ id }) {
  const scores = [
    { name: 'Студент 1', score: 500, place: 1 },
    { name: 'Студент 2', score: 550, place: 2 },
    { name: 'Студент 3', score: 600, place: 3 },
  ]

  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button size='small' onClick={(_) => setOpen(true)}>
        Решения участников
      </Button>

      <Dialog onClose={(_) => setOpen(false)} open={open}>
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
        { input: 10, expected: 10 },
      ],
    },
    {
      name: 'Числа Фиббоначи',
      description: 'Описание задания',
      added: true,
      checks: [
        { input: 5, expected: 5 },
        { input: 10, expected: 10 },
      ],
    },
  ]
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button size='small' onClick={(_) => setOpen(true)}>
        Задания
      </Button>

      <Dialog onClose={(_) => setOpen(false)} open={open}>
        <DialogTitle>Задания олимпиады</DialogTitle>
        <DialogContent>
          {tests.map((test) => (
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
                        <TableCell>Ввод</TableCell>
                        <TableCell>Ожидаемый вывод</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {test.checks.map((check) => (
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
        { input: 10, expected: 10, actual: 10 },
      ],
    },
    {
      name: 'Числа Фиббоначи',
      code: 'some code 2',
      score: 500,
      checks: [
        { input: 5, expected: 10, actual: 5 },
        { input: 10, expected: 10, actual: 10 },
      ],
    },
  ]
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button color='primary' onClick={(_) => setOpen(true)}>
        Решение
      </Button>

      <Dialog onClose={(_) => setOpen(false)} open={open}>
        <DialogTitle>Решение студента "Студент 1"</DialogTitle>
        <DialogContent>
          {tests.map((test) => (
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
                    {test.checks.map((check) => (
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
