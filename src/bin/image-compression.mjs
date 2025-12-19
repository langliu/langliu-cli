import { join } from 'node:path'
import { $, chalk, fs } from 'zx'

/**
 * 检查 ImageMagick 是否安装
 */
async function checkImageMagick() {
  try {
    await $`magick -version`
    return true
  } catch {
    return false
  }
}

/**
 * 递归压缩指定路径下的图片文件
 * @param {string} path 目标目录路径，如果不传由则默认为当前工作目录
 * @param {boolean} isRecursive 是否为递归调用，默认为 false
 */
export async function imageCompression(path, isRecursive = false) {
  // 确定当前处理的路径，如果路径不存在则回退到当前工作目录
  const currentPath = path ? (fs.existsSync(path) ? path : process.cwd()) : process.cwd()

  // 仅在首次调用（非递归中）时进行环境检查
  if (!isRecursive) {
    // 检查指定的路径是否存在
    if (!fs.existsSync(currentPath)) {
      console.log(chalk.red(`\n错误: 路径不存在 ${currentPath}`))
      return
    }

    // 检查 ImageMagick 是否已安装
    const hasMagick = await checkImageMagick()
    if (!hasMagick) {
      console.log(chalk.red('\n错误: 未检测到 ImageMagick。'))
      console.log(
        chalk.yellow('请先安装 ImageMagick: '),
        chalk.blue('https://imagemagick.org/script/download.php'),
      )
      return
    }
  }

  // 读取目录内容
  const dir = fs.readdirSync(currentPath)

  // Windows 系统下指定使用 PowerShell 7 (如果可用)
  if (process.platform === 'win32') $.shell = 'C:\\Program Files\\PowerShell\\7\\pwsh.exe'

  // 遍历目录下的每一项
  for (const item of dir) {
    const location = join(currentPath, item)
    const info = fs.statSync(location)
    const ext = getExtension(item).toLowerCase()

    // 如果是图片文件（jpg, jpeg, png, webp），则调用 magick 进行压缩
    if (info.isFile() && ['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      console.log(chalk.green(`正在压缩: ${location}`))
      // 使用 magick 进行压缩，设置质量为 75，覆盖原文件
      try {
        await $`magick ${location} -quality 75 ${location}`
      } catch {
        console.log(chalk.red(`压缩失败: ${location}`))
      }
    }
    // 如果是目录，且不是特定的忽略目录，则递归调用
    else if (
      info.isDirectory() &&
      item !== 'squoosh' &&
      item !== 'node_modules' &&
      !item.startsWith('.')
    ) {
      await imageCompression(location, true)
    }
  }
}

/**
 * 获取文件后缀
 * @param {string} filename 文件名称
 * @returns 文件后缀
 */
function getExtension(filename) {
  const ext = (filename || '').split('.')
  return ext.length > 1 ? ext[ext.length - 1] : ''
}
