import React from 'react'

export default function TestDescription({ test }) {
  return (
    <>
      <h3>{test.name}</h3>
      {test.description}
      <ul>
        <b>Expected behavior:</b>
        {test.checks.map(({ expected, input }) => (
          <li>
            For input "{input}" returns "{expected}"
          </li>
        ))}
      </ul>
      <div style={{ flexGrow: 1 }} />
    </>
  )
}
