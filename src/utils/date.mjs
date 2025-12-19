/**
 * 获取当前日期时间的格式化字符串
 * @returns {string} 格式为 "YYYY年MM月DD日 星期X HH时mm分ss秒" 的字符串
 */
export function getCurrentDate() {
  const date = new Date()
  const fullYear = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  const weekDay = weekDayText(date.getDay())
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  const second = date.getSeconds().toString().padStart(2, '0')

  return `${fullYear}年${month}月${day}日 ${weekDay} ${hour}时${minute}分${second}秒`
}

/**
 * 将星期数字转换为中文文本
 * @param {number} weekDay 星期几的数字（0-6，0代表星期天）
 * @returns {string} 中文星期文本
 */
function weekDayText(weekDay) {
  const num = weekDay % 7
  switch (num) {
    case 0:
      return '星期天'
    case 1:
      return '星期一'
    case 2:
      return '星期二'
    case 3:
      return '星期三'
    case 4:
      return '星期四'
    case 5:
      return '星期五'
    case 6:
      return '星期六'
    default:
      return '未知'
  }
}
