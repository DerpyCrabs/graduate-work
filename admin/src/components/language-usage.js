import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { Pie, PieChart, Tooltip, Cell } from 'recharts'

const QUERY = gql`
  {
    stats {
      test_completion {
        language
      }
    }
  }
`
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

const RADIAN = Math.PI / 180

export default function LanguageUsage() {
  const { data, loading } = useQuery(QUERY)
  if (loading) {
    return <div>Loading</div>
  }
  const usage = data.stats.test_completion.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.language]:
        typeof acc[cur.language] === 'undefined' ? 1 : acc[cur.language] + 1
    }),
    {}
  )
  const pieData = Object.entries(usage).map(([lang, usage]) => ({
    name: lang,
    value: usage
  }))
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.2
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill='white'
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline='central'
      >
        {`${pieData[index].name} - ${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }
  return (
    <div>
      <PieChart width={300} height={300}>
        <Pie data={pieData} label={renderCustomizedLabel} labelLine={false}>
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  )
}
