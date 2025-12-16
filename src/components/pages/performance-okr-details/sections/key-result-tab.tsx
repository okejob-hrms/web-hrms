import * as React from "react";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/tables/data-table";

type TimeRange = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

const generateDailyColumns = (startDate: Date, count: number = 7) => {
  const columns = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    columns.push({
      date: date,
      label: date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      key: `day_${i}`,
    });
  }
  return columns;
};

const generateWeeklyColumns = (startDate: Date, count: number = 6) => {
  const columns = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i * 7);
    const weekNumber = getWeekNumber(date);
    columns.push({
      date: date,
      label: `Week ${weekNumber} ${date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`,
      key: `week_${i}`,
    });
  }
  return columns;
};

const generateMonthlyColumns = (startDate: Date, count: number = 6) => {
  const columns = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    columns.push({
      date: date,
      label: date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      key: `month_${i}`,
    });
  }
  return columns;
};

const generateQuarterlyColumns = (startDate: Date, count: number = 4) => {
  const columns = [];
  const startQuarter = Math.floor(startDate.getMonth() / 3);
  const startYear = startDate.getFullYear();

  for (let i = 0; i < count; i++) {
    const quarterIndex = (startQuarter + i) % 4;
    const yearOffset = Math.floor((startQuarter + i) / 4);
    const year = startYear + yearOffset;
    columns.push({
      date: new Date(year, quarterIndex * 3, 1),
      label: `Q${quarterIndex + 1} ${year}`,
      key: `quarter_${i}`,
    });
  }
  return columns;
};

const generateYearlyColumns = (startDate: Date, count: number = 5) => {
  const columns = [];
  const startYear = startDate.getFullYear();
  for (let i = 0; i < count; i++) {
    const year = startYear + i;
    columns.push({
      date: new Date(year, 0, 1),
      label: `${year}`,
      key: `year_${i}`,
    });
  }
  return columns;
};

const getWeekNumber = (date: Date): number => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

interface KeyResultTabsProps {
  onTabChange: (value: TimeRange) => void;
}

export const KeyResultTabs = ({ onTabChange }: KeyResultTabsProps) => {
  return (
    <Tabs
      defaultValue="daily"
      onValueChange={(value) => onTabChange(value as TimeRange)}
      className="w-full mx-auto"
    >
      <TabsList className="bg-transparent relative rounded-none border-b p-0">
        <TabsTrigger
          className="bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary relative z-10 rounded-none border-0 data-[state=active]:text-primary data-[state=active]:font-semibold p-4"
          value="daily"
        >
          Daily (0)
        </TabsTrigger>
        <TabsTrigger
          className="bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary relative z-10 rounded-none border-0 data-[state=active]:text-primary data-[state=active]:font-semibold p-4"
          value="weekly"
        >
          Weekly (0)
        </TabsTrigger>
        <TabsTrigger
          className="bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary relative z-10 rounded-none border-0 data-[state=active]:text-primary data-[state=active]:font-semibold p-4"
          value="monthly"
        >
          Monthly (0)
        </TabsTrigger>
        <TabsTrigger
          className="bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary relative z-10 rounded-none border-0 data-[state=active]:text-primary data-[state=active]:font-semibold p-4"
          value="quarterly"
        >
          Quarterly (0)
        </TabsTrigger>
        <TabsTrigger
          className="bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary relative z-10 rounded-none border-0 data-[state=active]:text-primary data-[state=active]:font-semibold p-4"
          value="yearly"
        >
          Yearly (0)
        </TabsTrigger>
      </TabsList>
      <TabsContent value="daily" />
      <TabsContent value="weekly" />
      <TabsContent value="monthly" />
      <TabsContent value="quarterly" />
      <TabsContent value="yearly" />
    </Tabs>
  );
};

