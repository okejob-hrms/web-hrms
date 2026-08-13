import { IFieldResponse, IFormGroup } from "@/services/form/types";

type OrderableField = {
  order: number;
  group_order?: number;
};

/**
 * Field `order` is scoped per group (resets to 0 in each group).
 * When `group_order` is present, sort by that first, then field order.
 * Within a single group (no `group_order`), this is equivalent to sorting by `order`.
 */
export function compareFormFieldOrder(
  a: OrderableField,
  b: OrderableField,
): number {
  const groupA = a.group_order ?? 0;
  const groupB = b.group_order ?? 0;
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
 * Stamps a unique post-sort `group_order` so later sorts never re-interleave
 * fields when multiple groups share the same stored `order` value.
 */
export function flattenFormGroupsInTemplateOrder(
  groups: IFormGroup[] | undefined | null,
): IFieldResponse[] {
  if (!groups?.length) {
    return [];
  }

  return sortFormGroupsByTemplateOrder(groups).flatMap((group, groupIndex) => {
    const fields = sortFormFieldsByTemplateOrder(
      (group.fields ?? []).map((field) => ({
        ...field,
        field_group_id: Number(
          (field as { field_group_id?: number }).field_group_id ?? group.id,
        ),
        // Unique display rank after group sort — do not reuse stored group.order.
        group_order: groupIndex,
      })),
    );

    return fields as IFieldResponse[];
  });
}
