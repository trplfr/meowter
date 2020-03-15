import { createActions } from 'redux-actions'

export const { setFooterContent } = createActions({
  SET_FOOTER_CONTENT: content => ({ content })
})
