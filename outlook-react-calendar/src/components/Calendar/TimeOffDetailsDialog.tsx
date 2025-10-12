import { RequestStatus } from "@/api/types/common";
import { CalendarEvent } from "@/lib/calendar-types";
import { getStatusDisplayName } from "@/lib/time-off-transformer";
import { X } from "lucide-react";

interface TimeOffDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventData?: CalendarEvent["extendedProps"];
  startDate?: string;
  endDate?: string;
}

export function TimeOffDetailsDialog({
  open,
  onOpenChange,
  eventData,
  startDate,
  endDate,
}: TimeOffDetailsDialogProps) {
  if (!eventData) return null;

  const getStatusColor = (status: RequestStatus): string => {
    switch (status) {
      case RequestStatus.Approved:
        return "bg-green-100 text-green-800";
      case RequestStatus.Pending:
        return "bg-yellow-100 text-yellow-800";
      case RequestStatus.Refused:
        return "bg-red-100 text-red-800";
      case RequestStatus.Processing:
        return "bg-blue-100 text-blue-800";
      case RequestStatus.Assistant:
        return "bg-purple-100 text-purple-800";
      case RequestStatus.Balance:
        return "bg-gray-100 text-gray-800";
      case RequestStatus.Close:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        open ? "block" : "hidden"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {eventData?.type === "wfh"
              ? "WFH Request Details"
              : "Time-off Request Details"}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                eventData.status
              )}`}
            >
              {getStatusDisplayName(eventData.status)}
            </span>
          </div>

          {/* Total Days */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              Total Days:
            </span>
            <span className="text-sm text-gray-900">{eventData.totalDays}</span>
          </div>

          {/* Date Range */}
          <div>
            <span className="text-sm font-medium text-gray-700 block mb-2">
              Date Range:
            </span>
            <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
              <div className="flex items-center gap-2">
                <span className="font-medium">From:</span>
                <span>
                  {startDate
                    ? new Date(startDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-medium">To:</span>
                <span>
                  {endDate
                    ? new Date(endDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          {eventData.details && (
            <div>
              <span className="text-sm font-medium text-gray-700 block mb-2">
                Details:
              </span>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                {eventData.details}
              </p>
            </div>
          )}

          {/* Assistant (Time-off only) */}
          {eventData?.type === "time-off" &&
            "assistant" in eventData &&
            eventData.assistant && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-1">
                  Assistant:
                </span>
                <div className="text-sm text-gray-900">
                  <div className="font-medium">
                    {eventData.assistant.firstName}{" "}
                    {eventData.assistant.lastName}
                  </div>
                  <div className="text-gray-600">
                    {eventData.assistant.email}
                  </div>
                </div>
              </div>
            )}

          {/* Employee Info (WFH only) */}
          {eventData?.type === "wfh" &&
            "employeeName" in eventData &&
            eventData.employeeName && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-1">
                  Employee:
                </span>
                <div className="text-sm text-gray-900">
                  <div className="font-medium">{eventData.employeeName}</div>
                  {eventData.email && (
                    <div className="text-gray-600">{eventData.email}</div>
                  )}
                  {eventData.trigram && (
                    <div className="text-gray-600">
                      Trigram: {eventData.trigram}
                    </div>
                  )}
                  {eventData.position && (
                    <div className="text-gray-600">
                      Position: {eventData.position}
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* PM Info (Time-off only) */}
          {eventData?.type === "time-off" &&
            "pmName" in eventData &&
            eventData.pmName && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-1">
                  Project Manager:
                </span>
                <div className="text-sm text-gray-900">
                  <div className="font-medium">{eventData.pmName}</div>
                  {eventData.pmMail && (
                    <div className="text-gray-600">{eventData.pmMail}</div>
                  )}
                </div>
              </div>
            )}

          {/* Admin Note (Time-off only) */}
          {eventData?.type === "time-off" &&
            "adminNote" in eventData &&
            eventData.adminNote && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-2">
                  Admin Note:
                </span>
                <p className="text-sm text-gray-900 bg-blue-50 p-3 rounded-md">
                  {eventData.adminNote}
                </p>
              </div>
            )}

          {/* PM Note (Time-off only) */}
          {eventData?.type === "time-off" &&
            "pmNote" in eventData &&
            eventData.pmNote && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-2">
                  PM Note:
                </span>
                <p className="text-sm text-gray-900 bg-yellow-50 p-3 rounded-md">
                  {eventData.pmNote}
                </p>
              </div>
            )}

          {/* Work Space URL (WFH only) */}
          {eventData?.type === "wfh" &&
            "workSpaceUrl" in eventData &&
            eventData.workSpaceUrl && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-2">
                  Work Space URL:
                </span>
                <a
                  href={eventData.workSpaceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Open Work Space
                </a>
              </div>
            )}

          {/* Attached File */}
          {eventData.attachedFile && (
            <div>
              <span className="text-sm font-medium text-gray-700 block mb-2">
                Attached File:
              </span>
              <a
                href={eventData.attachedFile}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                View File
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
