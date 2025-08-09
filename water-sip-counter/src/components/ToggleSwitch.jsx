import React from "react";

export default function ToggleSwitch({ enabled, onToggle }) {
  return (
    <label className="flex items-center cursor-pointer gap-2">
      <span className="text-sm">Camera Detection</span>
      <div
        className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${
          enabled ? "bg-blue-500" : "bg-gray-300"
        }`}
        onClick={() => onToggle(!enabled)}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
            enabled ? "translate-x-5" : ""
          }`}
        ></div>
      </div>
    </label>
  );
}
