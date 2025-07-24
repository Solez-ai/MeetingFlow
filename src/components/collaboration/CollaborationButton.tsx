/**
 * CollaborationButton - Button to toggle collaboration features
 */

import React, { useState } from 'react'
import { Users, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCollaborationStore } from '@/store/collaborationStore'
import { CollaborationHub } from './CollaborationHub'

interface CollaborationButtonProps {
  className?: string
}

export const CollaborationButton: React.FC<CollaborationButtonProps> = ({ className }) => {
  const [showHub, setShowHub] = useState(false)
  const { isConnected, peers } = useCollaborationStore()

  const handleClick = () => {
    setShowHub(true)
  }

  return (
    <>
      <Button
        variant={isConnected ? "default" : "outline"}
        size="sm"
        onClick={handleClick}
        className={className}
      >
        {isConnected ? (
          <Wifi className="h-4 w-4 mr-2" />
        ) : (
          <WifiOff className="h-4 w-4 mr-2" />
        )}
        <Users className="h-4 w-4 mr-2" />
        Collaborate
        {isConnected && peers.length > 0 && (
          <Badge variant="secondary" className="ml-2">
            {peers.length}
          </Badge>
        )}
      </Button>

      <CollaborationHub 
        isOpen={showHub} 
        onClose={() => setShowHub(false)} 
      />
    </>
  )
}

export default CollaborationButton