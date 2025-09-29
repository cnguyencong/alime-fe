import CalendarSidebar from "@/components/Calendar/CalendarSidebar";
import CalendarView from "@/components/Calendar/CalendarView";
import { Agenda, Login, useIsSignedIn } from "@microsoft/mgt-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [isSignedIn] = useIsSignedIn();
  console.log(isSignedIn);
  const [currentView, setCurrentView] = useState("dayGridMonth");

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="bg-card border-b border-calendar-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Employee Calendar
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User actions */}
            <Login />
          </div>
        </div>
      </header>

      {/* Main Content */}
      {isSignedIn && (
        <div className="flex h-[calc(100vh-80px)]">
          {/* Sidebar */}
          <div
            className={`translate-x-0 transition-transform duration-200 ease-in-out`}
          >
            <CalendarSidebar />
          </div>

          {/* Calendar View */}
          <div className="flex-1 p-6">
            <CalendarView
              currentView={currentView}
              setCurrentView={setCurrentView}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
