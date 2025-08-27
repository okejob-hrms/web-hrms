'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { IPermissionModule } from '@/services/settings/types';
import { snakeToTitleCase } from '@/lib/helpers';

type PermissionTableProps = {
  data: IPermissionModule[];
  selected: number[];
  onToggle: (id: number, checked: boolean) => void;
};

export function PermissionTable({
  data,
  selected,
  onToggle,
}: PermissionTableProps) {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No permissions available.</p>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-xl">Permissions</h2>

      {data?.map((item) => (
        <div key={item.module} className="space-y-2">
          <h3 className="font-semibold text-lg">
            {snakeToTitleCase(item.module)}
          </h3>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-neutral-50">
                <TableRow>
                  <TableHead className="text-left font-semibold py-3">
                    Functionality
                  </TableHead>
                  {item.columns.map((col) => (
                    <TableHead
                      key={col}
                      className="text-center font-semibold py-3"
                    >
                      {snakeToTitleCase(col)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {item.rows.map((row) => (
                  <TableRow key={row.key} className="hover:bg-gray-50">
                    <TableCell className="py-5 font-medium text-gray-600">
                      {snakeToTitleCase(row.key)}
                    </TableCell>

                    {Object.entries(row.actions).map(
                      ([actionKey, actionValue]) => (
                        <TableCell
                          key={actionValue.id}
                          className="text-center py-5"
                        >
                          <Checkbox
                            aria-label={`${snakeToTitleCase(
                              row.key,
                            )} ${snakeToTitleCase(actionKey)}`}
                            checked={selected.includes(actionValue.id)}
                            onCheckedChange={(val) =>
                              onToggle(actionValue.id, Boolean(val))
                            }
                          />
                        </TableCell>
                      ),
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}
