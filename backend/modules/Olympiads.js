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
    participants: [Participant!]
    collaborators: [User!]
    score_curve: ScoreCurve!
    tests: [OlympiadTest!]!
    ended: Boolean!
  }
  enum RecruitmentType {
    Open
    Closed
  }
  type OlympiadTest {
    score_coefficient: Float!
    test: Test!
  }
  type Participant {
    id: String!
    name: String!
    consent: Boolean!
    users: [User!]
    test_answers: [TestAnswer!]
    submitted_solutions: SubmittedSolution!
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
    create_olympiad(name: String!, start_at: String!, done_at: String!, recruitment_type: RecruitmentType!): String
    invite_participant(olympiad_id: String!, user_email: String!): String
    remove_participant(participant_id: String!): String
    invite_collaborator(olympiad_id: String!, user_email: String!): String
    remove_collaborator(olympiad_id: String!, user_email: String!): String
    add_test(olympiad_id: String!, test_id: String!): String
    remove_test(olympiad_id: String!, test_id: String!): String
    set_test_score_coefficient(olympiad_id: String!, test_id: String!, score_coefficient: Float!): String
    invite_to_team(participant_id: String!, user_email: String!): String
    create_team(olympiad_id: String!, name: String!): String
    accept_invite(olympiad_id: String!, participant_id: String!): String
    submit_test_answer(olympiad_id: String!, code: String!, test_id: String!): String
    submit_solution(olympiad_id: String!, test_answers_ids: [String!]!): String
    set_test_answer_score(test_answer_id: String!, score: Int!): String
    complete_olympiad(olympiad_id: String!): String
  }
  type ScoreCurve {
    min: Int!
    max: Int!
    points: [ScoreCurvePoint!]!
  }
  type ScoreCurvePoint {
    place: Float!
    coefficient: Float!
  }
  `,
  Query: { olympiads: async () => query('SELECT * FROM olympiads', []) },

  Mutation: { olympiads: empty }
}
