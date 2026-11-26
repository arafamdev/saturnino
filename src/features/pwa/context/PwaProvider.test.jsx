import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { registerSW } from 'virtual:pwa-register'
import PwaProvider from './PwaProvider'
import PwaSettingsPanel from '../components/PwaSettingsPanel'

vi.mock('virtual:pwa-register', () => ({ registerSW: vi.fn() }))
let options, registration, worker, update, reload, online, previousWorker
beforeEach(() => {
  previousWorker = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker')
  worker = new EventTarget()
  worker.controller = null
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: worker,
  })
  vi.stubGlobal('isSecureContext', true)
  online = true
  vi.spyOn(navigator, 'onLine', 'get').mockImplementation(() => online)
  registration = {
    active: null,
    waiting: null,
    update: vi.fn().mockResolvedValue(undefined),
  }
  update = vi.fn().mockResolvedValue(undefined)
  reload = vi.fn()
  registerSW.mockReset().mockImplementation((value) => {
    options = value
    return update
  })
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  if (previousWorker)
    Object.defineProperty(navigator, 'serviceWorker', previousWorker)
  else delete navigator.serviceWorker
})
function setup(enabled = true) {
  return render(
    <PwaProvider enabled={enabled} reloadPage={reload}>
      <PwaSettingsPanel />
    </PwaProvider>,
  )
}
function registered({ active = null, waiting = null } = {}) {
  registration.active = active
  registration.waiting = waiting
  act(() => options.onRegisteredSW('/sw.js', registration))
}

