# Integration Test Guide - Kanban V2
**Manual Testing Guide for Frontend-Backend Integration**

---

## Prerequisites

Before starting tests, ensure the Socket.IO namespace issue is fixed:

**File:** `/Users/brunovilefort/Desktop/chatia-final/chatia/frontend/src/services/SocketWorker.js`

**Line 20 - Must be:**
```javascript
this.socket = io(`${BACKEND_URL}/workspace-${this?.companyId}`, {
```

**NOT:**
```javascript
this.socket = io(`${BACKEND_URL}/${this?.companyId}`, {  // WRONG!
```

---

## Setup Instructions

### Step 1: Install Dependencies

#### Backend
```bash
cd /Users/brunovilefort/Desktop/chatia-final/chatia/backend
npm install
```

**Expected Result:** No errors, dependencies installed successfully

#### Frontend
```bash
cd /Users/brunovilefort/Desktop/chatia-final/chatia/frontend
npm install --legacy-peer-deps
```

**Expected Result:**
- react-trello@2.2.11 installed
- No critical errors (warnings about peer dependencies are OK)

**Verify:**
```bash
npm list react-trello
# Should show: react-trello@2.2.11
```

---

### Step 2: Start Backend Server

```bash
cd /Users/brunovilefort/Desktop/chatia-final/chatia/backend
npm run dev:server
```

**Expected Console Output:**
```
Server started on port 8080
Database connected
Socket.IO initialized
```

**Verify:**
- No error messages
- Server running on port 8080 (or configured port)
- Database connection successful

---

### Step 3: Start Frontend Server

**Terminal 2 (keep backend running):**

```bash
cd /Users/brunovilefort/Desktop/chatia-final/chatia/frontend
REACT_APP_FEATURE_KANBAN_V2=true npm start
```

**Note:** Setting `REACT_APP_FEATURE_KANBAN_V2=true` enables Kanban V2 for this session.

**Alternative (Permanent):**

Edit `.env` file:
```bash
cd /Users/brunovilefort/Desktop/chatia-final/chatia/frontend
nano .env  # or vim, code, etc.
```

Change:
```
REACT_APP_FEATURE_KANBAN_V2=false
```

To:
```
REACT_APP_FEATURE_KANBAN_V2=true
```

Save and run:
```bash
npm start
```

**Expected Result:**
- Frontend starts on `http://localhost:3000`
- Browser opens automatically
- No compilation errors

---

### Step 4: Login

1. Navigate to `http://localhost:3000`
2. Login with test credentials
3. Verify you're redirected to `/tickets` dashboard

**Expected Result:**
- Successful login
- No console errors
- Socket.IO connection established (check browser console for "Conectado ao servidor Socket.IO")

---

## Test Scenarios

### Test 1: Create Kanban Tags (Lanes)

**Objective:** Verify tags can be created and configured as Kanban lanes

#### Steps:

1. **Navigate to Tags Management**
   - URL: `http://localhost:3000/tagsKanban`
   - Verify page loads without errors

2. **Create First Tag**
   - Click "Adicionar" button
   - Fill form:
     - Name: `Novo`
     - Color: `#3B82F6` (blue)
     - Kanban: Check the checkbox (value: 1)
   - Click "Salvar"

3. **Verify Creation**
   - Toast success message appears
   - Tag appears in table
   - Tag shows in "Novo" row with blue chip
   - Tickets count shows: 0

4. **Create Second Tag**
   - Click "Adicionar" button
   - Fill form:
     - Name: `Em Andamento`
     - Color: `#F59E0B` (yellow/orange)
     - Kanban: Check the checkbox
   - Click "Salvar"

5. **Create Third Tag**
   - Name: `Concluído`
   - Color: `#10B981` (green)
   - Kanban: Check the checkbox
   - Click "Salvar"

#### Expected Results:

✅ All 3 tags created successfully
✅ Tags appear in table with correct colors
✅ No console errors
✅ Toast success messages displayed

#### Actual Results:

- [ ] PASS
- [ ] FAIL - Error: ___________________________________

---

### Test 2: View Kanban Board

**Objective:** Verify Kanban board displays lanes and tickets correctly

#### Steps:

1. **Navigate to Kanban**
   - URL: `http://localhost:3000/kanban`
   - Wait for page to load

