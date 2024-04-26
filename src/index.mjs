#!/usr/bin/env node
import { $, chalk } from 'zx'
import figlet from 'figlet'

import { actions } from './utils/constants.mjs'
import { now } from './bin/now.mjs'
import { pwd } from './bin/pwd.mjs'
import { squoosh } from './bin/squoosh.mjs'
import { split } from './bin/split.mjs'

$.verbose = false
const argument = process.argv.slice(2)

if (argument.length === 0) {
  console.log('--help')
  console.log(figlet.textSync('LangLiu Cli'))
} else if (!actions.includes(argument[0])) {
  console.log('只能使用以下命令', actions.join('、'))
} else {
  const action = argument[0]
  switch (action) {
    case 'now':
      now()
      break
    case 'pwd':
      pwd()
      break
    case 'squoosh':
      squoosh()
      break
    case 'split':
      if (!argument?.[1]) {
        console.log(chalk.red('请输入文件地址'))
      } else {
        split(argument[1], argument[2])
      }
      break
  }
}
