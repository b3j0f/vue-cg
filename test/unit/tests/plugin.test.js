import { check } from './util'
import { setConfs, getConfs } from '@/lib/conf'

const confs = getConfs()

describe('parseConfs', () => {
  const parseConfs = conf => {
    if (typeof conf === 'function') {
      try {
        const confwithenum = conf({ schema: { enum: [''], additionalProperties: false, patternProperties: {}, required: [''] } })
        parseConfs(confwithenum)
      } catch (ex) {
      }
      try {
        const confwithoutenum = conf({ schema: {}, additionalProperties: false, patternProperties: {}, required: [''] })
        parseConfs(confwithoutenum)
      } catch (ex) {
      }
    } else if (conf && typeof conf === 'object') {
      Object.values(conf).forEach(parseConfs)
    }
  }
  it('parse', () => expect(parseConfs(confs)).toEqual(undefined))
})

describe('getConfs', () => {
  const tests = {
    undefined: { expectation: confs }
  }
  check(getConfs, tests)
})

describe('setConfs', () => {
  const seed = Math.random()
  const tests = {
    undefined: { params: [], expectation: confs },
    seed: { params: [{ seed: seed }], expectation: { ...confs, seed: seed } }
  }
  check(setConfs, tests)
})