2. **Verify Lanes**
   - Count visible lanes
   - Expected lanes:
     1. "Sem Etiqueta" (default lane for tickets without tags)
     2. "Novo" (blue)
     3. "Em Andamento" (yellow/orange)
     4. "Concluído" (green)

3. **Verify Lane Contents**
   - Each lane shows ticket count in label
   - Lanes have correct background colors
   - Default lane ("Sem Etiqueta") may have tickets if tickets exist without tags

4. **Verify Date Filters**
   - Start Date: Shows today's date
   - End Date: Shows today's date
   - "Pesquisar" button visible

5. **Verify Add Columns Button**
   - "Adicionar Colunas" button visible (if user has dashboard:view permission)
   - Click navigates back to `/tagsKanban`

#### Expected Results:

✅ 4 lanes displayed (Sem Etiqueta + 3 created tags)
✅ Lanes show correct colors
✅ Lanes show ticket counts
✅ Date filters operational
✅ No loading spinner stuck
✅ No console errors

#### Actual Results:

- [ ] PASS
- [ ] FAIL - Error: ___________________________________

---

### Test 3: Drag-and-Drop (Move Ticket)

**Objective:** Verify tickets can be moved between lanes and persist correctly

**Prerequisites:** At least 1 ticket exists in the system

#### Steps:

1. **Navigate to Kanban**
   - URL: `http://localhost:3000/kanban`
   - Wait for lanes and cards to load

2. **Identify a Ticket**
   - Look for a card in "Sem Etiqueta" lane
   - Note the ticket ID (e.g., "Ticket #123")
   - Note contact name/number

3. **Drag Card to "Novo" Lane**
   - Click and hold card
   - Drag to "Novo" (blue) lane
   - Release mouse button

4. **Verify Immediate Feedback**
   - Toast success message: "Tag adicionada com sucesso" (or similar)
   - Card disappears from "Sem Etiqueta" lane
   - Card appears in "Novo" lane
   - Lane counters update (+1 in Novo, -1 in Sem Etiqueta)

5. **Verify Network Calls (Browser DevTools)**
   - Open DevTools > Network tab
   - Check for:
     - `PUT /ticket-tags/{ticketId}/{tagId}` - Status 201
     - Response: Created TicketTag object

6. **Refresh Page**
   - Press F5 or click refresh
   - Wait for page reload

7. **Verify Persistence**
   - Card still in "Novo" lane
   - Card NOT back in "Sem Etiqueta"
   - Data persisted in database

8. **Move Card Again**
   - Drag card from "Novo" to "Em Andamento"
   - Verify toast success
   - Verify card moves visually

9. **Check Network Calls**
   - Should see TWO calls:
     1. `DELETE /ticket-tags/{ticketId}` - Remove old tag (Status 200)
     2. `PUT /ticket-tags/{ticketId}/{newTagId}` - Add new tag (Status 201)

10. **Refresh and Verify**
    - Card remains in "Em Andamento" lane
    - Persistence confirmed

#### Expected Results:

✅ Drag-and-drop works smoothly
✅ Toast success messages appear
✅ Card moves visually
✅ API calls succeed (201/200 status)
✅ Data persists after refresh
✅ Lane counters update correctly
✅ No console errors

#### Actual Results:

- [ ] PASS
- [ ] FAIL - Error: ___________________________________

**Troubleshooting:**
- If card doesn't move: Check console for errors
- If card moves but reverts: Check API response for errors
- If no toast: Check i18n translations exist

---

### Test 4: Real-time Socket.IO Updates (2 Browser Tabs)

**Objective:** Verify Socket.IO real-time updates work across multiple clients

**Prerequisites:**
- Socket.IO namespace fixed (see Prerequisites section)
- At least 1 ticket in Kanban

#### Steps:

1. **Open First Tab**
   - Browser 1: `http://localhost:3000/kanban`
   - Login if needed
   - Wait for board to load

2. **Open Second Tab**
   - Browser 1 (same browser): Open new tab
   - Navigate to `http://localhost:3000/kanban`
   - Position windows side-by-side to see both

3. **Verify Socket.IO Connection (Both Tabs)**
   - Open DevTools > Console in both tabs
   - Look for: `"Conectado ao servidor Socket.IO"`
   - Verify connection message appears in both consoles

