import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { useState } from "react";

const upcomingEvents = [
  {
    id: 1,
    title: "Team Meeting",
    time: "10:00 AM",
    date: "Today",
    location: "Conference Room A",
    attendees: 5,
    color: "bg-primary",
  },
  {
    id: 2,
    title: "Project Review",
    time: "2:00 PM",
    date: "Tomorrow",
    location: "Online",
    attendees: 3,
    color: "bg-purple-500",
  },
  {
    id: 3,
    title: "Client Presentation",
    time: "9:00 AM",
    date: "Jan 18",
    location: "Client Office",
    attendees: 8,
    color: "bg-red-500",
  },
];

const myCalendars = [
  { name: "Personal", color: "bg-primary", count: 12 },
  { name: "Work", color: "bg-green-500", count: 8 },
  { name: "Team Events", color: "bg-purple-500", count: 5 },
  { name: "Meetings", color: "bg-orange-500", count: 15 },
];

export default function CalendarSidebar() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="w-80 bg-calendar-sidebar border-r border-calendar-border p-4 space-y-6">
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
          {upcomingEvents.map((event) => (
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
