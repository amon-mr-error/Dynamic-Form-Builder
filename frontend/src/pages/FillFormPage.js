import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function FillFormPage() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const URL = process.env.REACT_APP_URL || "http://localhost:5000";

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${URL}/api/forms/${id}`)
      .then((res) => setForm(res.data))
      .catch(() => setError("Form not found or not accessible"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e, el) => {
    const value =
      el.type === "checkbox"
        ? e.target.checked
        : el.type === "file"
        ? e.target.files[0]
        : e.target.value;

    setValues((prev) => ({ ...prev, [el.id]: value }));
  };

  const validateField = (el, value) => {
    const { required, minLength, maxLength, pattern } = el.validation || {};

    if (required) {
      if (el.type === "file" && !value) return "File is required.";
      if (el.type === "checkbox" && !value) return "This checkbox is required.";
      if (!value || value.toString().trim() === "") return "This field is required.";
    }

    if (minLength && value?.length < minLength)
      return `Minimum ${minLength} characters required.`;

    if (maxLength && value?.length > maxLength)
      return `Maximum ${maxLength} characters allowed.`;

    if (pattern && value && !new RegExp(pattern).test(value))
      return "Invalid format.";

    return null;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setMessage("");

  const newErrors = {};
  for (const el of form.elements) {
    const val = values[el.id] || "";
    const validationError = validateField(el, val);
    if (validationError) {
      newErrors[el.id] = validationError;
    }
  }
  if (Object.keys(newErrors).length > 0) {
    setFieldErrors(newErrors);
    return;
  }

  setFieldErrors({});

  try {
    const formData = new FormData();
    formData.append("formId", form._id);

    // ✅ Convert values to array format for MongoDB schema
    const responsesArray = Object.entries(values).map(([id, value]) => ({
      elementId: id,
      value: value
    }));
    formData.append("responses", JSON.stringify(responsesArray));

    // ✅ Send metadata
    formData.append("metadata", JSON.stringify({
      device: navigator.userAgent,
      browser: navigator.userAgent
    }));

    // ✅ Append files separately
    for (const el of form.elements) {
      const val = values[el.id];
      if (el.type === "file" && val) {
        formData.append(`files[${el.id}]`, val);
      }
    }

    await axios.post(`${URL}/api/responses`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setMessage(form.settings?.successMessage || "Form submitted successfully!");
    setValues({});
  } catch (err) {
    setError(err.response?.data?.message || "Submission failed");
  }
};


  const renderInput = (el) => {
    const commonProps = {
      id: el.id,
      name: el.id,
      value: el.type !== "file" ? values[el.id] || "" : undefined,
      onChange: (e) => handleChange(e, el),
      placeholder: el.placeholder,
      required: el.validation?.required,
      className:
        "w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200",
    };

    switch (el.type) {
      case "textarea":
        return <textarea rows={4} {...commonProps} className={`${commonProps.className} resize-none`} />;
      case "select":
        return (
          <select {...commonProps}>
            <option value="">-- Select an option --</option>
            {el.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <div className="flex items-start space-x-3 p-2">
            <input
              type="checkbox"
              checked={values[el.id] || false}
              onChange={(e) => handleChange(e, el)}
              id={el.id}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={el.id} className="text-sm sm:text-base text-gray-700 leading-relaxed">
              {el.label}
            </label>
          </div>
        );
      case "file":
        return (
          <input 
            type="file" 
            onChange={(e) => handleChange(e, el)} 
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
        );
      case "date":
        return <input type="date" {...commonProps} />;
      case "rating":
        return (
          <div className="flex space-x-2 py-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() =>
                  setValues((prev) => ({ ...prev, [el.id]: num }))
                }
                className={`text-2xl sm:text-xl p-1 rounded transition-colors duration-200 ${
                  values[el.id] >= num ? "text-yellow-500" : "text-gray-300"
                } hover:scale-110 transform`}
              >
                ★
              </button>
            ))}
          </div>
        );
      default:
        return <input type={el.type || "text"} {...commonProps} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm sm:text-base">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-600 text-sm sm:text-base">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6"
        >
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-2 sm:mb-1 leading-tight">
              {form.title}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {form.description}
            </p>
          </div>

          <div className="space-y-4 sm:space-y-5">
            {form.elements.map((el) => (
              <div key={el.id} className="space-y-2">
                {el.type !== "checkbox" && (
                  <label
                    htmlFor={el.id}
                    className="block text-gray-700 text-sm sm:text-base font-medium leading-relaxed"
                  >
                    {el.label}
                    {el.validation?.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                )}
                {renderInput(el)}
                {fieldErrors[el.id] && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1 px-1">
                    {fieldErrors[el.id]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 sm:py-2 px-4 rounded-lg sm:rounded-md text-base sm:text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 active:transform active:scale-[0.98]"
          >
            {form.settings?.submitButtonText || "Submit"}
          </button>

          {message && (
            <div className="text-green-600 text-center text-sm sm:text-base p-3 bg-green-50 rounded-lg border border-green-200">
              {message}
            </div>
          )}
          {error && (
            <div className="text-red-600 text-center text-sm sm:text-base p-3 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}