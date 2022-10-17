import { $, cd, fs } from 'zx'
import { join } from 'path'

export async function squoosh (path) {
  const currentPath = path || process.cwd()
  $.verbose = true
  cd(currentPath)
  const dir = fs.readdirSync(currentPath)
  if (process.platform === 'win32') $.shell = 'C:\\Program Files\\PowerShell\\7\\pwsh.exe'
  for (const item of dir) {
    const location = join(currentPath, item)
    const info = fs.statSync(location)
    if (info.isFile() && ['jpg', 'jpeg', 'png', 'webp'].includes(getExtension(item))) {
      await $`squoosh-cli --avif '{"cqLevel":33,"cqAlphaLevel":-1,"denoiseLevel":0,"tileColsLog2":0,"tileRowsLog2":0,"speed":6,"subsample":1,"chromaDeltaQ":false,"sharpness":0,"tune":0}' -d squoosh ${item}`
    } else if (info.isDirectory() && item !== 'squoosh') {
      await squoosh(join(currentPath, item))
    }
  }
  $.verbose = false
}

/**
 * 获取文件后缀
 * @param {string} filename 文件名称
 * @returns 文件后缀
 */
function getExtension (filename) {
  const ext = (filename || '').split('.')
  return ext.length > 1 ? ext[ext.length - 1] : ''
}
