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
  TableCell
} from '@material-ui/core'

export default function Results({ id }) {
  const results = {
    name: 'Олимпиада',
    results: {
      participants: [
        { name: 'Участник 1', place: 1 },
        { name: 'Участник 2', place: 2 }
      ]
    }
  }
  results.results.participants.sort((a, b) => a.place - b.place)
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button variant='contained' onClick={_ => setOpen(!open)}>
        Результаты
      </Button>
      <Dialog onClose={_ => setOpen(false)} open={open}>
        <DialogTitle>Результаты олимпиады "{results.name}"</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Участник</TableCell>
                <TableCell>Место</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.results.participants.map(({ name, place }) => (
                <TableRow key={`${name}-${place}`}>
                  <TableCell>{name}</TableCell>
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
