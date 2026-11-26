import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'

const root = new URL('../dist/', import.meta.url)
const manifest = JSON.parse(
  await readFile(new URL('manifest.webmanifest', root), 'utf8'),
)
assert.equal(manifest.start_url, '/app')
assert.equal(manifest.scope, '/')
assert.equal(manifest.display, 'standalone')
for (const size of [192, 512])
  assert.ok(
    manifest.icons.some(
      (icon) => icon.sizes === `${size}x${size}` && icon.purpose === 'any',
    ),
  )
assert.ok(manifest.icons.some((icon) => icon.purpose === 'maskable'))
for (const icon of manifest.icons) {
  const bytes = await readFile(new URL(icon.src.replace(/^\//, ''), root))
  assert.equal(bytes.subarray(1, 4).toString(), 'PNG')
  const [width, height] = icon.sizes.split('x').map(Number)
  assert.equal(bytes.readUInt32BE(16), width)
  assert.equal(bytes.readUInt32BE(20), height)
}
const worker = await readFile(new URL('sw.js', root), 'utf8')
async function files(directory) {
  const entries = await readdir(new URL(directory, root), {
    withFileTypes: true,
  })
  const results = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? files(`${directory}${entry.name}/`)
        : `${directory}${entry.name}`,
    ),
  )
  return results.flat()
}
const assets = (await files('assets/')).filter((path) =>
  /\.(js|css|woff2?|svg|webp|png)$/.test(path),
)
for (const path of [
  'index.html',
  'favicon.svg',
  'apple-touch-icon-180x180.png',
  ...manifest.icons.map((icon) => icon.src.replace(/^\//, '')),
  ...assets,
])
  assert.ok(worker.includes(path), `Missing precache asset: ${path}`)
assert.ok(
  worker.includes('SKIP_WAITING'),
  'Expected explicit update activation',
)
const html = await readFile(new URL('index.html', root), 'utf8')
assert.ok(html.includes('manifest.webmanifest'))
assert.ok(html.includes('apple-touch-icon'))
console.log(
  `Verified PWA manifest, ${manifest.icons.length} icons and ${assets.length} precached assets.`,
)
