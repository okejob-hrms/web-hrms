import React from 'react';
import { useReactFlow, getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import Image from "next/image";

function downloadImage(dataUrl: string) {
  const a = document.createElement('a');
  a.setAttribute('download', 'reactflow.png');
  a.setAttribute('href', dataUrl);
  a.click();
}

function DownloadButton() {
  const { getNodes } = useReactFlow();

  const onClick = () => {
    // 1. Get the exact size of all nodes combined
    const nodesBounds = getNodesBounds(getNodes());

    // 2. Define the image dimensions based on the content size
    // We allow the image to be as wide/tall as the graph is.
    const imageWidth = nodesBounds.width;
    const imageHeight = nodesBounds.height;

    // 3. Calculate the transformation to ensure the nodes are centered 
    // and at a readable scale (zoom level 1)
    const viewport = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5, // Min zoom
      2,   // Max zoom
      0    // Padding
    );

    const viewportElement = document.querySelector('.react-flow__viewport');
    if (!viewportElement) {
      return;
    }

    toPng(viewportElement as HTMLElement, {
      backgroundColor: '#fff', // or #1a365d based on your previous code
      width: imageWidth,
      height: imageHeight,
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        // This shifts the viewport so the top-left node sits at (0,0) of the image
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    }).then(downloadImage);
  };

  return (
    <Button onClick={onClick} className="bg-white border border-primary text-primary whitespace-nowrap hover:bg-white/90">
        <Image
            src="/icons/download.svg"
            width={18}
            height={18}
            alt="download icon"
            />{" "}
            Download
    </Button>
  );
}

export default DownloadButton;