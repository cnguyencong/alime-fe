import { getCalendarView, GraphEvent } from "@/api/calendar.api";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";

type UpcomingItem = {
  id: string;
  title: string;
  time: string;
  date: string;
  location?: string;
  attendees: number;
  color: string;
};

const myCalendars = [
  { name: "Personal", color: "bg-primary", count: 12 },
  { name: "Work", color: "bg-green-500", count: 8 },
  { name: "Team Events", color: "bg-purple-500", count: 5 },
  { name: "Meetings", color: "bg-orange-500", count: 15 },
];

export default function CalendarSidebar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingItem[]>([]);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        setLoadingUpcoming(true);
        const now = new Date();
        const inSevenDays = new Date();
        inSevenDays.setDate(now.getDate() + 7);

        const events: GraphEvent[] = await getCalendarView(
          now.toISOString(),
          inSevenDays.toISOString()
        );

        const items: UpcomingItem[] = (events || [])
          .filter((e) => e.start?.dateTime)
          .sort((a, b) => {
            const ta = new Date(a.start!.dateTime as string).getTime();
            const tb = new Date(b.start!.dateTime as string).getTime();
            return ta - tb;
          })
          .slice(0, 5)
          .map((e) => {
            const start = e.start?.dateTime ? new Date(e.start.dateTime) : null;
            const isToday = start
              ? start.toDateString() === new Date().toDateString()
              : false;
            const isTomorrow = start
              ? start.toDateString() ===
                new Date(
                  new Date().setDate(new Date().getDate() + 1)
                ).toDateString()
              : false;

            const time = start
              ? start.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";
            const dateLabel = isToday
              ? "Today"
              : isTomorrow
                ? "Tomorrow"
                : start
                  ? start.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  : "";

            const attendeesCount = Array.isArray(e.attendees)
              ? e.attendees.length
              : 0;

            return {
              id: e.id || Math.random().toString(36),
              title: e.subject || "Untitled Event",
              time,
              date: dateLabel,
              location: e.location?.displayName,
              attendees: attendeesCount,
              color: "bg-primary",
            } as UpcomingItem;
          });

        setUpcomingEvents(items);
      } catch (err) {
        console.error("Failed to fetch upcoming events", err);
        setUpcomingEvents([]);
      } finally {
        setLoadingUpcoming(false);
      }
    };

    fetchUpcoming();
  }, []);

  return (
    <div className="w-80 h-full bg-calendar-sidebar border-r border-calendar-border p-4 space-y-6">
      {/* Mini Calendar */}
      <Card className="border-calendar-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border-0 p-0"
          />
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="border-calendar-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingUpcoming && (
            <div className="text-xs text-muted-foreground">Loading...</div>
          )}
          {!loadingUpcoming && upcomingEvents.length === 0 && (
            <div className="text-xs text-muted-foreground">
              No upcoming events
            </div>
          )}
          {!loadingUpcoming &&
            upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="p-3 rounded-lg border border-calendar-border hover:bg-calendar-hover cursor-pointer transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${event.color} mt-2 flex-shrink-0`}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{event.time}</span>
                      <span>•</span>
                      <span>{event.date}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Users className="h-3 w-3" />
                      <span>{event.attendees} attendees</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
