import { Providers, ProviderState } from "@microsoft/mgt-element";

type Dictionary<T = unknown> = Record<string, T>;

export type GraphEvent = {
  id?: string;
  subject?: string;
  body?: { contentType?: string; content?: string };
  start?: { dateTime?: string; timeZone?: string };
  end?: { dateTime?: string; timeZone?: string };
  location?: { displayName?: string };
  attendees?: Array<{
    emailAddress: { address: string; name?: string };
    type?: "required" | "optional" | "resource";
  }>;
  [key: string]: any;
};

export type GraphCalendar = {
  id: string;
  name: string;
  owner?: Dictionary;
  [key: string]: any;
};

export type PagedResponse<T> = {
  value: T[];
  "@odata.nextLink"?: string;
};

function ensureGraph() {
  const provider = Providers.globalProvider;
  if (!provider || provider.state !== ProviderState.SignedIn) {
    throw new Error("Graph provider not ready or user not signed in");
  }

  // Debug: Log token info
  console.log("Provider state:", provider.state);
  console.log("Provider scopes:", provider.approvedScopes);

  return provider.graph;
}

export async function getUserCalendars(
  params?: Dictionary<string | number | boolean>
): Promise<GraphCalendar[]> {
  let request = Providers.client.api("/me/calendars");
  if (params) request = request.query(params as Dictionary<string>);
  const res: PagedResponse<GraphCalendar> = await request.get();
  return res.value ?? [];
}

export async function getMeEvents(
  params?: Dictionary<string | number | boolean>
): Promise<GraphEvent[]> {
  const graph = ensureGraph();
  let request = graph.api("/me/events");
  if (params) request = request.query(params as Dictionary<string>);
  const res: PagedResponse<GraphEvent> = await request.get();
  return res.value ?? [];
}

export async function getCalendarEvents(
  calendarId: string,
  params?: Dictionary<string | number | boolean>
): Promise<GraphEvent[]> {
  const graph = ensureGraph();
  let request = graph.api(`/me/calendars/${calendarId}/events`);
  if (params) request = request.query(params as Dictionary<string>);
  const res: PagedResponse<GraphEvent> = await request.get();
  return res.value ?? [];
}

export async function createEvent(
  calendarId: string,
  event: GraphEvent
): Promise<GraphEvent> {
  const graph = ensureGraph();
  return await graph.api(`/me/calendars/${calendarId}/events`).post(event);
}

export async function updateEvent(
  calendarId: string,
  eventId: string,
  updates: Partial<GraphEvent>
): Promise<GraphEvent> {
  const graph = ensureGraph();
  return await graph
    .api(`/me/calendars/${calendarId}/events/${eventId}`)
    .patch(updates);
}

export async function deleteEvent(
  calendarId: string,
  eventId: string
): Promise<void> {
  const graph = ensureGraph();
  await graph.api(`/me/calendars/${calendarId}/events/${eventId}`).delete();
}

export async function getCalendarView(
  startDateTime: string,
  endDateTime: string,
  calendarId?: string,
  params?: Dictionary<string | number | boolean>
): Promise<GraphEvent[]> {
  const graph = ensureGraph();
  let base = calendarId
    ? `/me/calendars/${calendarId}/calendarView`
    : "/me/calendarView";
  let request = graph.api(base).query({
    startDateTime,
    endDateTime,
    ...(params ?? {}),
  } as Dictionary<string>);
  const res: PagedResponse<GraphEvent> = await request.get();
  return res.value ?? [];
}
