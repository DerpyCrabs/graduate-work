import React from 'react'

export default function TestDescription({ test }) {
  return (
    <>
      <h3>{test.name}</h3>
      {test.description}
      <ul>
        <b>Ожидаемое поведение:</b>
        {test.checks
          .slice(0, Math.ceil(test.checks.length / 2))
          .map(({ expected, input }) => (
            <li>
              Для ввода "{input}" возвращает "{expected}"
            </li>
          ))}
      </ul>
      <div style={{ flexGrow: 1 }} />
    </>
  )
}
