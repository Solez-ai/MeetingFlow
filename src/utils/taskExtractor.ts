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