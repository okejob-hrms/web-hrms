/* eslint-disable @typescript-eslint/no-explicit-any */
import { Command } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { DayPickerProps } from "react-day-picker";

//============== Models ============== //

export interface ApiPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface PaginatedResponse<T> {
  current_page: number;
  current_page_url: string;
  data: T[];
  first_page_url: string;
  from: number;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
  last_page?: number;
  next?: string | null;
  prev?: string | null;
  pagination?: ApiPagination;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export interface ApiSummaryResponse<T, S> {
  status: string;
  message: string;
  summary: S;
  data: T;
}

export interface IEmployee {
  firstName: string;
  lastName: string;
  employeeId: string;
  position: string;
  department: string;
  email: string;
  phoneNo: string;
  status: "active" | "inactive" | "on_leave";
  joinDate: string;
  image: string;
}

export interface IDepartment {
  id: number;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ITeam {
  id: number;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface IDocument {
  id: number;
  employee_profile_id: number;
  type: string;
  filename: string;
  mime_type: string;
  size: number;
  path: string;
  disk: string;
  uploaded_by: {
    id: number;
    name: string;
  };
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

//============== Component Props ============== //
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}
export interface InputFormProps extends InputProps {
  name: string;
  label?: string;
  description?: string;
  isOptional?: boolean;
  inputClassName?: string;
  labelClassName?: string;
  formItemClassName?: string;
}

export interface OptionFormProps extends InputFormProps {
  options: {
    label: string;
    value: string;
    icon?: React.ReactNode;
    subtitle?: string;
    image?: string;
  }[];
  modalChildren?: React.ReactNode;
  type?: "string" | "number";
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  allowClear?: boolean;
}

export type BasicDatePickerProps = DayPickerProps & {
  label?: string;
  description?: string;
  isOptional?: boolean;
  labelClassName?: string;
  onSelect: (value?: Date) => void;
  value?: Date;
  placeholder?: string;
};

export type DatePickerProps = DayPickerProps & {
  label?: string;
  name: string;
  description?: string;
  isOptional?: boolean;
  labelClassName?: string;
  onSelect?: () => void;
  value?: string;
  required?: boolean;
  placeholder?: string;
  onChange?: (value?: Date) => void;
};

export interface TextareaFormProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
  description?: string;
  isOptional?: boolean;
  inputClassName?: string;
  labelClassName?: string;
}

export interface Option {
  value: string;
  label: string;
  disable?: boolean;
  fixed?: boolean;
  [key: string]: string | boolean | undefined;
}

export interface SelectFilterProps {
  placeholder?: string;
  options: Option[];
  label?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export interface GroupOption {
  [key: string]: Option[];
}

export interface MultipleSelectProps {
  value?: Option[];
  defaultOptions?: Option[];
  options?: Option[];
  placeholder?: string;
  loadingIndicator?: React.ReactNode;
  emptyIndicator?: React.ReactNode;
  delay?: number;
  triggerSearchOnFocus?: boolean;
  onSearch?: (value: string) => Promise<Option[]>;
  onSearchSync?: (value: string) => Option[];
  onChange?: (options: Option[]) => void;
  maxSelected?: number;
  onMaxSelected?: (maxLimit: number) => void;
  hidePlaceholderWhenSelected?: boolean;
  disabled?: boolean;
  groupBy?: string;
  className?: string;
  badgeClassName?: string;
  selectFirstItem?: boolean;
  creatable?: boolean;
  commandProps?: React.ComponentPropsWithoutRef<typeof Command>;
  inputProps?: Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
    "value" | "placeholder" | "disabled"
  >;
  hideClearAllButton?: boolean;
}

export interface MultipleSelectRef {
  selectedValue: Option[];
  input: HTMLInputElement;
  focus: () => void;
  reset: () => void;
}

export interface MultipleSelectFormProps extends MultipleSelectProps {
  name: string;
  label?: string;
}

export interface UploadButtonProps extends React.ComponentProps<"button"> {
  label: string;
  required: boolean;
  name: string;
  defaultFile?: {
    filename: string;
    size: number;
    path: string;
    mime_type: string;
  };
  error?: string;
}

export interface ComboboxOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface ComboboxGroup {
  label: string;
  options: ComboboxOption[];
  renderOption?: (option: ComboboxOption, index: number) => React.ReactNode;
}

export interface SearchableSelectProps {
  value?: string | number | null;
  onValueChange: (value: string | number | null) => void;
  options?: ComboboxOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
  valueType?: "string" | "number";
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  modalChildren?: React.ReactNode;
  emptyMessage?: string;
  searchPlaceholder?: string;
  popoverClassName?: string;
  isLoading?: boolean;
  loadingMessage?: string;
}

export interface ComboboxProps extends InputFormProps {
  label?: string;
  name: string;
  labelClassName?: string;
  formItemClassName?: string;
  isOptional?: boolean;
  placeholder?: string;
  valueType?: "string" | "number";
  options?: ComboboxOption[];
  groups?: ComboboxGroup[];
  emptyMessage?: string;
  searchPlaceholder?: string;
  popoverClassName?: string;
  allowClear?: boolean;
  modalChildren?: React.ReactNode;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
  renderOption?: (
    option: ComboboxOption,
    fieldValue: any,
    isSelected?: boolean,
    handleSelect?: (option: ComboboxOption) => void,
  ) => React.ReactNode;
}
