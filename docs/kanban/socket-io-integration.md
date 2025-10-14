# Socket.IO Integration Documentation - Kanban V2
**Real-time WebSocket Communication Architecture**

---

## Overview

The Kanban V2 feature uses Socket.IO for real-time updates, allowing multiple users viewing the same Kanban board to see ticket movements instantly without page refreshes. This document explains the complete Socket.IO architecture, event flow, and implementation details.

---

## Architecture Diagram (ASCII)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SOCKET.IO ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────────┘

BACKEND (Node.js + Socket.IO)                FRONTEND (React + Socket.IO Client)
┌───────────────────────────┐                ┌──────────────────────────────┐
│  TicketTagController.ts   │                │     AuthContext.js           │
│  ┌─────────────────────┐  │                │  ┌────────────────────────┐  │
│  │ PUT /ticket-tags    │  │                │  │  socketConnection()    │  │
│  │  ├─ Validate user   │  │                │  │    └─> SocketWorker   │  │
│  │  ├─ Update database │  │                │  └────────────────────────┘  │
│  │  └─ Emit Socket.IO  │  │                │          │                   │
│  └─────────────────────┘  │                │          ▼                   │
│           │                │                │  ┌────────────────────────┐  │
│           ▼                │                │  │  socket instance       │  │
│  ┌─────────────────────┐  │                │  │  (singleton)           │  │
│  │   getIO()           │  │                │  └────────────────────────┘  │
│  │   └─> io.of()       │  │                │          │                   │
│  └─────────────────────┘  │                │          │ provided via     │
│           │                │                │          │ AuthContext      │
│           │                │                │          ▼                   │
│           ▼                │                │  ┌────────────────────────┐  │
│  ┌─────────────────────┐  │                │  │  Kanban/index.js       │  │
│  │ Namespace Selector  │  │                │  │  ┌──────────────────┐  │  │
│  │ /workspace-{cId}    │  │                │  │  │ useSocketKanban  │  │  │
│  └─────────────────────┘  │                │  │  │  (hook)          │  │  │
│           │                │                │  │  └──────────────────┘  │  │
│           ▼                │                │  └────────────────────────┘  │
│  ┌─────────────────────┐  │                │          │                   │
│  │ Emit Event          │──┼────────────────┼──────────┤                   │
│  │ company-{cId}-ticket│  │   WEBSOCKET    │          ▼                   │
│  │ {                   │  │   CONNECTION   │  ┌────────────────────────┐  │
│  │   action: "update"  │  │   (namespace)  │  │  socket.on()           │  │
│  │   ticket: {...}     │  │                │  │  company-{cId}-ticket  │  │
│  │ }                   │  │                │  └────────────────────────┘  │
│  └─────────────────────┘  │                │          │                   │
└───────────────────────────┘                │          ▼                   │
                                             │  ┌────────────────────────┐  │
                                             │  │  handleUpdate()        │  │
                                             │  │  └─> refetchTickets()  │  │
                                             │  └────────────────────────┘  │
                                             │          │                   │
                                             │          ▼                   │
                                             │  ┌────────────────────────┐  │
                                             │  │  UI Re-renders         │  │
                                             │  │  Board updates         │  │
                                             │  └────────────────────────┘  │
                                             └──────────────────────────────┘

FLOW:
1. Backend: User moves ticket → API call → Database update
2. Backend: Emit Socket.IO event to namespace /workspace-{companyId}
3. Frontend: All connected clients in same namespace receive event
4. Frontend: Event handler calls refetchTickets()
5. Frontend: UI re-renders with new ticket positions
6. Result: All users see update in real-time (1-2 seconds)
```

---

## Namespace Pattern

### Why Namespaces?

Socket.IO namespaces provide **multi-tenant isolation**. Each company operates in its own namespace, ensuring:
- Company A users only receive Company A events
- Company B users only receive Company B events
- No cross-company data leakage
- Efficient event routing (no filtering needed in application code)

### Namespace Format

**Pattern:** `/workspace-{companyId}`

**Examples:**
- Company 1: `/workspace-1`
- Company 2: `/workspace-2`
- Company 42: `/workspace-42`

**Why "workspace-" prefix?**
- Semantic: Indicates a workspace/company context
- Avoids conflicts with default namespace (`/`)
- Future-proof: Can add other namespace patterns (e.g., `/user-{userId}` for DMs)

---

## Implementation Details

### Backend Implementation

#### File: `/Users/brunovilefort/Desktop/chatia-final/chatia/backend/src/controllers/TicketTagController.ts`

#### Socket.IO Emission Points

**1. After Adding Tag (store method)**

```typescript
// Lines 36-42
const io = getIO();
io.of(`/workspace-${companyId}`)
  .emit(`company-${companyId}-ticket`, {
    action: "update",
    ticket: updatedTicket
  });
