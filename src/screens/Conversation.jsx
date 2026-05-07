import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Mic, ArrowLeft, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const STARTER_MESSAGE = {
  role: 'assistant',
  text: 'Bonjour ! Je suis Claude, votre assistant de conversation française. Comment puis-je vous aider aujourd\'hui ?',
  translation: "Hello! I'm Claude, your French conversation assistant. How can I help you today?",
}

const MOCK_RESPONSES = [
  {
    text: "Très bien ! Continuons en français. Qu'est-ce que vous avez fait aujourd'hui ?",
    translation: "Very good! Let's continue in French. What did you do today?",
  },
  {
    text: "Excellent ! Votre français s'améliore. Pouvez-vous me dire plus à ce sujet ?",
    translation: "Excellent! Your French is improving. Can you tell me more about that?",
  },
  {
    text: "Je comprends. En français, on dirait plutôt : « Je suis allé au marché. » Essayez !",
    translation: 'I understand. In French, you would say: "I went to the market." Try it!',
  },
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-[#5340c8]' : 'bg-[#0f3460]'
        }`}
      >
        {isUser ? <User size={14} color="white" /> : <Bot size={14} color="#a090f0" />}
      </div>
      <div className={`max-w-[75%] space-y-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            isUser
              ? 'bg-[#5340c8] text-white rounded-tr-sm'
              : 'bg-[#16213e] text-white border border-white/10 rounded-tl-sm'
          }`}
        >
          {msg.text}
        </div>
        {msg.translation && (
          <p className="text-xs text-white/30 px-1">{msg.translation}</p>
        )}
      </div>
    </div>
  )
}

export default function Conversation() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([STARTER_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const mockIdx = useRef(0)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', text: input.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Simulate Claude API response
    setTimeout(() => {
      const reply = MOCK_RESPONSES[mockIdx.current % MOCK_RESPONSES.length]
      mockIdx.current += 1
      setMessages((prev) => [...prev, { role: 'assistant', ...reply }])
      setLoading(false)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">AI Conversation</span>
              <Badge>Claude</Badge>
            </div>
            <p className="text-xs text-white/40">Practise French with AI</p>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0f3460] flex items-center justify-center">
              <Bot size={14} color="#a090f0" />
            </div>
            <div className="bg-[#16213e] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#5340c8] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-white/10 bg-[#16213e]/50 backdrop-blur">
        <div className="flex gap-2 items-center">
          <button className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all flex-shrink-0">
            <Mic size={18} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Écrivez en français…"
            className="flex-1 bg-[#0f3460]/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#5340c8]/60 transition-all"
          />
          <Button size="icon" onClick={sendMessage} disabled={!input.trim() || loading}>
            <Send size={16} />
          </Button>
        </div>
        <p className="text-xs text-white/20 text-center mt-2">
          Claude API · responses are simulated placeholders
        </p>
      </div>
    </div>
  )
}
