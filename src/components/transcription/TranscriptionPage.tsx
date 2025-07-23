import { TranscriptionService } from './TranscriptionService'
import { TranscriptDisplay } from './TranscriptDisplay'

export function TranscriptionPage() {
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-none">
        <TranscriptionService />
      </div>
      <div className="flex-1 min-h-0">
        <TranscriptDisplay />
      </div>
    </div>
  )
}