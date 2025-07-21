import { Link } from 'react-router-dom'
import { useTheme } from './ThemeProvider'
import { Button } from '../ui/button'
import { MoonIcon, SunIcon, SettingsIcon } from 'lucide-react'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-bold text-xl text-primary">MeetingFlow</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </Button>
          
          <Link to="/settings">
            <Button variant="ghost" size="icon" aria-label="Settings">
              <SettingsIcon className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}