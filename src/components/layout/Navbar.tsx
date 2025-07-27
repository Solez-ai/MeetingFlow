import { Link, useLocation } from 'react-router-dom'
import { useTheme } from './ThemeProvider'
import { Button } from '../ui/button'
import { VoiceCommandIndicator } from '../voice/VoiceCommandIndicator'
import { KeyboardShortcutsHelp } from '../ui/keyboard-shortcuts-help'
import { 
  MoonIcon, 
  SunIcon, 
  SettingsIcon, 
  HomeIcon, 
  PlusIcon, 
  MenuIcon, 
  FileTextIcon, 
  CheckSquareIcon, 
  MicIcon, 
  DownloadIcon,
  Sparkles
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
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
    if (path === '/') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header 
      className={cn(
        "border-b border-border sticky top-0 z-50 transition-all duration-200",
        scrolled 
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm" 
          : "bg-background"
      )}
      role="banner"
      aria-label="Site header"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className="flex items-center gap-2 group focus-ring rounded-lg p-1" 
              onClick={closeMobileMenu}
              aria-label="MeetingFlow home"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-white font-bold text-sm" aria-hidden="true">MF</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent hidden sm:inline">
                MeetingFlow
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav 
              className="hidden lg:flex items-center gap-1"
              role="navigation"
              aria-label="Main navigation"
              id="navigation"
            >
              <Link to="/">
                <Button 
                  variant={isActive('/') ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="gap-2 font-medium focus-ring"
                  aria-current={isActive('/') ? 'page' : undefined}
                >
                  <HomeIcon className="h-4 w-4" aria-hidden="true" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/meeting/new">
                <Button 
                  variant={isActive('/meeting/new') ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="gap-2 font-medium focus-ring"
                  aria-current={isActive('/meeting/new') ? 'page' : undefined}
                >
                  <PlusIcon className="h-4 w-4" aria-hidden="true" />
                  New Meeting
                </Button>
              </Link>
              <Link to="/agenda">
                <Button 
                  variant={isActive('/agenda') ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="gap-2 font-medium focus-ring"
                  aria-current={isActive('/agenda') ? 'page' : undefined}
                >
                  <FileTextIcon className="h-4 w-4" aria-hidden="true" />
                  Agenda
                </Button>
              </Link>
              <Link to="/tasks">
                <Button 
                  variant={isActive('/tasks') ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="gap-2 font-medium focus-ring"
                  aria-current={isActive('/tasks') ? 'page' : undefined}
                >
                  <CheckSquareIcon className="h-4 w-4" aria-hidden="true" />
                  Tasks
                </Button>
              </Link>
              <Link to="/action-items">
                <Button 
                  variant={isActive('/action-items') ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="gap-2 font-medium focus-ring"
                  aria-current={isActive('/action-items') ? 'page' : undefined}
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Action Items
                </Button>
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Voice Command Indicator */}
            <VoiceCommandIndicator className="hidden sm:flex mr-2" showText />
            
            {/* Quick Actions - Desktop */}
            <div className="hidden md:flex items-center">
              <Link to="/meeting/new?transcribe=true">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2 mr-2 text-sm font-medium border-dashed focus-ring"
                >
                  <MicIcon className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
                  Transcribe
                </Button>
              </Link>
              <Link to="/export">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2 mr-2 text-sm font-medium border-dashed focus-ring"
                  data-export-trigger
                >
                  <DownloadIcon className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
                  Export
                </Button>
              </Link>
            </div>
            
            {/* Keyboard Shortcuts Help */}
            <div className="hidden sm:flex mr-2">
              <KeyboardShortcutsHelp />
            </div>
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
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
                className="rounded-full"
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
              className="lg:hidden rounded-full focus-ring"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div 
            id="mobile-menu"
            className="lg:hidden mt-4 pb-4 border-t border-border pt-4 animate-in slide-in-from-top duration-300 safe-bottom"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <nav className="flex flex-col gap-2 touch-spacing">
              <Link to="/" onClick={closeMobileMenu}>
                <Button 
                  variant={isActive('/') ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="w-full justify-start gap-2 tap-target touch-manipulation focus-ring"
                  aria-current={isActive('/') ? 'page' : undefined}
                >
                  <HomeIcon className="h-4 w-4" aria-hidden="true" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/meeting/new" onClick={closeMobileMenu}>
                <Button 
                  variant={isActive('/meeting/new') ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="w-full justify-start gap-2 tap-target touch-manipulation focus-ring"
                  aria-current={isActive('/meeting/new') ? 'page' : undefined}
                >
                  <PlusIcon className="h-4 w-4" aria-hidden="true" />
                  New Meeting
                </Button>
              </Link>
              <Link to="/agenda" onClick={closeMobileMenu}>
                <Button 
                  variant={isActive('/agenda') ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="w-full justify-start gap-2 tap-target touch-manipulation focus-ring"
                  aria-current={isActive('/agenda') ? 'page' : undefined}
                >
                  <FileTextIcon className="h-4 w-4" aria-hidden="true" />
                  Agenda
                </Button>
              </Link>
              <Link to="/tasks" onClick={closeMobileMenu}>
                <Button 
                  variant={isActive('/tasks') ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="w-full justify-start gap-2 tap-target touch-manipulation focus-ring"
                  aria-current={isActive('/tasks') ? 'page' : undefined}
                >
                  <CheckSquareIcon className="h-4 w-4" aria-hidden="true" />
                  Tasks
                </Button>
              </Link>
              <Link to="/action-items" onClick={closeMobileMenu}>
                <Button 
                  variant={isActive('/action-items') ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="w-full justify-start gap-2 tap-target touch-manipulation focus-ring"
                  aria-current={isActive('/action-items') ? 'page' : undefined}
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Action Items
                </Button>
              </Link>
              <Link to="/meeting/new?transcribe=true" onClick={closeMobileMenu}>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full justify-start gap-2 mt-2 border-dashed tap-target touch-manipulation focus-ring"
                >
                  <MicIcon className="h-4 w-4 text-green-500" aria-hidden="true" />
                  Start Transcription
                </Button>
              </Link>
              <Link to="/export" onClick={closeMobileMenu}>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full justify-start gap-2 border-dashed tap-target touch-manipulation focus-ring"
                  data-export-trigger
                >
                  <DownloadIcon className="h-4 w-4 text-blue-500" aria-hidden="true" />
                  Export Data
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}