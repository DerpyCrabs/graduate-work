import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { BarChart, XAxis, YAxis, Bar } from 'recharts'

const QUERY = gql`
  {
    stats {
      plugin_runtime {
        id
        name
        run_time
      }
    }
    plugins {
      list {
        id
        name
      }
    }
  }
`

export default function PluginExecutionTime() {
  const { data, loading } = useQuery(QUERY)
  if (loading) {
    return <div>Loading</div>
  }
  const testCompletion = data.stats.plugin_runtime.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.id]: [...acc[cur.id], cur]
    }),
    Object.fromEntries(data.plugins.list.map(t => [t.id, []]))
  )
  const pieData = Object.entries(testCompletion).map(([plugin, arr]) => ({
    name: data.plugins.list.find(p => p.id === plugin).name,
    value:
      arr.reduce((acc, val) => parseInt(val.run_time) + acc, 0.0) / arr.length
  }))
  console.log(pieData)

  return (
    <div>
      <BarChart
        width={data.plugins.list.length * 140}
        height={300}
        data={pieData}
      >
        <XAxis dataKey='name' padding={{ left: 0, right: 0 }} interval={0} />
        <YAxis unit='ms' />
        <Bar dataKey='value' fill='#82ca9d' />
      </BarChart>
    </div>
  )
}
