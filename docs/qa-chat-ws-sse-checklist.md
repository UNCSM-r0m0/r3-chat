# QA Chat WS/SSE - Post Split

This checklist validates frontend behavior against the backend chat split contract.

## Scope

- Sessions endpoints (`/api/chat/sessions`, `/api/chat/:id`)
- Message endpoints (`/api/chat/message`, `/api/chat/message/stream`)
- WS namespace `/chat` event flow
- Error mapping for business codes

## Preconditions

- Frontend running with latest `main`
- Backend running with split controllers enabled
- Browser DevTools Network and Console open

## 1) Anonymous user flow

1. Open chat without login and send message.
2. Verify first response arrives by WS or SSE fallback.
3. Verify no duplicated user/assistant bubbles.
4. Verify chat list refreshes after response is finalized.

Expected:
- UI remains responsive.
- If no active UUID chat exists, backend creates one and frontend rehydrates chat with returned `conversationId`.

## 2) Authenticated user flow

1. Login and send multiple messages in same chat.
2. Reload app.
3. Open same chat from sidebar.

Expected:
- Session history remains under `/api/chat/sessions`.
- Messages are consistent with backend on reload.

## 3) Rename/Delete sync

1. Rename a chat.
2. Delete another chat.

Expected:
- Local UI updates immediately.
- Background refresh keeps list consistent with backend.

## 4) WS stream events contract

1. Send a message and inspect WS frames/events.
2. Confirm stream order:
   - `responseStart`
   - `responseChunk` (one or more)
   - `responseEnd`

Expected:
- Chunk render is routed by `chatId`.
- Canonical chat is consolidated on `responseEnd` when `conversationId` exists.
- No cross-chat chunk leakage.

## 5) Reconnection during stream

1. Start stream.
2. Toggle browser offline for a few seconds, then online.

Expected:
- No duplicate bubbles.
- No automatic resubmit of same prompt.
- If stream breaks, assistant message shows interruption hint and user can retry.

## 6) SSE fallback visual behavior

1. Force WS failure (e.g., block websocket transport/proxy).
2. Send message.

Expected:
- UI displays non-technical fallback message.
- Frontend retries using `/api/chat/message/stream`.
- Final chat remains coherent.

## 7) Business error mapping

Trigger backend business errors and validate:

- `LIMIT_EXCEEDED`
  - User sees daily-limit message.
  - `isLimitReached` disables input if configured.

- `PREMIUM_REQUIRED`
  - User sees premium-required message.

- `STREAM_ERROR`
  - User sees fallback notice and frontend attempts non-stream fallback.

## 8) Loading state consistency

Expected:
- `responseStart` enables streaming/pending state.
- `responseEnd` OR `error` always clears streaming state.
- Route unmount/teardown clears WS listeners (no memory leak growth).

## 9) Dev telemetry events

In dev console verify events:

- `ws_stream_started`
- `ws_stream_completed`
- `ws_stream_failed`
- `ws_stream_reconnected`

Payload should include as available:

- `chatId`
- `conversationId`
- `messageId`
- `model`
- `durationMs`
