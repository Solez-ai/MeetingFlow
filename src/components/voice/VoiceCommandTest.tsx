import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useVoiceCommands } from '@/hooks/useVoiceCommands'
import { VoiceCommandResult } from '@/types/voice'
import { Play, CheckCircle, XCircle } from 'lucide-react'

export function VoiceCommandTest() {
  const [testResults, setTestResults] = useState<Array<{
    command: string
    result: VoiceCommandResult | null
    timestamp: string
  }>>([])
  
  const { processCommand, commands } = useVoiceCommands()

  const testCommands = [
    'add topic project review',
    'mark action item send follow up email',
    'start recording',
    'stop recording',
    'show agenda',
    'show tasks',
    'help',
    'invalid command that should not work'
  ]

  const runTest = (command: string) => {
    const result = processCommand(command)
    const testResult = {
      command,
      result,
      timestamp: new Date().toLocaleTimeString()
    }
    
    setTestResults(prev => [testResult, ...prev])
  }

  const runAllTests = () => {
    setTestResults([])
    testCommands.forEach((command, index) => {
      setTimeout(() => runTest(command), index * 500)
    })
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Voice Command Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runAllTests}>
              <Play className="h-4 w-4 mr-2" />
              Run All Tests
            </Button>
            <Button variant="outline" onClick={clearResults}>
              Clear Results
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {testCommands.map((command, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => runTest(command)}
                className="justify-start text-left"
              >
                Test: "{command}"
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testResults.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex-1">
                    <div className="font-mono text-sm">"{test.command}"</div>
                    <div className="text-xs text-muted-foreground">{test.timestamp}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {test.result ? (
                      <>
                        {test.result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <Badge variant={test.result.success ? "default" : "destructive"}>
                          {test.result.success ? "Success" : "Failed"}
                        </Badge>
                      </>
                    ) : (
                      <Badge variant="secondary">Not Recognized</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Available Commands ({commands.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commands.map((command, index) => (
              <div key={index} className="p-3 border rounded-md">
                <div className="font-mono text-sm mb-1">
                  {command.pattern.source.replace(/\^\|\$|\\\w/g, '').replace(/\(\.\+\)/g, '[text]')}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {command.description}
                </div>
                <Badge variant="outline" className="text-xs">
                  {command.category}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}