import { Command } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { DayPickerProps } from "react-day-picker";

//============== Models ============== //

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
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface IFamily {
  name: string;
  relationship: string;
  placeOfBirth: string;
  bornDate: string;
  education: string;
  email: string;
  phoneNumber: string;
  occupation: string;
  company: string;
}

export interface ICandidate {
  id: string;
  firstName: string;
  lastName: string;
  jobApplied: string;
  phoneNumber: string;
  email: string;
  image: string;
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

export interface IFormalEducation {
  school: string;
  major: string;
  city: string;
  startDate: string;
  graduateDate: string;
  gpa: number;
}

export interface INonFormalEducation {
  instution: string;
  location: string;
  notes: string;
  startDate: string;
  graduateDate: string;
}

export interface IWorkExperience {
  company: string;
  initialPosition: string;
  finalPosition: string;
  supervision: string;
  supervisorContact: string;
  companyAddress: string;
  joinDate: Date;
  resignDate: Date;
  lastSalary: number;
  reasonOfResign: string;
}

export interface IContactOfReference {
  name: string;
  relationship: string;
  email: string;
  phoneNumber: string;
  occupation: string;
  company: string;
}
export interface IDepartment {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ITeam {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

//============== Component Props ============== //
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
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
  }[];
  modalChildren?: React.ReactNode;
}

export type BasicDatePickerProps = DayPickerProps & {
  label?: string;
  description?: string;
  isOptional?: boolean;
  labelClassName?: string;
  onSelect: (value?: Date) => void;
  value: Date;
};

export type DatePickerProps = DayPickerProps & {
  label?: string;
  name: string;
  description?: string;
  isOptional?: boolean;
  labelClassName?: string;
  onSelect?: () => void;
  value?: string;
};

export interface TextareaFormProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
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
  required?: boolean;
}
