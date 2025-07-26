import React, { useState, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { QRCodeSVG } from 'qrcode.react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Meeting } from '@/types'
import { 
  exportToMarkdown, 
  generateShareableLink, 
  downloadMarkdown, 
  copyToClipboard 
} from '@/utils/exportUtils'
import PrintableReport from './PrintableReport'
import { 
  FileText, 
  Download, 
  Share2, 
  Copy, 
  ExternalLink,
  Printer,
  CheckCircle,
  QrCode
} from 'lucide-react'

interface ExportDialogProps {
  meeting: Meeting
  trigger?: React.ReactNode
}

export default function ExportDialog({ meeting, trigger }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('pdf')
  const [shareableLink, setShareableLink] = useState<string>('')
  const [markdownPreview, setMarkdownPreview] = useState<string>('')
  const [showQRCode, setShowQRCode] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Generate shareable link when dialog opens
  React.useEffect(() => {
    if (isOpen && !shareableLink) {
      try {
        const link = generateShareableLink(meeting)
        setShareableLink(link)
      } catch (error) {
        console.error('Error generating shareable link:', error)
        toast({
          title: 'Error',
          description: 'Failed to generate shareable link',
          variant: 'destructive'
        })
      }
    }
  }, [isOpen, meeting, shareableLink, toast])

  // Generate markdown preview when tab is selected
  React.useEffect(() => {
    if (activeTab === 'markdown' && !markdownPreview) {
      try {
        const markdown = exportToMarkdown(meeting)
        setMarkdownPreview(markdown)
      } catch (error) {
        console.error('Error generating markdown:', error)
        toast({
          title: 'Error',
          description: 'Failed to generate markdown preview',
          variant: 'destructive'
        })
      }
    }
  }, [activeTab, meeting, markdownPreview, toast])

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${meeting.title} - Meeting Report`,
    onAfterPrint: () => {
      toast({
        title: 'Success',
        description: 'Meeting report sent to printer',
      })
    },
    onPrintError: (error) => {
      console.error('Print error:', error)
      toast({
        title: 'Print Error',
        description: 'Failed to print the meeting report',
        variant: 'destructive'
      })
    }
  })

  const handleDownloadMarkdown = () => {
    try {
      downloadMarkdown(meeting)
      toast({
        title: 'Success',
        description: 'Markdown file downloaded successfully',
      })
    } catch (error) {
      console.error('Error downloading markdown:', error)
      toast({
        title: 'Error',
        description: 'Failed to download markdown file',
        variant: 'destructive'
      })
    }
  }

  const handleCopyLink = async () => {
    try {
      const success = await copyToClipboard(shareableLink)
      if (success) {
        toast({
          title: 'Success',
          description: 'Shareable link copied to clipboard',
        })
      } else {
        throw new Error('Copy failed')
      }
    } catch (error) {
      console.error('Error copying link:', error)
      toast({
        title: 'Error',
        description: 'Failed to copy link to clipboard',
        variant: 'destructive'
      })
    }
  }

  const handleCopyMarkdown = async () => {
    try {
      const success = await copyToClipboard(markdownPreview)
      if (success) {
        toast({
          title: 'Success',
          description: 'Markdown content copied to clipboard',
        })
      } else {
        throw new Error('Copy failed')
      }
    } catch (error) {
      console.error('Error copying markdown:', error)
      toast({
        title: 'Error',
        description: 'Failed to copy markdown to clipboard',
        variant: 'destructive'
      })
    }
  }

  const openInNewTab = () => {
    window.open(shareableLink, '_blank')
  }

  const getMeetingStats = () => {
    return {
      agendaItems: meeting.agenda.length,
      noteBlocks: meeting.notes.length,
      tasks: meeting.tasks.length,
      transcripts: meeting.transcripts.length,
      completedTasks: meeting.tasks.filter(t => t.status === 'Done').length
    }
  }

  const stats = getMeetingStats()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Export & Share
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Export & Share Meeting
          </DialogTitle>
        </DialogHeader>

        {/* Meeting Overview */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{meeting.title}</CardTitle>
            <CardDescription>
              {new Date(meeting.startTime).toLocaleDateString()} at{' '}
              {new Date(meeting.startTime).toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{stats.agendaItems} agenda items</Badge>
              <Badge variant="secondary">{stats.noteBlocks} notes</Badge>
              <Badge variant="secondary">
                {stats.completedTasks}/{stats.tasks} tasks completed
              </Badge>
              <Badge variant="secondary">{stats.transcripts} transcripts</Badge>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pdf" className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              PDF Export
            </TabsTrigger>
            <TabsTrigger value="markdown" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Markdown
            </TabsTrigger>
            <TabsTrigger value="share" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share Link
            </TabsTrigger>
          </TabsList>

          {/* PDF Export Tab */}
          <TabsContent value="pdf" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">PDF Report</CardTitle>
                <CardDescription>
                  Generate a formatted PDF report of your meeting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={handlePrint} className="flex-1">
                    <Printer className="w-4 h-4 mr-2" />
                    Print / Save as PDF
                  </Button>
                </div>
                
                <Separator />
                
                {/* PDF Preview */}
                <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                  <div className="text-sm text-gray-600 mb-2">Preview:</div>
                  <div className="scale-75 origin-top-left">
                    <PrintableReport ref={printRef} meeting={meeting} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Markdown Export Tab */}
          <TabsContent value="markdown" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Markdown Export</CardTitle>
                <CardDescription>
                  Export your meeting as a formatted Markdown document
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={handleDownloadMarkdown} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download Markdown
                  </Button>
                  <Button variant="outline" onClick={handleCopyMarkdown}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                
                <Separator />
                
                {/* Markdown Preview */}
                <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                  <div className="text-sm text-gray-600 mb-2">Preview:</div>
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {markdownPreview}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Share Link Tab */}
          <TabsContent value="share" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Shareable Link</CardTitle>
                <CardDescription>
                  Generate a link to share your meeting data with others
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={handleCopyLink} className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button variant="outline" onClick={openInNewTab}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowQRCode(!showQRCode)}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Code
                  </Button>
                </div>
                
                <Separator />
                
                {/* QR Code Display */}
                {showQRCode && (
                  <div className="flex justify-center p-4 bg-white border rounded-lg">
                    <div className="text-center space-y-2">
                      <QRCodeSVG 
                        value={shareableLink} 
                        size={200}
                        level="M"
                        includeMargin={true}
                      />
                      <div className="text-sm text-gray-600">
                        Scan to open meeting
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Link Display */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Shareable URL:</div>
                  <div className="p-3 bg-gray-50 rounded border text-sm font-mono break-all">
                    {shareableLink}
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-blue-900">Privacy Note</div>
                      <div className="text-blue-700 mt-1">
                        This link contains your meeting data encoded in the URL. 
                        Anyone with this link can view your meeting information.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}