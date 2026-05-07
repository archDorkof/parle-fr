import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, BookOpen, MessageCircle, Mic, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']
const LENGTHS = ['Short', 'Medium', 'Long']
const TOPICS = [
  'Everyday conversation',
  'Travel & directions',
  'Food & dining',
  'Work & business',
  'Shopping',
  'Health & body',
  'Weather & nature',
  'Culture & entertainment',
]

function OptionPill({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
        selected
          ? 'bg-[#5340c8] text-white shadow-lg shadow-[#5340c8]/30'
          : 'bg-[#0f3460]/60 text-white/60 border border-white/10 hover:border-[#5340c8]/50 hover:text-white'
      }`}
    >
      {label}
    </button>
  )
}

export default function SessionSetup() {
  const navigate = useNavigate()
  const [level, setLevel] = useState('B1')
  const [length, setLength] = useState('Medium')
  const [phrases, setPhrases] = useState(10)
  const [topic, setTopic] = useState('Everyday conversation')

  const handleStart = () => {
    navigate('/speaking', { state: { level, length, phrases, topic } })
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">parle</span>
          <span className="text-2xl font-bold text-[#5340c8]">.fr</span>
        </div>
        <nav className="flex items-center gap-1">
          <button className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all">
            <BookOpen size={18} />
          </button>
          <button className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all">
            <MessageCircle size={18} />
          </button>
          <button className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all">
            <Trophy size={18} />
          </button>
        </nav>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-5">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">New session</h1>
            <p className="text-white/50 text-sm">Configure your French practice session</p>
          </div>

          {/* Level */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Proficiency level</CardTitle>
              <CardDescription>CEFR framework</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {LEVELS.map((l) => (
                  <OptionPill key={l} label={l} selected={level === l} onClick={() => setLevel(l)} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Phrase length */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Phrase length</CardTitle>
              <CardDescription>How complex each phrase will be</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {LENGTHS.map((l) => (
                  <OptionPill key={l} label={l} selected={length === l} onClick={() => setLength(l)} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Number of phrases */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Number of phrases</CardTitle>
              <CardDescription>{phrases} phrases per session</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="range"
                min={5}
                max={30}
                step={5}
                value={phrases}
                onChange={(e) => setPhrases(Number(e.target.value))}
                className="w-full accent-[#5340c8] cursor-pointer"
              />
              <div className="flex justify-between text-xs text-white/30 mt-2">
                {[5, 10, 15, 20, 25, 30].map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Topic */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Topic</CardTitle>
              <CardDescription>Focus area for phrases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {TOPICS.map((t) => (
                  <OptionPill key={t} label={t} selected={topic === t} onClick={() => setTopic(t)} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Button size="lg" className="w-full mt-2" onClick={handleStart}>
            <Mic size={18} />
            Start session
          </Button>
        </div>
      </main>
    </div>
  )
}
