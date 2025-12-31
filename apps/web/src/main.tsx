import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryProvider } from './providers/QueryProvider.tsx'
import { AuthProvider } from './providers/AuthProvider.tsx'
import { ThemeProvider } from './providers/ThemeProvider.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <QueryProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryProvider>
  </ThemeProvider>,
)
