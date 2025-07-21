import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-6 max-w-7xl h-full">
          <div className="h-full min-h-[calc(100vh-8rem)]">
            <Outlet />
          </div>
        </div>
      </main>
      <footer className="py-4 border-t border-border bg-card/50 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <span className="hidden sm:inline">MeetingFlow &copy; {new Date().getFullYear()} - Privacy-First Meeting Productivity Tool</span>
          <span className="sm:hidden">MeetingFlow &copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}