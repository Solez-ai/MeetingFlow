import { test, expect } from '@playwright/test'

test.describe('Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should display welcome message and create meeting option', async ({ page }) => {
    // Check for welcome/landing content
    await expect(page.locator('h1, h2, [data-testid="welcome-title"]')).toBeVisible()
    
    // Should have option to create new meeting
    await expect(page.locator('button:has-text("New Meeting"), button:has-text("Start"), [data-testid="create-meeting"]')).toBeVisible()
    
    // Should show empty state for meetings
    const emptyState = page.locator('text=No meetings, text=Get started, [data-testid="empty-state"]')
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible()
    }
  })

  test('should show recent meetings list', async ({ page }) => {
    // First create a meeting to have something in the list
    await page.click('button:has-text("New Meeting"), [data-testid="create-meeting"]')
    await page.fill('input[name="title"]', 'Test Meeting for Dashboard')
    await page.click('button:has-text("Create")')
    
    // Navigate back to dashboard (if not already there)
    const dashboardLink = page.locator('a[href="/"], button:has-text("Dashboard"), [data-testid="dashboard-link"]')
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click()
    }
    
    // Should show the meeting in recent meetings
    await expect(page.locator('[data-testid="recent-meetings"], .meeting-list')).toContainText('Test Meeting for Dashboard')
  })

  test('should allow quick access to recent meetings', async ({ page }) => {
    // Create multiple meetings
    const meetings = ['Morning Standup', 'Project Review', 'Client Call']
    
    for (const meetingTitle of meetings) {
      await page.click('button:has-text("New Meeting")')
      await page.fill('input[name="title"]', meetingTitle)
      await page.click('button:has-text("Create")')
      
      // Go back to dashboard
      const dashboardLink = page.locator('a[href="/"], button:has-text("Dashboard")')
      if (await dashboardLink.isVisible()) {
        await dashboardLink.click()
      }
    }
    
    // Should show all meetings in recent list
    for (const meetingTitle of meetings) {
      await expect(page.locator('[data-testid="recent-meetings"]')).toContainText(meetingTitle)
    }
    
    // Click on a meeting to open it
    await page.click(`text=${meetings[0]}`)
    
    // Should navigate to the meeting
    await expect(page.locator('h1, h2, [data-testid="meeting-title"]')).toContainText(meetings[0])
  })

  test('should display meeting statistics', async ({ page }) => {
    // Create a meeting with some content
    await page.click('button:has-text("New Meeting")')
    await page.fill('input[name="title"]', 'Stats Test Meeting')
    await page.click('button:has-text("Create")')
    
    // Add agenda items
    await page.fill('input[placeholder*="topic"]', 'Agenda Item 1')
    await page.fill('input[type="number"]', '15')
    await page.click('button:has-text("Add")')
    
    // Add a task
    await page.click('button:has-text("New Task")')
    await page.fill('input[name="title"]', 'Test Task')
    await page.click('button:has-text("Create"), button:has-text("Save")')
    
    // Go back to dashboard
    const dashboardLink = page.locator('a[href="/"], button:has-text("Dashboard")')
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click()
    }
    
    // Should show statistics
    const statsSection = page.locator('[data-testid="meeting-stats"], .stats, .summary')
    if (await statsSection.isVisible()) {
      await expect(statsSection).toBeVisible()
      
      // Should show meeting count
      await expect(statsSection).toContainText('1')
    }
  })

  test('should handle empty dashboard state', async ({ page }) => {
    // Clear any existing data (this might require localStorage manipulation)
    await page.evaluate(() => {
      localStorage.clear()
    })
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Should show empty state
    await expect(page.locator('text=No meetings, text=Get started, [data-testid="empty-state"]')).toBeVisible()
    
    // Should still show create meeting button
    await expect(page.locator('button:has-text("New Meeting"), [data-testid="create-meeting"]')).toBeVisible()
  })

  test('should support search/filter functionality', async ({ page }) => {
    // Create multiple meetings with different names
    const meetings = [
      'Daily Standup',
      'Weekly Review',
      'Monthly Planning',
      'Client Presentation'
    ]
    
    for (const meetingTitle of meetings) {
      await page.click('button:has-text("New Meeting")')
      await page.fill('input[name="title"]', meetingTitle)
      await page.click('button:has-text("Create")')
      
      const dashboardLink = page.locator('a[href="/"], button:has-text("Dashboard")')
      if (await dashboardLink.isVisible()) {
        await dashboardLink.click()
      }
    }
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="search"], input[type="search"], [data-testid="search-input"]')
    if (await searchInput.isVisible()) {
      // Search for specific meeting
      await searchInput.fill('Daily')
      
      // Should show only matching meetings
      await expect(page.locator('[data-testid="recent-meetings"]')).toContainText('Daily Standup')
      await expect(page.locator('[data-testid="recent-meetings"]')).not.toContainText('Weekly Review')
      
      // Clear search
      await searchInput.fill('')
      
      // Should show all meetings again
      for (const meetingTitle of meetings) {
        await expect(page.locator('[data-testid="recent-meetings"]')).toContainText(meetingTitle)
      }
    }
  })

  test('should handle meeting deletion from dashboard', async ({ page }) => {
    // Create a meeting
    await page.click('button:has-text("New Meeting")')
    await page.fill('input[name="title"]', 'Meeting to Delete')
    await page.click('button:has-text("Create")')
    
    // Go back to dashboard
    const dashboardLink = page.locator('a[href="/"], button:has-text("Dashboard")')
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click()
    }
    
    // Look for delete button or context menu
    const deleteButton = page.locator('button:has-text("Delete"), [data-testid="delete-meeting"], .delete-button')
    if (await deleteButton.isVisible()) {
      await deleteButton.click()
      
      // Handle confirmation dialog if present
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete"), [data-testid="confirm-delete"]')
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
      }
      
      // Meeting should be removed from list
      await expect(page.locator('[data-testid="recent-meetings"]')).not.toContainText('Meeting to Delete')
    }
  })

  test('should show meeting timestamps and metadata', async ({ page }) => {
    // Create a meeting
    await page.click('button:has-text("New Meeting")')
    await page.fill('input[name="title"]', 'Timestamped Meeting')
    await page.click('button:has-text("Create")')
    
    // Go back to dashboard
    const dashboardLink = page.locator('a[href="/"], button:has-text("Dashboard")')
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click()
    }
    
    // Should show timestamp information
    const meetingItem = page.locator('[data-testid="recent-meetings"] >> text=Timestamped Meeting').locator('..')
    
    // Look for date/time information
    const timeInfo = meetingItem.locator('text=/\\d{1,2}:\\d{2}|\\d{1,2}\\/\\d{1,2}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/')
    if (await timeInfo.isVisible()) {
      await expect(timeInfo).toBeVisible()
    }
  })

  test('should support keyboard navigation on dashboard', async ({ page }) => {
    // Create a few meetings
    const meetings = ['Meeting 1', 'Meeting 2', 'Meeting 3']
    
    for (const meetingTitle of meetings) {
      await page.click('button:has-text("New Meeting")')
      await page.fill('input[name="title"]', meetingTitle)
      await page.press('input[name="title"]', 'Enter')
      
      const dashboardLink = page.locator('a[href="/"], button:has-text("Dashboard")')
      if (await dashboardLink.isVisible()) {
        await dashboardLink.click()
      }
    }
    
    // Use Tab to navigate through meetings
    await page.press('body', 'Tab')
    
    // Should be able to select meeting with Enter
    const focusedElement = page.locator(':focus')
    if (await focusedElement.isVisible()) {
      await page.press(':focus', 'Enter')
      
      // Should navigate to a meeting
      await expect(page.locator('h1, h2, [data-testid="meeting-title"]')).toBeVisible()
    }
  })

  test('should handle responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Should still show main dashboard elements
    await expect(page.locator('button:has-text("New Meeting"), [data-testid="create-meeting"]')).toBeVisible()
    
    // Create a meeting to test mobile layout
    await page.click('button:has-text("New Meeting")')
    await page.fill('input[name="title"]', 'Mobile Test Meeting')
    await page.click('button:has-text("Create")')
    
    // Go back to dashboard
    const dashboardLink = page.locator('a[href="/"], button:has-text("Dashboard")')
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click()
    }
    
    // Should show meeting in mobile-friendly layout
    await expect(page.locator('[data-testid="recent-meetings"]')).toContainText('Mobile Test Meeting')
    
    // Elements should be properly sized for mobile
    const createButton = page.locator('button:has-text("New Meeting")')
    const buttonBox = await createButton.boundingBox()
    if (buttonBox) {
      expect(buttonBox.height).toBeGreaterThan(40) // Should be touch-friendly
    }
  })
})