4. **Move Card in Tab 1**
   - Tab 1: Drag a card from "Novo" to "Em Andamento"
   - Wait 1-2 seconds

5. **Verify Update in Tab 2**
   - Tab 2: Board should update automatically
   - Card should appear in "Em Andamento" lane
   - Card should disappear from "Novo" lane
   - **NO page refresh required**

6. **Verify Console Logs**
   - Tab 2 console should show:
     ```
     [Socket] Kanban update received: update
     ```

7. **Reverse Test**
   - Tab 2: Move a different card
   - Tab 1: Verify automatic update

8. **Test Multiple Rapid Moves**
   - Tab 1: Move 3 cards quickly
   - Tab 2: Verify all updates received
   - All cards should be in correct lanes

#### Expected Results:

✅ Both tabs connect to Socket.IO
✅ Move in Tab 1 updates Tab 2 automatically (1-2 seconds)
✅ Move in Tab 2 updates Tab 1 automatically
✅ Console shows `[Socket] Kanban update received: update`
✅ No page refresh needed
✅ Multiple rapid updates work correctly
✅ No console errors

#### Actual Results:

- [ ] PASS
- [ ] FAIL - Error: ___________________________________

**Troubleshooting:**
- **If Tab 2 doesn't update:**
  - Check Socket.IO namespace in SocketWorker.js (must be `/workspace-{companyId}`)
  - Check console for connection errors
  - Verify backend is emitting to correct namespace

- **If connection fails:**
  - Check backend logs for Socket.IO errors
  - Verify BACKEND_URL is correct in frontend .env
  - Check CORS settings

- **If updates are delayed >5 seconds:**
  - Check network latency
  - Verify backend isn't overloaded
  - Check for JavaScript errors blocking event handler

---

### Test 5: Multi-tenant Isolation

**Objective:** Verify users from different companies cannot see each other's data

**Prerequisites:**
- 2 companies in database (e.g., Company A with companyId=1, Company B with companyId=2)
- 2 users: User A (Company 1), User B (Company 2)
- Different browsers or incognito mode

#### Setup:

**Company A:**
- User: `userA@companyA.com`
- Password: `password123`
- CompanyId: 1

**Company B:**
- User: `userB@companyB.com`
- Password: `password456`
- CompanyId: 2

#### Steps:

1. **Company A - Create Tags**
   - Browser 1: Login as User A
   - Navigate to `/tagsKanban`
   - Create tag: "TagA" (color: red, kanban: 1)
   - Create ticket and assign to TagA (if needed)

2. **Company B - Create Tags**
   - Browser 2 (different browser or incognito): Login as User B
   - Navigate to `/tagsKanban`
   - Create tag: "TagB" (color: blue, kanban: 1)
   - Verify "TagA" is NOT visible in list

3. **Verify Tag Isolation**
   - Company A: Should see only "TagA"
   - Company B: Should see only "TagB"
   - No cross-company tag visibility

4. **Verify Kanban Board Isolation**
   - Company A: Navigate to `/kanban`
   - Verify "TagA" lane exists
   - Verify "TagB" lane does NOT exist

   - Company B: Navigate to `/kanban`
   - Verify "TagB" lane exists
   - Verify "TagA" lane does NOT exist

5. **Verify Socket.IO Isolation**
   - Company A (Browser 1): Open `/kanban` in 2 tabs (Tab A1, Tab A2)
   - Company B (Browser 2): Open `/kanban` in 2 tabs (Tab B1, Tab B2)

6. **Test Cross-Company Socket Events**
   - Tab A1: Move a card
   - Tab A2: Should update (same company) ✅
   - Tab B1 & B2: Should NOT update (different company) ✅

   - Tab B1: Move a card
   - Tab B2: Should update (same company) ✅
   - Tab A1 & A2: Should NOT update (different company) ✅

7. **Verify Console Socket Events**
   - Company A console: Should show `company-1-ticket` events only
   - Company B console: Should show `company-2-ticket` events only
   - No cross-company event names

8. **Verify Network Namespace**
   - DevTools > Network > WS (WebSocket)
   - Company A: Connected to `/workspace-1`
   - Company B: Connected to `/workspace-2`
   - Different namespaces confirmed

#### Expected Results:

