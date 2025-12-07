import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

const dateRanges = [
  { label: "Últimos 7 dias", value: "7daysAgo", endDate: "today" },
  { label: "Últimos 14 dias", value: "14daysAgo", endDate: "today" },
  { label: "Últimos 30 dias", value: "30daysAgo", endDate: "today" },
  { label: "Últimos 90 dias", value: "90daysAgo", endDate: "today" },
  { label: "Este mês", value: "month", endDate: "today" },
  { label: "Este trimestre", value: "quarter", endDate: "today" },
];

interface DateRangePickerProps {
  onDateChange?: (startDate: string, endDate: string) => void;
  defaultRange?: number;
}

export function DateRangePicker({ onDateChange, defaultRange = 2 }: DateRangePickerProps) {
  const [selected, setSelected] = useState(dateRanges[defaultRange]);

  useEffect(() => {
    if (onDateChange) {
      onDateChange(selected.value, selected.endDate);
    }
  }, [selected, onDateChange]);

  const handleSelect = (range: typeof dateRanges[0]) => {
    setSelected(range);
    if (onDateChange) {
      onDateChange(range.value, range.endDate);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          {selected.label}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {dateRanges.map((range) => (
          <DropdownMenuItem
            key={range.value}
            onClick={() => handleSelect(range)}
            className="cursor-pointer"
          >
            {range.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
