import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react'
import {
  Activity, ArrowUp, Brain, ChevronRight, Command, Compass, Copy, GitBranch,
  History, MessageSquare, MoreHorizontal, Paperclip, Plus, Search, Send,
  Settings2, Sparkles, Trash2, X, Zap,
} from 'lucide-react'

const suggestions = [
  ['01', 'Capture a thought', 'Retiens que mon stack préféré est Spring + React'],
  ['02', 'Explore memory', 'Qu’est-ce que tu sais déjà sur moi ?'],
  ['03', 'Make it clear', 'Résume ma dernière idée en trois points'],
]

function DotMatrix({ size = 13, active = false }) {
  return (
    <span className={`dot-matrix ${active ? 'is-active' : ''}`} style={{ '--matrix': `${size}px` }} aria-hidden>
      {Array.from({ length: 49 }, (_, i) => <i key={i} />)}
    </span>
  )
}

function Glow({ x, y }) {
  const mx = useMotionValue(x)
  const my = useMotionValue(y)
  const sx = useSpring(mx, { stiffness: 70, damping: 28 })
  const sy = useSpring(my, { stiffness: 70, damping: 28 })
  useEffect(() => {
    const move = (event) => { mx.set(event.clientX); my.set(event.clientY) }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [mx, my])
  return <motion.div className="cursor-glow" style={{ left: sx, top: sy }} />
}

function Rail({ onNew }) {
  return (
    <aside className="rail">
      <div className="rail-spacer" aria-hidden />
      <button className="rail-action rail-action--active" onClick={onNew}><Plus size={18} /><span>New thread</span></button>
      <button className="rail-action"><MessageSquare size={18} /><span>Threads</span></button>
      <button className="rail-action"><Brain size={18} /><span>Memory</span></button>
      <button className="rail-action"><Compass size={18} /><span>Explore</span></button>
      <div className="rail-bottom">
        <button className="rail-action"><Settings2 size={18} /><span>Settings</span></button>
        <div className="avatar">K</div>
      </div>
    </aside>
  )
}

function ThreadPanel({ open, threads, activeId, onSelect, onNew, onDelete, onClose }) {
  return (
    <AnimatePresence>
      {open && <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 252, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="thread-panel">
        <div className="panel-inner">
          <div className="panel-heading"><span>Workspace</span><button onClick={onClose}><X size={15} /></button></div>
          <button className="new-thread" onClick={onNew}><Plus size={15} /> New conversation <kbd>⌘ K</kbd></button>
          <div className="panel-label">Recent threads</div>
          <div className="thread-list">
            {threads.length === 0 && <div className="empty-threads">Your threads will<br />appear here.</div>}
            {threads.map((thread) => <motion.div layout key={thread.id} className={`thread ${thread.id === activeId ? 'thread--active' : ''}`}>
              <button onClick={() => onSelect(thread.id)}><span className="thread-dot" />{thread.title}</button>
              <button className="thread-delete" onClick={() => onDelete(thread.id)} aria-label="Delete thread"><Trash2 size={13} /></button>
            </motion.div>)}
          </div>
          <div className="panel-footer"><div className="status-dot" /> Memory system online <span>v1.0</span></div>
        </div>
      </motion.aside>}
    </AnimatePresence>
  )
}

function ContextPanel({ messages }) {
  return <aside className="context-panel">
    <div className="context-head"><span>Context layer</span><button><MoreHorizontal size={17} /></button></div>
    <div className="context-orb"><div className="orb-ring orb-ring--one" /><div className="orb-ring orb-ring--two" /><DotMatrix size={6} active /><span className="orb-pulse" /></div>
    <div className="context-title"><span className="live-dot" /> Live memory</div>
    <p className="context-copy">TRACE learns the shape of your thoughts as you go.</p>
    <div className="signal-card"><div><Activity size={14} /><span>Signal strength</span></div><strong>84<span>%</span></strong><div className="signal-bars">{[3, 5, 8, 12, 16, 13, 19, 24].map((height, i) => <i key={i} style={{ height }} />)}</div></div>
    <div className="context-section"><div className="section-label">Current thread <span>{messages.length} events</span></div><div className="memory-item"><span className="memory-icon"><Zap size={13} /></span><div><strong>Conversation context</strong><small>Active and evolving</small></div><ChevronRight size={14} /></div><div className="memory-item"><span className="memory-icon memory-icon--dim"><History size={13} /></span><div><strong>Long-term memory</strong><small>Ready to retrieve</small></div><ChevronRight size={14} /></div></div>
    <div className="context-bottom"><GitBranch size={14} /> Built for focused thinking <span>↗</span></div>
  </aside>
}

function Message({ message }) {
  const isUser = message.role === 'USER'
  return <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`message ${isUser ? 'message--user' : ''}`}>
    {!isUser && <div className="message-agent"><DotMatrix size={4} active /></div>}
    <div className="message-body">{!isUser && <div className="message-meta">TRACE <span>now</span></div>}<p>{message.content}</p>{isUser && <button className="copy-button"><Copy size={12} /></button>}</div>
  </motion.div>
}