✅ Tags isolated by company (no cross-visibility)
✅ Tickets isolated by company
✅ Kanban lanes isolated by company
✅ Socket.IO events isolated by company
✅ Socket namespaces different per company
✅ No data leakage between companies
✅ No console errors

#### Actual Results:

- [ ] PASS
- [ ] FAIL - Error: ___________________________________

**Security Note:** If ANY cross-company data is visible, this is a CRITICAL security issue. Report immediately.

---

### Test 6: Error Handling and Rollback

**Objective:** Verify UI handles API errors gracefully and performs rollback

#### Steps:

1. **Setup**
   - Open Kanban board: `http://localhost:3000/kanban`
   - Identify a card in "Novo" lane
   - Open DevTools > Console

2. **Simulate Backend Failure**
   - Stop backend server:
     ```bash
     # In backend terminal, press Ctrl+C
     ```
   - Wait for disconnection message in console

3. **Attempt to Move Card**
   - Drag card from "Novo" to "Em Andamento"
   - Release card

4. **Verify Error Handling**
   - Toast error message appears: "Erro ao mover ticket" (or similar)
   - Console shows error (expected)

5. **Verify Rollback (Visual)**
   - Card should return to "Novo" lane (rollback behavior depends on implementation)
   - OR: Card stays in "Em Andamento" but data not saved (will revert on refresh)

6. **Refresh Page**
   - Press F5
   - Wait for reload

7. **Verify Data Integrity**
   - Card is back in "Novo" lane (original position)
   - Move was NOT persisted
   - Data consistency maintained

8. **Restart Backend**
   - Restart backend server:
     ```bash
     cd /Users/brunovilefort/Desktop/chatia-final/chatia/backend
     npm run dev:server
     ```
   - Wait for "Server started" message

9. **Reconnection Test**
   - Frontend should reconnect automatically
   - Console: "Conectado ao servidor Socket.IO"
   - Try moving card again
   - Should work normally now

10. **Verify Rollback Logic in Code**
    - Open DevTools > Sources
    - Find: `useMoveTicket/index.js`
    - Verify catch block attempts to restore old tag:
      ```javascript
      if (oldTagId !== null && oldTagId !== "lane0") {
        await api.put(`/ticket-tags/${ticketId}/${oldTagId}`);
      }
      ```

#### Expected Results:

✅ Error toast appears on API failure
✅ Console logs error (expected behavior)
✅ Card position handled gracefully (rollback or revert on refresh)
✅ Data integrity maintained (no orphaned state)
✅ Reconnection works automatically when backend restarts
✅ Normal operation resumes after reconnection
✅ User informed of error state clearly

#### Actual Results:

- [ ] PASS
- [ ] FAIL - Error: ___________________________________

**Note:** The rollback logic in `useMoveTicket` attempts to restore the old tag if the PUT fails. However, if both DELETE and PUT fail, the ticket may be in "Sem Etiqueta" state temporarily.

---

### Test 7: Date Filtering

**Objective:** Verify date filters work correctly to show/hide tickets

**Prerequisites:** Tickets with different creation dates

#### Steps:

1. **Navigate to Kanban**
   - URL: `http://localhost:3000/kanban`
   - Wait for board to load

2. **Note Current Tickets**
   - Count total tickets visible across all lanes
   - Note ticket IDs

3. **Test Default Filter (Today)**
   - Start Date: Today (default)
   - End Date: Today (default)
   - Click "Pesquisar" button
   - Verify: Only tickets created/updated today are visible

4. **Test Date Range (Last 7 Days)**
   - Start Date: Set to 7 days ago
   - End Date: Set to today
   - Click "Pesquisar"
   - Verify: More tickets appear (if tickets exist in that range)

5. **Test Narrow Range**
   - Start Date: Set to yesterday
   - End Date: Set to yesterday
   - Click "Pesquisar"
   - Verify: Only tickets from yesterday are visible
   - May show 0 tickets if none created yesterday

6. **Test Future Date (Edge Case)**
   - Start Date: Tomorrow
   - End Date: Tomorrow
   - Click "Pesquisar"
   - Verify: No tickets shown (no future tickets should exist)

7. **Verify Network Call**
   - DevTools > Network
   - Look for: `GET /ticket/kanban?queueIds=...&startDate=...&endDate=...`
   - Verify dates in query params: `YYYY-MM-DD` format

