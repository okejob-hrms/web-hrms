import { Command } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { DayPickerProps } from "react-day-picker";

//============== Models ============== //

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

//============== Component Props ============== //
export interface InputFormProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  description?: string;
  isOptional?: boolean;
  inputClassName?: string;
  labelClassName?: string;
}

export interface OptionFormProps extends InputFormProps {
  options: {
    label: string;
    value: string;
  }[];
}

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

export interface MultipleSelectFormProps {
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

export interface MultipleSelectFormRef {
  selectedValue: Option[];
  input: HTMLInputElement;
  focus: () => void;
  reset: () => void;
}

export interface UploadButtonProps extends React.ComponentProps<"button"> {
  label: string;
  required?: boolean;
}
