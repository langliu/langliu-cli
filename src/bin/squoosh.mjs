import { $, fs } from 'zx'
import { join } from 'path'

export async function squoosh (path) {
  const currentPath = path || process.cwd()
  const dir = fs.readdirSync(currentPath)
  $.verbose = true
  if (process.platform === 'win32') $.shell = 'C:\\Program Files\\PowerShell\\7\\pwsh.exe'
  for (const item of dir) {
    const location = join(currentPath, item)
    const info = fs.statSync(location)
    if (info.isFile()) {
      await $`squoosh-cli --avif '{"cqLevel":33,"cqAlphaLevel":-1,"denoiseLevel":0,"tileColsLog2":0,"tileRowsLog2":0,"speed":6,"subsample":1,"chromaDeltaQ":false,"sharpness":0,"tune":0}' -d squoosh ${item}`
    }
  }
  $.verbose = false
}