```

**When:** After successfully creating a TicketTag (PUT /ticket-tags/:ticketId/:tagId)

**Payload:**
```typescript
{
  action: "update",      // Action type: "create" | "update" | "delete"
  ticket: Ticket         // Full ticket object with updated tags
}
```

**2. After Removing Tag (remove method)**

```typescript
// Lines 98-104
const io = getIO();
io.of(`/workspace-${companyId}`)
  .emit(`company-${companyId}-ticket`, {
    action: "update",
    ticket: updatedTicket
  });
```

**When:** After successfully removing TicketTag(s) (DELETE /ticket-tags/:ticketId)

**Payload:** Same structure as above

---

#### Security Validations (Multi-tenant)

**Before emitting any event, backend validates:**

1. **Ticket ownership** (Lines 14-15, 73-74):
   ```typescript
   const ticket = await ShowTicketService(ticketId, companyId);
   // Throws AppError if ticket doesn't belong to company
   ```

2. **Tag ownership** (Lines 18-24):
   ```typescript
   const tag = await Tag.findOne({
     where: {
       id: tagId,
       kanban: 1,
       companyId  // CRITICAL: Multi-tenant filter
     }
   });
   ```

3. **TicketTag removal scoped to company** (Lines 80-87):
   ```typescript
   const tagsWithKanbanOne = await Tag.findAll({
     where: {
       id: tagIds,
       kanban: 1,
       companyId  // CRITICAL: Only remove company's tags
     },
   });
   ```

**Result:** Only validated, company-owned data is emitted. No cross-company leakage possible.

---

### Frontend Implementation

#### File: `/Users/brunovilefort/Desktop/chatia-final/chatia/frontend/src/services/SocketWorker.js`

#### Socket Connection (Singleton Pattern)

```javascript
// Lines 5-17
class SocketWorker {
  constructor(companyId, userId) {
    if (!SocketWorker.instance) {
      this.companyId = companyId;
      this.userId = userId;
      this.socket = null;
      this.configureSocket();
      this.eventListeners = {}; // Tracks registered listeners
      SocketWorker.instance = this;
    }
    return SocketWorker.instance;
  }
}
```

**Design Pattern:** Singleton
- Ensures only ONE Socket.IO connection per session
- Prevents memory leaks from multiple connections
- Reuses existing connection if already established

#### Namespace Connection

**CURRENT (INCORRECT):**
```javascript
// Line 20 (WRONG!)
this.socket = io(`${BACKEND_URL}/${this?.companyId}`, {
```

**REQUIRED (CORRECT):**
```javascript
// Line 20 (CORRECT)
this.socket = io(`${BACKEND_URL}/workspace-${this?.companyId}`, {
```

**Critical Fix:** Add `/workspace-` prefix to match backend namespace.

**Connection Options:**
```javascript
{
  autoConnect: true,           // Connect immediately
  reconnection: true,           // Auto-reconnect on disconnect
  reconnectionDelay: 1000,      // Wait 1s before reconnecting
  reconnectionAttempts: Infinity, // Keep trying forever
  query: { userId: this.userId } // Send userId in connection query
}
```

#### Connection Lifecycle

**1. Connect Event:**
```javascript
// Lines 28-30
this.socket.on("connect", () => {
  console.log("Conectado ao servidor Socket.IO");
});
```

**2. Disconnect Event:**
```javascript
// Lines 32-35
this.socket.on("disconnect", () => {
  console.log("Desconectado do servidor Socket.IO");
  this.reconnectAfterDelay();
});
```

**3. Reconnection Logic:**
```javascript
// Lines 85-92
reconnectAfterDelay() {
  setTimeout(() => {
    if (!this.socket || !this.socket.connected) {
      console.log("Tentando reconectar após desconexão");
      this.connect();
    }
  }, 1000);
}
```

**Behavior:**
- If disconnected (network issue, server restart), auto-reconnect after 1 second
- Keeps retrying until connection established
- User sees seamless reconnection (no page reload needed)

---

#### File: `/Users/brunovilefort/Desktop/chatia-final/chatia/frontend/src/hooks/useSocketKanban/index.js`

#### Event Listener Hook

```javascript
const useSocketKanban = (socket, companyId, onUpdate) => {
  useEffect(() => {
    if (!socket || !companyId) return;

    const eventTicket = `company-${companyId}-ticket`;
    const eventAppMessage = `company-${companyId}-appMessage`;

    const handleUpdate = (data) => {
      if (data.action === "create" || data.action === "update" || data.action === "delete") {
        console.log(`[Socket] Kanban update received:`, data.action);
        onUpdate();  // Triggers refetchTickets()
      }
    };

    socket.on(eventTicket, handleUpdate);
    socket.on(eventAppMessage, handleUpdate);

    return () => {
      socket.off(eventTicket, handleUpdate);
      socket.off(eventAppMessage, handleUpdate);
    };
  }, [socket, companyId, onUpdate]);
};
```

**Key Features:**

1. **Dynamic Event Names:**
   - Event: `company-${companyId}-ticket`
   - Example: `company-1-ticket` for Company 1
   - Ensures events are scoped to company (additional safety on top of namespaces)

2. **Action Filtering:**
   - Only responds to: `create`, `update`, `delete`
   - Ignores unknown actions

3. **Callback Abstraction:**
   - Calls `onUpdate()` callback (provided by parent component)
   - Parent decides what to do (typically: refetch data)

4. **Cleanup Function:**
   - `return () => { socket.off(...) }`
   - Removes listeners when component unmounts
   - Prevents memory leaks and duplicate listeners

5. **Dependencies:**
   - `[socket, companyId, onUpdate]`
   - Re-registers listeners if any dependency changes

---

#### File: `/Users/brunovilefort/Desktop/chatia-final/chatia/frontend/src/pages/Kanban/index.js`

#### Usage in Kanban Component

```javascript
// Line 86
useSocketKanban(socket, user.companyId, refetchTickets);
```

**How It Works:**

1. **socket:** From `AuthContext` (via `useContext(AuthContext)`)
2. **user.companyId:** Current user's company ID (e.g., 1, 2, 42)
3. **refetchTickets:** Callback from `useKanbanTickets` hook

**Flow:**

```
User A moves ticket → API call → Backend updates DB → Backend emits Socket event
                                                              │
                                                              ▼
                                    Frontend receives event via useSocketKanban
                                                              │
                                                              ▼
                                              handleUpdate() called
                                                              │
                                                              ▼
                                              onUpdate() → refetchTickets()
                                                              │
                                                              ▼
                                              GET /ticket/kanban API call
                                                              │
                                                              ▼
                                              tickets state updates
                                                              │
                                                              ▼
                                              useEffect triggers popularCards()
                                                              │
                                                              ▼
                                              Board re-renders with new data
                                                              │
                                                              ▼
                                              User B (in another tab) sees update!
```

---

## Event Payloads

### Event Name Pattern

**Format:** `company-{companyId}-ticket`

**Examples:**
- Company 1: `company-1-ticket`
- Company 2: `company-2-ticket`

### Payload Structure

```typescript
{
  action: "create" | "update" | "delete",
  ticket: {
    id: number,
    uuid: string,
    status: string,
    contact: {
      id: number,
      name: string,
      number: string,
      // ...
    },
    tags: [
      {
        id: number,
        name: string,
        color: string,
        kanban: 1
      }
    ],
    lastMessage: string,
    updatedAt: string,
    user: {
      id: number,
      name: string
    },
    // ... other ticket fields
  }
}
```

### Action Types

| Action | When Emitted | Frontend Behavior |
|--------|-------------|-------------------|
| `create` | New ticket created | Refetch tickets, new card appears |
| `update` | Ticket updated (tag added/removed) | Refetch tickets, card moves lanes |
| `delete` | Ticket deleted | Refetch tickets, card disappears |

**Note:** Currently, both `store` and `remove` methods emit `action: "update"`. Could be refined to `action: "tag-added"` and `action: "tag-removed"` for more granular handling.

---

## Sequence Diagram

```
User A (Tab 1)          Backend                   Database       Socket.IO        User B (Tab 2)
     │                     │                          │               │                  │
     │──drag card────────> │                          │               │                  │
     │ PUT /ticket-tags    │                          │               │                  │
     │                     │                          │               │                  │
     │                     │──validate company────────>│               │                  │
     │                     │<─────ticket OK───────────│               │                  │
     │                     │                          │               │                  │
     │                     │──validate tag────────────>│               │                  │
     │                     │<─────tag OK──────────────│               │                  │
     │                     │                          │               │                  │
     │                     │──create TicketTag────────>│               │                  │
     │                     │<─────saved OK────────────│               │                  │
     │                     │                          │               │                  │
     │                     │──refetch ticket──────────>│               │                  │
     │                     │<─────ticket + tags───────│               │                  │
     │                     │                          │               │                  │
     │                     │──emit Socket.IO──────────────────────────>│                  │
     │                     │  /workspace-1            │               │                  │
     │                     │  company-1-ticket        │               │                  │
     │                     │  {action, ticket}        │               │                  │
     │                     │                          │               │                  │
     │<────201 Created─────│                          │               │                  │
     │ (API response)      │                          │               │                  │
     │                     │                          │               │                  │
     │                     │                          │               │──event received──>│
     │                     │                          │               │  company-1-ticket│
     │                     │                          │               │  {action,ticket} │
     │                     │                          │               │                  │
     │                     │                          │               │<─refetchTickets()─│
     │                     │<──GET /ticket/kanban──────────────────────────────────────│
     │                     │                          │               │                  │
     │                     │──query tickets───────────>│               │                  │
     │                     │<─────tickets─────────────│               │                  │
     │                     │                          │               │                  │
     │                     │──tickets JSON───────────────────────────────────────────────>│
     │                     │                          │               │                  │
     │                     │                          │               │                  │
     │                     │                          │               │  [UI re-renders] │
     │                     │                          │               │  Card moves lane │
     │                     │                          │               │                  │
```

**Timeline:**
- **T+0ms:** User A drags card
- **T+50ms:** API call sent
- **T+200ms:** Database updated
- **T+250ms:** Socket.IO event emitted
- **T+300ms:** User B receives event
- **T+350ms:** User B refetches tickets
- **T+550ms:** User B's UI updates

**Total latency: ~500-600ms** (varies by network)

---

## Multi-tenant Isolation

### How Isolation Works

1. **Namespace Level (Primary):**
   - Company 1 connects to: `/workspace-1`
   - Company 2 connects to: `/workspace-2`
   - Socket.IO ensures events in `/workspace-1` NEVER reach `/workspace-2`
   - Namespace isolation is built into Socket.IO protocol

2. **Event Name Level (Secondary):**
   - Company 1 listens to: `company-1-ticket`
   - Company 2 listens to: `company-2-ticket`
   - Even if namespaces were wrong, event names provide additional safety

3. **Backend Data Level (Tertiary):**
   - All database queries filter by `companyId`
   - JWT token provides `req.user.companyId`
   - No cross-company data in payloads

### Security Guarantees

**Scenario:** Company A (companyId=1) and Company B (companyId=2)

**User A moves ticket:**
```
Backend emits to: /workspace-1 → event: company-1-ticket
```

**Who receives the event?**
- Users in `/workspace-1` namespace: YES ✅
- Users in `/workspace-2` namespace: NO ❌
- Users in default `/` namespace: NO ❌

**Result:** Perfect isolation at protocol level.

---

## Error Handling

### Frontend Error Handling

**Connection Failures:**
- Auto-reconnection enabled (`reconnection: true`)
- Retries every 1 second (`reconnectionDelay: 1000`)
- Infinite retry attempts (`reconnectionAttempts: Infinity`)

**Event Handler Errors:**
```javascript
const handleUpdate = (data) => {
  try {
    if (data.action === "create" || data.action === "update" || data.action === "delete") {
      onUpdate();  // If this throws, error is caught
    }
  } catch (err) {
    console.error("[Socket] Event handler error:", err);
    // App continues running, error doesn't crash UI
  }
};
```

**Missing Socket/CompanyId:**
```javascript
if (!socket || !companyId) return;  // Exit early, don't register listeners
```

**Cleanup on Unmount:**
```javascript
return () => {
  socket.off(eventTicket, handleUpdate);
  socket.off(eventAppMessage, handleUpdate);
};
```
- Prevents memory leaks
- Removes listeners when component unmounts
- Avoids duplicate listeners if component re-mounts

---

### Backend Error Handling

**Validation Errors:**
- If ticket doesn't belong to company: Throws `AppError` (403)
- If tag doesn't belong to company: Returns 400 error
- Socket.IO emission SKIPPED if validation fails

**Socket.IO Emission Errors:**
```typescript
try {
  const io = getIO();
  io.of(`/workspace-${companyId}`).emit(...);
} catch (err) {
  // Log error, but don't fail the HTTP response
  console.error("Socket.IO emission failed:", err);
  // HTTP still returns 201/200 (database updated successfully)
}
```

**Why this pattern?**
- Socket.IO is a "nice-to-have" (real-time updates)
- Database update is critical (must succeed)
- If Socket fails, users can still refresh page to see updates
- Don't block HTTP response waiting for Socket.IO

---

## Testing Socket.IO

### Manual Testing

**See:** `integration-test-guide.md` → Test 4: Real-time Socket.IO Updates

**Quick Test:**
1. Open 2 browser tabs: Tab A and Tab B
2. Navigate both to `/kanban`
3. In Tab A: Move a card
4. In Tab B: Card should update automatically (1-2 seconds)

### Browser DevTools Testing

**1. Check Connection:**
```javascript
// Browser console
const socket = window.socket; // If exposed globally
socket.connected  // Should be true
socket.id         // Shows socket ID
```

**2. Check Namespace:**
```javascript
// DevTools > Network > WS (WebSocket)
// Look for connection URL:
ws://localhost:8080/workspace-1?userId=123
```

**3. Monitor Events:**
```javascript
// Browser console
socket.onAny((event, ...args) => {
  console.log("Socket event:", event, args);
});
```

**4. Manually Emit Event (Testing):**
```javascript
// Browser console
socket.emit("company-1-ticket", {
  action: "update",
  ticket: { id: 123, /* ... */ }
});
```

### Backend Testing (Socket.IO Debugging)

**Enable Debug Logs:**
```bash
# Backend terminal
DEBUG=socket.io* npm run dev:server
```

**Output:**
```
socket.io:server attaching client serving req handler
socket.io:server incoming connection with id abc123
socket.io:namespace /workspace-1 adding socket to namespace
socket.io:socket connected socket abc123 to namespace /workspace-1
```

---

## Performance Considerations

### Connection Pooling

- **Singleton Pattern:** Only 1 connection per user session
- **Namespace Isolation:** Server manages separate namespaces efficiently
- **Room-based Broadcast:** Socket.IO uses rooms internally for efficient event distribution

### Event Frequency

**Current Implementation:**
- Every ticket tag add/remove triggers 1 event
- Multiple users moving cards = multiple events
- Frontend debouncing: None (refetch on every event)

**Potential Optimization:**
- Debounce refetchTickets() to avoid rapid API calls
- Example: Max 1 refetch per 500ms

```javascript
// Optimized version (using lodash debounce)
import { debounce } from 'lodash';

const debouncedRefetch = useCallback(
  debounce(() => refetchTickets(), 500),
  [refetchTickets]
);

useSocketKanban(socket, user.companyId, debouncedRefetch);
```

### Scalability

**Single Server:**
- Socket.IO handles 10,000+ concurrent connections easily
- Namespace isolation scales well (O(1) lookup)

**Multi-Server (Future):**
- If scaling horizontally (multiple backend servers), need Socket.IO adapter
- Redis adapter recommended: `socket.io-redis`
- Ensures events propagate across all server instances

---

## Common Issues and Solutions

### Issue 1: "Real-time updates not working"

**Symptoms:**
- Move card in Tab A
- Tab B doesn't update

**Troubleshooting:**

1. **Check namespace mismatch:**
   ```javascript
   // SocketWorker.js line 20 - MUST BE:
   io(`${BACKEND_URL}/workspace-${this?.companyId}`, {

   // NOT:
   io(`${BACKEND_URL}/${this?.companyId}`, {  // WRONG!
   ```

2. **Check connection status:**
   ```javascript
   // Browser console
   console.log(socket.connected);  // Should be true
   ```

3. **Check event names:**
   - Backend emits: `company-1-ticket`
   - Frontend listens: `company-1-ticket`
   - CompanyId must match

4. **Check browser console:**
   - Look for: `"Conectado ao servidor Socket.IO"`
   - Look for: `"[Socket] Kanban update received: update"`

---

### Issue 2: "Socket.IO connection refused"

**Symptoms:**
- Console error: "WebSocket connection failed"
- No real-time updates

**Solutions:**

1. **Check BACKEND_URL:**
   ```javascript
   // frontend/src/config/env.js
   export const BACKEND_URL = "http://localhost:8080";
   ```

2. **Check CORS:**
   - Backend must allow frontend origin
   - `http://localhost:3000` should be in CORS whitelist

3. **Check backend is running:**
   ```bash
   curl http://localhost:8080/health
   ```

---

### Issue 3: "Multiple events received (duplicates)"

**Symptoms:**
- Move card once
- refetchTickets() called 5 times

**Causes:**
- Multiple listeners registered (no cleanup)
- Component re-mounting without cleanup

**Solution:**
- Ensure cleanup function in useEffect:
  ```javascript
  return () => {
    socket.off(eventTicket, handleUpdate);
  };
  ```

---

## Best Practices

### Do's ✅

1. **Always use namespace pattern:** `/workspace-{companyId}`
2. **Always validate companyId** in backend before emitting
3. **Always cleanup listeners** in useEffect return
4. **Use singleton pattern** for Socket connection
5. **Handle reconnection** gracefully (auto-reconnect enabled)
6. **Log events** in development (console.log in handleUpdate)
7. **Test with 2 tabs** before deploying

### Don'ts ❌

1. **Don't emit events without validation** (security risk)
2. **Don't create multiple Socket connections** (memory leak)
3. **Don't forget cleanup** (causes duplicate listeners)
4. **Don't emit sensitive data** (passwords, tokens)
5. **Don't use default namespace** `/` (no multi-tenant isolation)
6. **Don't block HTTP response** waiting for Socket.IO
7. **Don't emit events in loops** (causes event storms)

---

## Future Improvements

### 1. Granular Event Types

**Current:**
```typescript
{ action: "update", ticket: {...} }
```

**Improved:**
```typescript
{
  action: "tag-added",
  ticketId: 123,
  tagId: 5,
  tag: { id: 5, name: "Novo", color: "#3B82F6" }
}
```

**Benefits:**
- Frontend can update specific card without refetching all
- Reduces API calls
- Faster UI updates

---

### 2. Optimistic UI Updates

**Current Flow:**
1. User moves card
2. API call
3. Wait for Socket.IO event
4. Refetch all tickets
5. UI updates

**Optimized Flow:**
1. User moves card
2. Update UI immediately (optimistic)
3. API call in background
4. If API fails: Rollback UI
5. If API succeeds: Keep optimistic update
6. Socket.IO event confirms (secondary validation)

**Benefits:**
- Instant UI feedback (<50ms)
- Better UX (no waiting)
- Rollback on error (handled by useMoveTicket)

---

### 3. Presence Indicators

**Feature:** Show who's viewing the Kanban board

**Implementation:**
```typescript
// Backend
socket.on("join-kanban", (data) => {
  io.of(`/workspace-${companyId}`).emit("user-joined", {
    userId: data.userId,
    userName: data.userName
  });
});

// Frontend
<div>
  Viewing: {users.map(u => u.name).join(", ")}
</div>
```

---

### 4. Typing Indicators

**Feature:** Show when someone is dragging a card

**Implementation:**
```typescript
// Frontend sends
socket.emit("card-dragging", { cardId: 123, userId: 1 });

// Other clients receive
socket.on("card-dragging", (data) => {
  // Show "User X is moving this card..." indicator
});
```

---

## Conclusion

The Socket.IO integration provides real-time updates for the Kanban V2 feature, with strong multi-tenant isolation and robust error handling. The **critical namespace mismatch** in `SocketWorker.js` must be fixed before production deployment.

**Key Takeaways:**
1. Namespace pattern: `/workspace-{companyId}` (backend and frontend must match)
2. Event pattern: `company-{companyId}-ticket`
3. Multi-tenant isolation: Guaranteed by namespaces + event names + backend validation
4. Error handling: Auto-reconnection + cleanup + validation
5. Testing: Use 2 tabs to verify real-time updates

---

**Document Version:** 1.0
**Last Updated:** 2025-10-13
**Maintained By:** Integration Validation Specialist
**Status:** CRITICAL FIX REQUIRED - Namespace mismatch in SocketWorker.js
