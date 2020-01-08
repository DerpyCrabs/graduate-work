import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { BarChart, XAxis, YAxis, Bar } from 'recharts'

const QUERY = gql`
  {
    stats {
      test_completion {
        test_id
        errors
      }
    }
    tests {
      id
      name
    }
  }
`

export default function TestCompletion() {
  const { data, loading } = useQuery(QUERY)
  if (loading) {
    return <div>Loading</div>
  }
  const testCompletion = data.stats.test_completion.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.test_id]: [...acc[cur.test_id], cur]
    }),
    Object.fromEntries(data.tests.map(t => [t.id, []]))
  )
  const pieData = Object.entries(testCompletion).map(([test, arr]) => ({
    name: data.tests.find(val => val.id === test).name,
    value: (arr.filter(t => t.errors === 0).length / arr.length) * 100
  }))
  console.log(pieData)

  return (
    <div>
      <BarChart width={data.tests.length * 140} height={300} data={pieData}>
        <XAxis dataKey='name' padding={{ left: 0, right: 0 }} interval={0} />
        <YAxis unit='%' />
        <Bar dataKey='value' fill='#82ca9d' />
      </BarChart>
    </div>
  )
}
