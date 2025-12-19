import { join, parse, relative } from 'node:path'
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
 * @param {string} rootPath 根目录路径，用于保持目录结构，默认为 null
 * @param {number} quality 压缩质量 (1-100)，默认为 75
 * @param {{success: number, fail: number, totalOriginalSize: number, totalCompressedSize: number}} stats 统计信息
 */
export async function imageCompression(
  path,
  isRecursive = false,
  rootPath = null,
  quality = 75,
  stats = { fail: 0, success: 0, totalCompressedSize: 0, totalOriginalSize: 0 },
) {
  // 确定当前处理的路径，如果路径不存在则回退到当前工作目录
  const currentPath = path ? (fs.existsSync(path) ? path : process.cwd()) : process.cwd()
  let actualRoot = rootPath

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

    // 初始化根路径
    actualRoot = currentPath
    console.log(chalk.cyan(`\n🚀 开始转换图片至 WebP (质量: ${quality})...`))
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

    // 如果是图片文件（jpg, jpeg, png），则调用 magick 进行压缩并转换为 webp
    if (info.isFile() && ['jpg', 'jpeg', 'png'].includes(ext)) {
      const webpRoot = join(actualRoot, 'webp')
      const relPath = relative(actualRoot, currentPath)
      const targetWebpDir = join(webpRoot, relPath)

      // 如果不存在对应的 webp 文件夹，则创建一个
      if (!fs.existsSync(targetWebpDir)) {
        fs.mkdirSync(targetWebpDir, { recursive: true })
      }

      const fileName = parse(item).name
      const outputLocation = join(targetWebpDir, `${fileName}.webp`)
      const displayPath = relative(actualRoot, location)
      const originalSize = info.size

      try {
        // 使用 magick 将图片转换为 webp，设置质量
        await $`magick ${location} -quality ${quality} ${outputLocation}`

        const compressedSize = fs.statSync(outputLocation).size
        const savings = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1)

        stats.success++
        stats.totalOriginalSize += originalSize
        stats.totalCompressedSize += compressedSize

        console.log(
          chalk.green(
            `  ✔ ${displayPath} (${formatBytes(originalSize)} -> ${formatBytes(
              compressedSize,
            )}, -${savings}%)`,
          ),
        )
      } catch {
        stats.fail++
        console.log(chalk.red(`  ✖ ${displayPath}`))
      }
    }
    // 如果是目录，且不是特定的忽略目录，则递归调用
    else if (
      info.isDirectory() &&
      item !== 'webp' &&
      item !== 'node_modules' &&
      !item.startsWith('.')
    ) {
      await imageCompression(location, true, actualRoot, quality, stats)
    }
  }

  // 首次调用结束时显示统计信息
  if (!isRecursive) {
    console.log(chalk.bold.cyan(`\n✨ 完成！`))
    console.log(chalk.green(`  ✔ 成功: ${stats.success}`))
    if (stats.fail > 0) {
      console.log(chalk.red(`  ✖ 失败: ${stats.fail}`))
    }

    if (stats.success > 0) {
      const totalSavings = stats.totalOriginalSize - stats.totalCompressedSize
      const totalSavingsPercent = ((totalSavings / (stats.totalOriginalSize || 1)) * 100).toFixed(1)
      console.log(
        chalk.cyan(`  📦 总计节省空间: ${formatBytes(totalSavings)} (-${totalSavingsPercent}%)`),
      )
    }
    console.log('')
  }
}

/**
 * 格式化字节大小
 * @param {number} bytes 字节数
 * @returns {string} 格式化后的字符串
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
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
