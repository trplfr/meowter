import './logic'

import { createRoot } from 'react-dom/client'

import { App } from './App'

import '@ui/theme/global.scss'

const root = document.getElementById('root')

if (root) {
  createRoot(root).render(<App />)
}
