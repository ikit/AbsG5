# Manual Testing Checklist

## Overview
Comprehensive manual testing checklist for AbsG5 application post-migration.

## Test Environment Setup

### Prerequisites
- [ ] Backend running on http://localhost:3000
- [ ] Frontend running on http://localhost:5173
- [ ] PostgreSQL 16.x database running
- [ ] Test user accounts created
- [ ] Sample data loaded

### Test Browsers
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (if available)
- [ ] Mobile browsers (Chrome Mobile, Safari iOS)

### Test Devices
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

## 1. Authentication & User Management

### Login
- [ ] Login with valid credentials
- [ ] Login with invalid username
- [ ] Login with invalid password
- [ ] Login with empty fields
- [ ] Remember me functionality
- [ ] Session persistence after page refresh
- [ ] Logout functionality
- [ ] Auto-logout after session expiry

### Password Management
- [ ] Request password reset
- [ ] Receive reset email
- [ ] Reset password with valid token
- [ ] Reset password with expired token
- [ ] Change password while logged in
- [ ] Password strength validation
- [ ] Password confirmation matching

### User Profile
- [ ] View own profile
- [ ] Edit profile information
- [ ] Upload avatar
- [ ] Update email address
- [ ] View profile history
- [ ] Privacy settings

## 2. Photo Gallery & Albums

### Photo Viewing
- [ ] Browse photo gallery
- [ ] View photo details
- [ ] Navigate between photos (next/previous)
- [ ] Zoom in/out on photos
- [ ] View photo metadata (EXIF)
- [ ] Filter photos by date
- [ ] Filter photos by category
- [ ] Search photos by keywords

### Photo Upload
- [ ] Upload single photo
- [ ] Upload multiple photos
- [ ] Upload with valid file types (JPG, PNG)
- [ ] Reject invalid file types
- [ ] Reject oversized files (>50MB)
- [ ] Progress indicator during upload
- [ ] Cancel upload
- [ ] Edit photo metadata after upload

### Albums
- [ ] Create new album
- [ ] View album list
- [ ] Open album
- [ ] Add photos to album
- [ ] Remove photos from album
- [ ] Reorder photos in album
- [ ] Edit album details
- [ ] Delete album
- [ ] Share album

### Photo Editor
- [ ] Open photo editor
- [ ] Edit title
- [ ] Edit description
- [ ] Edit tags
- [ ] Edit location
- [ ] Save changes
- [ ] Cancel changes
- [ ] Delete photo

## 3. Forum

### Topic Browsing
- [ ] View forum topic list
- [ ] Sort topics by date
- [ ] Sort topics by activity
- [ ] Filter topics by category
- [ ] Search topics
- [ ] Pagination works correctly

### Reading Topics
- [ ] Open topic
- [ ] Read posts
- [ ] View post author info
- [ ] View post timestamps
- [ ] Navigate between pages
- [ ] View attachments
- [ ] View embedded images

### Creating Content
- [ ] Create new topic
- [ ] Add topic title
- [ ] Add topic content (rich text)
- [ ] Format text (bold, italic, lists)
- [ ] Add links
- [ ] Add images
- [ ] Preview before posting
- [ ] Submit topic

### Replying
- [ ] Reply to topic
- [ ] Quote previous post
- [ ] Edit own post
- [ ] Delete own post
- [ ] Report inappropriate content

## 4. AGPA (Photo Contest)

### Contest Information
- [ ] View current edition
- [ ] View contest rules
- [ ] View contest phases
- [ ] View categories
- [ ] View deadlines

### Phase 1: Submission
- [ ] Submit photo to category
- [ ] Upload photo file
- [ ] Add photo title
- [ ] Add photo description
- [ ] Select category
- [ ] Confirm submission
- [ ] View own submissions
- [ ] Edit submission (if allowed)
- [ ] Withdraw submission (if allowed)

### Phase 2: Selection
- [ ] View submitted photos (if admin)
- [ ] Select photos for voting
- [ ] Reject photos
- [ ] Add selection notes

### Phase 3: Voting
- [ ] View photos in voting
- [ ] Vote for photos
- [ ] Change votes (if allowed)
- [ ] View voting progress
- [ ] Submit final votes

### Phase 4: Results
- [ ] View results
- [ ] View winners by category
- [ ] View all participants
- [ ] View statistics
- [ ] Download certificates

### Archives
- [ ] Browse past editions
- [ ] View archive by year
- [ ] View archive by category
- [ ] View palmares (hall of fame)
- [ ] Search archives

### Monitoring (Admin)
- [ ] View submission statistics
- [ ] View voting statistics
- [ ] View participation charts
- [ ] Export data

## 5. Agenda & Events

### Calendar View
- [ ] View monthly calendar
- [ ] Navigate between months
- [ ] View events on calendar
- [ ] Click event for details

### Event List
- [ ] View upcoming events
- [ ] View past events
- [ ] Filter by event type
- [ ] Search events

### Event Details
- [ ] View event information
- [ ] View event location
- [ ] View event participants
- [ ] RSVP to event
- [ ] Add to personal calendar
- [ ] Share event

### Directory (Trombi)
- [ ] View member directory
- [ ] Search members
- [ ] Filter by criteria
- [ ] View member profile
- [ ] View member photos
- [ ] View member statistics

### Locations
- [ ] View location list
- [ ] View location on map
- [ ] Search locations
- [ ] View location details
- [ ] View events at location

## 6. Citations

