import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SessionSetup from '@/screens/SessionSetup'
import Speaking from '@/screens/Speaking'
import Conversation from '@/screens/Conversation'
import SessionComplete from '@/screens/SessionComplete'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SessionSetup />} />
        <Route path="/speaking" element={<Speaking />} />
        <Route path="/conversation" element={<Conversation />} />
        <Route path="/complete" element={<SessionComplete />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
