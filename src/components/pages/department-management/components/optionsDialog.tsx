import { useState, useRef, useEffect } from "react";
import { Ellipsis, Pencil, Trash } from "lucide-react";

export function EllipsisMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded hover:bg-gray-100"
      >
        <Ellipsis />
      </button>
      <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg">
        <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-left">
          <Pencil size={16} /> Edit
        </button>
        <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-left">
          <Trash size={16} /> Delete
        </button>
      </div>
    </div>
  );
}
