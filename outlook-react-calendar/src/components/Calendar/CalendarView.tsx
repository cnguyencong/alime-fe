import { createEvent, getUserCalendars, GraphEvent } from "@/api/calendar.api";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { CalendarEvent } from "@/lib/calendar-types";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useEffect, useState } from "react";
import { CalendarToolbar } from "./CalendarToolbar";
import { NewEventDialog } from "./NewEventDialog";
import { TimeOffDetailsDialog } from "./TimeOffDetailsDialog";

interface CalendarViewProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  timeOffEvents?: CalendarEvent[];
  wfhEvents?: CalendarEvent[];
}

export default function CalendarView({
  currentView,
  setCurrentView,
  timeOffEvents = [],
  wfhEvents = [],
}: CalendarViewProps) {
  const {
    calendarApi,
    setCalendarApi,
    events,
    loading,
    currentDate,
    fetchCalendarEvents,
    goToPrev,
    goToNext,
    goToToday,
  } = useCalendarEvents(currentView);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");

  // Time-off details dialog state
  const [isTimeOffDetailsOpen, setIsTimeOffDetailsOpen] = useState(false);
  const [selectedTimeOffData, setSelectedTimeOffData] = useState<
    CalendarEvent["extendedProps"] | null
  >(null);
  const [selectedEventDates, setSelectedEventDates] = useState<{
    start: string;
    end: string;
  } | null>(null);

  // fetchCalendarEvents provided by hook

  const handleDateClick = (arg: any) => {
    console.log("Date clicked:", arg.date);
  };

  const handleEventClick = (arg: any) => {
    console.log("Event clicked:", arg.event.title);

    if (
      arg.event.extendedProps?.type === "time-off" ||
      arg.event.extendedProps?.type === "wfh"
    ) {
      const eventData = arg.event.extendedProps;
      setSelectedTimeOffData(eventData);
      setSelectedEventDates({
        start: arg.event.start,
        end: arg.event.end,
      });
      setIsTimeOffDetailsOpen(true);
    }
  };

  const handleCreateEvent = async () => {
    if (!newTitle || !newStart || !newEnd) return;
    try {
      setCreating(true);
      const calendars = await getUserCalendars();
      const calendarId = calendars?.[0]?.id;
      if (!calendarId) throw new Error("No calendar available");

      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const event: GraphEvent = {
        subject: newTitle,
        body: { contentType: "HTML", content: newDescription },
        start: { dateTime: new Date(newStart).toISOString(), timeZone: tz },
        end: { dateTime: new Date(newEnd).toISOString(), timeZone: tz },
        location: newLocation ? { displayName: newLocation } : undefined,
      };

      await createEvent(calendarId, event);
      setIsNewOpen(false);
      setNewTitle("");
      setNewLocation("");
      setNewDescription("");
      setNewStart("");
      setNewEnd("");
      // Refresh events
      fetchCalendarEvents(currentDate);
    } catch (e) {
      console.error("Failed to create event", e);
    } finally {
      setCreating(false);
    }
  };

  // navigation provided by hook

  // Fetch events when calendar API is ready, view changes, or date changes
  useEffect(() => {
    if (calendarApi) {
      fetchCalendarEvents(currentDate);
    }
  }, [calendarApi, currentView, currentDate, fetchCalendarEvents]);

  // Handle view change
  const handleViewChange = (view: string) => {
    setCurrentView(view);
    if (calendarApi) {
      calendarApi.changeView(view);
      fetchCalendarEvents(calendarApi.getDate());
    }
  };

  return (
    <div className="flex-1 bg-card border border-calendar-border rounded-lg overflow-hidden">
      {/* Calendar Header */}
      <CalendarToolbar
        currentView={currentView}
        onChangeView={handleViewChange}
        onPrev={goToPrev}
        onNext={goToNext}
        onToday={goToToday}
        onOpenNew={() => setIsNewOpen(true)}
      />

      {/* Calendar Content */}
      <div className="p-4 relative">
        <NewEventDialog
          open={isNewOpen}
          onOpenChange={setIsNewOpen}
          creating={creating}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          newStart={newStart}
          setNewStart={setNewStart}
          newEnd={newEnd}
          setNewEnd={setNewEnd}
          newLocation={newLocation}
          setNewLocation={setNewLocation}
          newDescription={newDescription}
          setNewDescription={setNewDescription}
          onCreate={handleCreateEvent}
        />

        <TimeOffDetailsDialog
          open={isTimeOffDetailsOpen}
          onOpenChange={setIsTimeOffDetailsOpen}
          eventData={selectedTimeOffData}
          startDate={selectedEventDates?.start}
          endDate={selectedEventDates?.end ?? selectedEventDates?.start}
        />
        {loading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Loading events...
            </div>
          </div>
        )}
        <FullCalendar
          ref={(ref) => {
            if (ref) {
              setCalendarApi(ref.getApi());
            }
          }}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={currentView}
          headerToolbar={false}
          events={[...events, ...timeOffEvents, ...wfhEvents]}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          dayMaxEvents={3}
          moreLinkClick="popover"
          eventDisplay="block"
          displayEventTime={true}
          eventTimeFormat={{
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            meridiem: "short",
          }}
          slotLabelFormat={{
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            meridiem: "short",
          }}
          nowIndicator={true}
          selectable={true}
          selectMirror={true}
          dayHeaderFormat={{
            weekday: "short",
            month: "numeric",
            day: "numeric",
          }}
          loading={(isLoading) => {
            // FullCalendar loading callback - we can use this to show/hide loading indicators
            console.log("Calendar loading:", isLoading);
          }}
        />
      </div>
    </div>
  );
}
