import * as React from "react";

export interface FormField {
  id: number;
  label: string;
  type: string;
  form_id: number;
  options?:
    | string[]
    | {
        min: number;
        max: number;
      };
  children?: React.ReactNode;
}
