import React, { useState } from "react";
import axios from "axios";
import FormPreview from "../components/FormPreview";

export default function GenerateFormPage() {
  const [prompt, setPrompt] = useState("");
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const URL = process.env.REACT_APP_URL || "http://localhost:5000";

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setForm(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${URL}/api/forms/generate`,
        { prompt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForm(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate form");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-900 tracking-wide">
            Generate Form
          </h1>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <textarea
                className="w-full border-0 border-b border-gray-200 bg-transparent px-0 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-0 resize-none transition-colors duration-200 text-sm"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your form..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 px-4 text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-[0.99]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Generating
                </div>
              ) : (
                "Generate"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 border-l-4 border-red-400 animate-fade-in">
              {error}
            </div>
          )}
        </div>

        {/* Form Preview */}
        {form && (
          <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm animate-slide-in">
            <h3 className="text-lg font-light text-gray-900 mb-4">Preview</h3>
            <FormPreview form={form} />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}