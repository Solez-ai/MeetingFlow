import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useVoiceCommands } from '@/hooks/useVoiceCommands'
import { Calendar, CheckSquare, Mic, Navigation } from 'lucide-react'

const categoryIcons = {
  agenda: Calendar,
  tasks: CheckSquare,
  recording: Mic,
  navigation: Navigation
}

const categoryColors = {
  agenda: 'bg-blue-100 text-blue-800',
  tasks: 'bg-green-100 text-green-800',
  recording: 'bg-red-100 text-red-800',
  navigation: 'bg-purple-100 text-purple-800'
}

export function VoiceCommandHelp() {
  const { commands } = useVoiceCommands()

  const groupedCommands = commands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = []
    }
    acc[command.category]?.push(command)
    return acc
  }, {} as Record<string, typeof commands>)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Available Voice Commands</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedCommands).map(([category, categoryCommands]) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons]
          const colorClass = categoryColors[category as keyof typeof categoryColors]
          
          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <h3 className="font-semibold capitalize">{category}</h3>
                <Badge className={colorClass}>
                  {categoryCommands.length} command{categoryCommands.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="space-y-2 ml-6">
                {categoryCommands.map((command, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                        {command.pattern.source.replace(/\^\|\$|\\\w/g, '').replace(/\(\.\+\)/g, '[text]')}
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground ml-2">
                      {command.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        
        <div className="mt-6 p-4 bg-muted/50 rounded-md">
          <h4 className="font-medium mb-2">Tips for Better Recognition:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Speak clearly and at a normal pace</li>
            <li>• Use the exact command phrases shown above</li>
            <li>• Wait for the microphone to activate before speaking</li>
            <li>• Minimize background noise for better accuracy</li>
            <li>• Commands are case-insensitive</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}