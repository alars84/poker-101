import { HOW_TO_SECTIONS, type HowToSection } from '../howTo/sections'
import { GROUP_TITLES, type QuizId } from '../quizzes/quizCatalog'
import { RankingsChart } from './RankingsChart'

type IndexProps = {
  onOpenSection: (id: string) => void
  onExit: () => void
}

export function HowToIndex({ onOpenSection, onExit }: IndexProps) {
  return (
    <div className="how-to">
      <div className="run-header">
        <h1>How To</h1>
        <button type="button" className="link-button" onClick={onExit}>
          Back to home
        </button>
      </div>
      <p className="prompt">Short cheat sheets for garage poker. Each one takes about a minute.</p>

      {GROUP_TITLES.map((group) => (
        <section key={group} className="quiz-group" aria-label={group}>
          <h2>{group}</h2>
          <div className="quiz-cards">
            {HOW_TO_SECTIONS.filter((section) => section.group === group).map(({ id, title, summary }) => (
              <div key={id} className="quiz-card">
                <div className="quiz-card-text">
                  <h3>{title}</h3>
                  <p>{summary}</p>
                </div>
                <button
                  type="button"
                  className="quiz-card-action"
                  aria-label={`Read ${title}`}
                  onClick={() => onOpenSection(id)}
                >
                  Read
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

type SectionProps = {
  section: HowToSection
  onPractice: (quiz: QuizId) => void
  onExit: () => void
}

export function HowToSectionView({ section, onPractice, onExit }: SectionProps) {
  return (
    <div className="how-to">
      <div className="run-header">
        <h1>{section.title}</h1>
        <button type="button" className="link-button" onClick={onExit}>
          Back to How To
        </button>
      </div>

      {section.showsRankingsChart && <RankingsChart />}

      <div className="how-to-points">
        {section.points.map(({ title, body }) => (
          <section key={title} className="how-to-point">
            <h2>{title}</h2>
            <p>{body}</p>
          </section>
        ))}
      </div>

      <button type="button" className="primary" onClick={() => onPractice(section.quiz)}>
        Practice this
      </button>
    </div>
  )
}
