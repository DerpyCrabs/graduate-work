import React from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'

const LICENSE = gql`
  query kek($key: String) {
    license(key: $key) {
      name
      organization
      threads
      graphics
      expiresOn
    }
  }
`
export default function License() {
  const currentKey = localStorage.getItem('key')
  const [key, setKey] = React.useState(currentKey)
  const { data, loading } = useQuery(LICENSE, {
    variables: { key },
    pollInterval: 1000,
  })
  React.useEffect(() => {
    if (data && data.license) {
      localStorage.setItem('key', key)
      localStorage.setItem('threads', data.license.threads)
      localStorage.setItem('graphics', data.license.graphics)
    } else {
      localStorage.setItem('threads', 2)
      localStorage.setItem('graphics', false)
    }
  }, [data])
  return (
    <div style={{ padding: 10 }}>
      Ключ:
      <input
        value={key}
        style={{ width: 500 }}
        onChange={(e) => setKey(e.target.value)}
      />
      <br />
      {!(!data || !data.license) ? (
        <div>
          Имя: {data.license.name}
          <br />
          Организация: {data.license.organization}
          <br />
          Максимальное число одновременных задач: {data.license.threads}
          <br />
          Отображение статистики: {data.license.graphics ? 'Да' : 'Нет'}
          <br />
          Срок действия ключа: {data.license.expiresOn}
          <br />
        </div>
      ) : (
        <div>Ключ некорректен или его срок действия истек</div>
      )}
    </div>
  )
}
