import { useState } from "react";
import { TeamsFormValues } from "../types";
import { ITeam } from "@/lib/types";

export function useTeamManagement() {
  const dummyTeams: ITeam[] = [];

  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  const [teams, setTeams] = useState<ITeam[]>(dummyTeams);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSave = (data: TeamsFormValues) => {
    if (editIndex !== null) {
      setTeams((teams) =>
        teams.map((dept, idx) =>
          idx === editIndex
            ? {
                name: data.name,
                description: data.description,
                id: idx,
                created_at: "2025-08-06T13:18:26.000000Z",
                updated_at: "2025-08-06T13:18:26.000000Z",
              }
            : dept
        )
      );
    } else {
      setTeams([
        ...teams,
        {
          name: data.name,
          description: data.description,
          id: teams.length,
          created_at: "2025-08-06T13:18:26.000000Z",
          updated_at: "2025-08-06T13:18:26.000000Z",
        },
      ]);
    }
    setTeamName("");
    setDescription("");
    setEditIndex(null);
    setOpen(false);
  };

  const handleEdit = (idx: number) => {
    setTeamName(teams[idx].name);
    setDescription(teams[idx].description ?? "");
    setEditIndex(idx);
    setOpen(true);
  };

  const handleClose = () => {
    setTeamName("");
    setDescription("");
    setEditIndex(null);
    setOpen(false);
  };

  const handleDelete = () => {
    if (deleteIndex !== null) {
      setTeams((teams) => teams.filter((_, idx) => idx !== deleteIndex));
      setDeleteIndex(null);
      setDeleteDialogOpen(false);
    }
  };

  return {
    teamName,
    setTeamName,
    description,
    setDescription,
    open,
    setOpen,
    teams,
    setTeams,
    editIndex,
    setEditIndex,
    deleteIndex,
    setDeleteIndex,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleSave,
    handleEdit,
    handleClose,
    handleDelete,
  };
}
