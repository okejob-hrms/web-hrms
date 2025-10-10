// FileName: sections/node-card.tsx

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { type EmployeeNode } from "../types";
import { Edit, Plus, Trash2, Ellipsis } from "lucide-react";

type NodeCardData = {
  employee: EmployeeNode;
  onAddChild: (employee: EmployeeNode, handle: "top" | "bottom") => void;
  onEdit: (employee: EmployeeNode) => void;
  onDelete: (employee: EmployeeNode) => void;
  isEditMode: boolean;
};

export const NodeCard = ({ data }: { data: NodeCardData }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { employee, isEditMode, onAddChild, onEdit, onDelete } = data;
  const { employeeId, name, job_position, image } = employee;

  const fallbackSrc = "/icons/user02.svg";
  const [imgSrc, setImgSrc] = useState(image || fallbackSrc);

  useEffect(() => {
    setImgSrc(image || fallbackSrc);
  }, [image]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex flex-col items-center gap-2 bg-transparent">
      {isEditMode && (
        <button
          onClick={() => onEdit(employee)}
          className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white shadow hover:bg-primary/80"
        >
          <Plus className="w-3 h-3" />
        </button>
      )}
      <div
        className="bg-white border-t-6 border-l-2 border-r-2 border-b-2 border-primary-border rounded-lg p-2 shadow cursor-pointer"
        style={{ width: 220, height: 100 }}
      >
        <div className="flex flex-col gap-2 h-full">
          <div className="flex justify-between items-start gap-2">
            <div className="flex gap-2 items-start flex-1 min-w-0">
              <Image
                src={fallbackSrc}
                alt={name}
                width={40}
                height={40}
                className="rounded-full flex-shrink-0"
                onError={() => setImgSrc(fallbackSrc)}
              />
              <div className="flex flex-col items-start pt-1 max-w-[120px]">
                <span
                  title={name}
                  className="font-semibold text-sm text-gray-800 w-full truncate"
                >
                  {name}
                </span>
                <span
                  title={job_position}
                  className="text-xs text-gray-500 w-full truncate"
                >
                  {job_position}
                </span>
              </div>
            </div>

            {isEditMode && (
              <div className="relative">
                <button
                  onClick={handleMenuToggle}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <Ellipsis className="w-4 h-4" />
                </button>
                {isMenuOpen && (
                  <div
                    ref={menuRef}
                    className="absolute top-full right-0 mt-1 w-32 bg-white border rounded-md shadow-lg z-10"
                  >
                    <button
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => onEdit(employee)}
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => onDelete(employee)}
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-center items-center gap-2 mt-1">
            <button className="flex items-center gap-2 hover:none px-2 py-1 transition">
              <Image
                src="/icons/phone.svg"
                alt="Phone"
                width={14}
                height={14}
              />
              <span className="text-primary text-xs">Phone</span>
            </button>
            <button className="flex items-center gap-2 border-l border-gray-300 pl-2 hover:none px-2 py-1 transition">
              <Image src="/icons/mail.svg" alt="Mail" width={14} height={14} />
              <span className="text-primary text-xs">Mail</span>
            </button>
            <button className="flex items-center gap-2 border-l border-gray-300 pl-2 hover:none px-2 py-1 transition">
              <Image
                src="/icons/work.svg"
                alt="Profile"
                width={14}
                height={14}
              />
              <span className="text-primary text-xs">Profile</span>
            </button>
          </div>
        </div>
      </div>
      {isEditMode && (
        <button
          onClick={() => onAddChild(employee, "bottom")}
          className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white shadow hover:bg-primary/80"
        >
          <Plus className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