export default function App() {
  const [threads, setThreads] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [showThreads, setShowThreads] = useState(true)
  const endRef = useRef(null)

  const newThread = useCallback(() => { setActiveId(null); setMessages([]); setDraft('') }, [])
  const send = useCallback(async (value) => {
    const text = value.trim()
    if (!text || loading) return
    setMessages((current) => [...current, { id: `u-${Date.now()}`, role: 'USER', content: text }])
    setDraft(''); setLoading(true)
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: text, conversationId: activeId }) })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setActiveId(data.conversationId)
      setThreads((current) => current.some((item) => item.id === data.conversationId) ? current : [{ id: data.conversationId, title: text.slice(0, 32) }, ...current])
      setMessages((current) => [...current, { id: `a-${Date.now()}`, role: 'AGENT', content: data.aiResponse }])
    } catch {
      setMessages((current) => [...current, { id: `e-${Date.now()}`, role: 'AGENT', content: 'The memory engine is unreachable. Start the API and try again.' }])
    } finally { setLoading(false) }
  }, [activeId, loading])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])
  const activeTitle = useMemo(() => threads.find((thread) => thread.id === activeId)?.title, [threads, activeId])

  return <div className="app-shell">
    <Glow x={-300} y={-300} />
    <div className="grain" />
    <Rail onNew={newThread} />
    <ThreadPanel open={showThreads} threads={threads} activeId={activeId} onSelect={(id) => { setActiveId(id); setMessages([]) }} onNew={newThread} onDelete={(id) => setThreads((value) => value.filter((thread) => thread.id !== id))} onClose={() => setShowThreads(false)} />
    <main className="main-stage">
      <header className="topbar"><div className="topbar-title"><span className="eyebrow">Memory workspace</span><span className="topbar-thread">{activeTitle || 'Untitled thread'} <ChevronRight size={13} /> <span>Private</span></span></div><div className="topbar-actions"><button className="command-search"><Search size={14} /> <span>Search memory</span><kbd>⌘ /</kbd></button><button className="icon-button"><Command size={16} /></button></div></header>
      <section className={`chat-stage ${messages.length ? 'chat-stage--active' : ''}`}>
        {messages.length === 0 ? <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} className="welcome">
          <div className="welcome-orbit"><div className="orbit-line orbit-line--a" /><div className="orbit-line orbit-line--b" /><div className="welcome-core"><DotMatrix size={7} active /></div><span className="orbit-dot orbit-dot--a" /><span className="orbit-dot orbit-dot--b" /></div>
          <div className="welcome-kicker"><span className="live-dot" /> Your thinking space</div>
          <h1>Make room for<br /><em>better thoughts.</em></h1>
          <p>A conversation that remembers what matters.<br />Start anywhere — TRACE will follow.</p>
          <div className="suggestions">{suggestions.map(([number, label, text]) => <motion.button whileHover={{ y: -5 }} whileTap={{ scale: .98 }} onClick={() => setDraft(text)} key={number}><span className="suggestion-top"><small>{number}</small><strong>{label}</strong><ArrowUp size={14} /></span><span>{text}</span></motion.button>)}</div>
        </motion.div> : <div className="messages-wrap"><div className="conversation-heading"><span>{activeTitle || 'Current conversation'}</span><div className="heading-line" /><span>{messages.length} events</span></div><AnimatePresence initial={false}>{messages.map((message) => <Message key={message.id} message={message} />)}</AnimatePresence>{loading && <div className="typing"><DotMatrix size={3} active /><span>TRACE is thinking</span><span className="typing-dots">•••</span></div>}<div ref={endRef} /></div>}
      </section>
      <div className="composer-wrap"><div className={`composer ${draft ? 'composer--filled' : ''}`}><div className="composer-tools"><button><Paperclip size={15} /></button><span>{loading ? 'Processing context…' : 'Ask TRACE anything'}</span></div><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(draft) } }} placeholder="Write a thought, question, or something to remember…" rows={1} /><div className="composer-footer"><span><span className="shortcut-dot" /> Context is on</span><button className="send-button" onClick={() => send(draft)} disabled={!draft.trim() || loading}>{loading ? <Sparkles size={15} /> : <Send size={15} />}</button></div></div><p className="composer-hint">TRACE can make mistakes. Your memory stays yours.</p></div>
    </main>
    <ContextPanel messages={messages} />
  </div>
}
