import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import type { HandCategory } from '../domain/hand'
import { capitalize } from '../drills/capitalize'
import { countInRightSpot, isInRightSpot, moveHand, shuffledHands, STRONGEST_FIRST } from '../drills/rankTheHands'
import { Feedback } from './Feedback'
import { RankingsChart } from './RankingsChart'

type Props = {
  deal?: () => readonly HandCategory[]
}

export function RankTheHandsQuiz({ deal = shuffledHands }: Props) {
  const [order, setOrder] = useState(() => deal())
  const [submitted, setSubmitted] = useState(false)
  const [dragged, setDragged] = useState<HandCategory | null>(null)
  const listRef = useRef<HTMLOListElement>(null)

  const spotAt = (clientY: number, list: HTMLElement) => {
    const { top, height } = list.getBoundingClientRect()
    return Math.floor((clientY - top) / (height / order.length))
  }

  // Pointer events rather than HTML drag and drop, which doesn't fire on touch screens.
  // The list holds the capture because rows move in the DOM, and moving one would drop it.
  const startDrag = (event: PointerEvent<HTMLOListElement>) => {
    if (submitted || event.button !== 0) return
    const hand = order[spotAt(event.clientY, event.currentTarget)]
    if (!hand) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragged(hand)
  }
  const followDrag = (event: PointerEvent<HTMLOListElement>) => {
    if (!dragged) return
    setOrder(moveHand(order, order.indexOf(dragged), spotAt(event.clientY, event.currentTarget)))
  }
  const endDrag = () => setDragged(null)

  const moveWithKeys = (event: KeyboardEvent, spot: number) => {
    const step = { ArrowUp: -1, ArrowDown: 1 }[event.key]
    if (!step) return
    event.preventDefault()
    setOrder(moveHand(order, spot, spot + step))
    listRef.current?.querySelectorAll('button')[spot + step]?.focus()
  }

  const tryAgain = () => {
    setOrder(deal())
    setSubmitted(false)
  }

  const rightCount = countInRightSpot(order)

  return (
    <div className="drill">
      {!submitted && <p className="prompt">Drag the hands into order, strongest at the top.</p>}

      <div className={`rank-columns ${submitted ? 'rank-columns-submitted' : ''}`}>
        <div className="rank-column">
          {submitted && <h2>Your order</h2>}
          <ol
            ref={listRef}
            className="rank-list"
            aria-label="Your order"
            onPointerDown={startDrag}
            onPointerMove={followDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {order.map((hand, spot) => {
              const name = capitalize(hand)
              const right = isInRightSpot(order, spot)
              const state = submitted
                ? right
                  ? 'rank-row-right'
                  : 'rank-row-wrong'
                : hand === dragged
                  ? 'rank-row-draggable rank-row-dragging'
                  : 'rank-row-draggable'
              return (
                // Keyed by spot so a keyboard move leaves the buttons in place for focus to step between.
                <li key={spot} className={`rank-row ${state}`}>
                  {!submitted && (
                    <button
                      type="button"
                      className="rank-handle"
                      aria-label={`Move ${name}, spot ${spot + 1} of ${order.length}. Use the up and down arrow keys.`}
                      onKeyDown={(event) => moveWithKeys(event, spot)}
                    >
                      <span aria-hidden="true">⠿</span>
                    </button>
                  )}
                  <span className="rank-number">{spot + 1}</span>
                  <span className="rank-name">{name}</span>
                  {submitted && (
                    <span className="rank-mark" role="img" aria-label={right ? 'Right spot' : 'Wrong spot'}>
                      {right ? '✓' : '✗'}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </div>

        {submitted && (
          <div className="rank-column">
            <h2>Correct order</h2>
            <ol className="rank-list" aria-label="Correct order">
              {STRONGEST_FIRST.map((hand, spot) => (
                <li key={hand} className="rank-row">
                  <span className="rank-number">{spot + 1}</span>
                  <span className="rank-name">{capitalize(hand)}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {submitted ? (
        <Feedback
          correct={rightCount === order.length}
          message={`${rightCount} of ${order.length} in the right spot.`}
          nextLabel="Try again"
          onNext={tryAgain}
        />
      ) : (
        <button type="button" className="primary" onClick={() => setSubmitted(true)}>
          Submit
        </button>
      )}

      {submitted && (
        <section>
          <h2 className="rank-examples-heading">What each hand looks like</h2>
          <RankingsChart />
        </section>
      )}
    </div>
  )
}
