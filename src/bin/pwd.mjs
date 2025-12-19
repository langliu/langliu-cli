import { chalk } from 'zx'

export async function pwd() {
  console.log('当前目录:', chalk.blue(process.cwd()))
}
