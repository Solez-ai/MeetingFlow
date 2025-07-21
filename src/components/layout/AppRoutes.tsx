import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { Dashboard } from '../Dashboard'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="meeting/:id" element={<div>Meeting Page (Coming Soon)</div>} />
        <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}