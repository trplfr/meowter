import {
  sample,
  createEvent,
  createStore,
  type Store,
  type EventCallable
} from 'effector'
import { createFactory } from '@withease/factories'

export interface ValidationRule {
  field: string
  check: (value: string) => boolean
  message: () => string
}

interface CreateFormValidationParams {
  clock: EventCallable<void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source: Store<any>
  rules: ValidationRule[]
}

export interface FieldErrors {
  [field: string]: string | null
}

export const createFormValidation = createFactory(
  ({ clock, source, rules }: CreateFormValidationParams) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validated = createEvent<any>()
    const validationFailed = createEvent<FieldErrors>()
    const fieldTouched = createEvent<string>()
    const $errors = createStore<FieldErrors>({})

    const collectErrors = (form: Record<string, string>): FieldErrors => {
      const errors: FieldErrors = {}

      for (const rule of rules) {
        if (errors[rule.field]) continue
        if (!rule.check(form[rule.field])) {
          errors[rule.field] = rule.message()
        }
      }

      return errors
    }

    const hasErrors = (errors: FieldErrors): boolean =>
      Object.values(errors).some(Boolean)

    sample({
      clock,
      source,
      filter: form => !hasErrors(collectErrors(form)),
      target: validated
    })

    sample({
      clock,
      source,
      filter: form => hasErrors(collectErrors(form)),
      fn: form => collectErrors(form),
      target: [validationFailed, $errors]
    })

    // сброс ошибки поля при начале ввода
    sample({
      clock: fieldTouched,
      source: $errors,
      fn: (errors, field) => ({ ...errors, [field]: null }),
      target: $errors
    })

    return { validated, validationFailed, fieldTouched, $errors }
  }
)
