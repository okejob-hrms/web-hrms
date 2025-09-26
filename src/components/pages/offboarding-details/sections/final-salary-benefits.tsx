import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { SelectForm } from "@/components/ui/select-form";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as React from "react";
import { useForm } from "react-hook-form";

export const ModalForm = React.memo(function InitiateOffboardingEmployee() {
  const form = useForm();
  return (
    <Dialog>
      <Form {...form}>
        <form>
          <DialogTrigger asChild>
            <Button className="w-fit">Assign to Payruns</Button>
          </DialogTrigger>
          <DialogContent className="bg-white md:min-w-5xl overflow-y-scroll max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Assign Final Salary & Benefit Payout</DialogTitle>
            </DialogHeader>
            <SelectForm
              name="assign_payruns"
              label="Assign Payruns"
              required
              options={[
                { label: "Juni 2025", value: "Juni 2025" },
                { label: "Juli 2025", value: "Juli 2025" },
                { label: "Agustus 2025", value: "Agustus 2025" },
              ]}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
});

export const FinalSalaryBenefits = React.memo(function FinalSalaryBenefits() {
  return (
    <div className="space-y-4 w-full">
      <div className="border rounded-xl border-grayscale-20 shadow-sm shadow-[#1018281A] w-full">
        <div className="flex justify-between items-center p-4">
          <h4 className="font-semibold text-xl text-gray-900">
            Final Salary & Benefits
          </h4>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead
                className="text-text-secondary text-xs py-4 px-6"
                colSpan={2}
              >
                Component
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="py-4 px-6">Base Nett Salary</TableCell>
              <TableCell className="py-4 px-6">Rp 24.000.000,00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-4 px-6">Overtime</TableCell>
              <TableCell className="py-4 px-6">Rp 24.000.000,00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-4 px-6">Allowance</TableCell>
              <TableCell className="py-4 px-6">Rp 24.000.000,00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-4 px-6">Severance Pay</TableCell>
              <TableCell className="py-4 px-6">Rp 24.000.000,00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-4 px-6">Leave Compensation</TableCell>
              <TableCell className="py-4 px-6">Rp 24.000.000,00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-4 px-6">Bonus</TableCell>
              <TableCell className="py-4 px-6">Rp 24.000.000,00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-4 px-6">Reimbursement</TableCell>
              <TableCell className="py-4 px-6">Rp 24.000.000,00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-4 px-6">Deduction</TableCell>
              <TableCell className="py-4 px-6">Rp 24.000.000,00</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter className="bg-primary-background">
            <TableRow>
              <TableCell className="py-4 px-6">Total Gross Pay</TableCell>
              <TableCell className="py-4 px-6">$2,500.00</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      <div className="grid items-start w-full gap-4">
        <Alert className="flex items-center border border-grayscale-20 shadow-sm justify-between">
          <div>
            <AlertTitle className="text-primary font-semibold text-lg">
              Final Salary & Benefit Payout
            </AlertTitle>
            <AlertDescription>
              Set up final salary and benefit components to be included in a
              payrun
            </AlertDescription>
          </div>
          <ModalForm />
        </Alert>
      </div>
      <div className="flex gap-4">
        <Button type="submit" variant="outline">
          Complete Offboarding Process
        </Button>
        <Button
          variant="ghost"
          className="text-error hover:bg-error-background hover:text-error"
        >
          Cancel Offboarding Process
        </Button>
      </div>
    </div>
  );
});
