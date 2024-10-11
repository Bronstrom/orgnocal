import React, { useState } from "react";
import FullCalendar, {
  DateSelectArg,
  EventContentArg,
} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import multiMonthPlugin from "@fullcalendar/multimonth";
import Header from "@/components/Header";
import { IconCalendarWeek } from "@tabler/icons-react";
import { useGetTasksQuery } from "@/state/api";
import { useRouter } from "next/navigation";

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
  const {
    data: tasks,
    isLoading,
    error,
  } = useGetTasksQuery({
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

  async function handleEventSelection(eventContent: EventContentArg) {
    eventContent.jsEvent.preventDefault();
    router.push(`/tasks/${eventContent.event.id}`);
  }

  // TODO: This could be in utils & replace any type
  function selectObjectTaskListReplacementProps(...props: any) {
    return function (object: any) {
      const condensedObject = {};
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
