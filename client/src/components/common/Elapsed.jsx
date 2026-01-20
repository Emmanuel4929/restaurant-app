// src/components/common/Elapsed.jsx
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

/**
 * Muestra “hace X” y se actualiza cada 30s
 * @param {{ timestamp: string }} props
 */
export default function Elapsed({ timestamp }) {
  // contador para forzar re-render
  const [, tick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(iv);
  }, []);

  return (
    <span className="text-sm text-gray-500 ml-2">
      {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
    </span>
  );
}
