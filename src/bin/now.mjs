import { chalk } from 'zx'
import { getCurrentDate } from '../utils/date.mjs'

export function now() {
  console.log('现在时间是:', chalk.magenta(getCurrentDate()))
}
