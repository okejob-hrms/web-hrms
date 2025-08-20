// FileName: sections/node-card.tsx

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { type EmployeeNode } from "../types";
import { Edit, Plus, Trash2, Ellipsis } from "lucide-react";
import { type NodeProps } from "@xyflow/react";

type NodeCardData = {
  employee: EmployeeNode;
  isEditMode: boolean;
  isSafari: boolean;
  onAddChild: (id: string) => void;
  onEdit: () => void;
};
// Use this new, more specific type in NodeProps.
export const NodeCard = ({ data }: { data: NodeCardData }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Destructure all the properties you need from the `data` object.
  const { employee, isEditMode, isSafari, onAddChild, onEdit } = data;
  const { employeeId, name, title, image } = employee;

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
      <div
        className="bg-white border-t-6 border-l-2 border-r-2 border-b-2 border-primary-border rounded-lg p-2 shadow cursor-pointer"
        style={{ width: 220, height: 100 }}
      >
        <div className="flex flex-col gap-2 h-full">
          {/* Top row */}
          <div className="flex justify-between items-start">
            <div className="flex gap-2 items-start">
              <Image
                src={image || "/images/default-avatar.png"}
                alt={name}
                width={40}
                height={40}
                className={`w-10 h-10 ${!isSafari && "rounded-full"}`}
              />
              <div className="flex flex-col items-start">
                <div className="font-semibold text-sm text-text-primary">
                  {name}
                </div>
                <div className="text-xs text-text-disabled">{title}</div>
              </div>
            </div>

            {/* CONDITIONAL ACTION BUTTONS */}
            {isEditMode &&
              (isSafari ? (
                // SAFARI: Simple, flat icon buttons
                <div className="flex flex-row gap-2">
                  <button onClick={onEdit}>
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => {}}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                // OTHER BROWSERS: Ellipsis popup menu
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
                      className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                    >
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                        onClick={onEdit}
                      >
                        <Edit className="w-4 h-4" /> Edit Structure
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Bottom row: icons */}
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
          onClick={() => onAddChild(employeeId)}
          className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white shadow hover:bg-primary/80"
        >
          <Plus className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