### Browsing
- [ ] View citation list
- [ ] Search citations
- [ ] Filter by author
- [ ] Filter by category
- [ ] Sort citations

### Managing
- [ ] Add new citation
- [ ] Edit citation
- [ ] Delete citation
- [ ] Rate citation
- [ ] Share citation

## 7. GTheque (Library)

### Browsing
- [ ] View theque list
- [ ] Browse categories
- [ ] Search items
- [ ] Filter by type

### Item Details
- [ ] View item details
- [ ] View item images
- [ ] View item metadata
- [ ] Download files (if available)

### Grenier (Attic)
- [ ] Browse archived items
- [ ] Search archives
- [ ] View archived item details

## 8. Admin Functions

### User Management
- [ ] View user list
- [ ] Search users
- [ ] Edit user details
- [ ] Activate/deactivate users
- [ ] Assign roles
- [ ] Reset user password
- [ ] View user activity

### Dashboard
- [ ] View system statistics
- [ ] View user statistics
- [ ] View content statistics
- [ ] View activity charts

### Settings
- [ ] View system settings
- [ ] Update settings
- [ ] Test email configuration
- [ ] View logs

## 9. Notifications

### System Notifications
- [ ] Receive notifications
- [ ] View notification list
- [ ] Mark notification as read
- [ ] Mark all as read
- [ ] Delete notification
- [ ] Notification badge updates

### UI Notifications
- [ ] Success messages (snackbar)
- [ ] Info dialogs
- [ ] Warning dialogs
- [ ] Error dialogs
- [ ] Dismiss notifications

## 10. WebSocket / Real-time

### Connection
- [ ] WebSocket connects on page load
- [ ] Connection status indicator
- [ ] Reconnection on disconnect
- [ ] Connection error handling

### Real-time Updates
- [ ] Receive real-time notifications
- [ ] Receive real-time messages
- [ ] Live updates in forum
- [ ] Live updates in AGPA

## 11. Responsive Design

### Desktop (1920x1080)
- [ ] Layout correct
- [ ] Navigation accessible
- [ ] All features functional
- [ ] No horizontal scroll

### Laptop (1366x768)
- [ ] Layout adapts correctly
- [ ] Navigation accessible
- [ ] All features functional

### Tablet (768x1024)
- [ ] Mobile menu appears
- [ ] Touch interactions work
- [ ] Layout adapts correctly
- [ ] All features accessible

### Mobile (375x667)
- [ ] Mobile menu works
- [ ] Touch interactions work
- [ ] Layout stacks correctly
- [ ] Text readable without zoom
- [ ] Buttons large enough to tap
- [ ] Forms usable

## 12. Cross-Browser Testing

### Chrome/Edge
- [ ] All features work
- [ ] Layout correct
- [ ] No console errors
- [ ] Performance acceptable

### Firefox
- [ ] All features work
- [ ] Layout correct
- [ ] No console errors
- [ ] Performance acceptable

### Safari
- [ ] All features work
- [ ] Layout correct
- [ ] No console errors
- [ ] Performance acceptable

## 13. Accessibility

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Enter/Space activate buttons
- [ ] Escape closes dialogs
- [ ] Arrow keys navigate lists
- [ ] Focus visible on all elements

### Screen Reader
- [ ] Images have alt text
- [ ] Forms have labels
- [ ] Buttons have descriptive text
- [ ] Headings properly structured
- [ ] ARIA labels where needed

### Visual
- [ ] Sufficient color contrast
- [ ] Text resizable
- [ ] No information by color alone
- [ ] Focus indicators visible

## 14. Error Handling

### Network Errors
- [ ] Offline mode handling
- [ ] Timeout handling
- [ ] Server error (500) handling
- [ ] Not found (404) handling
- [ ] Unauthorized (401) handling

### Validation Errors
- [ ] Form validation messages
- [ ] Required field indicators
- [ ] Format validation (email, etc.)
- [ ] File type validation
- [ ] File size validation

### User Feedback
- [ ] Loading indicators
- [ ] Success confirmations
- [ ] Error messages clear
- [ ] Recovery options provided

## 15. Performance

### Page Load
- [ ] Initial load < 3s
- [ ] Subsequent loads faster
- [ ] No layout shift
- [ ] Images load progressively

### Interactions
- [ ] Buttons respond immediately
- [ ] Forms submit quickly
- [ ] Navigation smooth
- [ ] Animations smooth (60fps)

### Large Datasets
- [ ] Pagination works
- [ ] Infinite scroll works
- [ ] Search performs well
- [ ] Filters apply quickly

## Test Results Template

### Test Session Info
- **Date**: [Date]
- **Tester**: [Name]
- **Environment**: [Dev/Staging/Prod]
- **Browser**: [Browser + Version]
- **Device**: [Device Type]

### Results Summary
- **Total Tests**: [Number]
- **Passed**: [Number]
- **Failed**: [Number]
- **Blocked**: [Number]
- **Not Tested**: [Number]

### Issues Found
| ID | Severity | Component | Description | Steps to Reproduce |
|----|----------|-----------|-------------|-------------------|
| 1  | High     | Login     | ...         | ...               |

### Notes
[Any additional observations or comments]

## Status
⏳ **READY FOR EXECUTION**

This checklist should be used:
1. Before production deployment
2. After major updates
3. When adding new features
4. For regression testing

**Recommendation**: Execute at least critical path tests (sections 1-4) before production deployment.
