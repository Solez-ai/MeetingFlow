import { Link, useLocation } from 'react-router-dom'
import { useTheme } from './ThemeProvider'
import { Button } from '../ui/button'
import { MoonIcon, SunIcon, SettingsIcon, HomeIcon, PlusIcon, MenuIcon } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">MF</span>
              </div>
              <span className="font-bold text-xl text-foreground hidden sm:inline">MeetingFlow</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link to="/">
                <Button 
                  variant={isActive('/') ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="gap-2"
                >
                  <HomeIcon className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/meeting/new">
                <Button 
                  variant={isActive('/meeting/new') ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  New Meeting
                </Button>
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={
                theme === 'dark' 
                  ? 'Switch to system mode' 
                  : theme === 'light' 
                  ? 'Switch to dark mode' 
                  : 'Switch to light mode'
              }
            >
              {theme === 'dark' ? (
                <div className="h-5 w-5 rounded-full bg-gradient-to-r from-yellow-400 to-blue-600" />
              ) : theme === 'light' ? (
                <MoonIcon className="h-5 w-5" />
              ) : (
                <SunIcon className="h-5 w-5" />
              )}
            </Button>
            
            {/* Settings - Always visible */}
            <Link to="/settings">
              <Button 
                variant={isActive('/settings') ? 'secondary' : 'ghost'} 
                size="icon" 
                aria-label="Settings"
                onClick={closeMobileMenu}
              >
                <SettingsIcon className="h-5 w-5" />
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4">
            <nav className="flex flex-col gap-2">
              <Link to="/" onClick={closeMobileMenu}>
                <Button 
                  variant={isActive('/') ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="w-full justify-start gap-2"
                >
                  <HomeIcon className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/meeting/new" onClick={closeMobileMenu}>
                <Button 
                  variant={isActive('/meeting/new') ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="w-full justify-start gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  New Meeting
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}