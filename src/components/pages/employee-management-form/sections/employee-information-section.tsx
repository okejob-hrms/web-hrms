"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { SelectForm } from "@/components/ui/select-form";
import { DatePicker } from "@/components/ui/date-picker";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { getJobPosition, postJobPosition } from "@/services/job-position";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getJobLevels } from "@/services/job-levels";
import { toast } from "sonner";

export const AddNewJobLevelModal: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  const form = useForm<IPositionForm>({
    resolver: zodResolver(positionFormScheme),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (values: IPositionForm) => {
    console.log(values);
    postJobPosition(values)
      .then((res) => {
        console.log("### RESPONSE JOB LEVEL ###", res);
        setOpen(false);
        form.reset();
      })
      .catch((err) => console.log("### ERROR FETCH JOB LEVEL ###", err));
  };

  const handleCancel = () => {
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="text-primary px-2 justify-start font-semibold text-base bg-primary-focused rounded-none w-full m-0 hover:text-white"
          variant="ghost"
        >
          + Add New Job Level
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Create New Job Level</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <InputForm name="name" label="Job Level" required />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const AddNewPositionModal: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const form = useForm<IPositionForm>({
    resolver: zodResolver(positionFormScheme),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (values: IPositionForm) => {
    console.log(values);
    postJobPosition(values)
      .then((res) => {
        console.log("### RESPONSE POSITION ###", res);
        setOpen(false);
        form.reset();
      })
      .catch((err) => console.log("### ERROR FETCH POSITION ###", err));
  };

  const handleCancel = () => {
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="text-primary px-2 justify-start font-semibold text-base bg-primary-focused rounded-none w-full m-0 hover:text-white"
          variant="ghost"
        >
          + Add New Position
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Create New Position</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <InputForm name="name" label="Position Name" required />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const AddNewDepartmentModal: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const { mutate } = useMutation({
    mutationFn: (values: IDepartmentForm) => postDepartment(values),
    onSuccess: () => {
      toast.success("Success add new department!");
    },
    onError: (err) => {
      toast.error("Error add new department: " + err.message);
    },
  });
  const form = useForm<IDepartmentForm>({
    resolver: zodResolver(departmentFormScheme),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (values: IDepartmentForm) => {
    mutate(values);
  };

  const handleCancel = () => {
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="text-primary px-2 justify-start font-semibold text-base bg-primary-focused rounded-none w-full m-0 hover:text-white"
          variant="ghost"
        >
          + Add New Department
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Create New Department</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <InputForm name="name" label="Department Name" required />
            <TextAreaForm name="description" label="Description" isOptional />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const AddNewTeamModal: React.FC = () => {
  const [open, setOpen] = React.useState(false);

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
      .then((res) => {
        console.log("### RESPONSE TEAM ###", res);
        setOpen(false);
        form.reset();
      })
      .catch((err) => console.log("### ERROR FETCH TEAM ###", err));
  };

  const handleCancel = () => {
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="text-primary px-2 justify-start font-semibold text-base bg-primary-focused rounded-none w-full m-0 hover:text-white"
          variant="ghost"
        >
          + Add New Team
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <InputForm name="name" label="Team Name" required />
            <TextAreaForm name="description" label="Description" isOptional />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const EmployeeinformationSection = React.memo(
  function EmployeeinformationSection() {
    const { data: departments } = useQuery({
      queryKey: ["departments"],
      queryFn: getDepartment,
    });
    const { data: jobLevels } = useQuery({
      queryKey: ["job-levels"],
      queryFn: getJobLevels,
    });
    const { data: positions } = useQuery({
      queryKey: ["job-position"],
      queryFn: getJobPosition,
    });
    const { data: teams } = useQuery({
      queryKey: ["teams"],
      queryFn: getDepartment,
    });

    const departmentOptions = React.useMemo(() => {
      console.log("departments", departments);
      if (departments?.data) {
        return departments.data.data?.map((item) => ({
          label: item.name,
          value: item.name,
        }));
      }
      return [];
    }, [departments?.data]);

    const positionOptions = React.useMemo(() => {
      console.log("positions", positions);
      if (positions?.data) {
        return positions.data?.map((item) => ({
          label: item.name,
          value: item.name,
        }));
      }
      return [];
    }, [positions?.data]);

    const jobLevelOptions = React.useMemo(() => {
      console.log("job-levels", jobLevels);
      if (jobLevels?.data) {
        return jobLevels.data?.map((item) => ({
          label: item.name,
          value: item.name,
        }));
      }
      return [];
    }, [jobLevels?.data]);

    const teamOptions = React.useMemo(() => {
      console.log("teams", teams);
      if (teams?.data) {
        return teams.data.data?.map((item) => ({
          label: item.name,
          value: item.name,
        }));
      }
      return [];
    }, [teams?.data]);

    return (
      <React.Fragment>
        <h2 className="font-semibold text-lg leading-5 mb-3">
          Employment Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end w-full">
          <SelectForm
            name="position"
            label="Position"
            options={positionOptions}
            required
            className="w-full"
            modalChildren={<AddNewPositionModal />}
          />
          <SelectForm
            name="department"
            label="Department"
            options={departmentOptions}
            required
            modalChildren={<AddNewDepartmentModal />}
          />
          <SelectForm
            name="jobLevel"
            label="Job Level"
            options={jobLevelOptions}
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
            options={teamOptions}
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
