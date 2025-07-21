import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
      <footer className="py-4 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          MeetingFlow &copy; {new Date().getFullYear()} - Privacy-First Meeting Productivity Tool
        </div>
      </footer>
    </div>
  )
}