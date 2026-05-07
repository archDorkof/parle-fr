import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mic, MicOff, ChevronRight, Volume2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const SAMPLE_PHRASES = [
  { fr: 'Bonjour, comment allez-vous ?', en: 'Hello, how are you?' },
  { fr: "Je voudrais un café, s'il vous plaît.", en: 'I would like a coffee, please.' },
  { fr: 'Où se trouve la gare la plus proche ?', en: 'Where is the nearest train station?' },
  { fr: "Est-ce que vous parlez anglais ?", en: 'Do you speak English?' },
  { fr: "L'addition, s'il vous plaît.", en: 'The bill, please.' },
]

const SAMPLE_FEEDBACK = [
  { word: 'Bonjour,', score: 95 },
  { word: 'comment', score: 88 },
  { word: 'allez-vous', score: 72 },
  { word: '?', score: null },
]

function WordChip({ word, score }) {
  if (score === null) return <span className="text-white/50">{word}</span>
  const color =
    score >= 85 ? 'text-green-400' : score >= 65 ? 'text-yellow-400' : 'text-red-400'
  return (
    <span className={`font-semibold ${color}`} title={`${score}%`}>
      {word}
    </span>
  )
}

function ScoreRing({ score }) {
  const radius = 36
  const circ = 2 * Math.PI * radius
  const dash = (score / 100) * circ
  const color = score >= 85 ? '#22c55e' : score >= 65 ? '#eab308' : '#ef4444'
  return (
    <svg width="90" height="90" className="rotate-[-90deg]">
      <circle cx="45" cy="45" r={radius} fill="none" stroke="#ffffff15" strokeWidth="6" />
      <circle
        cx="45"
        cy="45"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text
        x="45"
        y="45"
        textAnchor="middle"
        dominantBaseline="central"
        className="rotate-90"
        style={{ transform: 'rotate(90deg)', transformOrigin: '45px 45px' }}
        fill="white"
        fontSize="16"
        fontWeight="bold"
      >
        {score}%
      </text>
    </svg>
  )
}

export default function Speaking() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const config = state || { level: 'B1', phrases: 5, topic: 'Everyday conversation' }

  const [phraseIdx, setPhraseIdx] = useState(0)
  const [recording, setRecording] = useState(false)
  const [result, setResult] = useState(null)
  const [scores, setScores] = useState([])

  const phrase = SAMPLE_PHRASES[phraseIdx % SAMPLE_PHRASES.length]
  const total = config.phrases || 5

  const handleMic = () => {
    if (recording) {
      // Simulate processing
      setRecording(false)
      const mockScore = Math.floor(Math.random() * 30) + 68
      setResult({ score: mockScore, feedback: SAMPLE_FEEDBACK })
    } else {
      setResult(null)
      setRecording(true)
    }
  }

  const handleNext = () => {
    const newScores = [...scores, result?.score ?? 0]
    if (phraseIdx + 1 >= total) {
      navigate('/complete', { state: { scores: newScores, config } })
    } else {
      setScores(newScores)
      setPhraseIdx((i) => i + 1)
      setResult(null)
    }
  }

  const progress = ((phraseIdx) / total) * 100

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">parle</span>
          <span className="text-2xl font-bold text-[#5340c8]">.fr</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge>{config.level}</Badge>
          <span className="text-white/40 text-sm">
            {phraseIdx + 1} / {total}
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-white/10">
        <div
          className="h-full bg-[#5340c8] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-6">

          {/* Topic chip */}
          <div className="text-center">
            <Badge variant="default">{config.topic}</Badge>
          </div>

          {/* Phrase card */}
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-2xl font-semibold text-white leading-relaxed mb-3">
                {phrase.fr}
              </p>
              <p className="text-sm text-white/40">{phrase.en}</p>
              <button className="mt-4 p-2 rounded-lg text-[#5340c8] hover:bg-[#5340c8]/10 transition-all">
                <Volume2 size={18} />
              </button>
            </CardContent>
          </Card>

          {/* Mic button */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleMic}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-2xl cursor-pointer ${
                recording
                  ? 'bg-red-500 shadow-red-500/40 scale-110 animate-pulse'
                  : 'bg-[#5340c8] shadow-[#5340c8]/40 hover:scale-105 hover:bg-[#6a55d6]'
              }`}
            >
              {recording ? <MicOff size={28} color="white" /> : <Mic size={28} color="white" />}
            </button>
            <p className="text-white/40 text-sm">
              {recording ? 'Recording… tap to stop' : result ? 'Tap to try again' : 'Tap to record'}
            </p>
          </div>

          {/* Result */}
          {result && (
            <Card>
              <CardContent className="pt-2">
                <div className="flex items-center gap-6">
                  <ScoreRing score={result.score} />
                  <div className="flex-1">
                    <p className="text-white/50 text-xs mb-2 uppercase tracking-wide">Word feedback</p>
                    <div className="flex flex-wrap gap-2 text-lg">
                      {result.feedback.map((item, i) => (
                        <WordChip key={i} word={item.word} score={item.score} />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="secondary" size="icon" onClick={() => setResult(null)} disabled={!result || recording}>
              <RotateCcw size={16} />
            </Button>
            <Button className="flex-1" onClick={handleNext} disabled={!result}>
              {phraseIdx + 1 >= total ? 'Finish session' : 'Next phrase'}
              <ChevronRight size={16} />
            </Button>
          </div>

          {/* AI Conversation shortcut */}
          <button
            onClick={() => navigate('/conversation')}
            className="w-full text-center text-[#5340c8] text-sm hover:text-[#7c6be0] transition-colors py-2"
          >
            Switch to AI conversation mode →
          </button>
        </div>
      </main>
    </div>
  )
}
