import { TranscriptChunk } from '@/types'

/**
 * Action item patterns for different languages and formats
 */
const ACTION_PATTERNS = {
  // Task assignments
  assignments: [
    // Standard task assignments
    /\b(you|we|I|they|he|she|team|group)\s+(need|should|must|will|have\s+to|going\s+to)\s+(.+?)(?:\.|$)/i,
    /\b(assign|assigned|give|given|delegate|delegated|task|tasked)\s+(.+?)(?:\.|$)/i,
    /\b(please|kindly)\s+(.+?)(?:\.|$)/i,
    /\b(let's|lets)\s+(.+?)(?:\.|$)/i,
    
    // Explicit action items
    /\b(action\s+item|todo|to-do|to\s+do|task)[:;]\s*(.+?)(?:\.|$)/i,
    /\b(follow\s+up|follow-up)[:;]?\s*(.+?)(?:\.|$)/i,
    /\b(remember\s+to|don't\s+forget\s+to|make\s+sure\s+to)\s+(.+?)(?:\.|$)/i,
    
    // Commitments and agreements
    /\b(I'll|I\s+will|we'll|we\s+will|they'll|they\s+will)\s+(.+?)(?:\.|$)/i,
    /\b(agreed\s+to|committed\s+to|promised\s+to)\s+(.+?)(?:\.|$)/i,
    
    // Responsibility assignments
    /\b(\w+)\s+(is|are|will\s+be)\s+(responsible\s+for|in\s+charge\s+of|taking\s+care\s+of|handling)\s+(.+?)(?:\.|$)/i,
    /\b(responsibility|ownership)\s+for\s+(.+?)\s+(goes\s+to|assigned\s+to|given\s+to)\s+(\w+)(?:\.|$)/i,
  ],
  
  // Deadline patterns
  deadlines: [
    // Day references
    /\b(by|before|due|until|on)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today|next\s+week|next\s+month|end\s+of\s+day|eod|end\s+of\s+week|eow|end\s+of\s+month|eom)\b/i,
    
    // Date formats
    /\b(by|before|due|until|on)\s+(\d{1,2}(?:st|nd|rd|th)?(?:\s+of)?\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?))/i,
    /\b(by|before|due|until|on)\s+(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i,
    
    // Relative time references
    /\b(in|within|after)\s+(\d+)\s+(day|days|week|weeks|month|months|hour|hours|minute|minutes)\b/i,
    /\b(by|before|due|until|on)\s+(this|next|coming)\s+(week|month|quarter|year|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    
    // Time of day
    /\b(by|before|due|until|on)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM))\b/i,
    /\b(by|before|due|until|on)\s+(noon|midnight|morning|afternoon|evening|close\s+of\s+business|cob)\b/i,
  ],
  
  // Priority indicators
  priorities: [
    // High priority
    /\b(urgent|important|critical|high\s+priority|asap|as\s+soon\s+as\s+possible|right\s+away|immediately|top\s+priority|highest\s+priority|p0|p1|priority\s+1|priority\s+0)\b/i,
    
    // Medium priority
    /\b(medium\s+priority|moderate\s+priority|p2|priority\s+2|normal\s+priority|standard\s+priority)\b/i,
    
    // Low priority
    /\b(low\s+priority|when\s+you\s+have\s+time|no\s+rush|whenever|if\s+you\s+get\s+a\s+chance|p3|p4|priority\s+3|priority\s+4|lowest\s+priority)\b/i,
  ],
  
  // Assignee patterns
  assignees: [
    // Direct assignments
    /\b(\w+)\s+(will|should|needs\s+to|has\s+to|is\s+going\s+to)\s+(.+?)(?:\.|$)/i,
    /\b(assign|assigned|give|given|delegate|delegated)\s+to\s+(\w+)(?:\.|$)/i,
    
    // Ownership statements
    /\b(\w+)'s\s+responsibility\b/i,
    /\b(\w+)\s+owns\s+this\b/i,
    /\b(\w+)\s+is\s+the\s+owner\b/i,
  ]
}

/**
 * Analyzes text to determine if it contains an action item
 * @param text The text to analyze
 * @returns Object with isActionItem flag and confidence score
 */
export function analyzeActionItem(text: string): { 
  isActionItem: boolean; 
  confidence: number;
  actionText?: string;
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  assignee?: string;
} {
  if (!text) {
    return { isActionItem: false, confidence: 0 };
  }
  
  let confidence = 0;
  let actionText: string | undefined;
  let priority: 'Low' | 'Medium' | 'High' | undefined;
  let dueDate: string | undefined;
  let assignee: string | undefined;
  
  // Check for assignment patterns
  for (const pattern of ACTION_PATTERNS.assignments) {
    const match = text.match(pattern);
    if (match) {
      confidence += 0.4;
      // Extract the action text from the appropriate capture group
      actionText = match[match.length - 1].trim();
      break;
    }
  }
  
  // Check for deadline patterns
  for (const pattern of ACTION_PATTERNS.deadlines) {
    const match = text.match(pattern);
    if (match) {
      confidence += 0.3;
      // Extract potential due date
      const rawDate = match[2].trim();
      
      // Try to parse the date more intelligently
      try {
        let parsedDate: Date | null = null;
        
        // Handle relative dates
        if (/tomorrow/i.test(rawDate)) {
          parsedDate = new Date();
          parsedDate.setDate(parsedDate.getDate() + 1);
        } 
        else if (/next\s+week/i.test(rawDate)) {
          parsedDate = new Date();
          parsedDate.setDate(parsedDate.getDate() + 7);
        }
        else if (/next\s+month/i.test(rawDate)) {
          parsedDate = new Date();
          parsedDate.setMonth(parsedDate.getMonth() + 1);
        }
        else if (/end\s+of\s+day|eod/i.test(rawDate)) {
          parsedDate = new Date();
        }
        else if (/end\s+of\s+week|eow/i.test(rawDate)) {
          parsedDate = new Date();
          // Calculate days until Friday
          const dayOfWeek = parsedDate.getDay();
          const daysUntilFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 5 + (7 - dayOfWeek);
          parsedDate.setDate(parsedDate.getDate() + daysUntilFriday);
        }
        else if (/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i.test(rawDate)) {
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const targetDay = dayNames.findIndex(day => new RegExp(day, 'i').test(rawDate));
          
          if (targetDay !== -1) {
            parsedDate = new Date();
            const currentDay = parsedDate.getDay();
            let daysToAdd = targetDay - currentDay;
            if (daysToAdd <= 0) daysToAdd += 7; // Next week if today or already passed
            parsedDate.setDate(parsedDate.getDate() + daysToAdd);
          }
        }
        else {
          // Try to parse as a date string
          parsedDate = new Date(rawDate);
          if (isNaN(parsedDate.getTime())) {
            parsedDate = null;
          }
        }
        
        // Format the date if we successfully parsed it
        if (parsedDate && !isNaN(parsedDate.getTime())) {
          dueDate = parsedDate.toISOString().split('T')[0];
        } else {
          // Fallback to showing the raw text
          dueDate = rawDate;
        }
      } catch (e) {
        // If date parsing fails, just use the raw text
        dueDate = rawDate;
      }
      
      break;
    }
  }
  
  // Check for assignee patterns
  for (const pattern of ACTION_PATTERNS.assignees) {
    const match = text.match(pattern);
    if (match) {
      // The first capture group should be the assignee name
      assignee = match[1].trim();
      confidence += 0.2;
      break;
    }
  }
  
  // Check for priority indicators
  const lowerText = text.toLowerCase();
  if (/(urgent|important|critical|high\s+priority|asap|as\s+soon\s+as\s+possible|right\s+away|immediately|top\s+priority|p0|p1)/i.test(lowerText)) {
    confidence += 0.2;
    priority = 'High';
  } else if (/(medium\s+priority|p2|priority\s+2|normal\s+priority)/i.test(lowerText)) {
    confidence += 0.1;
    priority = 'Medium';
  } else if (/(low\s+priority|when\s+you\s+have\s+time|no\s+rush|whenever|p3|p4)/i.test(lowerText)) {
    confidence += 0.1;
    priority = 'Low';
  } else {
    // Default priority
    priority = 'Medium';
  }
  
  // Additional confidence boosters
  if (text.includes('!')) confidence += 0.1;
  if (text.length > 10 && text.length < 100) confidence += 0.1; // Ideal action item length
  if (dueDate) confidence += 0.1; // Having a due date increases confidence
  if (assignee) confidence += 0.1; // Having an assignee increases confidence
  
  // Determine if this is likely an action item based on confidence score
  const isActionItem = confidence >= 0.4;
  
  return {
    isActionItem,
    confidence,
    actionText: actionText || text,
    priority,
    dueDate,
    assignee
  };
}

/**
 * Extracts potential tags from text
 * @param text The text to analyze
 * @returns Array of potential tags
 */
export function extractTags(text: string): string[] {
  if (!text) return [];
  
  const tags: string[] = [];
  
  // Extract hashtags
  const hashtagRegex = /#(\w+)/g;
  let match;
  while ((match = hashtagRegex.exec(text)) !== null) {
    tags.push(match[1]);
  }
  
  // Extract common project indicators
  const projectIndicators = [
    'project', 'feature', 'bug', 'issue', 'ticket', 'story',
    'epic', 'task', 'pr', 'review', 'meeting', 'call', 'discussion'
  ];
  
  const lowerText = text.toLowerCase();
  projectIndicators.forEach(indicator => {
    if (lowerText.includes(indicator)) {
      tags.push(indicator);
    }
  });
  
  // Extract potential people/assignees
  const peopleIndicators = [
    /\b(assign|assigned)\s+to\s+(\w+)\b/i,
    /\b(\w+)\s+will\s+(do|handle|take\s+care\s+of)\b/i,
    /\b(\w+)\s+is\s+responsible\s+for\b/i
  ];
  
  peopleIndicators.forEach(pattern => {
    const match = text.match(pattern);
    if (match && match[2]) {
      tags.push(`assignee:${match[2].toLowerCase()}`);
    }
  });
  
  // Remove duplicates and return
  return Array.from(new Set(tags));
}

/**
 * Processes a transcript chunk to identify action items
 * @param chunk The transcript chunk to process
 * @returns The processed chunk with action items identified
 */
export function processTranscriptChunk(chunk: TranscriptChunk): TranscriptChunk {
  // Split the text into sentences for more granular analysis
  const sentences = chunk.text.split(/(?<=[.!?])\s+/);
  
  const actionItems: string[] = [];
  
  sentences.forEach(sentence => {
    const analysis = analyzeActionItem(sentence);
    if (analysis.isActionItem && analysis.actionText) {
      actionItems.push(analysis.actionText);
    }
  });
  
  // If we found action items, add them to the chunk
  if (actionItems.length > 0) {
    return {
      ...chunk,
      actionItems
    };
  }
  
  return chunk;
}

/**
 * Processes an array of transcript chunks to identify action items
 * @param chunks Array of transcript chunks to process
 * @returns Array of processed chunks with action items identified
 */
export function processTranscriptChunks(chunks: TranscriptChunk[]): TranscriptChunk[] {
  return chunks.map(processTranscriptChunk);
}

/**
 * Extracts all action items from an array of transcript chunks
 * @param chunks Array of transcript chunks
 * @returns Array of action items with metadata
 */
export function extractActionItems(chunks: TranscriptChunk[]): Array<{
  text: string;
  confidence: number;
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  assignee?: string;
  tags: string[];
  sourceChunkId: string;
  timestamp: number;
}> {
  const actionItems: Array<{
    text: string;
    confidence: number;
    priority: 'Low' | 'Medium' | 'High';
    dueDate?: string;
    assignee?: string;
    tags: string[];
    sourceChunkId: string;
    timestamp: number;
  }> = [];
  
  chunks.forEach(chunk => {
    // Split the text into sentences for more granular analysis
    const sentences = chunk.text.split(/(?<=[.!?])\s+/);
    
    sentences.forEach(sentence => {
      const analysis = analyzeActionItem(sentence);
      if (analysis.isActionItem && analysis.actionText) {
        // Generate tags, including the assignee as a tag if present
        const tags = extractTags(sentence);
        if (analysis.assignee && !tags.includes(`assignee:${analysis.assignee.toLowerCase()}`)) {
          tags.push(`assignee:${analysis.assignee.toLowerCase()}`);
        }
        
        actionItems.push({
          text: analysis.actionText,
          confidence: analysis.confidence,
          priority: analysis.priority || 'Medium',
          dueDate: analysis.dueDate,
          assignee: analysis.assignee,
          tags,
          sourceChunkId: chunk.id,
          timestamp: chunk.timestamp
        });
      }
    });
  });
  
  return actionItems;
}