8. **Reset to Today**
   - Start Date: Today
   - End Date: Today
   - Click "Pesquisar"
   - Verify: Back to original state

#### Expected Results:

✅ Date filters update visible tickets
✅ API call includes correct date params
✅ Date format: `YYYY-MM-DD`
✅ No tickets shown for empty date ranges
✅ Filters work with Socket.IO updates (new ticket in range appears automatically)
✅ No console errors

#### Actual Results:

- [ ] PASS
- [ ] FAIL - Error: ___________________________________

---

### Test 8: Feature Flag Toggle

**Objective:** Verify feature flag controls Kanban V2 vs Legacy

#### Steps:

1. **Disable Feature Flag**
   - Edit: `/Users/brunovilefort/Desktop/chatia-final/chatia/frontend/.env`
   - Set: `REACT_APP_FEATURE_KANBAN_V2=false`
   - Save file

2. **Restart Frontend**
   - Stop frontend (Ctrl+C)
   - Start: `npm start`
   - Wait for browser to open

3. **Navigate to Kanban**
   - URL: `http://localhost:3000/kanban`
   - Verify: **Legacy Kanban** loads (KanbanLegacy.jsx)
   - Legacy version should look different (if implemented differently)

4. **Enable Feature Flag**
   - Edit `.env` again
   - Set: `REACT_APP_FEATURE_KANBAN_V2=true`
   - Save file

5. **Restart Frontend Again**
   - Stop and restart: `npm start`

6. **Navigate to Kanban**
   - URL: `http://localhost:3000/kanban`
   - Verify: **Kanban V2** loads (index.js)
   - Should see react-trello Board component

7. **Verify Different Implementations**
   - Check DevTools > Sources
   - V2: Should load `/pages/Kanban/index.js` (319 lines)
   - Legacy: Should load `/pages/Kanban/KanbanLegacy.jsx`

#### Expected Results:

✅ Feature flag controls which Kanban version loads
✅ `false`: Legacy Kanban
✅ `true`: Kanban V2 with react-trello
✅ No errors in either mode
✅ Smooth transition between versions

#### Actual Results:

- [ ] PASS
- [ ] FAIL - Error: ___________________________________

---

## Common Issues and Troubleshooting

### Issue 1: Socket.IO Not Connecting

**Symptoms:**
- Console: No "Conectado ao servidor Socket.IO" message
- Real-time updates don't work
- Console errors: "WebSocket connection failed"

**Troubleshooting:**

1. **Check Backend is Running**
   ```bash
   curl http://localhost:8080/health  # Or your health endpoint
   ```

2. **Check BACKEND_URL**
   - File: `/Users/brunovilefort/Desktop/chatia-final/chatia/frontend/src/config/env.js`
   - Verify: `BACKEND_URL` points to correct backend (e.g., `http://localhost:8080`)

3. **Check Socket.IO Namespace**
   - File: `SocketWorker.js` line 20
   - Must be: `/workspace-${companyId}`
   - NOT: `/${companyId}`

4. **Check CORS**
   - Backend must allow frontend origin
   - Typical: `http://localhost:3000` allowed in CORS config

5. **Check Browser Console**
   - Network tab > WS (WebSocket)
   - Look for WebSocket connection
   - Status should be "101 Switching Protocols"

**Fix:**
- Fix namespace in SocketWorker.js
- Restart both backend and frontend

---

### Issue 2: react-trello Not Found

**Symptoms:**
- Error: "Cannot find module 'react-trello'"
- Build fails

**Troubleshooting:**

1. **Check Installation**
   ```bash
   cd /Users/brunovilefort/Desktop/chatia-final/chatia/frontend
   npm list react-trello
   ```

2. **Reinstall**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Verify package.json**
   ```bash
   grep "react-trello" package.json
   # Should show: "react-trello": "^2.2.11"
   ```

**Fix:**
- Run `npm install --legacy-peer-deps`
- Restart frontend

---

### Issue 3: Tags Not Appearing in Kanban

**Symptoms:**
- Tags created in TagsKanban page
- Tags don't appear as lanes in Kanban board

**Troubleshooting:**

1. **Check kanban=1 Flag**
   - In TagsKanban creation form, verify "Kanban" checkbox is CHECKED
   - This sets `kanban: 1` in database

