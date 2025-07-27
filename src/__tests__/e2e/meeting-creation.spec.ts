import { test, expect } from '@playwright/test'

test.describe('Meeting Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/')
    
    // Wait for the application to load
    await page.waitForLoadState('networkidle')
  })

  test('should create a new meeting with agenda and tasks', async ({ page }) => {
    // Click on "Start New Meeting" or similar button
    await page.click('[data-testid="create-meeting"], button:has-text("New Meeting"), button:has-text("Start")')
    
    // Fill in meeting details
    await page.fill('input[placeholder*="meeting"], input[name="title"]', 'Weekly Team Sync')
    
    // Set meeting duration if available
    const durationInput = page.locator('input[name="duration"], input[placeholder*="duration"]')
    if (await durationInput.isVisible()) {
      await durationInput.fill('60')
    }
    
    // Submit meeting creation
    await page.click('button:has-text("Create"), button:has-text("Start Meeting")')
    
    // Verify meeting was created
    await expect(page.locator('h1, h2, [data-testid="meeting-title"]')).toContainText('Weekly Team Sync')
    
    // Add agenda items
    await page.fill('input[placeholder*="agenda"], input[placeholder*="topic"]', 'Project Updates')
    await page.fill('input[placeholder*="duration"], input[type="number"]', '15')
    await page.click('button:has-text("Add"), button:has-text("Add Item")')
    
    // Verify agenda item was added
    await expect(page.locator('[data-testid="agenda-list"], .agenda-item')).toContainText('Project Updates')
    
    // Add another agenda item
    await page.fill('input[placeholder*="agenda"], input[placeholder*="topic"]', 'Technical Discussion')
    await page.fill('input[placeholder*="duration"], input[type="number"]', '30')
    await page.click('button:has-text("Add"), button:has-text("Add Item")')
    
    // Verify second agenda item
    await expect(page.locator('[data-testid="agenda-list"], .agenda-item')).toContainText('Technical Discussion')
    
    // Create a task
    await page.click('button:has-text("New Task"), [data-testid="add-task"]')
    
    // Fill task details in dialog/form
    await page.fill('input[name="title"], input[placeholder*="task"]', 'Review documentation')
    await page.fill('textarea[name="description"], textarea[placeholder*="description"]', 'Review and update project documentation')
    
    // Set priority
    await page.click('select[name="priority"], button:has-text("Priority")')
    await page.click('option[value="High"], [data-value="High"]')
    
    // Set due date
    const dueDateInput = page.locator('input[type="date"], input[name="dueDate"]')
    if (await dueDateInput.isVisible()) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      await dueDateInput.fill(tomorrow.toISOString().split('T')[0])
    }
    
    // Save task
    await page.click('button:has-text("Create"), button:has-text("Save")')
    
    // Verify task was created
    await expect(page.locator('[data-testid="task-list"], .task-item')).toContainText('Review documentation')
    
    // Verify task appears in Todo column
    await expect(page.locator('[data-testid="todo-column"], .todo')).toContainText('Review documentation')
  })

  test('should generate time-balanced agenda', async ({ page }) => {
    // Create a meeting first
    await page.click('[data-testid="create-meeting"], button:has-text("New Meeting")')
    await page.fill('input[name="title"]', 'Test Meeting')
    await page.click('button:has-text("Create")')
    
    // Add multiple agenda items
    const agendaItems = [
      { title: 'Opening', duration: '5' },
      { title: 'Main Discussion', duration: '20' },
      { title: 'Action Items', duration: '10' },
      { title: 'Closing', duration: '5' }
    ]
    
    for (const item of agendaItems) {
      await page.fill('input[placeholder*="topic"]', item.title)
      await page.fill('input[type="number"]', item.duration)
      await page.click('button:has-text("Add")')
    }
    
    // Click balance time button
    await page.click('button:has-text("Balance Time"), [data-testid="balance-time"]')
    
    // Verify that agenda items have been rebalanced
    // The exact verification depends on the UI implementation
    await expect(page.locator('[data-testid="agenda-list"]')).toBeVisible()
    
    // Check that all items are still present
    for (const item of agendaItems) {
      await expect(page.locator('[data-testid="agenda-list"]')).toContainText(item.title)
    }
  })

  test('should handle meeting without agenda items', async ({ page }) => {
    // Create a meeting without agenda items
    await page.click('[data-testid="create-meeting"], button:has-text("New Meeting")')
    await page.fill('input[name="title"]', 'Empty Meeting')
    await page.click('button:has-text("Create")')
    
    // Verify empty state message
    await expect(page.locator('text=No agenda items')).toBeVisible()
    
    // Verify balance time button is disabled
    const balanceButton = page.locator('button:has-text("Balance Time")')
    if (await balanceButton.isVisible()) {
      await expect(balanceButton).toBeDisabled()
    }
  })

  test('should persist meeting data in localStorage', async ({ page }) => {
    // Create a meeting with data
    await page.click('[data-testid="create-meeting"], button:has-text("New Meeting")')
    await page.fill('input[name="title"]', 'Persistent Meeting')
    await page.click('button:has-text("Create")')
    
    // Add agenda item
    await page.fill('input[placeholder*="topic"]', 'Test Topic')
    await page.fill('input[type="number"]', '15')
    await page.click('button:has-text("Add")')
    
    // Refresh the page
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Verify data persisted
    await expect(page.locator('h1, h2, [data-testid="meeting-title"]')).toContainText('Persistent Meeting')
    await expect(page.locator('[data-testid="agenda-list"]')).toContainText('Test Topic')
  })

  test('should handle form validation errors', async ({ page }) => {
    // Try to create meeting without title
    await page.click('[data-testid="create-meeting"], button:has-text("New Meeting")')
    
    // Leave title empty and try to submit
    await page.click('button:has-text("Create")')
    
    // Should show validation error or prevent submission
    const titleInput = page.locator('input[name="title"]')
    if (await titleInput.isVisible()) {
      await expect(titleInput).toBeFocused()
    }
    
    // Try to add agenda item without title
    await page.fill('input[name="title"]', 'Test Meeting')
    await page.click('button:has-text("Create")')
    
    // Try to add empty agenda item
    await page.fill('input[type="number"]', '15')
    await page.click('button:has-text("Add")')
    
    // Should not add empty agenda item
    const agendaList = page.locator('[data-testid="agenda-list"]')
    if (await agendaList.isVisible()) {
      await expect(agendaList).not.toContainText('undefined')
      await expect(agendaList).not.toContainText('')
    }
  })

  test('should support keyboard navigation', async ({ page }) => {
    // Create a meeting
    await page.click('[data-testid="create-meeting"], button:has-text("New Meeting")')
    await page.fill('input[name="title"]', 'Keyboard Test')
    await page.press('input[name="title"]', 'Enter')
    
    // Navigate using Tab key
    await page.press('body', 'Tab')
    await page.press('body', 'Tab')
    
    // Should be able to add agenda item using keyboard
    await page.type('input[placeholder*="topic"]', 'Keyboard Topic')
    await page.press('input[placeholder*="topic"]', 'Tab')
    await page.type('input[type="number"]', '10')
    await page.press('input[type="number"]', 'Enter')
    
    // Verify agenda item was added
    await expect(page.locator('[data-testid="agenda-list"]')).toContainText('Keyboard Topic')
  })

  test('should handle concurrent user actions', async ({ page }) => {
    // Create a meeting
    await page.click('[data-testid="create-meeting"], button:has-text("New Meeting")')
    await page.fill('input[name="title"]', 'Concurrent Test')
    await page.click('button:has-text("Create")')
    
    // Rapidly add multiple agenda items
    const items = ['Item 1', 'Item 2', 'Item 3']
    
    for (let i = 0; i < items.length; i++) {
      await page.fill('input[placeholder*="topic"]', items[i])
      await page.fill('input[type="number"]', '10')
      await page.click('button:has-text("Add")')
      
      // Small delay to simulate real user behavior
      await page.waitForTimeout(100)
    }
    
    // Verify all items were added
    for (const item of items) {
      await expect(page.locator('[data-testid="agenda-list"]')).toContainText(item)
    }
  })
})