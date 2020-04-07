import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { AreaChart, XAxis, YAxis, Area, Legend } from 'recharts'

const QUERY = gql`
  {
    stats {
      plugin_runtime {
        start_time
      }
    }
  }
`

export default function PluginExecutionTime() {
  const { data, loading } = useQuery(QUERY)
  if (loading) {
    return <div>Loading</div>
  }
  const dates = data.stats.plugin_runtime
    .map((pr) => {
      let date = new Date(parseInt(pr.start_time))
      date.setHours(0, 0, 0, 0)
      return date.getTime()
    })
    .reduce(function (acc, curr) {
      if (typeof acc[curr] == 'undefined') {
        acc[curr] = 1
      } else {
        acc[curr] += 1
      }

      return acc
    }, {})
  const pieData = Object.entries(dates).map(([date, activity]) => ({
    date,
    activity,
  }))

  return (
    <div>
      <AreaChart
        width={500}
        height={300}
        data={pieData}
        margin={{ left: 20, right: 20 }}
      >
        <XAxis
          dataKey='date'
          type='number'
          domain={['auto', 'auto']}
          tickFormatter={(tickStr) => {
            const d = new Date(parseInt(tickStr))
            return `${d.getDate()}/${d.getMonth() + 1}`
          }}
          padding={{ left: 10, right: 10 }}
        />
        <YAxis />
        <Legend layout='vertical' />
        <Area
          name='Решений заданий олимпиад в день'
          dataKey='activity'
          stroke='#82ca9d'
        />
      </AreaChart>
    </div>
  )
}
