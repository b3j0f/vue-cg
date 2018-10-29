import {check} from '../util'
import {absolutePath, concatPath} from '@/lib/path'

describe('absolutePath', () => {
  const tests = {
    undefined: {params: [], expectation: '/'},
    absolute: {params: ['/a/b'], expectation: '/a/b'},
    absolute2: {params: ['/a/b/'], expectation: '/a/b'},
    absolute3: {params: ['/a/b//'], expectation: '/a/b'},
    absolute4: {params: ['/a/b/.'], expectation: '/a/b'},
    absolute5: {params: ['/a/b/./'], expectation: '/a/b'},
    absolute6: {params: ['/a/b/../'], expectation: '/a'},
    absolute7: {params: ['/a/b/.././b'], expectation: '/a/b'},
    relative: {params: ['a/b'], expectation: '/a/b'},
    relative2: {params: ['a/b/'], expectation: '/a/b'},
    relative3: {params: ['a/b//'], expectation: '/a/b'},
    relative4: {params: ['a/b/.'], expectation: '/a/b'},
    relative5: {params: ['a/b/./'], expectation: '/a/b'},
    relative6: {params: ['a/b/../'], expectation: '/a'},
    relative7: {params: ['a/b/.././b'], expectation: '/a/b'},
    misc: {params: ['././'], expectation: '/'},
    misc2: {params: ['../../'], expectation: '/'}
  }
  check(absolutePath, tests)
})

describe('concatPath', () => {
  const tests = {
    undefined: {params: [], expectation: '/'},
    absolute: {params: ['/a/b', '/twist'], expectation: '/twist'},
    absolute2: {params: ['/a/b', '/twist/./../bilbon'], expectation: '/bilbon'},
    relative: {params: ['a/b', 'c'], expectation: '/a/b/c'},
    relative2: {params: ['a/b/', '..'], expectation: '/a'}
  }
  check(concatPath, tests)
})
