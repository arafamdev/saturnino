import { useCallback, useEffect, useRef, useState } from 'react'

import { useBeforeUnload, useBlocker } from 'react-router'

import { BEFORE_PWA_UPDATE } from '@/features/pwa/events/updateGuard'

export function useTaskDraftGuard({ dirty, saving, onClose }) {
  const [pendingAction, setPendingAction] = useState(null)
  const allowExit = useRef(false)
  const blocker = useBlocker(dirty || saving)

  useBeforeUnload(
    useCallback(
      (event) => {
        if ((dirty || saving) && !allowExit.current) {
          event.preventDefault()
          event.returnValue = ''
        }
      },
      [dirty, saving],
    ),
  )

  useEffect(() => {
    function beforeUpdate(event) {
      if (!dirty && !saving) return
      event.preventDefault()
      if (!saving) setPendingAction({ proceed: event.detail.proceed })
    }
    window.addEventListener(BEFORE_PWA_UPDATE, beforeUpdate)
    return () => window.removeEventListener(BEFORE_PWA_UPDATE, beforeUpdate)
  }, [dirty, saving])

  function requestClose() {
    if (saving) return
    if (dirty) setPendingAction({})
    else onClose()
  }

  function keepEditing() {
    setPendingAction(null)
    if (blocker.state === 'blocked') blocker.reset()
  }

  function discard() {
    if (saving) return
    allowExit.current = true
    if (blocker.state === 'blocked') blocker.proceed()
    else {
      const proceed = pendingAction?.proceed
      setPendingAction(null)
      onClose()
      proceed?.()
    }
  }

  return {
    requestClose,
    keepEditing,
    discard,
    confirmExit: Boolean(pendingAction) || blocker.state === 'blocked',
  }
}
