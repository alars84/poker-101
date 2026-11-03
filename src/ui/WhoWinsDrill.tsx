import { useState } from 'react'
import { describeHand, explainShowdown } from '../domain/explanation'
import { SCENARIO_LABELS } from '../drills/scenario'
import { dealWhoWinsRound, isCorrectPick } from '../drills/whoWins'
import { CardRow } from './CardView'
import { Feedback } from './Feedback'

type Props = {
  deal?: typeof dealWhoWinsRound
  onAnswered: (topic: string, correct: boolean) => void
}

export function WhoWinsDrill({ deal = dealWhoWinsRound, onAnswered }: Props) {
  const [round, setRound] = useState(() => deal())
  const [picks, setPicks] = useState<readonly string[]>([])
  const [answered, setAnswered] = useState(false)

  const { result } = round
  const winnerNames = result.winners.map((winner) => winner.name)
  const correct = isCorrectPick(round, picks)

  const togglePick = (name: string) => {
    setPicks(picks.includes(name) ? picks.filter((pick) => pick !== name) : [...picks, name])
  }
  const lockIn = () => {
    setAnswered(true)
    onAnswered(SCENARIO_LABELS[result.scenario], correct)
  }
  const nextHand = () => {
    setRound(deal())
    setPicks([])
    setAnswered(false)
  }

  return (
    <div className="drill">
      <p className="prompt">Who takes the pot? Pick more than one player for a split.</p>

      <section className="board" aria-label="Board">
        <CardRow cards={round.board} bestFive={answered ? result.winningHand.cards : undefined} />
      </section>

      <div className="seats">
        {round.players.map((player, i) => {
          const isWinner = winnerNames.includes(player.name)
          const seatState = [
            picks.includes(player.name) && 'seat-picked',
            answered && isWinner && 'seat-winner',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <button
              type="button"
              key={player.name}
              className={`seat ${seatState}`}
              aria-pressed={picks.includes(player.name)}
              disabled={answered}
              onClick={() => togglePick(player.name)}
            >
              <span className="seat-name">
                {player.name}
                {answered && isWinner && <span className="seat-badge">Wins</span>}
              </span>
              <CardRow cards={player.holeCards} bestFive={answered ? result.hands[i].cards : undefined} />
              {answered && <span className="seat-hand">{describeHand(result.hands[i])}</span>}
            </button>
          )
        })}
      </div>

      {answered ? (
        <Feedback correct={correct} message={explainShowdown(result)} onNext={nextHand} />
      ) : (
        <button type="button" className="primary" disabled={picks.length === 0} onClick={lockIn}>
          Lock it in
        </button>
      )}
    </div>
  )
}
