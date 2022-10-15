export function getCurrentDate () {
  const date = new Date()
  const fullYear = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = (date.getDate()).toString().padStart(2, '0')

  const weekDay = weekDayText(date.getDay())
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  const second = date.getSeconds().toString().padStart(2, '0')

  return `${fullYear}年${month}月${day}日 ${weekDay} ${hour}时${minute}分${second}秒`
}

/**
 * 星期几中文
 * @param {number} weekDay 星期几
 */
function weekDayText (weekDay) {
  const num = weekDay % 7
  switch (num) {
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
    case 7:
      return '星期天'
    default:
      return '未知'
  }
}
