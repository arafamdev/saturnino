import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { registerSW } from 'virtual:pwa-register'
import { PwaContext } from './PwaContext'
import PwaUpdateBanner from '../components/PwaUpdateBanner'
import { BEFORE_PWA_UPDATE } from '../events/updateGuard'

function subscribeNetwork(listener) {
  window.addEventListener('online', listener)
  window.addEventListener('offline', listener)
  return () => {
    window.removeEventListener('online', listener)
    window.removeEventListener('offline', listener)
  }
}
function networkSnapshot() {
  return navigator.onLine
}

function reloadDocument() {
  window.location.reload()
}

function PwaProvider({
  children,
  enabled = import.meta.env.PROD,
  reloadPage = reloadDocument,
}) {
  const supported =
    enabled && window.isSecureContext && 'serviceWorker' in navigator
  const isOnline = useSyncExternalStore(
    subscribeNetwork,
    networkSnapshot,
    () => true,
  )
  const registrationRef = useRef(null)
  const updateRef = useRef(null)
  const reloadRequested = useRef(false)
  const reloadIssued = useRef(false)
  const operations = useRef({ checking: false, updating: false })
  const [offlineReady, setOfflineReady] = useState(false)
  const [needRefresh, setNeedRefresh] = useState(false)
  const [hasRegistration, setHasRegistration] = useState(false)
  const [error, setError] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const commitReload = useCallback(() => {
    if (reloadIssued.current) return
    reloadIssued.current = true
    reloadPage()
  }, [reloadPage])

  useEffect(() => {
    if (!supported) return
    let active = true
    const worker = navigator.serviceWorker
    let previousController = worker.controller
    function controlled() {
      const controller = worker.controller
      if (!active || !controller) return
      setOfflineReady(true)
      if (controller !== previousController) {
        // Workbox may classify rapid or cross-tab updates as external.
        if (reloadRequested.current) commitReload()
        else if (previousController) setNeedRefresh(true)
        previousController = controller
      }
    }
    worker.addEventListener('controllerchange', controlled)
    updateRef.current = registerSW({
      immediate: true,
      onNeedReload() {
        if (!active) return
        if (reloadRequested.current) commitReload()
        else setNeedRefresh(true)
      },
      onOfflineReady() {
        if (active) setOfflineReady(true)
      },
      onNeedRefresh() {
        if (active) setNeedRefresh(true)
      },
      onRegisteredSW(_url, registration) {
        if (!active) return
        registrationRef.current = registration ?? null
        setHasRegistration(Boolean(registration))
        if (registration?.active) setOfflineReady(true)
        if (registration?.waiting) setNeedRefresh(true)
      },
      onRegisterError() {
        if (active) setError('registrationFailed')
      },
    })
    return () => {
      active = false
      worker.removeEventListener('controllerchange', controlled)
      registrationRef.current = null
      updateRef.current = null
    }
  }, [supported, commitReload])

  async function checkForUpdates() {
    const registration = registrationRef.current
    if (
      !registration ||
      operations.current.checking ||
      operations.current.updating
    )
      return
    operations.current.checking = true
    setIsChecking(true)
    setError('')
    try {
      await registration.update()
      if (registration.waiting) setNeedRefresh(true)
    } catch {
      setError('checkFailed')
    } finally {
      operations.current.checking = false
      setIsChecking(false)
    }
  }

  async function applyUpdate({ skipDraftGuard = false } = {}) {
    if (
      !updateRef.current ||
      operations.current.updating ||
      operations.current.checking
    )
      return
    if (!skipDraftGuard) {
      const event = new CustomEvent(BEFORE_PWA_UPDATE, {
        cancelable: true,
        detail: { proceed: () => applyUpdate({ skipDraftGuard: true }) },
      })
      if (!window.dispatchEvent(event)) return
    }
    operations.current.updating = true
    setIsUpdating(true)
    setError('')
    reloadRequested.current = true
    reloadIssued.current = false
    try {
      if (registrationRef.current && !registrationRef.current.waiting)
        commitReload()
      else await updateRef.current(true)
    } catch {
      reloadRequested.current = false
      setError('updateFailed')
    } finally {
      operations.current.updating = false
      setIsUpdating(false)
    }
  }

  const value = {
    supported: Boolean(supported),
    isOnline,
    offlineReady: Boolean(supported && offlineReady),
    needRefresh: Boolean(supported && needRefresh),
    hasRegistration: Boolean(supported && hasRegistration),
    error: supported ? error : '',
    isChecking,
    isUpdating,
    checkForUpdates,
    applyUpdate,
    dismissUpdate: () => setNeedRefresh(false),
  }
  return (
    <PwaContext value={value}>
      {children}
      <PwaUpdateBanner />
    </PwaContext>
  )
}
export default PwaProvider
