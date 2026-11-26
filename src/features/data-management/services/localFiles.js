export function downloadTextFile(text, contentType, filename) {
  const url = URL.createObjectURL(new Blob([text], { type: contentType }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  try {
    anchor.click()
  } finally {
    anchor.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}

export function readFileText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('BACKUP_READ_FAILED'))
    reader.onabort = () => reject(new Error('BACKUP_READ_FAILED'))
    reader.readAsText(file, 'UTF-8')
  })
}
