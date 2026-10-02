import { useEffect, useMemo, useState } from 'react'
import { ideas } from './ideas.js'

const categories = ['All', ...new Set(ideas.map((i) => i.category))]

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('theme')
    if (saved) return saved
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function IdeaModal({ idea, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Close">×</button>
        <span className="tag">{idea.category}</span>
        <h2 id="modal-title">{idea.name}</h2>
        <h3>Problem</h3>
        <p>{idea.problem}</p>
        <h3>Solution</h3>
        <p>{idea.solution}</p>
        <h3>Suggested MVP</h3>
        <ul>{idea.mvp.map((m) => <li key={m}>{m}</li>)}</ul>
        <h3>Tech stack</h3>
        <div className="chips">{idea.stack.map((s) => <span key={s} className="chip">{s}</span>)}</div>
      </div>
    </div>
  )
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('theme', theme) } catch {}
  }, [theme])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ideas.filter((i) =>
      (category === 'All' || i.category === category) &&
      (!q || [i.name, i.problem, i.solution, i.category].some((t) => t.toLowerCase().includes(q)))
    )
  }, [query, category])

  return (
    <>
      <header className="nav">
        <span className="brand">Idea Vault</span>
        <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle dark and light mode">
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </header>

      <main>
        <section className="hero">
          <h1>Hackathon Idea Vault</h1>
          <p className="subtitle">Discover, explore, and organize hackathon ideas.</p>
          <input
            className="search"
            type="search"
            placeholder="Search by name, problem, or category"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search ideas"
          />
          <div className="filters" role="group" aria-label="Filter by category">
            {categories.map((c) => (
              <button key={c} className={`filter ${c === category ? 'active' : ''}`} onClick={() => setCategory(c)} aria-pressed={c === category}>
                {c}
              </button>
            ))}
          </div>
        </section>

        <section className="grid" aria-live="polite">
          {filtered.map((idea, n) => (
            <article className="card" key={idea.id} style={{ '--i': n }}>
              <div className="card-top">
                <span className="tag">{idea.category}</span>
                <span className={`diff diff-${idea.difficulty.toLowerCase()}`}>{idea.difficulty}</span>
              </div>
              <h2>{idea.name}</h2>
              <h3>Problem</h3>
              <p>{idea.problem}</p>
              <h3>Solution</h3>
              <p>{idea.solution}</p>
              <button className="btn" onClick={() => setSelected(idea)}>View Idea</button>
            </article>
          ))}
          {filtered.length === 0 && (
            <p className="empty">No ideas match your search. Try a different keyword or choose All.</p>
          )}
        </section>
      </main>

      <footer className="footer">Built for practice. Ideas are free to use.</footer>
      {selected && <IdeaModal idea={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
