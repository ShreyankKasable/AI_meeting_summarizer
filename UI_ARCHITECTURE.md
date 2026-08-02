# UI Architecture

This document describes the frontend architecture and user-facing flows. For
the backend/API side, see `SYSTEM_ARCHITECTURE.md`.

## 1. Tech Stack

- **React 18**, JSX permitted in `.js` files (Vite's React plugin is
  configured with `include: /\.(js|jsx)$/`).
- **No router.** View switching is conditional rendering driven by Redux
  state (`sessionDetails.hostView`) and the raw `window.location.pathname`
  (for the one real "route" the app has: `/share/:token`).
- **Redux** — classic (`redux` + `redux-thunk`, not Redux Toolkit): plain
  action creators/types/reducers, thunks for anything async, the entire tree
  persisted to `localStorage` on every change and rehydrated on boot.
- **styled-components**, with every colour/spacing/radius/font-size value
  sourced from CSS custom properties defined once in `src/GlobalStyle.js` —
  no component hardcodes a raw value.
- **Vite** for dev server (HMR, proxies `/api` + `/socket.io` to the backend)
  and production build (`vite build` → `frontend/dist`, served by Express).
- **socket.io-client** for the live-transcript/processing-status channel.

## 2. Directory Structure (`frontend/src/`)

```
src/
  main.jsx, App.jsx, GlobalStyle.js
  common/
    components/            # shared UI primitives, one folder per component
      Button/ Input/ Alert/ Badge/ Modal/ PageContainer/
      Navbar/ Avatar/ Tabs/ AudioVisualizer/
    global-styled-components.js   # H1, H2, Body1/2/3, Eyebrow, MonoLabel, ...
    constants/index.js      # HOST_VIEWS, SOCKET_EVENTS, PRIORITIES, ...
    hooks/
      useSocket.js          # opens the one Socket.IO connection, dispatches redux
      useAudioRecorder.js   # Web Audio capture → WAV encode → chunked upload
    redux/
      store.js, rootReducer.js
      actions/    types.js, sessionActions.js, meetingActions.js, settingsActions.js
      reducers/   session.reducer.js, meeting.reducer.js, settings.reducer.js
    utils/
      apiUrls.js            # every backend endpoint path, centralized
      utils.js              # localStorage persistence, date/duration formatting
      audio.js              # encodeWav / concatFloat32 (pure functions, ported from the pre-rewrite app)
  services/                 # one file per API surface, thin axios wrappers
    api.service.js          # axios instance, bearer-token attachment, error normalization
    auth.service.js, meeting.service.js, share.service.js, settings.service.js
  pages/                    # one folder per screen
```

## 3. Redux State Shape

```
{
  sessionDetails: {
    token, user,               // auth
    status, error,              // 'idle' | 'loading' | 'error'
    hostView                    // HOST_VIEWS.Dashboard | Record | Settings | Meeting | Share
  },
  meetingDetails: {
    list,                       // all meetings the current host owns
    activeId,                   // currently open meeting (Record/Meeting/Share views)
    liveTranscript,              // array of text chunks, appended during recording
    processingStatus             // { status, progress } while a recording is being processed
  },
  settingsDetails: {
    status,                     // last-fetched GET /api/settings payload
    saving, lastSavedAt
  }
}
```

Only `token` really needs cross-session persistence; the rest persists too
(cheap, whole-tree `JSON.stringify` on every `store.subscribe`) but is
naturally refreshed by each page's own data-fetching effect on mount.

## 4. View Switching Without a Router

`App.jsx` is the single dispatch point:

```
window.location.pathname matches /share/:token ?
  ├─ yes and no session token → <Login />
  ├─ yes and session token set → <MeetingContentViewParticipant token={...} />
  │                              (renders <InvalidToken /> itself if the token 404s)
  ├─ path starts with /share/ but doesn't match → <Login /> or <InvalidToken />
  └─ no →
      sessionDetails.token is falsy → <Login />
      sessionDetails.token is set   → <HostApp />
                                        ├─ <Navbar />  (sidebar or mobile bar, see §7)
                                        └─ renders one of RecordMeeting / Settings /
                                           MeetingContentView / ShareScreen / HostDashboard
                                           based on sessionDetails.hostView
```

The share-link branch is checked **before** the normal host branch so a
signed-in participant opening `/share/:token` gets the participant view instead
of the host dashboard.

Within `HostApp`, "navigation" is just `dispatch(setHostView(HOST_VIEWS.X))`
— there's no URL change, no browser history entry. This is a deliberate
simplification matching the reference architecture's own guest/host
view-switching pattern; it means the browser back button doesn't work
between host views, which is an accepted tradeoff for this app's scope.

## 5. The Two User Journeys

### Host journey
```
Login/Signup ─► Host Dashboard ─► (New Meeting) ─► Record Meeting
                     ▲                                    │
                     │                              (Stop → auto-processed)
                     │                                    ▼
                     └──────────── Meeting Content View (full: transcript,
                                    translate, AI chat, summary, actions,
                                    edit title, export to Notion, Share)
                                                    │
                                                    ▼
                                              Share Screen
                                       (create/copy/revoke/regenerate link)
```
Settings is reachable from the sidebar at any point, independent of this flow.

