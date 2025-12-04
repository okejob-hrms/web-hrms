import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  IAssessmentField,
  IAssessmentGroup,
} from "@/services/employees/self-assessment/types";
import { getFormById } from "@/services/form";
import { IFormGroup } from "@/services/form/types";
import { FormFieldRenderer } from "./form-field-renderer";
import { Skeleton } from "@/components/ui/skeleton";

interface OpenSections {
  [key: string]: boolean;
}

interface AssessmentFormProps {
  formId: number;
  fields?: IAssessmentField[];
  groups?: IAssessmentGroup[];
}

interface GroupFieldsMap {
  [groupId: number]: IFormGroup["fields"];
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  formId,
  fields,
  groups,
}) => {
  const [openSections, setOpenSections] = useState<OpenSections>({});
  const [groupFields, setGroupFields] = useState<GroupFieldsMap>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (groups && groups.length > 0) {
      const initialOpenState = groups.reduce(
        (acc, group) => ({
          ...acc,
          [group.field_group_id]: true,
        }),
        {},
      );
      setOpenSections(initialOpenState);
    }
  }, [groups]);

  useEffect(() => {
    const fetchFormData = async () => {
      if (!formId || !groups || groups.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getFormById(formId);

        if (response.data && response.data.groups) {
          const fieldsMap: GroupFieldsMap = {};

          response.data.groups.forEach((group: IFormGroup) => {
            const groupId = parseInt(group.id);
            if (group.fields && Array.isArray(group.fields)) {
              fieldsMap[groupId] = group.fields;
            }
          });

          setGroupFields(fieldsMap);
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [formId, groups]);

  const toggleSection = (section: string | number): void => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const getFieldAssessmentValue = (fieldId: number, groupId: number) => {
    if (!fields) return undefined;
    return fields.find(
      (f) => f.field_id === fieldId && f.field_group_id === groupId,
    );
  };

  if (!groups || groups.length === 0) {
    return (
      <div className="w-full mx-auto p-6 text-center text-primary font-semibold">
        No assessment groups available
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      {loading || !groups || groups.length === 0 ? (
        <Skeleton />
      ) : (
        groups.map((group) => {
          const fieldsForGroup = groupFields[group.field_group_id] || [];

          return (
            <Collapsible
              key={group.field_group_id}
              open={openSections[group.field_group_id]}
              onOpenChange={() => toggleSection(group.field_group_id)}
              className="mb-6"
            >
              <div className="bg-white border border-gray-200 rounded-lg">
                <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-[#0e6488]">
                      {group.name}
                    </h2>
                  </div>
                  {openSections[group.field_group_id] ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-6 space-y-4">
                    {fieldsForGroup.length === 0 ? (
                      <div className="text-center py-4 text-primary font-semibold">
                        No fields available for this group
                      </div>
                    ) : (
                      fieldsForGroup
                        .sort((a, b) => a.order - b.order)
                        .map((field) => {
                          const assessmentValue = getFieldAssessmentValue(
                            field.id,
                            group.field_group_id,
                          );

                          return (
                            <FormFieldRenderer
                              key={field.id}
                              field={{
                                ...field,
                                form_id: field.form_id,
                              }}
                              value={assessmentValue}
                            />
                          );
                        })
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })
      )}
    </div>
  );
};
