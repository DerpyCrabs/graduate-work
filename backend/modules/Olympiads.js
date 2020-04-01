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
    teams: Int
    collaborators: [User!]
    ended: Boolean!
    score_curve: ScoreCurve!
    tests: [OlympiadTest!]!
    participants: [Participant!]

    leaderboard: [LeaderboardEntry!]
  }
  enum RecruitmentType {
    Open
    Closed
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
    submitted_solutions: SubmittedSolution!
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
    submitted_at: String!
    test: Test!
    score: Int!
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
    submit_solution(olympiad_id: String!, test_answers_ids: [String!]!): String
    set_test_answer_score(test_answer_id: String!, score: Int!): String
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
      query('SELECT * FROM olympiads', []).then(rows =>
        rows.map(olympiad => ({
          ...olympiad,
          recruitment_type: olympiad.recruitment_type === 1 ? 'Closed' : 'Open'
        }))
      )
  },
  Participant: {
    users: async ({ id }) =>
      (
        await query(
          'SELECT * FROM olympiad_participant_teams JOIN users ON participant_id = users.id WHERE olympiad_participant_id = $1',
          [id]
        )
      ).map(user => ({ consent: user.consent, user }))
  },
  Olympiad: {
    creator: async ({ creator_id }) =>
      query('SELECT * FROM users WHERE id = $1 LIMIT 1', [creator_id]).then(
        rows => rows[0]
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
        points: curve_points
      }
    },
    tests: async ({ id }) => {
      const tests = await query(
        'SELECT * FROM olympiad_tests JOIN tests ON test_id = tests.id WHERE olympiad_id = $1',
        [id]
      )
      return tests.map(test => ({
        score_coefficient: test.coefficient,
        test: test
      }))
    }
  },

  Mutation: { olympiads: empty },
  OlympiadsMutation: {
    remove_participant: async (_, { participant_id }) => {
      await query(
        'DELETE FROM olympiad_participant_teams WHERE olympiad_participant_id = $1',
        [participant_id]
      )
      await query('DELETE FROM olympiad_participants WHERE id = $1', [
        participant_id
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
      query(
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
            recruitment_type === 'Closed' ? 1 : 0,
            teams
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
        olympiad_id
      ]).then(_ => 'done'),
    invite_collaborator: async (_, { olympiad_id, user_email }) =>
      await query(
        'INSERT INTO olympiad_collaborators (olympiad_id, collaborator_id) VALUES ($1, (SELECT id FROM users WHERE email = $2 LIMIT 1))',
        [olympiad_id, user_email]
      ).then(_ => 'done'),
    remove_collaborator: async (_, { olympiad_id, user_email }) =>
      await query(
        'DELETE FROM olympiad_collaborators WHERE olympiad_id = $1 AND collaborator_id = (SELECT id FROM users WHERE email = $2 LIMIT 1)',
        [olympiad_id, user_email]
      ).then(_ => 'done'),
    set_score_interval: async (_, { olympiad_id, min, max }) =>
      await query(
        'UPDATE olympiads SET min_score = $1, max_score = $2 WHERE id = $3',
        [min, max, olympiad_id]
      ).then(_ => 'done'),
    set_score_curve: async (_, { olympiad_id, curve }) => {
      await query('DELETE FROM olympiad_score_curves WHERE olympiad_id = $1', [
        olympiad_id
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
      ).then(_ => 'done'),
    remove_test: async (_, { olympiad_id, test_id }) =>
      query(
        'DELETE FROM olympiad_tests WHERE test_id = $1 AND olympiad_id = $2',
        [test_id, olympiad_id]
      ).then(_ => 'done'),
    set_test_score_coefficient: async (
      _,
      { olympiad_id, test_id, score_coefficient }
    ) =>
      query(
        'UPDATE olympiad_tests SET coefficient = $1 WHERE test_id = $2 AND olympiad_id = $3',
        [score_coefficient, test_id, olympiad_id]
      ).then(_ => 'done')
  }
}
