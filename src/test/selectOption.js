import { screen } from '@testing-library/react'

export async function selectOption(user, control, label) {
  await user.click(control)
  await user.click(
    await screen.findByRole('option', { name: label, exact: true }),
  )
}
