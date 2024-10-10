// TODO: Split this out into different styling utils

// FORM
export const formSelectStyles =
  "mb-4 block w-full rounded border border-gray-300 px-3 py-2 dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";

export const formLabelStyles = "block text-sm font-medium dark:text-white";

export const formInputStyles =
  "w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";

// CHART
// TODO: If possible with recharts use what is defined in tailwind.config:
// These are just primary, secondary and tertiary
export const pieChartColors = ["#24e7c7", "#2445e7", "#24a6e7"];

// TODO: If possible with recharts use what is defined in tailwind.config:
// These are just secondary and tertiary with dark-bg and white
export const barChartColorsLight = {
  bar: "#24e7c7",
  barGrid: "#2445e7",
  text: "#fffbfe",
};

export const barChartColorsDark = {
  bar: "#2445e7",
  barGrid: "#24e7c7",
  text: "#0e0e0e",
};

// DATA GRID
export const dataGridClassNames =
  "border border-gray-200 bg-white shadow dark:border-stroke-dark dark:bg-dark-secondary dark:text-gray-200";

export const dataGridSxStyles = (isDarkMode: boolean) => {
  return {
    // TODO: Common Tailwind CSS colors? - may have difficulties with MUI
    "& .MuiDataGrid-columnHeaders": {
      // TODO: gray-100
      color: isDarkMode ? "#dedcdd" : "",
      '& [role="row"] > *': {
        // TODO: dark-secondary and white
        backgroundColor: isDarkMode ? "#1d1b1c" : "#fffbfe",
        // TODO: dark-stroke
        borderColor: isDarkMode ? "#2b292a" : "",
      },
    },
    "& .MuiIconbutton-root": {
      // TODO: gray-300
      color: isDarkMode ? "#9b9698" : "",
    },
    "& .MuiTablePagination-root": {
      // TODO: gray-300
      color: isDarkMode ? "#9b9698" : "",
    },
    "& .MuiTablePagination-selectIcon": {
      // TODO: gray-300
      color: isDarkMode ? "#9b9698" : "",
    },
    "& .MuiDataGrid-cell": {
      border: "none",
    },
    "& .MuiDataGrid-row": {
      // TODO: dark-stroke and gray-200
      borderBottom: `1px solid ${isDarkMode ? "#2b292a" : "#bcb9bb"}`,
    },
    "& .MuiDataGrid-withBorderColor": {
      // TODO: dark-stroke and gray-200
      borderColor: isDarkMode ? "#2b292a" : "#bcb9bb",
    },
  };
};
