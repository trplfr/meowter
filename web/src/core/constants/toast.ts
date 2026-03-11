import { type ToasterProps } from 'sonner'

export const toastOptions: ToasterProps = {
  position: 'top-center',
  toastOptions: {
    style: {
      fontFamily: 'var(--font-family)',
      fontSize: '14px',
      borderRadius: '18px'
    },
    classNames: {
      error: 'toast-error',
      success: 'toast-success'
    }
  }
}
