import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Tooltip from '@components/Tooltip'

describe('Tooltip component', () => {
  test('does not show tooltip content by default', () => {
    render(
      <Tooltip content="Hello tooltip">
        <button>Hover me</button>
      </Tooltip>
    )

    expect(screen.queryByText('Hello tooltip')).not.toBeInTheDocument()
  })

  test('shows tooltip on hover', async () => {
    const user = userEvent.setup()

    render(
      <Tooltip content="Hello tooltip">
        <button>Hover me</button>
      </Tooltip>
    )

    await user.hover(screen.getByText('Hover me'))

    expect(screen.getByText('Hello tooltip')).toBeVisible()
  })

  test('hides tooltip when mouse leaves', async () => {
    const user = userEvent.setup()

    render(
      <Tooltip content="Hello tooltip">
        <button>Hover me</button>
      </Tooltip>
    )

    const button = screen.getByText('Hover me')

    await user.hover(button)
    await user.unhover(button)

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).not.toBeVisible()
    })
  })

  test('shows tooltip on keyboard focus', async () => {
    const user = userEvent.setup()

    render(
      <Tooltip content="Hello tooltip">
        <button>Focus me</button>
      </Tooltip>
    )

    await user.tab()

    const tooltip = await screen.findByText('Hello tooltip')
    expect(tooltip).toBeVisible()
  })

  test('hides tooltip when focus leaves', async () => {
    const user = userEvent.setup()

    render(
      <Tooltip content="Hello tooltip">
        <button>Focus me</button>
      </Tooltip>
    )

    await user.tab()
    await user.tab()

    await waitFor(() => {
      expect(screen.queryByText('Hello tooltip')).not.toBeInTheDocument()
    })
  })
})
