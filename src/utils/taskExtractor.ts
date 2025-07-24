/**
 * Utility functions for extracting tasks from text
 */

/**
 * Checks if a text is likely to be an action item
 * This is a simple heuristic that looks for common action item patterns
 */
export function isLikelyActionItem(text: string): boolean {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  
  // Common action item indicators
  const actionPhrases = [
    'need to', 'should', 'must', 'will', 'todo', 'to-do', 'to do',
    'action item', 'action required', 'follow up', 'follow-up',
    'task:', 'action:', 'remember to', 'don\'t forget', 'make sure',
    'please', 'let\'s', 'we need', 'i need', 'you need'
  ];
  
  // Check if the text contains any action phrases
  return actionPhrases.some(phrase => lowerText.includes(phrase));
}

/**
 * Extracts potential tags from text
 */
export function extractPotentialTags(text: string): string[] {
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
    'epic', 'task', 'pr', 'review'
  ];
  
  const lowerText = text.toLowerCase();
  projectIndicators.forEach(indicator => {
    if (lowerText.includes(indicator)) {
      tags.push(indicator);
    }
  });
  
  // Remove duplicates and return
  return Array.from(new Set(tags));
}

/**
 * Extracts tasks from notes content
 */
export function extractTasksFromNotes(notesContent: string): Array<{
  title: string;
  description?: string;
  tags: string[];
  priority: 'Low' | 'Medium' | 'High';
}> {
  if (!notesContent) return [];
  
  const tasks: Array<{
    title: string;
    description?: string;
    tags: string[];
    priority: 'Low' | 'Medium' | 'High';
  }> = [];
  
  // Split content into lines
  const lines = notesContent.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines and headers
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;
    
    // Check if this line is likely an action item
    if (isLikelyActionItem(trimmedLine)) {
      // Clean up the text to create a task title
      let title = trimmedLine
        .replace(/^[-*•]\s*/, '') // Remove bullet points
        .replace(/^\d+\.\s*/, '') // Remove numbered lists
        .replace(/^(todo|action item|task):\s*/i, '') // Remove prefixes
        .trim();
      
      if (title.length > 0) {
        const tags = extractPotentialTags(title);
        
        // Determine priority based on keywords
        let priority: 'Low' | 'Medium' | 'High' = 'Medium';
        const lowerTitle = title.toLowerCase();
        
        if (lowerTitle.includes('urgent') || lowerTitle.includes('asap') || lowerTitle.includes('critical')) {
          priority = 'High';
        } else if (lowerTitle.includes('later') || lowerTitle.includes('eventually') || lowerTitle.includes('nice to have')) {
          priority = 'Low';
        }
        
        tasks.push({
          title,
          description: `Extracted from notes`,
          tags,
          priority
        });
      }
    }
  }
  
  return tasks;
}