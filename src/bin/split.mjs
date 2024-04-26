import { chalk, fs, path } from 'zx'
import { stringify } from 'csv'
import * as nzh from 'nzh/cn'

/**
 * 小说拆分
 * @param {string} filePath 文件地址
 * @param {string} titleRegex 匹配标题的正则表达式
 */
export async function split (filePath, titleRegex) {
  /** 判断文件是否存在 */
  const fileExist = await fs.exists(filePath)
  if (fileExist) {
    fs.readFile(filePath).then((value) => {
      const fileContent = value.toString()
      const list = []
      const arr = fileContent.split(/\n/).filter(item => item !== '')
      const regex = titleRegex ? new RegExp(titleRegex) : /^\s*第(.*)章\s*(.*)/
      for (const item of arr) {
        if (regex.test(item)) {
          let serial = 0
          try {
            serial = item.replace(regex, '$1')
            if (/^\d*$/.test(serial)) {
              serial = Number(serial)
            } else {
              serial = nzh.default.decodeS(serial)
            }
          } catch (error) {
            serial = 0
          }
          list.push({
            title: item.replace(regex, '$2').trim(),
            serial
          })
        } else {
          const current = list[list.length - 1]
          if (current && item && item !== '\r') {
            current.content = (current?.content ?? '') + `${item}\n`
          }
        }
      }
      const stringifier = stringify({ header: true, columns: Object.keys(list[0]) })
      for (const item of list) {
        stringifier.write(Object.values(item))
      }
      const writableStream = fs.createWriteStream(`${path.parse(filePath).name.trim()}.csv`)
      stringifier.pipe(writableStream)
    })
  } else {
    console.log(chalk.red(`在 ${filePath} 未找到文件，请检查你输入的文件地址`))
  }
}
