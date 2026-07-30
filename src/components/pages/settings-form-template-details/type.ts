import * as React from "react";

export interface FormField {
  id: number;
  label: string;
  type: string;
  form_id: number;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  competency_levels?:
    | {
        id: number;
        dimensions: string;
        level: string;
        name: string;
        description: string;
      }[]
    | null;
  options?:
    | string[]
    | {
        min: number;
        max: number;
      };
  children?: React.ReactNode;
}
