import React from 'react'
import { Meeting } from '@/types'

interface PrintableReportProps {
  meeting: Meeting
}

const PrintableReport = React.forwardRef<HTMLDivElement, PrintableReportProps>(
  ({ meeting }, ref) => {
    const formatTime = (timestamp: string) => {
      return new Date(timestamp).toLocaleString()
    }

    const formatDuration = (minutes: number) => {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
    }

    return (
      <div ref={ref} className="p-8 bg-white text-black max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b-2 border-gray-300 pb-4">
          <h1 className="text-3xl font-bold mb-2">{meeting.title}</h1>
          <div className="text-gray-600 space-y-1">
            <p><strong>Date:</strong> {formatTime(meeting.startTime)}</p>
            {meeting.endTime && (
              <p><strong>Duration:</strong> {formatDuration(
                Math.round((new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime()) / (1000 * 60))
              )}</p>
            )}
            {meeting.metadata.participants && meeting.metadata.participants.length > 0 && (
              <p><strong>Participants:</strong> {meeting.metadata.participants.join(', ')}</p>
            )}
            {meeting.metadata.description && (
              <p><strong>Description:</strong> {meeting.metadata.description}</p>
            )}
          </div>
        </div>

        {/* Agenda Section */}
        {meeting.agenda.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-800">Agenda</h2>
            <div className="space-y-3">
              {meeting.agenda
                .sort((a, b) => a.order - b.order)
                .map((item, index) => (
                  <div key={item.id} className="border-l-4 border-blue-200 pl-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-lg">
                        {index + 1}. {item.title}
                      </h3>
                      <span className="text-sm text-gray-500 ml-4">
                        {item.duration} min
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-gray-600 mt-1">{item.description}</p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Notes Section */}
        {meeting.notes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-green-800">Notes</h2>
            <div className="space-y-3">
              {meeting.notes.map((note) => (
                <div key={note.id} className="border-l-4 border-green-200 pl-4">
                  {note.type === 'heading' && (
                    <h3 className="text-xl font-semibold">{note.content}</h3>
                  )}
                  {note.type === 'bullet' && (
                    <div className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{note.content}</span>
                    </div>
                  )}
                  {note.type === 'todo' && (
                    <div className="flex items-start">
                      <span className="mr-2">☐</span>
                      <span>{note.content}</span>
                    </div>
                  )}
                  {note.type === 'code' && (
                    <pre className="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
                      {note.content}
                    </pre>
                  )}
                  {note.type === 'quote' && (
                    <blockquote className="italic text-gray-700 border-l-2 border-gray-300 pl-3">
                      {note.content}
                    </blockquote>
                  )}
                  {note.type === 'paragraph' && (
                    <p>{note.content}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks Section */}
        {meeting.tasks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-orange-800">Action Items</h2>
            
            {/* Group tasks by status */}
            {['Todo', 'In Progress', 'Done'].map(status => {
              const statusTasks = meeting.tasks.filter(task => task.status === status)
              if (statusTasks.length === 0) return null
              
              return (
                <div key={status} className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-gray-700">{status}</h3>
                  <div className="space-y-3">
                    {statusTasks.map((task) => (
                      <div key={task.id} className="border-l-4 border-orange-200 pl-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="mr-2">
                                {status === 'Done' ? '☑' : '☐'}
                              </span>
                              <h4 className="font-medium">{task.title}</h4>
                              {task.priority !== 'Low' && (
                                <span className={`ml-2 px-2 py-1 text-xs rounded ${
                                  task.priority === 'High' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {task.priority}
                                </span>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-gray-600 mt-1 ml-6">{task.description}</p>
                            )}
                            <div className="flex items-center mt-2 ml-6 text-sm text-gray-500 space-x-4">
                              {task.dueDate && (
                                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                              )}
                              {task.assignee && (
                                <span>Assigned to: {task.assignee}</span>
                              )}
                              {task.tags.length > 0 && (
                                <span>Tags: {task.tags.join(', ')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Transcripts Section */}
        {meeting.transcripts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-purple-800">Transcripts</h2>
            <div className="space-y-4">
              {meeting.transcripts.map((chunk) => (
                <div key={chunk.id} className="border-l-4 border-purple-200 pl-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm text-gray-500">
                      {new Date(chunk.timestamp).toLocaleTimeString()}
                    </span>
                    {chunk.confidence && (
                      <span className="text-xs text-gray-400">
                        {Math.round(chunk.confidence * 100)}% confidence
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800">{chunk.text}</p>
                  {chunk.actionItems && chunk.actionItems.length > 0 && (
                    <div className="mt-2 ml-4">
                      <p className="text-sm font-medium text-gray-600">Action Items:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {chunk.actionItems.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-4 border-t-2 border-gray-300 text-center text-sm text-gray-500">
          <p>Generated by MeetingFlow on {new Date().toLocaleString()}</p>
        </div>
      </div>
    )
  }
)

PrintableReport.displayName = 'PrintableReport'

export default PrintableReport