const { empty } = require('../utils')
const { query } = require('../db')

module.exports = {
  Schema: `
  extend type Query {
    olympiads: [Olympiad!]
  }
  extend type Mutation {
    olympiads: OlympiadsMutation!
  }
  type Olympiad {
    id: String!
    creator: User!
    name: String!
    start_at: String!
    done_at: String!
    recruitment_type: RecruitmentType!
    teams: Int!
    collaborators: [User!]
    score_curve: ScoreCurve!
    tests: [OlympiadTest!]!
    participants: [Participant!]
    leaderboard: [LeaderboardEntry!]
    stage: OlympiadStage!
  }
  enum RecruitmentType {
    Open
    Closed
  }
  enum OlympiadStage {
    Created
    Ongoing
    Review
    Ended
  }
  type LeaderboardEntry {
    place: Int!
    score: Int!
    participant: Participant!
  }
  type OlympiadTest {
    score_coefficient: Float!
    test: Test!
  }
  type Participant {
    id: String!
    name: String!
    users: [ParticipantUser!]
    test_answers: [TestAnswer!]
    submitted_solutions: [SubmittedSolution!]
  }
  type ParticipantUser {
    user: User!
    consent: Boolean!
  }
  type SubmittedSolution {
    id: String!
    submitted_at: String!
    answers: [TestAnswer!]!
  }
  type TestAnswer {
    id: String!
    code: String!
    test: Test!
    score: Int
  }
  type OlympiadsMutation {
    create_olympiad(name: String!, start_at: String!, done_at: String!, recruitment_type: RecruitmentType!, teams: Int!): String
    complete_olympiad(olympiad_id: String!): String
    invite_collaborator(olympiad_id: String!, user_email: String!): String
    remove_collaborator(olympiad_id: String!, user_email: String!): String
    set_score_interval(olympiad_id: String!, min: Int!, max: Int!): String
    set_score_curve(olympiad_id: String!, curve: ScoreCurveInput!): String
    add_test(olympiad_id: String!, test_id: String!): String
    remove_test(olympiad_id: String!, test_id: String!): String
    set_test_score_coefficient(olympiad_id: String!, test_id: String!, score_coefficient: Float!): String
    invite_participant(olympiad_id: String!, user_email: String!): String
    remove_participant(participant_id: String!): String
    accept_invite(participant_id: String!): String
    apply(olympiad_id: String!): String
    invite_to_team(participant_id: String!, user_email: String!): String
    create_team(olympiad_id: String!, name: String!): String
    submit_test_answer(olympiad_id: String!, code: String!, test_id: String!): String
    set_test_answer_score(test_answer_id: String!, score: Int!): String
    submit_solution(olympiad_id: String!, test_answers_ids: [String!]!): String
  }
  type ScoreCurve {
    min: Int!
    max: Int!
    points: [ScoreCurvePoint!]!
  }
  input ScoreCurveInput {
    points: [ScoreCurvePointInput!]!
  }
  input ScoreCurvePointInput {
    place: Float!
    coefficient: Float!
  }
  type ScoreCurvePoint {
    place: Float!
    coefficient: Float!
  }
  `,
  Query: {
    olympiads: async () =>
      query(
        'SELECT * FROM olympiads ORDER BY start_at ASC, done_at ASC',
        []
      ).then((rows) =>
        rows.map((olympiad) => ({
          ...olympiad,
          recruitment_type: olympiad.recruitment_type === 1 ? 'Closed' : 'Open',
        }))
      ),
  },
  Participant: {
    users: async ({ id }) =>
      (
        await query(
          'SELECT * FROM olympiad_participant_teams JOIN users ON participant_id = users.id WHERE olympiad_participant_id = $1',
          [id]
        )
      ).map((user) => ({ consent: user.consent, user })),
    test_answers: async ({ id }) =>
      await query(
        'SELECT * FROM olympiad_test_answers WHERE participant_id = $1',
        [id]
      ),
    submitted_solutions: async ({ id }) =>
      await query(
        'SELECT * FROM olympiad_submitted_solutions WHERE participant_id = $1',
        [id]
      ),
    name: async ({ id }) =>
      (
        await query('SELECT name FROM olympiad_participants WHERE id = $1', [
          id,
        ])
      )[0].name,
  },
  SubmittedSolution: {
    answers: async ({ id }) =>
      await query(
        'SELECT olympiad_test_answers.id AS id, test_id, code, score FROM olympiad_submitted_solution_answers JOIN olympiad_test_answers ON answer_id = olympiad_test_answers.id WHERE solution_id = $1',
        [id]
      ),
  },
  TestAnswer: {
    test: async ({ test_id }) =>
      (await query('SELECT * FROM tests WHERE id = $1', [test_id]))[0],
  },
  Olympiad: {
    stage: async ({ id }) => {
      const olympiad = (
        await query('SELECT * FROM olympiads WHERE id = $1', [id])
      )[0]

      if (olympiad.start_at > new Date()) {
        return 'Created'
      } else if (olympiad.done_at > new Date()) {
        return 'Ongoing'
      } else if (!olympiad.ended) {
        return 'Review'
      } else {
        return 'Ended'
      }
    },
    leaderboard: async ({ id }) => {
      const olympiad = (
        await query('SELECT * FROM olympiads WHERE id = $1', [id])
      )[0]
      if (!olympiad.ended) {
        return null
      }
      const participant_ids = (
        await query(
          'SELECT id FROM olympiad_participants WHERE olympiad_id = $1',
          [id]
        )
      ).map((row) => row.id)

      let leaderboard = []
      for (const participant_id of participant_ids) {
        const submitted_solution = await query(
          'SELECT * FROM olympiad_submitted_solutions WHERE participant_id = $1 ORDER BY submitted_at DESC LIMIT 1',
          [participant_id]
        )
        if (submitted_solution.length === 0) {
          continue
        }
        const answers = await query(
          'SELECT * FROM olympiad_submitted_solution_answers WHERE solution_id = $1',
          [submitted_solution[0].id]
        )
        const score = answers.reduce((acc, answer) => acc + answer.score, 0)
        leaderboard.push({ participant: { id: participant_id }, score })
      }

      leaderboard.sort((a, b) => b.score - a.score)
      return leaderboard.map((entry, i) => ({ ...entry, place: i + 1 }))
    },
    creator: async ({ creator_id }) =>
      query('SELECT * FROM users WHERE id = $1 LIMIT 1', [creator_id]).then(
        (rows) => rows[0]
      ),
    collaborators: async ({ id }) =>
      query(
        'SELECT * FROM olympiad_collaborators JOIN users ON collaborator_id = users.id WHERE olympiad_id = $1',
        [id]
      ),
    participants: async ({ id }) =>
      await query(
        'SELECT * FROM olympiad_participants WHERE olympiad_id = $1',
        [id]
      ),
    score_curve: async ({ id }) => {
      const interval = (
        await query(
          'SELECT min_score, max_score FROM olympiads WHERE id = $1',
          [id]
        )
      )[0]
      const curve_points = await query(
        'SELECT * FROM olympiad_score_curves WHERE olympiad_id = $1 ORDER BY place ASC',
        [id]
      )
      return {
        min: interval.min_score,
        max: interval.max_score,
        points: curve_points,
      }
    },
    tests: async ({ id }) => {
      const tests = await query(
        'SELECT * FROM olympiad_tests JOIN tests ON test_id = tests.id WHERE olympiad_id = $1',
        [id]
      )
      return tests.map((test) => ({
        score_coefficient: test.coefficient,
        test: test,
      }))
    },
  },

  Mutation: { olympiads: empty },
  OlympiadsMutation: {
    submit_solution: async (
      _,
      { olympiad_id, test_answers_ids },
      { email }
    ) => {
      const olympiad = (
        await query('SELECT * FROM olympiads WHERE id = $1', [olympiad_id])
      )[0]

      if (olympiad.start_at > new Date() || olympiad.done_at < new Date()) {
        throw new Error("Olympiad hasn't begun or already ended")
      }

      const score_curve = await query(
        'SELECT * FROM olympiad_score_curves WHERE olympiad_id = $1',
        [olympiad_id]
      )
      const score_curve_coefficient = (() => {
        const now = new Date().getTime() / 1000
        const start = olympiad.start_at.getTime() / 1000
        const done = olympiad.done_at.getTime() / 1000
        const place = (now - start) / (done - start)
        let closest_place = { prev: 0, next: 0, prev_coef: 0, next_coef: 0 }
        score_curve.forEach((point, i) => {
          if (point.place < place) {
            closest_place = {
              prev: point.place,
              prev_coef: point.coefficient,
              next: score_curve[i + 1].place,
              next_coef: score_curve[i + 1].coefficient,
            }
          }
        })
        return (
          closest_place.prev_coef +
          ((place - closest_place.prev) /
            (closest_place.next - closest_place.prev)) *
            (closest_place.next_coef - closest_place.prev_coef)
        )
      })()
      const calculate_score = async (test_id) => {
        const test_coefficient = (
          await query(
            'SELECT coefficient FROM olympiad_tests WHERE test_id = $1 AND olympiad_id = $2',
            [test_id, olympiad_id]
          )
        )[0].coefficient
        return Math.ceil(
          test_coefficient *
            ((olympiad.max_score - olympiad.min_score) *
              score_curve_coefficient +
              olympiad.min_score)
        )
      }
      const participant_id = (
        await query(
          'SELECT olympiad_participant_id FROM olympiad_participant_teams JOIN olympiad_participants ON olympiad_participant_id = olympiad_participants.id WHERE participant_id = (SELECT id FROM users WHERE email = $1 LIMIT 1) AND olympiad_id = $2',
          [email, olympiad_id]
        )
      )[0].olympiad_participant_id
      const solution_id = (
        await query(
          'INSERT INTO olympiad_submitted_solutions (olympiad_id, participant_id, submitted_at) VALUES ($1, $2, now()) RETURNING id',
          [olympiad_id, participant_id]
        )
      )[0].id
      for (const answer_id of test_answers_ids) {
        const test_id = (
          await query(
            'SELECT test_id FROM olympiad_test_answers WHERE id = $1',
            [answer_id]
          )
        )[0].test_id
        const score = await calculate_score(test_id)
        await query(
          'INSERT INTO olympiad_submitted_solution_answers (solution_id, answer_id, score) VALUES ($1, $2, $3)',
          [solution_id, answer_id, score]
        )
      }
      return 'done'
    },
    set_test_answer_score: async (_, { test_answer_id, score }) =>
      query(
        'UPDATE olympiad_submitted_solution_answers SET score = $1 WHERE id = $2',
        [score, test_answer_id]
      ).then((_) => 'done'),
    submit_test_answer: async (
      _,
      { olympiad_id, code, test_id },
      { email }
    ) => {
      const olympiad = (
        await query('SELECT * FROM olympiads WHERE id = $1', [olympiad_id])
      )[0]

      if (olympiad.start_at > new Date() || olympiad.done_at < new Date()) {
        throw new Error("Olympiad hasn't begun or already ended")
      }
      const participant_id = (
        await query(
          'SELECT olympiad_participant_id FROM olympiad_participant_teams JOIN olympiad_participants ON olympiad_participant_id = olympiad_participants.id WHERE participant_id = (SELECT id FROM users WHERE email = $1 LIMIT 1) AND olympiad_id = $2',
          [email, olympiad_id]
        )
      )[0].olympiad_participant_id
      await query(
        'INSERT INTO olympiad_test_answers (participant_id, test_id, code) VALUES ($1, $2, $3)',
        [participant_id, test_id, code]
      )
      return 'done'
    },
    invite_to_team: async (_, { participant_id, user_email }) => {
      const olympiad_id = (
        await query(
          'SELECT olympiad_id FROM olympiad_participants WHERE id = $1',
          [participant_id]
        )
      )[0].olympiad_id
      const olympiad = (
        await query('SELECT teams FROM olympiads WHERE id = $1', [olympiad_id])
      )[0]
      if (olympiad.teams === 1) {
        throw new Error('Cannot use teams for this olympiad')
      }
      const current_members = await query(
        'SELECT * FROM olympiad_participant_teams WHERE olympiad_participant_id = $1 AND consent = true',
        [participant_id]
      )
      if (current_members.length === olympiad.teams) {
        throw new Error('Cannot invite more members')
      }
      await query(
        'INSERT INTO olympiad_participant_teams (consent, olympiad_participant_id, participant_id) VALUES (false, $1, (SELECT id FROM users WHERE email = $2 LIMIT 1))',
        [participant_id, user_email]
      )
      return 'done'
    },
    create_team: async (_, { olympiad_id, name }, { email }) => {
      const olympiad = (
        await query(
          'SELECT recruitment_type, teams FROM olympiads WHERE id = $1',
          [olympiad_id]
        )
      )[0]
      if (olympiad.recruitment_type !== 0) {
        throw new Error('Cannot apply to closed olympiad')
      }
      if (olympiad.teams === 1) {
        throw new Error('Cannot create teams for this olympiad')
      }
      const olympiad_participant_id = (
        await query(
          'INSERT INTO olympiad_participants (name, olympiad_id) VALUES ($1, $2) RETURNING id',
          [name, olympiad_id]
        )
      )[0].id
      await query(
        'INSERT INTO olympiad_participant_teams (consent, olympiad_participant_id, participant_id) VALUES (true, $1, (SELECT id FROM users WHERE email = $2 LIMIT 1))',
        [olympiad_participant_id, email]
      )
      return 'done'
    },
    remove_participant: async (_, { participant_id }) => {
      await query(
        'DELETE FROM olympiad_participant_teams WHERE olympiad_participant_id = $1',
        [participant_id]
      )
      await query('DELETE FROM olympiad_participants WHERE id = $1', [
        participant_id,
      ])
      return 'done'
    },
    invite_participant: async (_, { olympiad_id, user_email }) => {
      const olympiad = (
        await query('SELECT teams FROM olympiads WHERE id = $1', [olympiad_id])
      )[0]
      if (olympiad.teams !== 1) {
        throw new Error('Cannot invite single member')
      }
      const olympiad_participant_id = (
        await query(
          'INSERT INTO olympiad_participants (name, olympiad_id) VALUES ($1, $2) RETURNING id',
          [user_email, olympiad_id]
        )
      )[0].id
      await query(
        'INSERT INTO olympiad_participant_teams (consent, olympiad_participant_id, participant_id) VALUES (false, $1, (SELECT id FROM users WHERE email = $2 LIMIT 1))',
        [olympiad_participant_id, user_email]
      )
      return 'done'
    },
    accept_invite: async (_, { participant_id }) => {
      const olympiad_id = (
        await query(
          'SELECT olympiad_id FROM olympiad_participants WHERE id = $1',
          [participant_id]
        )
      )[0].olympiad_id
      const olympiad = (
        await query(
          'SELECT recruitment_type, teams FROM olympiads WHERE id = $1',
          [olympiad_id]
        )
      )[0]
      const current_members = await query(
        'SELECT * FROM olympiad_participant_teams WHERE olympiad_participant_id = $1 AND consent = true',
        [participant_id]
      )
      if (current_members.length === olympiad.teams) {
        throw new Error('Team is full')
      }
      await query(
        'UPDATE olympiad_participant_teams SET consent = TRUE WHERE olympiad_participant_id = $1',
        [participant_id]
      )
      return 'done'
    },
    apply: async (_, { olympiad_id }, { email }) => {
      const olympiad = (
        await query(
          'SELECT recruitment_type, teams FROM olympiads WHERE id = $1',
          [olympiad_id]
        )
      )[0]
      if (olympiad.recruitment_type !== 0) {
        throw new Error('Cannot apply to closed olympiad')
      }
      if (olympiad.teams !== 1) {
        throw new Error('Cannot apply without team')
      }
      const olympiad_participant_id = (
        await query(
          'INSERT INTO olympiad_participants (name, olympiad_id) VALUES ($1, $2) RETURNING id',
          [email, olympiad_id]
        )
      )[0].id
      await query(
        'INSERT INTO olympiad_participant_teams (consent, olympiad_participant_id, participant_id) VALUES (true, $1, (SELECT id FROM users WHERE email = $2 LIMIT 1))',
        [olympiad_participant_id, email]
      )
      return 'done'
    },
    create_olympiad: async (
      _,
      { name, start_at, done_at, recruitment_type, teams },
      { email }
    ) => {
      const id = (
        await query(
          'INSERT INTO olympiads (creator_id, name, start_at, done_at, recruitment_type, teams, ended, min_score, max_score) VALUES ((SELECT id FROM users WHERE email = $1 LIMIT 1), $2, to_timestamp($3), to_timestamp($4), $5, $6, FALSE, 50, 100) RETURNING olympiads.id as id',
          [
            email,
            name,
            parseInt(start_at),
            parseInt(done_at),
            teams !== 1 ? 0 : recruitment_type === 'Closed' ? 1 : 0,
            teams,
          ]
        )
      )[0].id
      for (let i = 0; i < 5; i++) {
        await query(
          'INSERT INTO olympiad_score_curves (olympiad_id, place, coefficient) VALUES ($1, $2, 1.0)',
          [id, i * 0.25]
        )
      }
      return 'done'
    },
    complete_olympiad: async (_, { olympiad_id }) =>
      await query('UPDATE olympiads SET ended = true WHERE id = $1', [
        olympiad_id,
      ]).then((_) => 'done'),
    invite_collaborator: async (_, { olympiad_id, user_email }) =>
      await query(
        'INSERT INTO olympiad_collaborators (olympiad_id, collaborator_id) VALUES ($1, (SELECT id FROM users WHERE email = $2 LIMIT 1))',
        [olympiad_id, user_email]
      ).then((_) => 'done'),
    remove_collaborator: async (_, { olympiad_id, user_email }) =>
      await query(
        'DELETE FROM olympiad_collaborators WHERE olympiad_id = $1 AND collaborator_id = (SELECT id FROM users WHERE email = $2 LIMIT 1)',
        [olympiad_id, user_email]
      ).then((_) => 'done'),
    set_score_interval: async (_, { olympiad_id, min, max }) =>
      await query(
        'UPDATE olympiads SET min_score = $1, max_score = $2 WHERE id = $3',
        [min, max, olympiad_id]
      ).then((_) => 'done'),
    set_score_curve: async (_, { olympiad_id, curve }) => {
      await query('DELETE FROM olympiad_score_curves WHERE olympiad_id = $1', [
        olympiad_id,
      ])
      for (const point of curve.points) {
        await query(
          'INSERT INTO olympiad_score_curves (olympiad_id, place, coefficient) VALUES ($1, $2, $3)',
          [olympiad_id, point.place, point.coefficient]
        )
      }
      return 'done'
    },
    add_test: async (_, { olympiad_id, test_id }) =>
      query(
        'INSERT INTO olympiad_tests (test_id, olympiad_id, coefficient) VALUES ($1, $2, 1.0)',
        [test_id, olympiad_id]
      ).then((_) => 'done'),
    remove_test: async (_, { olympiad_id, test_id }) =>
      query(
        'DELETE FROM olympiad_tests WHERE test_id = $1 AND olympiad_id = $2',
        [test_id, olympiad_id]
      ).then((_) => 'done'),
    set_test_score_coefficient: async (
      _,
      { olympiad_id, test_id, score_coefficient }
    ) =>
      query(
        'UPDATE olympiad_tests SET coefficient = $1 WHERE test_id = $2 AND olympiad_id = $3',
        [score_coefficient, test_id, olympiad_id]
      ).then((_) => 'done'),
  },
}