2. **Check API Response**
   - DevTools > Network > `GET /tag/kanban`
   - Response should include your tags with `kanban: 1`

3. **Check Filter Logic**
   - File: `useKanbanTags/index.js`
   - Endpoint: `GET /tag/kanban` (should only return kanban=1 tags)

4. **Verify Backend Endpoint**
   - Check backend: TagController or TagService
   - Ensure `/tag/kanban` filters by `kanban: 1`

**Fix:**
- Re-create tags with kanban checkbox CHECKED
- Verify backend filters correctly

---

### Issue 4: Card Doesn't Move (Stays in Place)

**Symptoms:**
- Drag card, release, card snaps back to original position
- No toast message
- No error in console

**Troubleshooting:**

1. **Check draggable Prop**
   - File: `Kanban/index.js`
   - Line ~312: `draggable={!moveLoading}`
   - Verify moveLoading is not stuck at `true`

2. **Check onCardMoveAcrossLanes**
   - Prop should be: `onCardMoveAcrossLanes={handleCardMove}`
   - Verify handleCardMove is defined

3. **Check API Endpoints**
   - DevTools > Network
   - Should see DELETE and/or PUT requests
   - Check response status codes (200/201 expected)

4. **Check Ticket ID**
   - Verify card.id is a valid ticket ID
   - Check ticketId parsing: `parseInt(cardId)`

**Fix:**
- Check console for JavaScript errors
- Verify handleCardMove is called (add console.log)
- Check API responses for errors

---

### Issue 5: Multi-tenant Data Leakage

**Symptoms:**
- User from Company A sees data from Company B
- Tags/tickets from other companies visible

**CRITICAL SECURITY ISSUE**

**Troubleshooting:**

1. **Check CompanyId in Queries**
   - Backend: TicketTagController.ts
   - Verify `companyId` filter in ALL database queries
   - Lines 22, 85: `companyId` must be in WHERE clause

2. **Check JWT Token**
   - Verify `req.user.companyId` is correctly extracted from JWT
   - Check isAuth middleware

3. **Check Socket.IO Namespace**
   - Backend emits to: `/workspace-${companyId}` (unique per company)
   - Frontend connects to: `/workspace-${user.companyId}` (same)

4. **Test with 2 Companies**
   - Follow Test 5: Multi-tenant Isolation
   - Verify NO cross-company visibility

**Fix:**
- Add/verify `companyId` filter in all backend queries
- Report security issue immediately if confirmed

---

## Test Results Summary Template

After completing all tests, fill in this summary:

### Test Results

| Test | Status | Notes |
|------|--------|-------|
| 1. Create Kanban Tags | [ ] PASS [ ] FAIL | |
| 2. View Kanban Board | [ ] PASS [ ] FAIL | |
| 3. Drag-and-Drop | [ ] PASS [ ] FAIL | |
| 4. Real-time Socket.IO | [ ] PASS [ ] FAIL | |
| 5. Multi-tenant Isolation | [ ] PASS [ ] FAIL | |
| 6. Error Handling/Rollback | [ ] PASS [ ] FAIL | |
| 7. Date Filtering | [ ] PASS [ ] FAIL | |
| 8. Feature Flag Toggle | [ ] PASS [ ] FAIL | |

### Issues Found

1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

### Overall Assessment

- [ ] Ready for Production
- [ ] Needs Minor Fixes
- [ ] Needs Major Fixes
- [ ] Not Ready (Critical Issues)

**Tester Name:** _______________________
**Test Date:** _______________________
**Environment:** Dev / Staging / Production

---

## Next Steps After Testing

### If All Tests Pass

1. Merge feature branch to main
2. Deploy to staging environment
3. Run E2E automated tests (if available)
4. Deploy to production with feature flag OFF
5. Enable feature flag for beta users
6. Monitor logs and Sentry for errors
7. Gradually roll out to all users

### If Tests Fail

1. Document failures in "Test Results Summary"
2. Create bug tickets for each issue
3. Prioritize: Critical > Major > Minor
4. Fix issues
5. Re-run failed tests
6. Repeat until all tests pass

---

**Guide Version:** 1.0
**Last Updated:** 2025-10-13
**Maintained By:** Integration Validation Specialist
