import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Quita tildes y mayúsculas para que "ingenieria" encuentre "Ingeniería".
const normalize = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const MAX_HEIGHT = 280
const GAP = 4

// Lista desplegable con buscador. groups: [{ group, items: [{ value, label }] }]
// Con allowCustom=true, permite escribir libremente en el input si la opción no está en la lista (ideal para móviles).
function SearchSelect({
  label,
  groups,
  value,
  onChange,
  placeholder = 'Escribe para buscar…',
  emptyText = 'Sin resultados',
  allowCustom = false,
  customGroupLabel = 'Usar texto personalizado',
}) {
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
  const displayValue = selected ? selected.label : (value || '')

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    return q ? flat.filter((item) => normalize(`${item.label} ${item.group}`).includes(q)) : flat
  }, [flat, query])

  const hasExactMatch = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return false
    return flat.some((item) => normalize(item.label) === q || normalize(item.value) === q)
  }, [flat, query])

  // Calcula dónde dibujar la lista: debajo del campo si cabe, si no arriba.
  const place = () => {
    const rect = inputRef.current?.getBoundingClientRect()
    if (!rect) return
    // Si el campo se scrolleó fuera de la vista, cerrar la lista
    if (rect.bottom < 40 || rect.top > window.innerHeight - 40) {
      commitRef.current?.()
      return
    }
    const below = window.innerHeight - rect.bottom - GAP - 12
    const above = rect.top - GAP - 12
    const up = below < 220 && above > below
    const maxHeight = Math.max(140, Math.min(MAX_HEIGHT, up ? above : below))
    setPos({ left: rect.left, width: rect.width, maxHeight, ...(up ? { bottom: window.innerHeight - rect.top + GAP } : { top: rect.bottom + GAP }) })
  }

  const openList = () => {
    const rect = inputRef.current?.getBoundingClientRect()
    if (rect && window.innerHeight - rect.bottom < 300) rootRef.current?.scrollIntoView({ block: 'center' })
    place()
    setOpen(true)
  }

  const choose = (val) => {
    onChange(val)
    setOpen(false)
    setQuery('')
  }

  const commitRef = useRef()
  commitRef.current = () => {
    if (allowCustom && query.trim()) {
      const q = query.trim()
      const match = flat.find((item) => normalize(item.label) === normalize(q) || normalize(item.value) === normalize(q))
      choose(match ? match.value : q)
    } else {
      setOpen(false)
      setQuery('')
    }
  }

  // Cierra el menú al hacer click o tap fuera, en cualquier parte de la pantalla o del modal
  useEffect(() => {
    if (!open) return undefined

    const onDown = (event) => {
      // Si el click o tap ocurrió dentro de este SearchSelect o de su menú desplegable flotante, no cerrar
      if (rootRef.current?.contains(event.target) || listRef.current?.contains(event.target)) {
        return
      }
      commitRef.current?.()
    }

    // Usamos capture: true para detectar el click/tap antes de que cualquier modal o contenedor llame a stopPropagation()
    document.addEventListener('pointerdown', onDown, true)
    document.addEventListener('touchstart', onDown, true)
    document.addEventListener('mousedown', onDown, true)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)

    return () => {
      document.removeEventListener('pointerdown', onDown, true)
      document.removeEventListener('touchstart', onDown, true)
      document.removeEventListener('mousedown', onDown, true)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open])

  useEffect(() => {
    if (open) listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) openList()
      setActive((i) => Math.min(i + 1, filtered.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (open) {
        if (filtered[active]) {
          choose(filtered[active].value)
        } else if (allowCustom && query.trim()) {
          commitRef.current?.()
        } else {
          setOpen(false)
        }
      }
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
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
        placeholder={open ? (displayValue || placeholder) : (displayValue || placeholder)}
        value={open ? query : displayValue}
        onChange={(e) => { setQuery(e.target.value); setActive(0); if (!open) openList() }}
        onFocus={() => { openList(); setQuery(displayValue) }}
        onClick={() => { if (!open) openList() }}
        onKeyDown={onKeyDown}
      />
      <span
        className="ss-chevron"
        aria-hidden="true"
        style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (open) {
            commitRef.current?.()
          } else {
            inputRef.current?.focus()
            openList()
          }
        }}
      >
        ▾
      </span>
      {open && pos && createPortal(
        <ul
          className="ss-list"
          id={`${id}-list`}
          role="listbox"
          ref={listRef}
          aria-labelledby={`${id}-label`}
          style={{ position: 'fixed', left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxHeight }}
        >
          {allowCustom && query.trim() && !hasExactMatch && (
            <li role="presentation" style={{ display: 'contents' }}>
              <div className="ss-group ss-group--custom" role="presentation">{customGroupLabel}</div>
              <div
                role="option"
                className="ss-option ss-option--custom"
                onMouseDown={(e) => { e.preventDefault(); choose(query.trim()) }}
                onClick={() => choose(query.trim())}
              >
                <span>Usar: &ldquo;<strong>{query.trim()}</strong>&rdquo;</span>
              </div>
            </li>
          )}
          {filtered.length === 0 && (!allowCustom || !query.trim()) && <li className="ss-empty">{emptyText}</li>}
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
                  onMouseDown={(e) => { e.preventDefault(); choose(item.value) }}
                  onClick={() => choose(item.value)}
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
