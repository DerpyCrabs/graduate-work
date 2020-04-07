import React from 'react'
import { Apply, AcceptInvite, CreateTeam, TeamInvite } from '../pages/index'
import Button from '@material-ui/core/Button'

const getParticipant = (olympiad, email) =>
  olympiad.participants.find((p) =>
    p.users.map((u) => u.user.email).includes(email)
  )

export default function OlympiadParticipation({ olympiad, email }) {
  const p = getParticipant(olympiad, email)
  if (olympiad.teams === 1) {
    if (olympiad.recruitment_type === 'Open') {
      if (p) {
        return <Button disabled>Заявка на участие подана</Button>
      } else {
        return <Apply olympiad={olympiad} />
      }
    } else {
      const user = p.users.find((u) => u.user.email === email)
      if (!user.consent) {
        return <AcceptInvite participant={p.id} />
      } else {
        return <Button disabled>Приглашение на участие принято</Button>
      }
    }
  } else {
    if (!p) {
      return <CreateTeam olympiad={olympiad} />
    } else {
      const user = p.users.find((u) => u.user.email === email)
      if (user.consent) {
        if (p.users.filter((u) => u.consent).length === olympiad.teams) {
          return <Button disabled>Команда собрана</Button>
        } else {
          return <TeamInvite participant={p} />
        }
      } else {
        return <AcceptInvite participant={p.id} />
      }
    }
  }
}
