import React from 'react'
import MainRouterContainer from './MainRouterContainer'
import {BrowserRouter} from 'react-router-dom'
import { ThemeProvider } from '@material-ui/styles'
import theme from './theme'
import { hot } from 'react-hot-loader'
//redux dependencies
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import {  user, asyncProcesses, dialogs, system } from './Reducers'
import { InitialState } from './InitialState'
const middleware = applyMiddleware(thunk, createLogger())

const store = createStore(combineReducers(
    { user, asyncProcesses, dialogs, system }), InitialState, middleware)



const App = () => {
  
  return (
  <BrowserRouter>
      <ThemeProvider theme={theme}>
          <Provider store={store}>
            <MainRouterContainer/>
          </Provider>
      </ThemeProvider>
  </BrowserRouter>
)}

export default hot(module)(App)