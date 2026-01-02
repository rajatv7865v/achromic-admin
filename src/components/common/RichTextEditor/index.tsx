import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactQuill from 'react-quill';
import "react-quill/dist/quill.snow.css";
import { uploadFile } from "../../../services/upload";

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
  const [isClient, setIsClient] = useState(false);
  const quillRef = useRef<any>(null);
  
  useEffect(() => {
    // Mark as client-side to ensure ReactQuill renders properly
    setIsClient(true);
  }, []);
  
  // Define the image handler function
  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      
      try {
        const res: any = await uploadFile({ file });
        if (res?.data?.path) {
          // Get the Quill editor instance from ref
          if (quillRef.current && quillRef.current.getEditor) {
            const quill = quillRef.current.getEditor();
            if (quill) {
              const range = quill.getSelection();
              if (range) {
                quill.insertEmbed(range.index, 'image', res.data.path);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    };
  }, []);

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: handleImageUpload,
      },
    },
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
    "image",
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
      {isClient ? (
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
        />
      ) : (
        <div className="border p-2 w-full rounded border-gray-400 min-h-[150px] flex items-center justify-center text-gray-500">
          Loading editor...
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
