import { useMobileDetection } from '@/hooks/useMobileDetection'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ResponsiveTest() {
  const { isMobile, isTablet, isDesktop, isTouchDevice, screenSize, orientation } = useMobileDetection()
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Device Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Screen Size:</span>
          <Badge variant="outline">{screenSize}</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm">Orientation:</span>
          <Badge variant="outline">{orientation}</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm">Touch Device:</span>
          <Badge variant={isTouchDevice ? "default" : "secondary"}>
            {isTouchDevice ? "Yes" : "No"}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">Mobile:</span>
            <Badge variant={isMobile ? "default" : "secondary"}>
              {isMobile ? "Yes" : "No"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">Tablet:</span>
            <Badge variant={isTablet ? "default" : "secondary"}>
              {isTablet ? "Yes" : "No"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">Desktop:</span>
            <Badge variant={isDesktop ? "default" : "secondary"}>
              {isDesktop ? "Yes" : "No"}
            </Badge>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground mt-4">
          Window: {window.innerWidth} × {window.innerHeight}
        </div>
      </CardContent>
    </Card>
  )
}