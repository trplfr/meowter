import 'regenerator-runtime/runtime'

import { createStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'

import { rootReducer } from 'modules/reducers'
import { rootSaga } from 'modules/sagas'

export const configureStore = initialState => {
  const sagaMiddleware = createSagaMiddleware()
  const middlewareEnhancer = applyMiddleware(sagaMiddleware)
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(middlewareEnhancer)
  )

  sagaMiddleware.run(rootSaga)

  if (module.hot) {
    module.hot.accept('modules/reducers', () =>
      store.replaceReducer(rootReducer)
    )
  }

  return store
}
