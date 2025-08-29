// FileName: sections/custom--controls.tsx

import React from "react";
import { Panel, useReactFlow, useViewport } from "@xyflow/react";
import Image from "next/image";

export const CustomControls = () => {
  const { zoomIn, zoomOut } = useReactFlow();
  const { zoom } = useViewport();
  const zoomLevel = Math.round(zoom * 100);

  return (
    <Panel position="top-right">
      <div className="flex items-center gap-2 p-2 bg-white rounded-lg border shadow">
        <span className="text-sm font-medium">Zoom</span>
        <span className="text-sm text-gray-500">{zoomLevel}%</span>
        <button
          onClick={() => zoomOut({ duration: 300 })}
          className="p-1"
          aria-label="Zoom out"
        >
          <Image
            src="/icons/zoomOut.svg"
            width={16}
            height={16}
            alt="zoom out"
          />
        </button>
        <button
          onClick={() => zoomIn({ duration: 300 })}
          className="pl-2 border-l"
          aria-label="Zoom in"
        >
          <Image src="/icons/zoomIn.svg" width={16} height={16} alt="zoom in" />
        </button>
      </div>
    </Panel>
  );
};
