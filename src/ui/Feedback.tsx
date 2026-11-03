export function Feedback({
  correct,
  message,
  nextLabel = 'Next hand',
  onNext,
}: {
  correct: boolean
  message: string
  nextLabel?: string
  onNext?: () => void
}) {
  return (
    <section className={`feedback ${correct ? 'feedback-correct' : 'feedback-wrong'}`} aria-live="polite">
      <p className="verdict">{correct ? 'Correct!' : 'Not quite.'}</p>
      <p>{message}</p>
      <button type="button" className="primary" onClick={onNext}>
        {nextLabel}
      </button>
    </section>
  )
}