it('does not register in disabled development/test sessions', () => {
  setup(false)
  expect(registerSW).not.toHaveBeenCalled()
  expect(
    screen.getByRole('status', { name: 'Offline cache status' }),
  ).toHaveTextContent('unavailable')
  expect(
    screen.getByRole('button', { name: 'Check for updates' }),
  ).toBeDisabled()
})
it('does not register in an insecure context', () => {
  vi.stubGlobal('isSecureContext', false)
  setup()
  expect(registerSW).not.toHaveBeenCalled()
  expect(
    screen.getByRole('status', { name: 'Offline cache status' }),
  ).toHaveTextContent('unavailable')
})
it('reports preparation then cache readiness without activating an update', () => {
  setup()
  expect(registerSW).toHaveBeenCalledOnce()
  expect(
    screen.getByRole('status', { name: 'Offline cache status' }),
  ).toHaveTextContent('Preparing')
  registered()
  act(() => options.onOfflineReady())
  expect(
    screen.getByRole('status', { name: 'Offline cache status' }),
  ).toHaveTextContent('Ready for offline use.')
  expect(update).not.toHaveBeenCalled()
  expect(reload).not.toHaveBeenCalled()
})
it('recognizes an already-active registration after a later visit', () => {
  setup()
  registered({ active: {} })
  expect(
    screen.getByRole('status', { name: 'Offline cache status' }),
  ).toHaveTextContent('Ready for offline use.')
})
it('waits for explicit update choice and supports postponement', async () => {
  const user = userEvent.setup()
  setup()
  registered({ active: {}, waiting: {} })
  expect(
    await screen.findByRole('complementary', { name: 'An update is ready' }),
  ).toBeInTheDocument()
  expect(update).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Later' }))
  expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
  act(() => options.onNeedRefresh())
  await user.click(screen.getByRole('button', { name: 'Reload to update' }))
  expect(update).toHaveBeenCalledOnce()
  act(() => options.onNeedReload())
  expect(reload).toHaveBeenCalledOnce()
})
it('does not automatically reload when another tab activates a worker', async () => {
  const user = userEvent.setup()
  setup()
  registered({ active: {} })
  act(() => options.onNeedReload())
  expect(reload).not.toHaveBeenCalled()
  expect(
    screen.getByRole('complementary', { name: 'An update is ready' }),
  ).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Reload to update' }))
  expect(reload).toHaveBeenCalledOnce()
  expect(update).not.toHaveBeenCalled()
})
it('checks for updates and reopens a previously postponed waiting update', async () => {
  const user = userEvent.setup()
  setup()
  registered({ active: {}, waiting: {} })
  await user.click(screen.getByRole('button', { name: 'Later' }))
  await user.click(screen.getByRole('button', { name: 'Check for updates' }))
  expect(registration.update).toHaveBeenCalledOnce()
  expect(
    screen.getByRole('complementary', { name: 'An update is ready' }),
  ).toBeInTheDocument()
})
it('reports registration failure without claiming offline readiness', () => {
  setup()
  act(() => options.onRegisterError(new Error('PRIVATE_DETAIL')))
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Could not enable offline use',
  )
  expect(screen.queryByText('PRIVATE_DETAIL')).not.toBeInTheDocument()
  expect(
    screen.getByRole('status', { name: 'Offline cache status' }),
  ).not.toHaveTextContent('Ready for offline use.')
})
it('keeps cached readiness on an update-check failure and allows retry', async () => {
  const user = userEvent.setup()
  setup()
  registered({ active: {} })
  registration.update.mockRejectedValueOnce(new Error('NETWORK_FAILED'))
  await user.click(screen.getByRole('button', { name: 'Check for updates' }))
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Could not check for updates',
  )
  expect(
    screen.getByRole('status', { name: 'Offline cache status' }),
  ).toHaveTextContent('Ready for offline use.')
  await user.click(screen.getByRole('button', { name: 'Check for updates' }))
  expect(registration.update).toHaveBeenCalledTimes(2)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
it('reports update failure once and retries without a premature reload', async () => {
  const user = userEvent.setup()
  setup()
  registered({ active: {}, waiting: {} })
  update.mockRejectedValueOnce(new Error('UPDATE_FAILED'))
  await user.click(screen.getByRole('button', { name: 'Reload to update' }))
  expect(screen.getAllByRole('alert')).toHaveLength(1)
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Could not apply the update',
  )
  act(() => options.onNeedReload())
  expect(reload).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Reload to update' }))
  act(() => options.onNeedReload())
  expect(update).toHaveBeenCalledTimes(2)
  expect(reload).toHaveBeenCalledOnce()
})
it('reflects browser network events while retaining offline cache readiness', () => {
  setup()
  registered({ active: {} })
  online = false
  fireEvent(window, new Event('offline'))
  expect(screen.getByText('Offline', { exact: true })).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Check for updates' }),
  ).toBeDisabled()
  expect(
    screen.getByRole('status', { name: 'Offline cache status' }),
  ).toHaveTextContent('Ready for offline use.')
  online = true
  fireEvent(window, new Event('online'))
  expect(
    screen.getByRole('button', { name: 'Check for updates' }),
  ).toBeEnabled()
})
it('removes worker listeners and ignores registration callbacks after unmount', () => {
  const remove = vi.spyOn(worker, 'removeEventListener')
  const view = setup()
  const callbacks = options
  view.unmount()
  act(() => {
    callbacks.onRegisteredSW('/sw.js', registration)
    callbacks.onNeedRefresh()
    callbacks.onNeedReload()
  })
  expect(remove).toHaveBeenCalledWith('controllerchange', expect.any(Function))
  expect(reload).not.toHaveBeenCalled()
})
it('prevents overlapping update activation while the operation is pending', async () => {
  const user = userEvent.setup()
  setup()
  registered({ active: {}, waiting: {} })
  let release
  const gate = new Promise((resolve) => {
    release = resolve
  })
  update.mockReturnValueOnce(gate)
  await user.click(screen.getByRole('button', { name: 'Reload to update' }))
  expect(screen.getByRole('button', { name: 'Updating…' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Later' })).toBeDisabled()
  expect(update).toHaveBeenCalledOnce()
  await act(async () => {
    release()
    await gate
  })
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Reload to update' }),
    ).toBeEnabled(),
  )
})
it('updates cache readiness when a worker gains control', () => {
  setup()
  worker.controller = {}
  fireEvent(worker, new Event('controllerchange'))
  expect(
    screen.getByRole('status', { name: 'Offline cache status' }),
  ).toHaveTextContent('Ready for offline use.')
})

it('waits for a dirty-draft guard before activating an explicit update', async () => {
  const user = userEvent.setup()
  let resume
  const guard = (event) => {
    event.preventDefault()
    resume = event.detail.proceed
  }
  window.addEventListener('saturnino:before-pwa-update', guard)
  try {
    setup()
    registered({ active: {}, waiting: {} })
    await user.click(screen.getByRole('button', { name: 'Reload to update' }))
    expect(update).not.toHaveBeenCalled()
    expect(reload).not.toHaveBeenCalled()
    expect(resume).toBeTypeOf('function')
    await act(async () => {
      await resume()
    })
    expect(update).toHaveBeenCalledOnce()
    act(() => options.onNeedReload())
    expect(reload).toHaveBeenCalledOnce()
  } finally {
    window.removeEventListener('saturnino:before-pwa-update', guard)
  }
})
