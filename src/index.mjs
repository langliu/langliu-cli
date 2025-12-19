#!/usr/bin/env node
import { Command } from 'commander'
import figlet from 'figlet'
import { chalk } from 'zx'
import { imageCompression, now, pwd, split } from './bin/index.mjs'

const program = new Command()

program
  .name('lq')
  .description('LangLiu 的个人 CLI 工具库')
  .version('0.0.3')
  .addHelpText('before', chalk.cyan(figlet.textSync('LangLiu CLI')))

program
  .command('now')
  .description('显示当前日期和时间')
  .action(() => {
    now()
  })

program
  .command('pwd')
  .description('显示当前工作目录路径')
  .action(() => {
    pwd()
  })

program
  .command('magick')
  .description('使用 ImageMagick 递归压缩当前目录或指定目录下的图片')
  .argument('[path]', '目标目录路径，默认为当前目录')
  .action((path) => {
    imageCompression(path)
  })

program
  .command('split')
  .description('按章节正则表达式拆分小说文件并导出为 CSV')
  .argument('<filePath>', '小说文件路径')
  .argument('[titleRegex]', '匹配标题的正则表达式 (可选)')
  .action((filePath, titleRegex) => {
    split(filePath, titleRegex)
  })

// 处理没有传递参数的情况，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp()
}

program.parse(process.argv)
