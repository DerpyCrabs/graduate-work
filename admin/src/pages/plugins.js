import React from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import {
  Checkbox,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  TextField,
  Button
} from '@material-ui/core'

const PLUGINS_QUERY = gql`
  {
    plugins {
      list {
        id
        enabled
        name
        stage
        version
        settings {
          key
          value
        }
      }
    }
  }
`

const ADD_WORK = gql`
  mutation add_work($language: String!, $text: String!, $type_id: String!) {
    work_queue {
      add_work(language: $language, text: $text, type_id: $type_id) {
        id
      }
    }
  }
`

const PluginEnabledCheckbox = ({ enabled, id }) => {
  const [enable] = useMutation(
    gql`
      mutation enable($id: String!) {
        plugin(id: $id) {
          enable_plugin
        }
      }
    `,
    { variables: { id }, refetchQueries: [{ query: PLUGINS_QUERY }] }
  )
  const [disable] = useMutation(
    gql`
      mutation disable($id: String!) {
        plugin(id: $id) {
          disable_plugin
        }
      }
    `,
    { variables: { id }, refetchQueries: [{ query: PLUGINS_QUERY }] }
  )
  return (
    <Checkbox
      checked={enabled}
      onChange={e => (!e.target.checked ? disable() : enable())}
    />
  )
}

const PluginSettingsDialog = ({ id, settings: initialSettings }) => {
  const [showDialog, setShowDialog] = React.useState(false)
  const [settings, setSettings] = React.useState(initialSettings)
  const [setSetting] = useMutation(
    gql`
      mutation set_setting($id: String!, $key: String!, $value: String!) {
        plugin(id: $id) {
          set_setting(key: $key, value: $value) {
            key
            value
          }
        }
      }
    `
  )
  const setSettingsHandler = (key, value) => {
    setSettings([{ key, value }, ...settings.filter(set => key !== set.key)])
    setSetting({
      variables: { id, key, value }
    })
  }
  return (
    <div>
      {initialSettings.length > 0 ? (
        <Button onClick={() => setShowDialog(true)}>Show settings</Button>
      ) : (
        <div>No settings</div>
      )}
      <Dialog onClose={() => setShowDialog(false)} open={showDialog}>
        <DialogTitle>Plugin settings</DialogTitle>
        {settings.map(({ key, value }) => (
          <TextField
            label={key}
            value={settings.find(({ key: key2 }) => key2 === key).value}
            onChange={e => setSettingsHandler(key, e.target.value)}
          />
        ))}
      </Dialog>
    </div>
  )
}

// const PluginStatsDialog = ({ stats }) => {
//   const [showDialog, setShowDialog] = React.useState(false)
//   return (
//     <div>
//       {stats.length > 0 ? (
//         <Button onClick={() => setShowDialog(true)}>Show stats</Button>
//       ) : (
//         <div>No stats</div>
//       )}
//       <Dialog onClose={() => setShowDialog(false)} open={showDialog}>
//         <DialogTitle>Plugin statistics</DialogTitle>
//         {stats.map(stat => (
//           <div>{JSON.stringify(stat)}</div>
//         ))}
//       </Dialog>
//     </div>
//   )
// }

export default function Plugins() {
  const { loading, data } = useQuery(PLUGINS_QUERY)
  const [language, setLanguage] = React.useState('')
  const [type, setType] = React.useState('')
  const [text, setText] = React.useState('')
  const [addWork] = useMutation(ADD_WORK)
  return (
    <div>
      <h3>Plugins</h3>
      <br />
      {loading ? (
        <div>loading</div>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Enabled?</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Stage</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Settings</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.plugins.list.map(
                ({ id, enabled, name, stage, version, settings }) => (
                  <TableRow>
                    <TableCell>{id}</TableCell>
                    <TableCell>
                      <PluginEnabledCheckbox enabled={enabled} id={id} />
                    </TableCell>
                    <TableCell>{name}</TableCell>
                    <TableCell>{stage}</TableCell>
                    <TableCell>{version}</TableCell>
                    <TableCell>
                      <PluginSettingsDialog id={id} settings={settings} />
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </div>
  )
}
