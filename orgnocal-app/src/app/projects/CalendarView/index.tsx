import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import multiMonthPlugin from "@fullcalendar/multimonth";
import Header from "@/components/Header";
import { IconCalendarWeek } from "@tabler/icons-react";
import { useGetTasksQuery } from "@/state/api";
import { useRouter } from "next/navigation";
import { DateSelectArg, EventContentArg } from "@fullcalendar/core/index.js";
import MoreInfo from "@/components/MoreInfo";

const views = {
  timeGridDay: {
    type: "timeGridDay",
    buttonText: "Day",
    duration: { days: 1 },
  },
  timeGridWeek: {
    type: "timeGridWeek",
    buttonText: "Week",
    duration: { weeks: 1 },
  },
  dayGridMonth: {
    type: "dayGridMonth",
    buttonText: "Month",
    duration: { months: 1 },
  },
  multiMonthSixMonth: {
    type: "multiMonth",
    buttonText: "6 Months",
    duration: { months: 6 },
  },
};

// TODO: Props can be reused from the different views
type CalendarViewProps = {
  id: string;
  isArchivedSelected: boolean;
  taskSearchQuery: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  setStartAndEndDates: (startAndEndDates: string[]) => void;
};

const CalendarView = ({
  id,
  isArchivedSelected,
  taskSearchQuery,
  setIsModalNewTaskOpen,
  setStartAndEndDates,
}: CalendarViewProps) => {
  const { data: tasks } = useGetTasksQuery({
    projectId: Number(id),
    isArchived: isArchivedSelected,
    query: taskSearchQuery,
  });
  const router = useRouter();

  const [isShowingWeekends, setIsShowingWeekends] = useState(true);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setIsModalNewTaskOpen(true);
    setStartAndEndDates([selectInfo.startStr, selectInfo.endStr]);
  };

  // TODO: Replace any - could be EventContentArg
  async function handleEventSelection(eventContent: any) {
    eventContent.jsEvent.preventDefault();
    router.push(`/tasks/${eventContent.event.id}`);
  }

  // TODO: This could be in utils & replace any type
  function selectObjectTaskListReplacementProps(...props: any) {
    return function (object: any) {
      const condensedObject: any = {};
      props.forEach((nameReplacement: any) => {
        condensedObject[nameReplacement[1]] = object[nameReplacement[0]];
      });
      return condensedObject;
    };
  }

  function renderEventContent(eventContent: EventContentArg) {
    return (
      <>
        <b>{eventContent.timeText}</b> <i>{eventContent.event.title}</i>
      </>
    );
  }

  const condensedTasksList = tasks?.map(
    selectObjectTaskListReplacementProps(
      ["id", "id"],
      ["title", "title"],
      ["startDate", "start"],
      ["endDate", "end"],
    ),
  );

  return (
    <div className="gap-2 px-4 py-5 dark:text-gray-500 xl:px-6">
      <div className="flex flex-wrap items-center justify-between">
        <Header
          title="Calendar"
          rightAlignedComponent={
            <div className="flex flex-wrap items-center gap-5">
              <MoreInfo
                title={
                  <div className="grid gap-2">
                    <div className="text-center">
                      <b>Calendar View Info:</b>
                    </div>
                    <div>
                      Calendar View displays tasks according to their start and
                      end dates. Use the timeframe buttons on the top right of
                      the calendar to select between: &quot;6 Months&quot;,
                      &quot;Month&quot;, and &quot;Week&quot;, and
                      &quot;Day&quot; to see how tasks lineup for different time
                      periods.
                    </div>
                    <div>
                      <b>Time Periods:</b> Use the arrows on the right to switch
                      between the previous and next period according to the
                      timeframe selected. To return to the current period, use
                      the &quot;today&quot; button next to the arrows.
                    </div>
                    <div>
                      <b>Weekends:</b> Weekends can be hidden/revealed with the
                      &quot;Hide Weekends&quot; and &quot;Show Weekends&quot;
                      buttons, respectively.
                    </div>
                  </div>
                }
              />
              <div className="relative inline-block">
                <button
                  className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
                  onClick={() => setIsShowingWeekends(!isShowingWeekends)}
                >
                  <IconCalendarWeek className="mr-2 h-5 w-5" />
                  {!isShowingWeekends ? "Show Weekends" : "Hide Weekends"}
                </button>
              </div>
            </div>
          }
          isSmallText
        />
      </div>
      <div className="rounded-md bg-white p-5 shadow dark:bg-dark-secondary dark:text-white">
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            multiMonthPlugin,
          ]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "multiMonthSixMonth,dayGridMonth,timeGridWeek,timeGridDay",
          }}
          initialView="dayGridMonth"
          views={views}
          events={condensedTasksList}
          // TODO: If wanting to keep drag-n-drop will need to actually update dates
          editable={true}
          selectable={true}
          dayMaxEvents={true}
          weekends={isShowingWeekends}
          select={handleDateSelect}
          eventContent={renderEventContent} // custom render function
          eventClick={handleEventSelection}
        />
      </div>
    </div>
  );
};

export default CalendarView;
