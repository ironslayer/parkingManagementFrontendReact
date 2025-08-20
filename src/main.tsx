import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PermissionProvider } from './contexts/PermissionsContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PermissionProvider>
      <App />
    </PermissionProvider>
  </StrictMode>,
)
