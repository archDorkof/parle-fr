import { useNavigate, useLocation } from 'react-router-dom'
import { Trophy, RotateCcw, MessageCircle, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const SAMPLE_SCORES = [82, 91, 67, 88, 75]
const SAMPLE_PHRASES = [
  'Bonjour, comment allez-vous ?',
  "Je voudrais un café, s'il vous plaît.",
  'Où se trouve la gare la plus proche ?',
  "Est-ce que vous parlez anglais ?",
  "L'addition, s'il vous plaît.",
]

function ScoreBar({ score }) {
  const color = score >= 85 ? 'bg-green-500' : score >= 65 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-700`}
        style={{ width: `${score}%` }}
      />
    </div>
  )
}

function getRating(avg) {
  if (avg >= 90) return { label: 'Excellent !', stars: 5 }
  if (avg >= 80) return { label: 'Très bien !', stars: 4 }
  if (avg >= 70) return { label: 'Bien !', stars: 3 }
  if (avg >= 60) return { label: 'Pas mal !', stars: 2 }
  return { label: 'Continuez !', stars: 1 }
}

export default function SessionComplete() {
  const navigate = useNavigate()
  const { state } = useLocation()

  const scores = state?.scores?.length ? state.scores : SAMPLE_SCORES
  const config = state?.config || { level: 'B1', topic: 'Everyday conversation' }
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  const { label, stars } = getRating(avg)

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">parle</span>
          <span className="text-2xl font-bold text-[#5340c8]">.fr</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-5">

          {/* Hero score */}
          <div className="text-center py-6">
            <div className="w-24 h-24 rounded-full bg-[#5340c8]/20 border-2 border-[#5340c8]/50 flex items-center justify-center mx-auto mb-4">
              <Trophy size={36} className="text-[#5340c8]" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-1">{avg}%</h1>
            <p className="text-xl text-[#a090f0] font-semibold mb-2">{label}</p>
            <div className="flex justify-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}
                />
              ))}
            </div>
            <div className="flex items-center justify-center gap-2">
              <Badge>{config.level}</Badge>
              <Badge variant="default">{config.topic}</Badge>
            </div>
          </div>

          {/* Phrase breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Phrase breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {scores.map((score, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/50 truncate flex-1 mr-3">
                      {SAMPLE_PHRASES[i % SAMPLE_PHRASES.length]}
                    </p>
                    <span
                      className={`text-xs font-bold flex-shrink-0 ${
                        score >= 85
                          ? 'text-green-400'
                          : score >= 65
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}
                    >
                      {score}%
                    </span>
                  </div>
                  <ScoreBar score={score} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Phrases', value: scores.length },
              { label: 'Best', value: `${Math.max(...scores)}%` },
              { label: 'Needs work', value: scores.filter((s) => s < 70).length },
            ].map(({ label, value }) => (
              <Card key={label} className="text-center py-4">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/40 mt-1">{label}</p>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button size="lg" className="w-full" onClick={() => navigate('/')}>
              <RotateCcw size={16} />
              New session
            </Button>
            <Button variant="secondary" size="lg" className="w-full" onClick={() => navigate('/conversation')}>
              <MessageCircle size={16} />
              Continue in AI conversation
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
