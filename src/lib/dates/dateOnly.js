// A due date is a calendar day, not a UTC instant.
export function isValidDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }
  if (Number(value.slice(0, 4)) === 0) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  )
}

export function getTodayDateOnly(now = new Date()) {
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
}

export function formatDateOnly(value, locale) {
  if (!isValidDateOnly(value)) return ''
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
    new Date(`${value}T12:00:00`),
  )
}
