import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Tabs,
  Tab,
  TabPanel,
  Table,
  Grid,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from '@material-ui/core'

export default function Results({ olympiad, email }) {
  let results = olympiad.leaderboard
  results.sort((a, b) => a.place - b.place)
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button variant='contained' onClick={(_) => setOpen(!open)}>
        Результаты
      </Button>
      <Dialog onClose={(_) => setOpen(false)} open={open}>
        <DialogTitle>Результаты олимпиады "{olympiad.name}"</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Участник</TableCell>
                <TableCell>Количество очков</TableCell>
                <TableCell>Место</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map(({ participant, score, place }) => (
                <TableRow
                  key={`${participant.name}-${place}`}
                  style={{
                    backgroundColor: participant.users
                      .map((u) => u.user.email)
                      .includes(email)
                      ? 'beige'
                      : 'white',
                  }}
                >
                  <TableCell>
                    {olympiad.teams === 1
                      ? participant.name
                      : `${participant.name} (${participant.users
                          .map((u) => u.user.email)
                          .join(', ')})`}
                  </TableCell>
                  <TableCell>{score}</TableCell>
                  <TableCell>{place}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </>
  )
}
