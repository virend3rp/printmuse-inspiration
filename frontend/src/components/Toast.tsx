"use client";

import { useEffect } from "react";

export default function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-[999] animate-slideIn">
      <div
        className={`px-6 py-4 rounded-xl shadow-xl text-white min-w-[220px] ${
          type === "success"
            ? "bg-black"
            : "bg-red-600"
        }`}
      >
        {message}
      </div>
    </div>
  );
}