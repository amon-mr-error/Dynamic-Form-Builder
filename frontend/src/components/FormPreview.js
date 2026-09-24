import React from "react";

export default function FormPreview({ form }) {
  if (!form) return null;
  return (
    <div>
      <div className="mb-2">
        <span className="font-bold">Title:</span> {form.title}
      </div>
      <div className="mb-4">
        <span className="font-bold">Description:</span> {form.description}
      </div>
      <div>
        <span className="font-bold">Fields:</span>
        <ul className="list-disc ml-6 mt-2">
          {form.elements?.map((el) => (
            <li key={el.id} className="mb-1">
              <span className="font-semibold">{el.label}</span>{" "}
              <span className="text-gray-500">({el.type})</span>
              {el.placeholder && (
                <span className="ml-2 text-gray-400">
                  — {el.placeholder}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <span className="font-bold">Submit Button:</span>{" "}
        {form.settings?.submitButtonText || "Submit"}
      </div>
      <div>
        <span className="font-bold">Success Message:</span>{" "}
        {form.settings?.successMessage || ""}
      </div>
    </div>
  );
}