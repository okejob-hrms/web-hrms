import * as React from "react";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/tables/data-table";
import { useOKRTrackingPeriods } from "../hook";
import { Skeleton } from "@/components/ui/skeleton";

interface KeyResultTabsProps {
  periodType: string;
  onPeriodTypeChange: (value: string) => void;
}

export const KeyResultTabs = ({
  periodType,
  onPeriodTypeChange,
}: KeyResultTabsProps) => {
  return (
    <Tabs
      value={periodType}
      onValueChange={onPeriodTypeChange}
      className="w-full mx-auto"
    >
      <TabsList className="bg-transparent relative rounded-none border-b p-0">
        <TabsTrigger
          className="bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary relative z-10 rounded-none border-0 data-[state=active]:text-primary data-[state=active]:font-semibold p-4"
          value="4"
        >
          Daily
        </TabsTrigger>
        <TabsTrigger
          className="bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary relative z-10 rounded-none border-0 data-[state=active]:text-primary data-[state=active]:font-semibold p-4"
          value="0"
        >
          Weekly
        </TabsTrigger>
        <TabsTrigger
          className="bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary relative z-10 rounded-none border-0 data-[state=active]:text-primary data-[state=active]:font-semibold p-4"
          value="1"
        >
          Monthly
        </TabsTrigger>
        <TabsTrigger
          className="bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary relative z-10 rounded-none border-0 data-[state=active]:text-primary data-[state=active]:font-semibold p-4"
          value="2"
        >
          Quarterly
        </TabsTrigger>
        <TabsTrigger
          className="bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary relative z-10 rounded-none border-0 data-[state=active]:text-primary data-[state=active]:font-semibold p-4"
          value="3"
        >
          Yearly
        </TabsTrigger>
      </TabsList>
      <TabsContent value="4" />
      <TabsContent value="0" />
      <TabsContent value="1" />
      <TabsContent value="2" />
      <TabsContent value="3" />
    </Tabs>
  );
};

export const KeyResultTab = () => {
  const {
    periodType,
    handlePeriodTypeChange,
    searchKeyResult,
    setSearchKeyResult,
    tableData,
    periodColumns,
    isLoadingTrackingPeriods,
    handleUpdateValue,
    handleSaveTrackingPeriods,
    isSaving,
  } = useOKRTrackingPeriods();

  const [columnOffset, setColumnOffset] = React.useState(0);
  const visibleColumnsCount = 6;

  const handlePrevious = () => {
    setColumnOffset((prev) => Math.max(0, prev - visibleColumnsCount));
  };

  const handleNext = () => {
    setColumnOffset((prev) =>
      Math.min(
        Math.max(0, periodColumns.length - visibleColumnsCount),
        prev + visibleColumnsCount,
      ),
    );
  };

  React.useEffect(() => {
    setColumnOffset(0);
  }, [periodType]);

  const visiblePeriodColumns = React.useMemo(() => {
    return periodColumns.slice(
      columnOffset,
      columnOffset + visibleColumnsCount,
    );
  }, [periodColumns, columnOffset, visibleColumnsCount]);

  const generateColumns = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const columns: any[] = [
      {
        accessorKey: "name",
        header: "Name",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
              disabled={columnOffset === 0}
              className="h-8 w-8 p-0 bg-primary-focused disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 text-primary" />
            </Button>
          </div>
        ),
        size: 10,
        cell: () => {
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

    visiblePeriodColumns.forEach((periodCol, index) => {
      const isLastColumn = index === visiblePeriodColumns.length - 1;

      columns.push({
        accessorKey: periodCol.key,
        header: () => (
          <div className="text-center min-w-[120px] flex items-center justify-center gap-2">
            {isLastColumn ? (
              <Button
                size="sm"
                onClick={handleNext}
                disabled={
                  columnOffset + visibleColumnsCount >= periodColumns.length
                }
                className="h-8 w-8 p-0 bg-primary-focused disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4 text-primary" />
              </Button>
            ) : (
              <span className="text-sm font-medium">{periodCol.label}</span>
            )}
          </div>
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cell: ({ row }: any) => {
          const data = row.original[periodCol.key] || { actual: 0, target: 0 };
          if (!isLastColumn) {
            return (
              <div className="flex flex-col -my-2">
                <div className="p-2 -mx-4">
                  <Input
                    type="number"
                    defaultValue={data.actual}
                    onChange={(e) => {
                      handleUpdateValue(
                        row.original.okr_key_result_id,
                        data.period_id,
                        Number(e.target.value),
                      );
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="bg-background p-2 -mx-4">
                  <Input
                    type="number"
                    defaultValue={data.target}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            );
          }
          return null;
        },
      });
    });

    return columns;
  }, [visiblePeriodColumns, columnOffset, periodColumns.length]);

  if (isLoadingTrackingPeriods) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Search key results..."
        value={searchKeyResult}
        onChange={(e) => setSearchKeyResult(e.target.value)}
        icon={<Search className="size-5 text-grayscale-20" />}
        iconPosition="right"
        className="md:max-w-[320px]"
      />
      <KeyResultTabs
        periodType={periodType}
        onPeriodTypeChange={handlePeriodTypeChange}
      />
      <div>
        <div className="flex justify-between py-5 px-6">
          <div className="flex items-center gap-2">
            <h2 className="text-gray-900 font-semibold">Key Result Data</h2>
            {periodColumns.length > 0 && (
              <span className="text-sm text-muted-foreground">
                ({columnOffset + 1}-
                {Math.min(
                  columnOffset + visibleColumnsCount,
                  periodColumns.length,
                )}{" "}
                of {periodColumns.length})
              </span>
            )}
          </div>
          <Button onClick={handleSaveTrackingPeriods} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
        {tableData.length > 0 ? (
          <DataTable columns={generateColumns} data={tableData} />
        ) : (
          <div className="flex items-center justify-center h-40 font-semibold border border-primary text-primary rounded-md bg-background">
            No key results found for this period type
          </div>
        )}
      </div>
    </div>
  );
};
