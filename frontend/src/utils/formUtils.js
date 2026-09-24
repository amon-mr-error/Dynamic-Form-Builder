import axios from "axios";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

/**
 * Publish a form by ID
 */
export const handlePublish = async ({ formId, setPublishingId, setLoading, loading, URL }) => {
  const token = localStorage.getItem("token");
  try {
    setPublishingId(formId);
    await axios.put(
      `${URL}/api/forms/${formId}`,
      { status: "published" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setLoading(!loading); // Trigger re-fetch
  } catch (err) {
    window.alert(
      err.response?.data?.message || "Failed to publish the form. Try again."
    );
  } finally {
    setPublishingId(null);
  }
};

/**
 * Copy public form link to clipboard
 */
export const handleCopy = (formId, setCopied) => {
  const publicUrl = `${window.location.origin}/form/${formId}`;
  navigator.clipboard.writeText(publicUrl);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};

/**
 * Return icon based on form status
 */
export const getStatusIcon = (status) => {
  switch (status) {
    case "published":
      return <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />;
    case "draft":
      return <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />;
    default:
      return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />;
  }
};

/**
 * Return Tailwind classes based on form status
 */
export const getStatusColor = (status) => {
  switch (status) {
    case "published":
      return "bg-green-50 text-green-700 border-green-200";
    case "draft":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};
