import React from 'react'

export default function Graphics() {
  const allowed = JSON.parse(localStorage.getItem('graphics'))
  if (!allowed) {
    return <div>Graphics are not allowed by your license</div>
  }
  return <div>Graphics</div>
}
