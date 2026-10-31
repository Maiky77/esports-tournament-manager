import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Quita tildes y mayúsculas para que "ingenieria" encuentre "Ingeniería".
const normalize = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const MAX_HEIGHT = 280
const GAP = 4

// Lista desplegable con buscador. groups: [{ group, items: [{ value, label }] }]
// La lista se dibuja en <body> con posición fija: ninguna tarjeta ni el borde del modal la tapan.
function SearchSelect({ label, groups, value, onChange, placeholder = 'Escribe para buscar…', emptyText = 'Sin resultados' }) {
  const id = useId()
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [pos, setPos] = useState(null)

  const flat = useMemo(() => groups.flatMap((g) => g.items.map((item) => ({ ...item, group: g.group }))), [groups])
  const selected = flat.find((item) => item.value === value)
  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    return q ? flat.filter((item) => normalize(`${item.label} ${item.group}`).includes(q)) : flat
  }, [flat, query])

  // Calcula dónde dibujar la lista: debajo del campo si cabe, si no arriba.
  const place = () => {
    const rect = inputRef.current?.getBoundingClientRect()
    if (!rect) return
    const below = window.innerHeight - rect.bottom - GAP - 12
    const above = rect.top - GAP - 12
    const up = below < 220 && above > below
    const maxHeight = Math.max(140, Math.min(MAX_HEIGHT, up ? above : below))
    setPos({ left: rect.left, width: rect.width, maxHeight, ...(up ? { bottom: window.innerHeight - rect.top + GAP } : { top: rect.bottom + GAP }) })
  }

  const openList = () => {
    // Si abajo no hay espacio, acerca el campo al centro antes de abrir.
    const rect = inputRef.current?.getBoundingClientRect()
    if (rect && window.innerHeight - rect.bottom < 300) rootRef.current?.scrollIntoView({ block: 'center' })
    place()
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return undefined
    const onDown = (event) => {
      if (rootRef.current?.contains(event.target) || listRef.current?.contains(event.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open])

  useEffect(() => {
    if (open) listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const choose = (item) => {
    onChange(item.value)
    setOpen(false)
    setQuery('')
  }

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) openList()
      setActive((i) => Math.min(i + 1, filtered.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter' && open) {
      event.preventDefault()
      if (filtered[active]) choose(filtered[active])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="form-field ss" ref={rootRef}>
      <span id={`${id}-label`}>{label}</span>
      <input
        ref={inputRef}
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-labelledby={`${id}-label`}
        aria-autocomplete="list"
        aria-activedescendant={open && filtered[active] ? `${id}-opt-${active}` : undefined}
        autoComplete="off"
        maxLength={80}
        placeholder={open ? (selected ? selected.label : placeholder) : placeholder}
        value={open ? query : selected?.label ?? ''}
        onChange={(e) => { setQuery(e.target.value); setActive(0); if (!open) openList() }}
        onFocus={() => { openList(); setQuery('') }}
        onClick={() => { if (!open) openList() }}
        onKeyDown={onKeyDown}
      />
      <span className="ss-chevron" aria-hidden="true">▾</span>
      {open && pos && createPortal(
        <ul
          className="ss-list"
          id={`${id}-list`}
          role="listbox"
          ref={listRef}
          aria-labelledby={`${id}-label`}
          style={{ position: 'fixed', left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxHeight }}
        >
          {filtered.length === 0 && <li className="ss-empty">{emptyText}</li>}
          {filtered.map((item, index) => {
            const showHeader = index === 0 || filtered[index - 1].group !== item.group
            return (
              <li key={item.value} role="presentation" style={{ display: 'contents' }}>
                {showHeader && <div className="ss-group" role="presentation">{item.group}</div>}
                <div
                  id={`${id}-opt-${index}`}
                  role="option"
                  aria-selected={item.value === value}
                  data-active={index === active}
                  className={`ss-option ${item.value === value ? 'ss-option--selected' : ''} ${index === active ? 'ss-option--active' : ''}`}
                  onMouseEnter={() => setActive(index)}
                  onMouseDown={(e) => { e.preventDefault(); choose(item) }}
                >
                  {item.label}
                </div>
              </li>
            )
          })}
        </ul>,
        document.body,
      )}
    </div>
  )
}

export default SearchSelect
