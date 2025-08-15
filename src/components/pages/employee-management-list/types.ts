export interface Filters {
  department: string[];
  position: string[];
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface AdvancedFilterProps {
  onChangePosition: (val: string[]) => void;
  onChangeDepartment: (val: string[]) => void;
  onChangeName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  onChangeStartDate: (val: Date) => void;
  onChangeEndDate: (val: Date) => void;
  filterData: Filters;
}
