import { useLayoutEffect, useRef } from 'react'

interface AccessibleDialogOptions {
  canClose?: boolean
  modal?: boolean
}

export function useAccessibleDialog(
  isOpen: boolean,
  onClose: () => void,
  { canClose = true, modal = true }: AccessibleDialogOptions = {}
) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  const canCloseRef = useRef(canClose)
  onCloseRef.current = onClose
  canCloseRef.current = canClose

  useLayoutEffect(() => {
    if (!isOpen || !dialogRef.current) return

    const dialog = dialogRef.current
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const getFocusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => element.getClientRects().length > 0)

    const focusable = getFocusable()
    const initialFocus = focusable.find((element) => element.hasAttribute('data-dialog-autofocus')) ?? focusable[0] ?? dialog
    initialFocus.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && canCloseRef.current) {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (!modal || event.key !== 'Tab') return
      const elements = getFocusable()
      if (elements.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const first = elements[0]
      const last = elements[elements.length - 1]
      const active = document.activeElement
      if (event.shiftKey && (active === first || active === dialog || !dialog.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || active === dialog || !dialog.contains(active))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [isOpen, modal])

  return dialogRef
}
