let work = []
const snooze = ms => new Promise(resolve => setTimeout(resolve, ms))

async function runWork(workId) {
  await snooze(3000)
  work[workId].stage = 'Done'
}

module.exports = {
  WorkQueue: {
    queue: () => {
      return work.map((work, id) => {
        return { id, ...work, type: { id: work.type_id } }
      })
    }
  },
  WorkQueueMutation: {
    add_work: (_, { language, type_id, text }) => {
      work = [
        ...work,
        {
          stage: 'WaitingForCompilation',
          language,
          type_id,
          text,
          result: null
        }
      ]
      runWork(work.length - 1)
      return work.length - 1
    },
    check_work_result: (_, { id }) => {
      return work[id].stage === 'Done'
    }
  }
}
