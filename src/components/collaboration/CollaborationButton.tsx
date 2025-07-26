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
        className={`${className} touch-manipulation`}
      >
        {isConnected ? (
          <Wifi className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        ) : (
          <WifiOff className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        )}
        <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">Collaborate</span>
        <span className="sm:hidden">Share</span>
        {isConnected && peers.length > 0 && (
          <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
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