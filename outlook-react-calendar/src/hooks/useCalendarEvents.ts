import { useCallback, useEffect, useState } from "react";
import { getCalendarView, GraphEvent } from "@/api/calendar.api";

export type FullCalApi = any;

export type CalendarEvent = {
  id?: string;
  title?: string;
  start?: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: Record<string, unknown>;
};

function convertGraphEventToFullCalendar(
  graphEvent: GraphEvent
): CalendarEvent {
  return {
    id: graphEvent.id,
    title: graphEvent.subject || "Untitled Event",
    start: graphEvent.start?.dateTime,
    end: graphEvent.end?.dateTime,
    backgroundColor: "#0078d4",
    borderColor: "#0078d4",
    extendedProps: {
      location: graphEvent.location?.displayName,
      attendees: graphEvent.attendees,
      body: graphEvent.body?.content,
      originalStartTime: graphEvent.start?.dateTime,
      originalEndTime: graphEvent.end?.dateTime,
    },
  };
}

export function useCalendarEvents(currentView: string) {
  const [calendarApi, setCalendarApi] = useState<FullCalApi | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const fetchCalendarEvents = useCallback(
    async (date: Date) => {
      if (!calendarApi) return;
      setLoading(true);
      try {
        let startDate: Date;
        let endDate: Date;

        if (currentView === "dayGridMonth") {
          startDate = new Date(date.getFullYear(), date.getMonth(), 1);
          endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        } else if (currentView === "timeGridWeek") {
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          startDate = startOfWeek;
          endDate = new Date(startOfWeek);
          endDate.setDate(startOfWeek.getDate() + 6);
        } else {
          startDate = new Date(date);
          endDate = new Date(date);
          endDate.setDate(date.getDate() + 1);
        }

        const startDateTime = startDate.toISOString();
        const endDateTime = endDate.toISOString();

        const graphEvents = await getCalendarView(startDateTime, endDateTime);
        const fullCalendarEvents = graphEvents.map(
          convertGraphEventToFullCalendar
        );
        setEvents(fullCalendarEvents);
      } finally {
        setLoading(false);
      }
    },
    [calendarApi, currentView]
  );

  useEffect(() => {
    if (calendarApi) {
      fetchCalendarEvents(currentDate);
    }
  }, [calendarApi, currentView, currentDate, fetchCalendarEvents]);

  const goToPrev = () => {
    if (!calendarApi) return;
    calendarApi.prev();
    setCurrentDate(calendarApi.getDate());
  };

  const goToNext = () => {
    if (!calendarApi) return;
    calendarApi.next();
    setCurrentDate(calendarApi.getDate());
  };

  const goToToday = () => {
    if (!calendarApi) return;
    calendarApi.today();
    setCurrentDate(new Date());
  };

  return {
    calendarApi,
    setCalendarApi,
    events,
    loading,
    currentDate,
    setCurrentDate,
    fetchCalendarEvents,
    goToPrev,
    goToNext,
    goToToday,
  };
}
