import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
} from "lucide-react";

type Props = {
  currentView: string;
  onChangeView: (view: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onOpenNew: () => void;
};

export function CalendarToolbar({
  currentView,
  onChangeView,
  onPrev,
  onNext,
  onToday,
  onOpenNew,
}: Props) {
  return (
    <div className="bg-gradient-primary p-4 text-primary-foreground">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            onClick={onPrev}
            className="border-white/20 text-white hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={onNext}
            className="border-white/20 text-white hover:bg-white/10 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={onToday}
            className="border-white/20 text-white hover:bg-white/10 hover:text-white"
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => onChangeView("dayGridMonth")}
            className={
              currentView === "dayGridMonth"
                ? "bg-white text-primary hover:bg-white/90"
                : "border-white/20 text-white hover:bg-white/10 hover:text-white"
            }
          >
            <CalendarIcon className="h-4 w-4 mr-1" />
            Month
          </Button>
          <Button
            size="sm"
            onClick={() => onChangeView("timeGridWeek")}
            className={
              currentView === "timeGridWeek"
                ? "bg-white text-primary hover:bg-white/90"
                : "border-white/20 text-white hover:bg-white/10 hover:text-white"
            }
          >
            Week
          </Button>
          <Button
            size="sm"
            onClick={() => onChangeView("timeGridDay")}
            className={
              currentView === "timeGridDay"
                ? "bg-white text-primary hover:bg-white/90"
                : "border-white/20 text-white hover:bg-white/10 hover:text-white"
            }
          >
            <Clock className="h-4 w-4 mr-1" />
            Day
          </Button>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="bg-white text-primary hover:bg-white/90"
          onClick={onOpenNew}
        >
          <Plus className="h-4 w-4 mr-1" />
          New Event
        </Button>
      </div>
    </div>
  );
}
