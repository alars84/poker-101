/** Your share of the final pot. The pot already includes the bet you're facing. */
export function priceToCall(pot: number, call: number): number {
  return call / (pot + call)
}

export function chanceToHit(outs: number, unseenCards: number): number {
  return outs / unseenCards
}
