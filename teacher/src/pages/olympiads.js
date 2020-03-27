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
      stage: 'ожидает проверки',
      type: 'open',
      ended: true
    },
    {
      name: 'Олимпиада 2',
      participants: [{ name: 'Участник 1' }, { name: 'Участник 2' }],
      starts: '18:00 21 сентября 2020',
      ends: '19:00 21 сентября 2020',
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
              <Button size='small'>Задания</Button>
              {olympiad.ended ? (
                <Button size='small'>Решения участников</Button>
              ) : (
                <Button size='small'>Участники</Button>
              )}
              <Button size='small'>Проверяющие</Button>
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
function Students({ id }) {}
function InviteStudent({ id }) {}
function Collaborators({ id }) {}
function Solutions({ id }) {}
function Tests({ id }) {}
