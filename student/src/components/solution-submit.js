import React from 'react'
import { OLYMPIADS_QUERY } from '../pages/index'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  Card,
  CardContent,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'

const getParticipant = (olympiad, email) =>
  olympiad.participants.find((p) =>
    p.users.map((u) => u.user.email).includes(email)
  )

const getSubmittedAnswers = (olympiad, participant_id, test_id) =>
  olympiad.participants
    .find((p) => p.id === participant_id)
    .test_answers.filter((ta) => ta.test.id === test_id)

export default function SolutionSubmit({ olympiad, email }) {
  const [submit] = useMutation(gql`
    mutation submit($olympiad_id: String!, $test_answers_ids: [String!]!) {
      olympiads {
        submit_solution(
          olympiad_id: $olympiad_id
          test_answers_ids: $test_answers_ids
        )
      }
    }
  `)
  const p = getParticipant(olympiad, email)
  const [open, setOpen] = React.useState(false)
  const [selectedAnswers, setSelectedAnswers] = React.useState(
    new Array(olympiad.tests.length).map((_) => null)
  )
  const submitHandler = () => {
    console.log(selectedAnswers.filter((a) => a))
    submit({
      refetchQueries: [{ query: OLYMPIADS_QUERY }],
      variables: {
        olympiad_id: olympiad.id,
        test_answers_ids: selectedAnswers.filter((a) => a),
      },
    })
  }
  const selectAnswer = (v, i) => {
    let answers = selectedAnswers.slice()
    answers[i] = v
    setSelectedAnswers(answers)
  }
  return (
    <>
      <Button variant='contained' onClick={(_) => setOpen(true)}>
        Отправка решения
      </Button>
      <Dialog onClose={(_) => setOpen(false)} open={open}>
        <DialogTitle>Отправка решения</DialogTitle>
        <DialogContent>
          {p.submitted_solutions.length !== 0 && (
            <div>
              <h3>Отправленные решения</h3>
              <ul>
                {p.submitted_solutions.map((s) => (
                  <li>
                    Решение {s.answers.length} из {olympiad.tests.length} задач
                    отправленное в{' '}
                    {new Date(parseInt(s.submitted_at)).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <h3>Выбор решений для отправки</h3>
          {olympiad.tests.map((t, i) => (
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <h5>
                  Тест {t.test.name}
                  {selectedAnswers[i] && ` решение ${selectedAnswers[i]}`}
                </h5>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <Select
                  value={selectedAnswers[i]}
                  onChange={(e) => selectAnswer(e.target.value, i)}
                >
                  {getSubmittedAnswers(olympiad, p.id, t.test.id).map((sa) => (
                    <MenuItem value={sa.id}>{sa.id}</MenuItem>
                  ))}
                </Select>
                {selectedAnswers[i] && (
                  <div>
                    {
                      getSubmittedAnswers(olympiad, p.id, t.test.id).find(
                        (sa) => sa.id === selectedAnswers[i]
                      ).code
                    }
                  </div>
                )}
              </ExpansionPanelDetails>
            </ExpansionPanel>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={(_) => setOpen(false)}>Отменить</Button>
          <Button onClick={submitHandler}>Отправить решение</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
