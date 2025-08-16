import React, { useState } from "react";
import Image from "next/image";
import { EmployeeNode } from "../types";
import { Edit, Plus, Trash2 } from "lucide-react";

interface NodeCardProps {
  data: EmployeeNode;
  width?: number;
  height?: number;
  onAddChild: (parentId: string) => void;
}

export const NodeCard = ({
  data,
  width = 220,
  height = 100,
  onAddChild,
}: NodeCardProps) => {
  return (
    <div className="flex flex-col items-center gap-2 bg-transparent">
      <div
        className="bg-white border-t-6 border-l-2 border-r-2 border-b-2 border-primary-border rounded-lg p-2 shadow cursor-pointer"
        style={{ width, height }}
      >
        <div className="flex flex-col gap-2 justify-between h-full">
          {/* Top row: image + name/title + actions */}
          <div className="flex justify-between items-start">
            <div className="flex gap-2 items-start">
              <Image
                src={data.image || "/images/default-avatar.png"}
                alt={data.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex flex-col items-start">
                <div className="font-semibold text-sm text-text-primary">
                  {data.name}
                </div>
                <div className="text-xs text-text-disabled">{data.title}</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={() => {}}>
                <Edit className="w-4 h-4" />
              </button>

              <button onClick={() => {}}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom row: icons */}
          <div className="flex justify-center items-center gap-2 mt-1">
            <button
              onClick={() => console.log("Phone clicked")}
              className="flex items-center gap-2 hover:none px-2 py-1 transition"
            >
              <Image
                src="/icons/phone.svg"
                alt="Phone"
                width={14}
                height={14}
              />
              <span className="text-primary text-xs">Phone</span>
            </button>

            <button
              onClick={() => console.log("Mail clicked")}
              className="flex items-center gap-2 border-l border-gray-300 pl-2 hover:none px-2 py-1 transition"
            >
              <Image src="/icons/mail.svg" alt="Mail" width={14} height={14} />
              <span className="text-primary text-xs">Mail</span>
            </button>

            <button
              onClick={() => console.log("Profile clicked")}
              className="flex items-center gap-2 border-l border-gray-300 pl-2 hover:none px-2 py-1 transition"
            >
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
      <button
        onClick={() => {
          onAddChild(data.id);
        }}
        className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white shadow hover:bg-primary/80"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
};
