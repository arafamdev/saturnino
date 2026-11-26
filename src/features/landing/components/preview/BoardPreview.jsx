import { Columns3, Folder, LayoutDashboard } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { boardPreviewColumns } from '../../data/boardPreviewData'

import BoardPreviewColumn from './BoardPreviewColumn'

function BoardPreview() {
  const { t } = useTranslation('landing')

  const totalTasks = boardPreviewColumns.reduce(
    (total, column) => total + column.tasks.length,
    0,
  )

  const completedTasks =
    boardPreviewColumns.find((column) => column.id === 'done')?.tasks.length ??
    0

  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-xl">
      {/* Preview window */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
        </div>

        <span className="mx-auto text-xs text-muted-foreground">
          {t('board.workspacePath')}
        </span>
      </div>

      <div className="flex">
        {/* Illustrative sidebar */}
        <aside className="hidden w-44 shrink-0 space-y-6 border-r bg-sidebar p-4 lg:block">
          <p className="text-lg font-semibold tracking-tight">saturnino.</p>

          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="size-4 shrink-0" aria-hidden="true" />
              {t('board.overview')}
            </div>

            <div className="flex items-center gap-2">
              <Folder className="size-4 shrink-0" aria-hidden="true" />
              {t('board.projects')}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              {t('board.workspace')}
            </p>

            <div className="flex items-center gap-2 rounded-md bg-sidebar-accent p-2 text-sm">
              <span className="size-2 shrink-0 rounded-full bg-primary" />
              {t('board.website')}
            </div>
          </div>
        </aside>

        {/* Board content */}
        <div className="min-w-0 flex-1 space-y-4 p-3 sm:space-y-6 sm:p-6">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {t('board.breadcrumb')}
            </p>

            <h3 className="text-xl font-semibold tracking-tight">
              {t('board.projectName')}
            </h3>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Columns3 className="size-4" aria-hidden="true" />
              {t('board.boardView')}
            </div>
          </div>

          {/* Project progress */}
          <div className="space-y-2">
            <div className="flex justify-between gap-2 text-xs text-muted-foreground">
              <span>{t('board.progress')}</span>

              <span>
                {t('board.completion', {
                  percentage: completionPercentage,
                })}
              </span>
            </div>

            <div
              role="progressbar"
              aria-label={t('board.progress')}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completionPercentage}
              className="h-1.5 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Board columns */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {boardPreviewColumns.map((column) => (
              <BoardPreviewColumn key={column.id} column={column} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BoardPreview