export const KeyResultTab = () => {
  const [selectedTimeRange, setSelectedTimeRange] =
    React.useState<TimeRange>("daily");
  const [currentStartDate, setCurrentStartDate] = React.useState(new Date());

  const handlePrevious = () => {
    const newDate = new Date(currentStartDate);
    switch (selectedTimeRange) {
      case "daily":
        newDate.setDate(newDate.getDate() - 7);
        break;
      case "weekly":
        newDate.setDate(newDate.getDate() - 42); // 6 weeks
        break;
      case "monthly":
        newDate.setMonth(newDate.getMonth() - 6);
        break;
      case "quarterly":
        newDate.setMonth(newDate.getMonth() - 12); // 4 quarters
        break;
      case "yearly":
        newDate.setFullYear(newDate.getFullYear() - 5);
        break;
    }
    setCurrentStartDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentStartDate);
    switch (selectedTimeRange) {
      case "daily":
        newDate.setDate(newDate.getDate() + 7);
        break;
      case "weekly":
        newDate.setDate(newDate.getDate() + 42); // 6 weeks
        break;
      case "monthly":
        newDate.setMonth(newDate.getMonth() + 6);
        break;
      case "quarterly":
        newDate.setMonth(newDate.getMonth() + 12); // 4 quarters
        break;
      case "yearly":
        newDate.setFullYear(newDate.getFullYear() + 5);
        break;
    }
    setCurrentStartDate(newDate);
  };

  const generateColumns = React.useMemo(() => {
    let timeColumns: { date: Date; label: string; key: string }[] = [];

    switch (selectedTimeRange) {
      case "daily":
        timeColumns = generateDailyColumns(currentStartDate);
        break;
      case "weekly":
        timeColumns = generateWeeklyColumns(currentStartDate);
        break;
      case "monthly":
        timeColumns = generateMonthlyColumns(currentStartDate);
        break;
      case "quarterly":
        timeColumns = generateQuarterlyColumns(currentStartDate);
        break;
      case "yearly":
        timeColumns = generateYearlyColumns(currentStartDate);
        break;
    }

    const columns: any[] = [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }: any) => {
          return (
            <div className="flex flex-col gap-2 min-w-[150px]">
              <span className="text-black text-sm font-medium">
                {row.original.name}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "target",
        header: () => (
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={handlePrevious}
              className="h-8 w-8 p-0 bg-primary-focused"
            >
              <ChevronLeft className="h-4 w-4 text-primary" />
            </Button>
          </div>
        ),
        size: 10,
        cell: ({ row }: any) => {
          return (
            <div className="flex flex-col -my-2">
              <div className="p-3.5 -mx-4">
                <span className="text-black text-sm">Actual</span>
              </div>
              <div className="bg-background p-3.5 -mx-4">
                <span className="text-black text-sm">Target</span>
              </div>
            </div>
          );
        },
      },
    ];

    timeColumns.forEach((timeCol, index) => {
      const isLastColumn = index === timeColumns.length - 1;

      columns.push({
        accessorKey: timeCol.key,
        header: () => (
          <div className="text-center min-w-[120px] flex items-center justify-center gap-2">
            {isLastColumn ? (
              <Button
                size="sm"
                onClick={handleNext}
                className="h-8 w-8 p-0 bg-primary-focused"
              >
                <ChevronRight className="h-4 w-4 text-primary" />
              </Button>
            ) : (
              <span className="text-sm font-medium">{timeCol.label}</span>
            )}
          </div>
        ),
        cell: ({ row }: any) => {
          const data = row.original[timeCol.key] || { actual: "", target: "" };
          if (!isLastColumn) {
            return (
              <div className="flex flex-col -my-2">
                <div className="p-2 -mx-4">
                  <Input
                    type="number"
                    value={data.actual}
                    onChange={(e) => {
                      console.log(
                        `Actual for ${row.original.name} on ${timeCol.label}:`,
                        e.target.value,
                      );
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="bg-background p-2 -mx-4">
                  <Input
                    type="number"
                    value={data.target}
                    onChange={(e) => {
                      console.log(
                        `Target for ${row.original.name} on ${timeCol.label}:`,
                        e.target.value,
                      );
                    }}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            );
          }
        },
      });
    });

    return columns;
  }, [selectedTimeRange, currentStartDate]);

  const mockData = [
    {
      name: "Revenue Growth",
      day_0: { actual: "", target: "" },
      day_1: { actual: "", target: "" },
      day_2: { actual: "", target: "" },
      day_3: { actual: "", target: "" },
      day_4: { actual: "", target: "" },
      day_5: { actual: "", target: "" },
      day_6: { actual: "", target: "" },
    },
    {
      name: "Customer Satisfaction",
      day_0: { actual: "", target: "" },
      day_1: { actual: "", target: "" },
      day_2: { actual: "", target: "" },
      day_3: { actual: "", target: "" },
      day_4: { actual: "", target: "" },
      day_5: { actual: "", target: "" },
      day_6: { actual: "", target: "" },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Search"
        icon={<Search className="size-5 text-grayscale-20" />}
        iconPosition="right"
        className="md:max-w-[320px]"
      />
      <KeyResultTabs onTabChange={setSelectedTimeRange} />
      <div>
        <div className="flex justify-between py-5 px-6">
          <div className="flex items-center gap-2">
            <h2 className="text-gray-900 font-semibold">Key Result Data</h2>
          </div>
          <Button>Save</Button>
        </div>
        <DataTable columns={generateColumns} data={mockData} />
      </div>
    </div>
  );
};
