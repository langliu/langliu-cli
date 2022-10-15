#!/usr/bin/env node
import { $ } from 'zx'

import { actions } from './utils/constants.mjs'
import { now } from './bin/now.mjs'
import { pwd } from './bin/pwd.mjs'

$.verbose = false
const argument = process.argv.slice(2)

if (argument.length === 0) {
  console.log('--help')
} else if (!actions.includes(argument[0])) {
  console.log('只能使用以下命令')
} else {
  const action = argument[0]
  switch (action) {
    case 'now':
      now()
      break
    case 'pwd':
      pwd()
      break
  }
}
