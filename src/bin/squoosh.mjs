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

export async function squoosh(path, isRecursive = false) {
	const currentPath = path
		? fs.existsSync(path)
			? path
			: process.cwd()
		: process.cwd()

	// 仅在首次调用时检查 ImageMagick
	if (!isRecursive) {
		if (!fs.existsSync(currentPath)) {
			console.log(chalk.red(`\n错误: 路径不存在 ${currentPath}`))
			return
		}

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

	const dir = fs.readdirSync(currentPath)
	if (process.platform === 'win32')
		$.shell = 'C:\\Program Files\\PowerShell\\7\\pwsh.exe'

	for (const item of dir) {
		const location = join(currentPath, item)
		const info = fs.statSync(location)
		const ext = getExtension(item).toLowerCase()

		if (info.isFile() && ['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
			console.log(chalk.green(`正在压缩: ${location}`))
			// 使用 magick 进行压缩，设置质量为 75
			try {
				await $`magick ${location} -quality 75 ${location}`
			} catch {
				console.log(chalk.red(`压缩失败: ${location}`))
			}
		} else if (
			info.isDirectory() &&
			item !== 'squoosh' &&
			item !== 'node_modules' &&
			!item.startsWith('.')
		) {
			await squoosh(location, true)
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
