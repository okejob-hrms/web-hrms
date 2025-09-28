/* eslint-disable @typescript-eslint/no-explicit-any */
import DataTable from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { InputForm } from "@/components/ui/input";
import { MultiSelectForm } from "@/components/ui/multi-select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { getEmployees } from "@/services/employees";
import {
  getHandoverAssetsReturn,
  storeWorkDocumentHandover,
} from "@/services/employees/offboardings/handover-and-assets";
import {
  IWorkAndHandoverResponse,
  IWorkDocumentHandoverRequest,
} from "@/services/employees/offboardings/handover-and-assets/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface TableProps {
  offboarding_id: number;
}

interface FormModalProps {
  offboarding_id: number;
}

export const FormModal = React.memo(function FormModal({
  offboarding_id,
}: FormModalProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [searchEmployee, setSearchEmployee] = React.useState("");
  const debouncedEmployee = useDebounce(searchEmployee, 300);

  const form = useForm<IWorkDocumentHandoverRequest>({
    defaultValues: {
      category: "document",
      name: "",
      recipients: [],
    },
  });

  const { data: employees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["offboarding-employees", debouncedEmployee],
    queryFn: () =>
      getEmployees(debouncedEmployee ? { search: debouncedEmployee } : {}),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const mutation = useMutation({
    mutationFn: (data: IWorkDocumentHandoverRequest) =>
      storeWorkDocumentHandover(offboarding_id, data),
    onSuccess: () => {
      toast.success("Document handover created successfully");
      form.reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["document-handover"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create document handover");
    },
  });

  const employeesOptions = React.useMemo(() => {
    if (employees?.data?.data) {
      return employees.data.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [employees?.data]);

  const handleSubmit = (values: IWorkDocumentHandoverRequest) => {
    mutation.mutate({
      ...values,
      recipients: values.recipients.map((item) => ({
        user_id: item as unknown as number,
        status: 1,
      })),
    });
  };

  const handleCancel = () => {
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-fit">
          Add <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white md:min-w-5xl overflow-y-scroll max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Document Handover</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <InputForm label="Document Name" name="name" required />
            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">
                Handed Over To<span className="text-error">*</span>
              </label>
              <MultiSelectForm
                options={employeesOptions}
                name="recipients"
                maxCount={3}
                searchPlaceholder="Search Employee"
                hideSelectAll
                disabled={isLoadingEmployees}
                valueTransformer={(value) => Number(value)}
                searchValue={searchEmployee}
                onSearchChange={setSearchEmployee}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending || !form.formState.isValid}
              >
                {mutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});

export const DocumentHandoverTable = React.memo(function DocumentHandoverTable({
  offboarding_id,
}: TableProps) {
  const { data, isLoading } = useQuery({
    queryKey: offboarding_id
      ? ["document-handover", offboarding_id]
      : ["document-handover"],
    queryFn: () =>
      getHandoverAssetsReturn({ offboarding_id, category: "document" }),
    retry: (failureCount, error: any) => {
      console.error("Query error:", error);
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: !!offboarding_id,
  });

  const columns: ColumnDef<IWorkAndHandoverResponse>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Works",
      },
      {
        accessorKey: "recipients",
        header: "Handed Over To",
        cell: ({ row }) => (
          <div>
            {row.original.recipients.map((item) => (
              <span key={item.id}>{item.name}</span>
            ))}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
      },
      {
        accessorKey: "received_at",
        header: "Received Date",
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h4 className="font-semibold text-lg">Document Handover</h4>
        <FormModal offboarding_id={offboarding_id} />
      </div>
      {isLoading ? (
        <div className="flex flex-col gap-4 items-center w-full">
          <Skeleton className="h-12 w-full" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-30 w-full" />
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data.data || []}
          tableClassName="table-fixed w-full"
          tableCellClassName="w-1/9 text-clip text-balance"
          tableHeadClassName="w-1/9 text-clip text-balance"
        />
      )}
    </div>
  );
});
