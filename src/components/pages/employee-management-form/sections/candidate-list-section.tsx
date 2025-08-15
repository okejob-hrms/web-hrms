"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import * as React from "react";
import { ICandidate } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/data-table";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";

const columns: ColumnDef<ICandidate>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const { firstName, lastName, id, image } = row.original;
      return (
        <div className="flex items-center gap-2">
          <Checkbox />
          <Avatar>
            <AvatarImage src={image} />
          </Avatar>
          <div className="flex flex-col">
            <span className="text-foreground text-sm font-semibold">
              {firstName} {lastName}
            </span>
            <span className="text-text-secondary text-sm">{id}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "jobApplied",
    header: "Job Applied",
  },
  {
    accessorKey: "contact",
    header: "Contact",
    cell: ({ row }) => {
      const { phoneNumber, email } = row.original;
      return (
        <span>
          {phoneNumber}
          <br />
          {email}
        </span>
      );
    },
  },
];

export const candidates: ICandidate[] = [
  {
    id: "#001",
    firstName: "Ayla",
    lastName: "Putri",
    jobApplied: "Frontend Developer",
    phoneNumber: "081234567890",
    email: "ayla.putri@example.com",
    image: "https://ui-avatars.com/api/?name=Ayla+Putri",
  },
  {
    id: "#002",
    firstName: "Rizky",
    lastName: "Maulana",
    jobApplied: "Backend Developer",
    phoneNumber: "081298765432",
    email: "rizky.maulana@example.com",
    image: "https://ui-avatars.com/api/?name=Rizky+Maulana",
  },
  {
    id: "#003",
    firstName: "Nadira",
    lastName: "Salsabila",
    jobApplied: "UI/UX Designer",
    phoneNumber: "081277788899",
    email: "nadira.salsabila@example.com",
    image: "https://ui-avatars.com/api/?name=Nadira+Salsabila",
  },
  {
    id: "#004",
    firstName: "Dimas",
    lastName: "Saputra",
    jobApplied: "Product Manager",
    phoneNumber: "081345678912",
    email: "dimas.saputra@example.com",
    image: "https://ui-avatars.com/api/?name=Dimas+Saputra",
  },
  {
    id: "#005",
    firstName: "Laras",
    lastName: "Wijaya",
    jobApplied: "QA Engineer",
    phoneNumber: "081212121212",
    email: "laras.wijaya@example.com",
    image: "https://ui-avatars.com/api/?name=Laras+Wijaya",
  },
  {
    id: "#006",
    firstName: "Bagas",
    lastName: "Rahman",
    jobApplied: "DevOps Engineer",
    phoneNumber: "081234555678",
    email: "bagas.rahman@example.com",
    image: "https://ui-avatars.com/api/?name=Bagas+Rahman",
  },
  {
    id: "#007",
    firstName: "Intan",
    lastName: "Permata",
    jobApplied: "Business Analyst",
    phoneNumber: "081222233344",
    email: "intan.permata@example.com",
    image: "https://ui-avatars.com/api/?name=Intan+Permata",
  },
  {
    id: "#008",
    firstName: "Galih",
    lastName: "Sutrisno",
    jobApplied: "Mobile Developer",
    phoneNumber: "081245678901",
    email: "galih.sutrisno@example.com",
    image: "https://ui-avatars.com/api/?name=Galih+Sutrisno",
  },
];

export const CandidateListSection = React.memo(function CandidateListSection() {
  return (
    <Dialog>
      <DialogTrigger className="w-fit rounded-md border border-primary py-2 text-primary text-sm font-semibold px-5 bg-transparent flex gap-2 justify-center items-center hover:opacity-50 transition duration-300 h-10">
        <Image
          src="/icons/search-event.svg"
          width={18}
          height={18}
          alt="icon search"
        />
        Search Candidate
      </DialogTrigger>
      <DialogContent className="bg-white w-full sm:max-w-[80%] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>All Candidates</DialogTitle>
          <Input
            iconPosition="right"
            icon={
              <Image
                src="/icons/search.svg"
                width={18}
                height={18}
                alt="icon search"
              />
            }
            placeholder="Search Candidates"
            className="max-w-lg self-end"
          />
        </DialogHeader>
        <DataTable
          columns={columns}
          data={candidates}
          tableClassName="w-full"
        />
        <DialogFooter>
          <Button variant="outline" className="px-5 w-44">
            Cancel
          </Button>
          <Button type="submit">Select Candidate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
