"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { SelectForm } from "@/components/ui/select-form";
import { DatePicker } from "@/components/ui/date-picker";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/ui/input";
import { TextAreaForm } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { getDepartment, postDepartment } from "@/services/department";
import {
  departmentFormScheme,
  IDepartmentForm,
} from "@/services/department/types";
import {
  IPositionForm,
  positionFormScheme,
} from "@/services/job-position/types";
import { postJobPosition } from "@/services/job-position";
import { useQuery } from "@tanstack/react-query";

export const AddNewJobLevelModal: React.FC = () => {
  const form = useForm<IPositionForm>({
    resolver: zodResolver(positionFormScheme),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (values: IPositionForm) => {
    console.log(values);
    postJobPosition(values)
      .then((res) => console.log("### RESPONSE JOB LEVEL ###", res.data))
      .catch((err) => console.log("### ERROR FETCH JOB LEVEL ###", err));
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="text-primary px-2 justify-start font-semibold text-base bg-primary-focused rounded-none w-full m-0 hover:text-white"
          variant="ghost"
        >
          + Add New Job Level
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Job Level</AlertDialogTitle>
          <Form {...form}>
            <InputForm name="name" label="Job Level" required />
          </Form>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={form.handleSubmit(onSubmit)}>
            Save
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const AddNewPositionModal: React.FC = () => {
  const form = useForm<IPositionForm>({
    resolver: zodResolver(positionFormScheme),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (values: IPositionForm) => {
    console.log(values);
    postJobPosition(values)
      .then((res) => console.log("### RESPONSE DEPARTMENT ###", res.data))
      .catch((err) => console.log("### ERROR FETCH DEPARTMENT ###", err));
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="text-primary px-2 justify-start font-semibold text-base bg-primary-focused rounded-none w-full m-0 hover:text-white"
          variant="ghost"
        >
          + Add New Position
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Position</AlertDialogTitle>
          <Form {...form}>
            <InputForm name="name" label="Position Name" required />
          </Form>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={form.handleSubmit(onSubmit)}>
            Save
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const AddNewDepartmentModal: React.FC = () => {
  const form = useForm<IDepartmentForm>({
    resolver: zodResolver(departmentFormScheme),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (values: IDepartmentForm) => {
    console.log(values);
    postDepartment(values)
      .then((res) => console.log("### RESPONSE DEPARTMENT ###", res.data))
      .catch((err) => console.log("### ERROR FETCH DEPARTMENT ###", err));
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="text-primary px-2 justify-start font-semibold text-base bg-primary-focused rounded-none w-full m-0 hover:text-white"
          variant="ghost"
        >
          + Add New Department
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Department</AlertDialogTitle>
          <Form {...form}>
            <InputForm name="name" label="Department Name" required />
            <TextAreaForm name="description" label="Description" isOptional />
          </Form>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={form.handleSubmit(onSubmit)}>
            Save
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const AddNewTeamModal: React.FC = () => {
  const form = useForm<IDepartmentForm>({
    resolver: zodResolver(departmentFormScheme),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (values: IDepartmentForm) => {
    console.log(values);
    postDepartment(values)
      .then((res) => console.log("### RESPONSE DEPARTMENT ###", res.data))
      .catch((err) => console.log("### ERROR FETCH DEPARTMENT ###", err));
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="text-primary px-2 justify-start font-semibold text-base bg-primary-focused rounded-none w-full m-0 hover:text-white"
          variant="ghost"
        >
          + Add New Team
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Team</AlertDialogTitle>
          <Form {...form}>
            <InputForm name="name" label="Department Name" required />
            <TextAreaForm name="description" label="Description" isOptional />
          </Form>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={form.handleSubmit(onSubmit)}>
            Save
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const EmployeeinformationSection = React.memo(
  function EmployeeinformationSection() {
    const { data: departments } = useQuery({
      queryKey: ["departments"],
      queryFn: getDepartment,
    });
    console.log(departments);
    return (
      <React.Fragment>
        <h2 className="font-semibold text-lg leading-5 mb-3">
          Employment Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end w-full">
          <SelectForm
            name="position"
            label="Position"
            options={[
              { label: "CTO", value: "cto" },
              { label: "COO", value: "coo" },
              {
                label: "Head of Product Designer",
                value: "head_product_designer",
              },
              { label: "Product Designer", value: "product_designer" },
              { label: "Head of Engineer", value: "head_engineer" },
              { label: "Engineer", value: "engineer" },
            ]}
            required
            className="w-full"
            modalChildren={<AddNewPositionModal />}
          />
          <SelectForm
            name="department"
            label="Department"
            options={[
              { label: "Engineering", value: "engineering" },
              { label: "Human Resource", value: "hrd" },
            ]}
            required
            modalChildren={<AddNewDepartmentModal />}
          />
          <SelectForm
            name="jobLevel"
            label="Job Level"
            options={[
              { label: "Junior", value: "junior" },
              { label: "Middle", value: "middle" },
              { label: "Senior", value: "senior" },
              { label: "Supervisor", value: "supervisor" },
            ]}
            required
            modalChildren={<AddNewJobLevelModal />}
          />
          <SelectForm
            name="primaryDirectReport"
            label="Primary Direct Report"
            options={[
              { label: "Junio", value: "junior" },
              { label: "Middle", value: "middle" },
              { label: "Senior", value: "senior" },
              { label: "Supervisor", value: "supervisor" },
            ]}
            required
          />
          <SelectForm
            name="additionalDirectReport"
            label="Additional Direct Report"
            options={[
              { label: "Junio", value: "junior" },
              { label: "Middle", value: "middle" },
              { label: "Senior", value: "senior" },
              { label: "Supervisor", value: "supervisor" },
            ]}
            required
          />
          <SelectForm
            name="team"
            label="Team"
            options={[
              { label: "Junior", value: "junior" },
              { label: "Middle", value: "middle" },
              { label: "Senior", value: "senior" },
              { label: "Supervisor", value: "supervisor" },
            ]}
            required
            modalChildren={<AddNewTeamModal />}
          />
          <DatePicker name="startDate" label="Employment Start Date" />
          <DatePicker name="endDate" label="Employment End Date" />
          <SelectForm
            name="status"
            label="Status"
            options={[
              { label: "Junio", value: "junior" },
              { label: "Middle", value: "middle" },
              { label: "Senior", value: "senior" },
              { label: "Supervisor", value: "supervisor" },
            ]}
            required
          />
          <Separator className="md:col-span-2 my-4" />
        </div>
      </React.Fragment>
    );
  },
);
