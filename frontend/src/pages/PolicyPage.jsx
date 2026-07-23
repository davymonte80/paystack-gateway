export default function PolicyPage({ policy }) {
  return (
    <>
      <header className="page-hero page-hero--compact">
        <p className="eyebrow">{policy.eyebrow}</p>
        <h1>{policy.title}</h1>
        <p className="lede">{policy.introduction}</p>
      </header>
      <section className="policy-card">
        <p className="policy-card__updated">Last updated: July 2026</p>
        {policy.sections.map((section) => (
          <article key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.copy}</p>
          </article>
        ))}
      </section>
    </>
  );
}
