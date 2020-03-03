import 'regenerator-runtime/runtime'

import { createStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'

import { rootReducer } from 'store/reducers/root.reducer'
import { rootSaga } from 'store/sagas/root.saga'

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
    module.hot.accept('store/reducers/root.reducer', () =>
      store.replaceReducer(rootReducer)
    )
  }

  return store
}
