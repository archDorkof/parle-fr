import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mic, MicOff, ChevronRight, Play, Gauge, RotateCcw, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const FALLBACK_PHRASES = [
  { fr: 'Bonjour, comment allez-vous ?', en: 'Hello, how are you?' },
  { fr: "Je voudrais un café, s'il vous plaît.", en: 'I would like a coffee, please.' },
  { fr: 'Où se trouve la gare la plus proche ?', en: 'Where is the nearest train station?' },
  { fr: "Est-ce que vous parlez anglais ?", en: 'Do you speak English?' },
  { fr: "L'addition, s'il vous plaît.", en: 'The bill, please.' },
]

const MAX_SECONDS = 8

function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents for fuzzy match
    .replace(/[^a-z\s]/g, '')
    .trim()
}

function compareWords(targetFr, transcript) {
  const targetWords = targetFr.split(/\s+/)
  const spokenSet = new Set(normalize(transcript).split(/\s+/))
  const feedback = targetWords.map((word) => ({
    word,
    matched: spokenSet.has(normalize(word)),
  }))
  const score = Math.round((feedback.filter((w) => w.matched).length / feedback.length) * 100)
  return { feedback, score }
}

function WordChip({ word, matched }) {
  return (
    <span className={`font-semibold ${matched ? 'text-green-400' : 'text-red-400'}`}>
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
        cx="45" cy="45" r={radius} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text
        x="45" y="45" textAnchor="middle" dominantBaseline="central"
        style={{ transform: 'rotate(90deg)', transformOrigin: '45px 45px' }}
        fill="white" fontSize="16" fontWeight="bold"
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
  const phraseList = state?.generatedPhrases?.length ? state.generatedPhrases : FALLBACK_PHRASES

  const [phraseIdx, setPhraseIdx] = useState(0)
  const [recording, setRecording] = useState(false)
  const [analysing, setAnalysing] = useState(false)
  const [timeLeft, setTimeLeft] = useState(MAX_SECONDS)
  const [result, setResult] = useState(null)
  const [playbackUrl, setPlaybackUrl] = useState(null)
  const [scores, setScores] = useState([])
  const [showTranslation, setShowTranslation] = useState(true)
  const [showExitPrompt, setShowExitPrompt] = useState(false)
  const [error, setError] = useState(null)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const autoStopRef = useRef(null)
  const countdownRef = useRef(null)
  const playbackUrlRef = useRef(null)

  const phrase = phraseList[phraseIdx] ?? phraseList[0]
  const total = phraseList.length

  useEffect(() => {
    return () => {
      clearTimeout(autoStopRef.current)
      clearInterval(countdownRef.current)
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop()
      if (playbackUrlRef.current) URL.revokeObjectURL(playbackUrlRef.current)
    }
  }, [])

  // Revoke old playback URL when phrase changes
  useEffect(() => {
    if (playbackUrlRef.current) URL.revokeObjectURL(playbackUrlRef.current)
    setPlaybackUrl(null)
    setResult(null)
    setError(null)
    setTimeLeft(MAX_SECONDS)
  }, [phraseIdx])

  const speak = (rate = 1) => {
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(phrase.fr)
    utter.lang = 'fr-FR'
    utter.rate = rate
    window.speechSynthesis.speak(utter)
  }

  const stopRecording = () => {
    clearTimeout(autoStopRef.current)
    clearInterval(countdownRef.current)
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setRecording(false)
  }

  const analyseWithWhisper = async (blob) => {
    setAnalysing(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', blob, 'recording.webm')
      formData.append('model', 'whisper-1')
      formData.append('language', 'fr')

      const res = await fetch('/api/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}` },
        body: formData,
      })

      if (!res.ok) throw new Error(`Whisper error ${res.status}`)

      const data = await res.json()
      const transcript = data.text || ''
      const { feedback, score } = compareWords(phrase.fr, transcript)
      setResult({ score, feedback, transcript })
    } catch (err) {
      setError('Could not analyse audio. Check your OpenAI API key and try again.')
      console.error(err)
    } finally {
      setAnalysing(false)
      setTimeLeft(MAX_SECONDS)
    }
  }

  const startRecording = async () => {
    setResult(null)
    setError(null)
    if (playbackUrlRef.current) {
      URL.revokeObjectURL(playbackUrlRef.current)
      playbackUrlRef.current = null
      setPlaybackUrl(null)
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : ''
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' })
        const url = URL.createObjectURL(blob)
        playbackUrlRef.current = url
        setPlaybackUrl(url)
        analyseWithWhisper(blob)
      }

      mediaRecorder.start()
      setRecording(true)
      setTimeLeft(MAX_SECONDS)

      countdownRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000)
      autoStopRef.current = setTimeout(stopRecording, MAX_SECONDS * 1000)
    } catch (err) {
      const msg = {
        NotAllowedError: 'Microphone permission denied — check browser site settings.',
        NotFoundError: 'No microphone found — plug one in and try again.',
        NotReadableError: 'Microphone is in use by another app — close it and try again.',
        SecurityError: 'Microphone blocked — page needs HTTPS or localhost.',
      }
      setError(msg[err.name] ?? `Microphone error: ${err.name} — ${err.message}`)
      console.error(err)
    }
  }

  const handleMic = () => {
    if (recording) stopRecording()
    else startRecording()
  }

  const handleNext = () => {
    const newScores = [...scores, result?.score ?? 0]
    if (phraseIdx + 1 >= total) {
      navigate('/complete', { state: { scores: newScores, config } })
    } else {
      setScores(newScores)
      setPhraseIdx((i) => i + 1)
    }
  }

  const progress = (phraseIdx / total) * 100

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col">

      {/* Exit confirmation popup */}
      {showExitPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#16213e] border border-white/15 rounded-2xl p-6 w-72 shadow-2xl">
            <p className="text-white font-semibold text-center mb-1">Finish session?</p>
            <p className="text-white/40 text-sm text-center mb-5">Your progress so far will be lost.</p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-2.5 rounded-xl bg-[#5340c8] text-white text-sm font-semibold hover:bg-[#6a55d6] transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setShowExitPrompt(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/15 text-white/70 text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <button
          onClick={() => setShowExitPrompt(true)}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl font-bold text-white">parle</span>
          <span className="text-2xl font-bold text-[#5340c8]">.fr</span>
        </button>
        <div className="flex items-center gap-3">
          <Badge>{config.level}</Badge>
          <span className="text-white/40 text-sm">{phraseIdx + 1} / {total}</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-white/10">
        <div className="h-full bg-[#5340c8] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-6">

          <div className="text-center">
            <Badge variant="default">{config.topic}</Badge>
          </div>

          {/* Phrase card */}
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-2xl font-semibold text-white leading-relaxed mb-3">
                {phrase.fr}
              </p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-sm text-white/40">
                  {showTranslation ? phrase.en : '••••••••••••'}
                </p>
                <button
                  onClick={() => setShowTranslation((v) => !v)}
                  className="p-1 rounded-md text-white/30 hover:text-white/60 transition-colors"
                >
                  {showTranslation ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => speak(1)}
                  disabled={recording || analysing}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-[#5340c8] hover:bg-[#5340c8]/10 border border-[#5340c8]/30 hover:border-[#5340c8]/60 transition-all disabled:opacity-40"
                >
                  <Play size={14} className="fill-[#5340c8]" />
                  Hear it
                </button>
                <button
                  onClick={() => speak(0.6)}
                  disabled={recording || analysing}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/10 border border-white/15 hover:border-white/30 transition-all disabled:opacity-40"
                >
                  <Gauge size={14} />
                  Slow
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Mic button */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleMic}
              disabled={analysing}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-2xl cursor-pointer disabled:cursor-not-allowed ${
                analysing
                  ? 'bg-[#5340c8]/40 shadow-none'
                  : recording
                  ? 'bg-red-500 shadow-red-500/40 scale-110 animate-pulse'
                  : 'bg-[#5340c8] shadow-[#5340c8]/40 hover:scale-105 hover:bg-[#6a55d6]'
              }`}
            >
              {analysing
                ? <Loader2 size={28} color="white" className="animate-spin" />
                : recording
                ? <MicOff size={28} color="white" />
                : <Mic size={28} color="white" />}
            </button>
            <p className="text-white/40 text-sm h-5">
              {analysing
                ? 'Analysing…'
                : recording
                ? `Recording… ${timeLeft}s`
                : result
                ? 'Tap to try again'
                : 'Tap to record'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {/* Result */}
          {result && (
            <Card>
              <CardContent className="pt-2 space-y-4">
                <div className="flex items-center gap-6">
                  <ScoreRing score={result.score} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/50 text-xs mb-2 uppercase tracking-wide">Word feedback</p>
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-lg">
                      {result.feedback.map((item, i) => (
                        <WordChip key={i} word={item.word} matched={item.matched} />
                      ))}
                    </div>
                    {result.transcript && (
                      <p className="text-white/30 text-xs mt-3 truncate">
                        Heard: <span className="italic">{result.transcript}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Playback */}
                {playbackUrl && (
                  <div>
                    <p className="text-white/40 text-xs mb-1.5 uppercase tracking-wide">Your recording</p>
                    <audio
                      src={playbackUrl}
                      controls
                      className="w-full h-9 rounded-lg"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => { setResult(null); setError(null); setPlaybackUrl(null) }}
              disabled={(!result && !error) || recording || analysing}
            >
              <RotateCcw size={16} />
            </Button>
            <Button className="flex-1" onClick={handleNext} disabled={!result || recording || analysing}>
              {phraseIdx + 1 >= total ? 'Finish session' : 'Next phrase'}
              <ChevronRight size={16} />
            </Button>
          </div>

        </div>
      </main>
    </div>
  )
}
