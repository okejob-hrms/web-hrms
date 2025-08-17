import React, { useState } from "react";
import Image from "next/image";
import { CardActions } from "./card-actions";
import { EmployeeNode } from "../types";

interface NodeCardProps {
  data: EmployeeNode;
  width?: number;
  height?: number;
}

export const NodeCard = ({
  data,
  width = 220,
  height = 100,
}: NodeCardProps) => {
  return (
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

          {/* Card actions */}
          <CardActions
            nodeId={data.id}
            onEdit={() => console.log("Edit", data.id)}
            onDelete={() => console.log("Delete", data.id)}
          />
        </div>

        {/* Bottom row: icons */}
        <div className="flex justify-center items-center gap-2 mt-1">
          <div className="flex items-center gap-2">
            <Image src="/icons/phone.svg" alt="Phone" width={14} height={14} />
            <span className="text-primary">Phone</span>
          </div>

          <div className="flex items-center gap-2 border-l border-gray-300 pl-2">
            <Image src="/icons/mail.svg" alt="Mail" width={14} height={14} />
            <span className="text-primary">Mail</span>
          </div>

          <div className="flex items-center gap-2 border-l border-gray-300 pl-2">
            <Image src="/icons/work.svg" alt="Profile" width={14} height={14} />
            <span className="text-primary">Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
};
