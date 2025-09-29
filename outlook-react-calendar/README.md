# Outlook Calendar Sync – Frontend (React + Vite + TypeScript)

A minimal frontend that displays and manages Outlook Calendar events using React, Vite, TypeScript, FullCalendar, and Microsoft Graph (via Microsoft Graph Toolkit).

## Features

- Sign in with Microsoft account (MGT `<Login />`).
- Display Outlook Calendar events in FullCalendar.
- Create events directly from the calendar.
- Sync with Microsoft Graph API (optional: update and delete).

## Tech Stack

- React, Vite, TypeScript
- FullCalendar (`@fullcalendar/react`, `daygrid`, `interaction`, optional `timegrid`)
- Microsoft Graph Toolkit React (`@microsoft/mgt-react`) and Microsoft Graph API

## Project Structure (suggested)

```
src/
 ├─ components/
 │   ├─ AuthProvider.tsx     # MGT Provider (MSAL)
 │   ├─ LoginButton.tsx      # Microsoft login component
 │   ├─ CalendarView.tsx     # FullCalendar view + load/sync events
 │   ├─ EventForm.tsx        # Optional create/edit form
 │
 ├─ services/
 │   ├─ graphClient.ts       # Graph API helpers
 │
 ├─ App.tsx
 ├─ main.tsx                 # Initialize MGT provider
```

## Setup

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Azure App Registration (required)

1. Create an Azure App Registration and note Client ID, Tenant ID, Redirect URI (e.g. `http://localhost:5173`).
2. Platform: Single-page application (SPA) with the Redirect URI.
3. API permissions: `User.Read`, `Calendars.ReadWrite` (grant admin consent if needed).

Example provider setup:

```ts
import { Providers } from "@microsoft/mgt-element";
import { Msal2Provider } from "@microsoft/mgt-msal2";

Providers.globalProvider = new Msal2Provider({
  clientId: "YOUR_CLIENT_ID",
  authority: "https://login.microsoftonline.com/organizations",
  redirectUri: "http://localhost:5173",
  scopes: ["User.Read", "Calendars.ReadWrite"],
});
```

## Graph API References

- Get default calendar metadata:

  ```http
  GET https://graph.microsoft.com/v1.0/me/calendar
  ```

- List events by time range (recommended for calendar UIs):

  ```http
  GET https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=2025-09-01T00:00:00Z&endDateTime=2025-10-01T00:00:00Z
  Prefer: outlook.timezone="Asia/Ho_Chi_Minh"
  ```

- Create / Update / Delete events:

  ```http
  POST   https://graph.microsoft.com/v1.0/me/events
  PATCH  https://graph.microsoft.com/v1.0/me/events/{id}
  DELETE https://graph.microsoft.com/v1.0/me/events/{id}
  ```

Notes:

- Use `Prefer: outlook.timezone="<TZ>"` to control response timezone.
- Handle pagination via `@odata.nextLink` for long ranges.
- Delegated permissions: `Calendars.ReadWrite` to read/write, or `Calendars.Read` for read-only.
- `GET /me/calendar` returns metadata; use `calendarView` for event ranges.
