import { handleActions } from 'redux-actions'

import { setFooterContent } from 'screens/Layout/store/actions/footer.actions'

const initialState = {
  content: 'Mobile!'
}

export const footerReducer = handleActions(
  {
    [setFooterContent]: (state, { payload: { content } }) => ({
      ...state,
      content
    })
  },
  initialState
)
