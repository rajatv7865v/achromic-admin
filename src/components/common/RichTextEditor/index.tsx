import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter description...",
  disabled = false,
  className = "",
}) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "align",
    "link",
  ];

  return (
    <div className={`rich-text-editor ${className}`}>
      <style>{`
        .rich-text-editor .quill {
          background: white;
        }
        .rich-text-editor .ql-container {
          min-height: 150px;
          font-size: 14px;
          font-family: "Poppins", sans-serif;
        }
        .rich-text-editor .ql-editor {
          min-height: 150px;
        }
        .rich-text-editor .ql-toolbar {
          border-top: 1px solid #d1d5db;
          border-left: 1px solid #d1d5db;
          border-right: 1px solid #d1d5db;
          border-bottom: none;
          border-radius: 0.375rem 0.375rem 0 0;
          background: #f9fafb;
        }
        .rich-text-editor .ql-container {
          border-bottom: 1px solid #d1d5db;
          border-left: 1px solid #d1d5db;
          border-right: 1px solid #d1d5db;
          border-top: none;
          border-radius: 0 0 0.375rem 0.375rem;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
          font-family: "Poppins", sans-serif;
        }
        .rich-text-editor .ql-snow .ql-stroke {
          stroke: #374151;
        }
        .rich-text-editor .ql-snow .ql-fill {
          fill: #374151;
        }
        .rich-text-editor .ql-snow .ql-picker-label {
          color: #374151;
        }
        .rich-text-editor .ql-snow.ql-toolbar button:hover,
        .rich-text-editor .ql-snow .ql-toolbar button:hover,
        .rich-text-editor .ql-snow.ql-toolbar button.ql-active,
        .rich-text-editor .ql-snow .ql-toolbar button.ql-active {
          color: #0f766e;
        }
        .rich-text-editor .ql-snow.ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-snow .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-snow.ql-toolbar button.ql-active .ql-stroke {
          stroke: #0f766e;
        }
        .rich-text-editor .ql-snow.ql-toolbar button:hover .ql-fill,
        .rich-text-editor .ql-snow .ql-toolbar button:hover .ql-fill,
        .rich-text-editor .ql-snow.ql-toolbar button.ql-active .ql-fill {
          fill: #0f766e;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled}
      />
    </div>
  );
};

export default RichTextEditor;