### Participant journey
```
Landing page ─(Join Meeting)─► Login screen ─► authenticated workspace
                                                        │
                                      Join Meeting ─────┤
                                                        │
      OR: signed-in user opens a /share/:token link ────┤
                                                        ▼
                                          Meeting Content View (read-only:
                                          transcript, translate, AI chat,
                                          summary, actions — no edit/export/
                                          share/checkbox controls)
                                                                │
                                                   (token invalid/expired)
                                                                ▼
                                                        Invalid Token screen
                                              (error message + manual token
                                               re-entry, links back to landing)
```
A participant authenticates first, then enters a meeting code from the
workspace or opens a shared `/share/:token` link. The
`MeetingContentViewParticipant` page is a thin wrapper around the *same*
`TranscriptPane` / `ChatTab` / `SummaryTab` / `ActionsTab` components the host
view uses (imported directly from `pages/MeetingContentView/`), just without
the host-only action buttons and with `ActionsTab`'s checkboxes disabled via
a `readOnly` prop.

## 6. Page-by-Page Summary

| Page | Purpose | Talks to |
|---|---|---|
| `Login` (+`SignupForm`) | Sign-in/sign-up before entering the workspace or opening a share link | `auth.service` |
| `HostDashboard` (+`MeetingCard`, `NewMeetingModal`, `FilterBar`) | List/search/filter the host's meetings, start a new recording | `meeting.service.list`, `socket.service.emitStartRecording` |
| `RecordMeeting` (+`TranscriptPanel`) | Live recording UI — timer, waveform, live transcript, stop control | `useAudioRecorder`, socket events (no direct REST besides the recorder's own chunk/full uploads) |
| `MeetingContentView` (host) (+`TranscriptPane`, `AudioScrubber`, `ChatTab`, `SummaryTab`, `ActionsTab`) | Full read/write meeting view | `meeting.service` (get, chat, translate, title, export, action items) |
| `JoinMeeting` | Authenticated participant entry point for entering a meeting code | `share.service` |
| `MeetingContentViewParticipant` | Read-only twin of the above, session-authenticated and token-scoped | `share.service` |
| `ShareScreen` | Generate/copy/revoke/regenerate a share link | `meeting.service` (share endpoints) |
| `Settings` (+`AiProvidersTab`, `IntegrationsTab`, `NotificationsTab`) | View/edit provider connection status and keys | `settings.service` |
| `InvalidToken` | Error state for a bad/expired share link + manual re-entry | `share.service` |

## 7. Common Components

- **`Button`** — `mode` (primary/secondary/dark/ghost), `size`
  (small/default/large), `block`, `loader` (spinner state).
- **`Input`** — `label`, `optional`, `addon` (icon/button inside the field),
  `mono` (monospace/uppercase, used for tokens).
- **`Badge`** — `tone` (action/success/warning/danger/neutral/solid*).
- **`Modal`, `Alert`, `Avatar`, `Tabs`, `AudioVisualizer`, `PageContainer`** —
  self-explanatory; `Tabs` is shared between `Settings` and both
  `MeetingContentView` variants' right-hand panel rather than each rolling
  its own tab-switch logic.
- **`Navbar`** renders *two* things: a fixed left `Sidebar` (desktop) and,
  under the same 1024px breakpoint where the sidebar hides itself, a top
  `MobileBar` with a hamburger toggle revealing the same nav items + Sign
  Out. `App.jsx`'s host `Layout` switches to `flex-direction: column` at that
  same breakpoint so the mobile bar stacks above content instead of squeezing
  beside it. This exists specifically so navigation (including Sign Out)
  isn't silently unreachable on any viewport width.

## 8. Hooks

- **`useSocket`** — opens the one `socket.io-client` connection (via the
  `services/socket.service.js` singleton, `auth: {token}` handshake),
  subscribes to `recording_started` / `live_transcript_update` /
  `processing_status` / `meeting_processed`, and dispatches the corresponding
  plain redux actions. Called exactly once, inside `HostApp`, only while
  authenticated. Any component that needs to *emit* (e.g. `NewMeetingModal`
  calling `emitStartRecording`) imports the singleton's emit helper directly
  rather than calling `useSocket()` again — a second call would open a
  second connection.
- **`useAudioRecorder`** — `getUserMedia` → `AudioContext` →
  `ScriptProcessorNode`, buffering raw PCM into both a full-recording array
  and a "since last flush" array. Every 10 seconds (`LIVE_CHUNK_MS`) the
  chunk buffer is WAV-encoded and uploaded for live transcription; `stop()`
  encodes and uploads the full buffer, which kicks off the backend's
  transcribe→summarize→extract pipeline. The target `meetingId` is read from
  a `ref` (not a closure) since the meeting is typically created a few
  hundred milliseconds *after* recording starts (the id only arrives via the
  `recording_started` socket event), so the interval callback needs to see
  the id update after it was created.

## 9. Services Layer

Each `services/*.service.js` file is a plain object of methods that call
`ApiService.get/post/put` (or `postForm` for multipart audio uploads), with
every URL centralized in `common/utils/apiUrls.js`. `api.service.js` holds
the axios instance and a module-level `authToken` set via `setAuthToken()` —
called both synchronously at store-creation time (from persisted
`localStorage` state, so the very first request already carries a token) and
again after a fresh login/hydration confirms it's valid.

`meeting.service.js` (host-owned meeting calls) and `share.service.js`
(signed-in participant calls scoped by a share token) are kept **deliberately
separate** rather than one service branching on access mode internally — this
makes it structurally obvious which meeting surface each call site is using.

## 10. Design System

All values live in `src/GlobalStyle.js` as CSS custom properties, following
the "Cognitive Clarity" light-theme spec: primary `#0058be`, secondary
`#4648d4`, `#f7f9fb` background / `#ffffff` cards, Inter typography, a 4px
spacing baseline, and two shadow levels (`Color-Shadow-Card` for resting
cards, `Color-Shadow-1` for elevated/hover states). Token *names* mirror the
reference architecture's convention (`--Color-Background-*`,
`--Size-Gap-*`, `--Size-CornerRadius-*`, etc.) so any component built against
that convention drops in without modification — only the token *values*
differ.
