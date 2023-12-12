import { CardProps } from "@/components/game/Card"

export const getMaxColumn = (cards: CardProps[]) => {
  const columns = cards
    .filter((c) => !c.hidden && c.column != null)
    .map((c) => c.column) as number[]
  return Math.max(...columns)
}
