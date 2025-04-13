import { useState, useMemo } from "react";

type DateRange =
  | "all"
  | "today"
  | "yesterday"
  | "week"
  | "month"
  | "quarter"
  | "custom";

interface UseDateFilterOptions {
  initialDateRange?: DateRange;
  initialStartDate?: string;
  initialEndDate?: string;
}

interface UseDateFilterResult {
  selectedDateRange: DateRange;
  startDate: string;
  endDate: string;
  setSelectedDateRange: (value: DateRange) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  handleDateRangeChange: (value: DateRange) => void;
  isDateInRange: (dateString: string) => boolean;
}

/**
 * A custom hook for handling date filtering logic
 */
export function useDateFilter(
  options: UseDateFilterOptions = {},
): UseDateFilterResult {
  const {
    initialDateRange = "all",
    initialStartDate = "",
    initialEndDate = "",
  } = options;

  const [selectedDateRange, setSelectedDateRange] =
    useState<DateRange>(initialDateRange);
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(initialEndDate);

  const handleDateRangeChange = (value: DateRange) => {
    setSelectedDateRange(value);
    if (value !== "custom") {
      setStartDate("");
      setEndDate("");
    }
  };

  const isDateInRange = useMemo(() => {
    return (dateString: string): boolean => {
      const boxDate = new Date(dateString);

      if (startDate && endDate) {
        // Custom date range filter
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return boxDate >= start && boxDate <= end;
      } else if (selectedDateRange !== "all") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());

        const thisMonthStart = new Date(
          today.getFullYear(),
          today.getMonth(),
          1,
        );

        const thisQuarterStart = new Date(today);
        const quarterMonth = Math.floor(today.getMonth() / 3) * 3;
        thisQuarterStart.setMonth(quarterMonth, 1);
        thisQuarterStart.setHours(0, 0, 0, 0);

        switch (selectedDateRange) {
          case "today":
            return boxDate >= today;
          case "yesterday":
            return boxDate >= yesterday && boxDate < today;
          case "week":
            return boxDate >= thisWeekStart;
          case "month":
            return boxDate >= thisMonthStart;
          case "quarter":
            return boxDate >= thisQuarterStart;
          default:
            return true;
        }
      }

      return true;
    };
  }, [selectedDateRange, startDate, endDate]);

  return {
    selectedDateRange,
    startDate,
    endDate,
    setSelectedDateRange,
    setStartDate,
    setEndDate,
    handleDateRangeChange,
    isDateInRange,
  };
}
