import React, { useState, useRef, useEffect } from "react";
import { Upload, Download, Trash2, Check, X, Loader } from "lucide-react";

const sampleData = [
  ["Email", "Password", "Role"],
  ["jane.hr@example.com", "StrongHr@789", "HR"],
  ["mike.faculty@example.com", "StrongFaculty@456", "Faculty"],
];

const CSVUpload = ({ onFileUpload, uploadStatus, onDeleteFile, uploadedFiles }) => {
  const [dragActive, setDragActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "text/csv" || file.name.toLowerCase().endsWith('.csv')) {
        onFileUpload(file);
      } else {
        setStatusMessage("Please select a CSV file");
        setTimeout(() => setStatusMessage(""), 3000);
      }
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "text/csv" || file.name.toLowerCase().endsWith('.csv')) {
        onFileUpload(file);
      } else {
        setStatusMessage("Please select a CSV file");
        setTimeout(() => setStatusMessage(""), 3000);
      }
    }
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Reset input and show status messages
  useEffect(() => {
    if (uploadStatus === "success") {
      resetFileInput();
      setStatusMessage("File uploaded successfully!");
      setTimeout(() => setStatusMessage(""), 3000);
    } else if (uploadStatus === "error") {
      resetFileInput();
      setStatusMessage("Upload failed. Please try again.");
      setTimeout(() => setStatusMessage(""), 3000);
    }
  }, [uploadStatus]);

  const downloadSampleCSV = () => {
    const csvContent = sampleData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample_users.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getUploadBoxStyles = () => {
    if (uploadStatus === "loading") {
      return "border-blue-400 bg-blue-50";
    } else if (dragActive) {
      return "border-teal-400 bg-teal-50";
    } else if (uploadStatus === "success") {
      return "border-green-400 bg-green-50";
    } else if (uploadStatus === "error") {
      return "border-red-400 bg-red-50";
    }
    return "border-gray-300 hover:border-teal-400 hover:bg-teal-50";
  };

  const getStatusIcon = () => {
    if (uploadStatus === "loading") {
      return <Loader className="h-8 w-8 text-blue-500 mb-3 mx-auto animate-spin" />;
    } else if (uploadStatus === "success") {
      return <Check className="h-8 w-8 text-green-500 mb-3 mx-auto" />;
    } else if (uploadStatus === "error") {
      return <X className="h-8 w-8 text-red-500 mb-3 mx-auto" />;
    }
    return <Upload className="h-8 w-8 text-gray-400 mb-3 mx-auto" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Bulk User Upload</h3>
        <button
          onClick={downloadSampleCSV}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Download className="h-4 w-4" />
          Sample CSV
        </button>
      </div>

      {/* Upload box */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${getUploadBoxStyles()}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {getStatusIcon()}
        <p className="text-sm font-medium text-gray-700 mb-2">
          {uploadStatus === "loading" 
            ? "Uploading..." 
            : "Drop CSV file here or choose file"
          }
        </p>
        
        {statusMessage && (
          <p className={`text-xs mb-2 ${
            uploadStatus === "success" ? "text-green-600" : 
            uploadStatus === "error" ? "text-red-600" : "text-gray-600"
          }`}>
            {statusMessage}
          </p>
        )}

        <input
          type="file"
          accept=".csv,text/csv"
          ref={fileInputRef}
          onChange={handleFileInput}
          className="hidden"
          id="csvFileInput"
          disabled={uploadStatus === "loading"}
        />
        <label
          htmlFor="csvFileInput"
          className={`inline-block px-4 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
            uploadStatus === "loading" 
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-teal-600 text-white hover:bg-teal-700"
          }`}
        >
          {uploadStatus === "loading" ? "Uploading..." : "Choose File"}
        </label>
      </div>

      {/* Format instructions */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 font-medium mb-1">CSV Format:</p>
        <p className="text-xs text-gray-500">
          Email, Password, Role (HR/FACULTY/ADMIN)
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Note: Passwords will be automatically hashed when stored.
        </p>
      </div>

      {/* Uploaded files list */}
      {uploadedFiles && uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    {file.filename}
                  </span>
                  {file.size && (
                    <p className="text-xs text-gray-500">
                      Size: {Math.round(parseInt(file.size) / 1024)} KB
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onDeleteFile(file.filename)}
                  className="ml-3 p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                  title="Delete file"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVUpload;