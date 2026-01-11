import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface FilterProps {
  frequencyCode: number;
  onFilterChange?: (params: any) => void;
}

export function KeyResultFilter({ frequencyCode, onFilterChange }: FilterProps) {
  const [rangeLabel, setRangeLabel] = React.useState<string>("");
  const [isOpen, setIsOpen] = React.useState(false);

  const [date, setDate] = React.useState<DateRange | undefined>();

  const currentYear = new Date().getFullYear().toString();

  const weeks = Array.from({ length: 53 }, (_, i) => ({
    label: `Week ${i + 1}`,
    value: `W${(i + 1).toString().padStart(2, '0')}`
  }));

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ].map((m, i) => ({ label: m, value: (i + 1).toString().padStart(2, '0') }));

  const quarters = [1, 2, 3, 4].map(q => ({ label: `Q${q}`, value: q.toString() }));

  const handleApply = (label: string, params: any) => {
    setRangeLabel(label);
    setIsOpen(false);
    if (onFilterChange) onFilterChange(params);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="flex h-11 w-full items-center justify-between border rounded-lg px-3 py-2 text-sm font-medium text-[#2D3748] bg-white hover:bg-gray-50 transition-colors">
          <span className={!rangeLabel ? "text-gray-300" : "text-[#2D3748]"}>
            {rangeLabel || "Select Range"}
          </span>
          <CalendarIcon className="h-4 w-4 text-gray-400" />
        </button>
      </PopoverTrigger>
      
      <PopoverContent 
        className={cn(
            "p-4 shadow-xl border-gray-100 rounded-xl",
            frequencyCode === 4 ? "w-fit" : "w-[340px]" 
        )} 
        align="start"
      >
        {frequencyCode === 4 && (
          <div className="flex flex-col gap-4 items-center">
            <Calendar 
              mode="range" 
              className="p-0 border-none"
              selected={date}
              onSelect={setDate}
            />
            <button 
              disabled={!date?.from || !date?.to}
              onClick={() => {
                if (date?.from && date?.to) {
                  const label = `${format(date.from, "MMMM d, yyyy")} - ${format(date.to, "MMMM d, yyyy")}`;
                  handleApply(label, {
                    start_date: format(date.from, "yyyy-MM-dd"),
                    end_date: format(date.to, "yyyy-MM-dd")
                  });
                }
              }}
              className="w-full bg-[#18618B] text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Filter
            </button>
          </div>
        )}

        {frequencyCode === 0 && (
          <FilterGrid 
            label="Week" 
            options={weeks} 
            defaultYear={currentYear}
            onApply={(start: any, end: any, sYear: any, eYear: any) => {
              handleApply(`${start.l}, ${sYear} - ${end.l}, ${eYear}`, {
                start_week: `${sYear}-${start.v}`,
                end_week: `${eYear}-${end.v}`
              });
            }} 
          />
        )}

        {frequencyCode === 1 && (
          <FilterGrid 
            label="Month" 
            options={months} 
            defaultYear={currentYear}
            onApply={(start: any, end: any, sYear: any, eYear: any) => {
              handleApply(`${start.l}, ${sYear} - ${end.l}, ${eYear}`, {
                start_month: `${sYear}-${start.v}-1`,
                end_month: `${eYear}-${end.v}-1`
              });
            }} 
          />
        )}

        {frequencyCode === 2 && (
          <FilterGrid 
            label="Quarter" 
            options={quarters} 
            defaultYear={currentYear}
            onApply={(start: any, end: any) => {
              handleApply(`${start.l} - ${end.l}`, {
                start_quarter: parseInt(start.v),
                end_quarter: parseInt(end.v)
              });
            }} 
          />
        )}

        {frequencyCode === 3 && (
          <YearRangeForm 
            defaultYear={currentYear}
            onApply={(start: any, end: any) => {
              handleApply(`${start} - ${end}`, { 
                start_year: start,
                end_year: end 
              });
            }} 
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

function FilterGrid({ label, options, defaultYear, onApply }: any) {
  const [start, setStart] = React.useState(options[0].value);
  const [end, setEnd] = React.useState(options[options.length - 1].value);
  const [startYear, setStartYear] = React.useState(defaultYear);
  const [endYear, setEndYear] = React.useState(defaultYear);

  const handleYearChange = (val: string, setter: (v: string) => void) => {
    setter(val.replace(/[^0-9]/g, ""));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 w-full">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{label}*</span>
          <Select value={start} onValueChange={setStart}>
            <SelectTrigger className="w-full h-10"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {options.map((o: any) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Year*</span>
          <Input 
            value={startYear} 
            maxLength={4}
            onChange={(e) => handleYearChange(e.target.value, setStartYear)} 
            className="w-full h-10 focus-visible:ring-[#C86AA4]"
          />
        </div>
      </div>
      <div className="text-[10px] font-bold text-gray-400 uppercase">To</div>
      <div className="grid grid-cols-2 gap-3 w-full">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{label}*</span>
          <Select value={end} onValueChange={setEnd}>
            <SelectTrigger className="w-full h-10"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {options.map((o: any) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Year*</span>
          <Input 
            value={endYear} 
            maxLength={4}
            onChange={(e) => handleYearChange(e.target.value, setEndYear)} 
            className="w-full h-10 focus-visible:ring-[#C86AA4]"
          />
        </div>
      </div>
      <button 
        onClick={() => onApply(
          {v: start, l: options.find((o: any) => o.value === start).label},
          {v: end, l: options.find((o: any) => o.value === end).label},
          startYear,
          endYear
        )}
        className="w-full bg-[#18618B] text-white py-2.5 rounded-lg text-sm font-semibold mt-2 hover:opacity-90 transition-opacity"
      > Apply Filter </button>
    </div>
  );
}

function YearRangeForm({ defaultYear, onApply }: any) {
  const [s, setS] = React.useState(defaultYear);
  const [e, setE] = React.useState(defaultYear);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Year*</span>
        <Input 
            value={s} 
            maxLength={4}
            onChange={(ev) => setS(ev.target.value.replace(/[^0-9]/g, ""))} 
            className="w-full h-10 focus-visible:ring-[#C86AA4]"
        />
      </div>
      <div className="text-[10px] font-bold text-gray-400 uppercase">To</div>
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Year*</span>
        <Input 
            value={e} 
            maxLength={4}
            onChange={(ev) => setE(ev.target.value.replace(/[^0-9]/g, ""))} 
            className="w-full h-10 focus-visible:ring-[#C86AA4]"
        />
      </div>
      <button 
        onClick={() => onApply(s, e)} 
        className="w-full bg-[#18618B] text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90"
      > Apply Filter </button>
    </div>
  );
}