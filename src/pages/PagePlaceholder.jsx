function PagePlaceholder({ title, description }) {
  return (
    <main className="page-shell">
      <section className="placeholder-card">
        <span className="eyebrow">U-SERIES 2026</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>
    </main>
  )
}

export default PagePlaceholder

