export interface FormField {
  id: number;
  label: string;
  type: string;
  form_id: number;
  options?: string[];
  children?: React.ReactNode;
}
