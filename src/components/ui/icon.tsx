/* eslint-disable @typescript-eslint/no-explicit-any */

import Image from "next/image";
import { useEffect, useState } from "react";

const svgCache = new Map();

const Icon = ({
  name = "",
  size = 24,
  color = "currentColor",
  className = "",
  style = {},
  ...props
}) => {
  const [svgContent, setSvgContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSvg = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check cache first
        if (svgCache.has(name)) {
          const cachedSvg = svgCache.get(name);

          // Apply current size and color
          const processedSvg = cachedSvg
            .replace(/width="\d+"/, `width="${size}"`)
            .replace(/height="\d+"/, `height="${size}"`)
            .replace(/fill="[^"]*"/, `fill="${color}"`);

          setSvgContent(processedSvg);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/icons/${name}.svg`);

        if (!response.ok) {
          throw new Error(`Failed to load icon: ${name}`);
        }

        const svgText = await response.text();

        // Clean and prepare SVG
        const cleanSvg = svgText
          .replace(/width="[^"]*"/g, "")
          .replace(/height="[^"]*"/g, "")
          .replace(/fill="[^"]*"/g, "")
          .replace(
            /<svg/,
            `<svg width="${size}" height="${size}" fill="${color}"`,
          );

        // Cache the cleaned version
        svgCache.set(name, cleanSvg);
        setSvgContent(cleanSvg);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (name) {
      fetchSvg();
    }
  }, [name, size, color]);

  if (isLoading) {
    return (
      // <div
      //   style={{
      //     width: size,
      //     height: size,
      //     backgroundColor: '#f0f0f0',
      //     borderRadius: '2px',
      //     ...style
      //   }}
      //   className={`inline-block animate-pulse ${className}`}
      //   {...props}
      // />
      <Image src={`/icons/${name}.svg`} width={size} height={size} alt={name} />
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: "#fee2e2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.max(10, size * 0.4),
          color: "#dc2626",
          borderRadius: "2px",
          ...style,
        }}
        className={`inline-block ${className}`}
        title={error}
        {...props}
      >
        ⚠
      </div>
    );
  }

  return (
    <span
      className={`inline-block ${className}`}
      style={{
        width: size,
        height: size,
        lineHeight: 0,
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      {...props}
    />
  );
};

export { Icon };
