import { useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, FileSpreadsheet, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkspaceSnapshot } from '@/lib/db/useWorkspaceSnapshot'
import { workspaceRepository } from '@/lib/db/workspaceRepository'
import {
  MAX_BACKUP_BYTES,
  getWorkspaceRevision,
  parseBackup,
  serializeBackup,
} from '../services/backupFormat'
import { dataManagementRepository } from '../services/dataManagementRepository'
import { downloadTextFile, readFileText } from '../services/localFiles'
import { serializeTaskCsv } from '../services/taskCsv'
import RestoreBackupDialog from './RestoreBackupDialog'

const errorCodes = new Set([
  'BACKUP_INVALID',
  'BACKUP_VERSION_UNSUPPORTED',
  'BACKUP_TOO_LARGE',
  'WORKSPACE_CHANGED',
  'BACKUP_READ_FAILED',
])
function errorCode(cause) {
  return errorCodes.has(cause?.message) ? cause.message : 'ACTION_FAILED'
}

function DataManagementPanel() {
  const { t } = useTranslation('app')
  const id = useId()
  const query = useWorkspaceSnapshot()
  const inputRef = useRef(null)
  const importButtonRef = useRef(null)
  const pending = useRef(false)
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState(null)
  const unavailable = query.isLoading || query.isError || busy

  function begin() {
    if (pending.current) return false
    pending.current = true
    setBusy(true)
    setError('')
    setFeedback(null)
    return true
  }
  function finish() {
    pending.current = false
    setBusy(false)
  }

  async function exportFile(format) {
    if (!begin()) return
    try {
      const snapshot = await workspaceRepository.getSnapshot()
      const date = new Date().toISOString().slice(0, 10)
      if (format === 'json')
        downloadTextFile(
          serializeBackup(snapshot),
          'application/json;charset=utf-8',
          `saturnino-backup-${date}.json`,
        )
      else
        downloadTextFile(
          serializeTaskCsv(snapshot),
          'text/csv;charset=utf-8',
          `saturnino-tasks-${date}.csv`,
        )
      setFeedback(format === 'json' ? 'exportedJson' : 'exportedCsv')
    } catch (cause) {
      setError(errorCode(cause))
    } finally {
      finish()
    }
  }

  async function handleFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !begin()) return
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error('BACKUP_TOO_LARGE')
      const backup = parseBackup(await readFileText(file))
      const current = await workspaceRepository.getSnapshot()
      setPreview({
        backup,
        filename: file.name,
        revision: getWorkspaceRevision(current),
        currentProjectCount: current.projects.length,
        currentTaskCount: current.tasks.length,
      })
    } catch (cause) {
      setError(errorCode(cause))
    } finally {
      finish()
    }
  }

  async function restore() {
    if (!preview || !begin()) return
    try {
      await dataManagementRepository.restoreBackup(
        preview.backup,
        preview.revision,
      )
      setPreview(null)
      setFeedback('restored')
    } catch (cause) {
      setError(errorCode(cause))
    } finally {
      finish()
    }
  }

  function cancel() {
    if (!pending.current) {
      setPreview(null)
      setError('')
    }
  }
  function restoreFocus(event) {
    if (importButtonRef.current && !importButtonRef.current.disabled) {
      event.preventDefault()
      importButtonRef.current.focus()
    }
  }

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="space-y-4 rounded-xl border bg-card p-4"
    >
      <h2 id={`${id}-heading`} className="text-base font-semibold">
        {t('dataManagement.title')}
      </h2>
      <p className="text-sm text-muted-foreground">
        {t('dataManagement.description')}
      </p>
      {query.isError ? (
        <div role="alert" className="space-y-3">
          <p className="text-sm text-destructive">
            {t('dataManagement.loadFailed')}
          </p>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={query.retry}
          >
            {t('tasks.actions.retry')}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {query.isLoading
            ? t('dataManagement.loading')
            : t('dataManagement.counts', {
                projects: query.snapshot.projects.length,
                tasks: query.snapshot.tasks.length,
              })}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          className="min-h-11 gap-2"
          disabled={unavailable}
          onClick={() => exportFile('json')}
        >
          <Download aria-hidden="true" />
          {t('dataManagement.exportJson')}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 gap-2"
          disabled={unavailable}
          onClick={() => exportFile('csv')}
        >
          <FileSpreadsheet aria-hidden="true" />
          {t('dataManagement.exportCsv')}
        </Button>
        <Button
          ref={importButtonRef}
          type="button"
          variant="outline"
          className="min-h-11 gap-2"
          disabled={unavailable}
          onClick={() => inputRef.current?.click()}
        >
          <Upload aria-hidden="true" />
          {t('dataManagement.import')}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          hidden
          aria-label={t('dataManagement.file')}
          onChange={handleFile}
        />
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {t('dataManagement.notes')}
      </p>
      {!preview && error && (
        <p role="alert" className="text-sm text-destructive">
          {t(`dataManagement.errors.${error}`)}
        </p>
      )}
      <p
        role="status"
        aria-label={t('dataManagement.feedback')}
        className="text-sm text-muted-foreground"
      >
        {busy
          ? t('dataManagement.working')
          : feedback
            ? t(`dataManagement.${feedback}`)
            : ''}
      </p>
      <RestoreBackupDialog
        preview={preview}
        busy={busy}
        error={error}
        onCancel={cancel}
        onRestore={restore}
        onCloseAutoFocus={restoreFocus}
      />
    </section>
  )
}
export default DataManagementPanel
