import { ActionItemExtractor } from '../tasks/ActionItemExtractor'
import { TranscriptDisplay } from './TranscriptDisplay'

export function ActionItemsPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Action Item Extraction</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ActionItemExtractor />
        </div>
        
        <div>
          <TranscriptDisplay />
        </div>
      </div>
    </div>
  )
}