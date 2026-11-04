import { useState } from 'react'

type CopyState = 'ready' | 'copied' | 'failed'

const LABELS: Record<CopyState, string> = {
  ready: 'Copy result',
  copied: 'Copied!',
  failed: "Couldn't copy. Select the text instead.",
}

export function ShareResult({ text }: { text: string }) {
  const [copyState, setCopyState] = useState<CopyState>('ready')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }

  return (
    <div className="share-result">
      <pre>{text}</pre>
      <button type="button" className="primary" onClick={copy}>
        {LABELS[copyState]}
      </button>
    </div>
  )
}
