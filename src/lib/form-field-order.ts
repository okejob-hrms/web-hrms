import { IFieldResponse, IFormGroup } from "@/services/form/types";

type OrderableField = {
  order: number;
  group_order?: number;
  field_group_id?: number;
};

/**
 * Field `order` is scoped per group (resets to 0 in each group).
 * Sort by group template order first, then field order within the group.
 */
export function compareFormFieldOrder(
  a: OrderableField,
  b: OrderableField,
): number {
  const groupA = a.group_order ?? a.field_group_id ?? 0;
  const groupB = b.group_order ?? b.field_group_id ?? 0;
  if (groupA !== groupB) {
    return groupA - groupB;
  }
  return a.order - b.order;
}

export function sortFormFieldsByTemplateOrder<T extends OrderableField>(
  fields: T[],
): T[] {
  return [...fields].sort(compareFormFieldOrder);
}

export function sortFormGroupsByTemplateOrder(
  groups: IFormGroup[],
): IFormGroup[] {
  return [...groups].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * Flatten form groups into fields in the same order as the form template UI.
 */
export function flattenFormGroupsInTemplateOrder(
  groups: IFormGroup[] | undefined | null,
): IFieldResponse[] {
  if (!groups?.length) {
    return [];
  }

  return sortFormGroupsByTemplateOrder(groups).flatMap((group, groupIndex) => {
    const groupOrder = group.order ?? groupIndex;
    const fields = sortFormFieldsByTemplateOrder(
      (group.fields ?? []).map((field) => ({
        ...field,
        field_group_id: Number(
          (field as { field_group_id?: number }).field_group_id ?? group.id,
        ),
        group_order: groupOrder,
      })),
    );

    return fields as IFieldResponse[];
  });
}
