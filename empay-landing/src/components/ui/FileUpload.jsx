import React, { useRef, useState } from 'react';
import { Upload, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FileUpload = ({ onFileSelect, label = "Upload Logo" }) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onFileSelect(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setPreview(null);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onFileSelect(null);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-dashed transition-all duration-300 cursor-pointer
          ${preview 
            ? 'border-brand-green bg-brand-green/5' 
            : 'border-brand-purple/30 bg-brand-surface hover:border-brand-purple hover:bg-brand-purple/5'
          }
        `}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`p-2 rounded-lg ${preview ? 'bg-brand-green text-white' : 'bg-brand-purple/10 text-brand-purple'}`}>
            {preview ? <CheckCircle2 size={18} /> : <Upload size={18} />}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-brand-text truncate">
              {preview ? fileName : label}
            </span>
            <span className="text-xs text-brand-muted">
              {preview ? 'Logo uploaded' : 'PNG, JPG or SVG (max 2MB)'}
            </span>
          </div>
        </div>

        <AnimatePresence>
          {preview && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={clearFile}
              className="p-1.5 rounded-full bg-brand-muted/10 text-brand-muted hover:bg-red-100 hover:text-red-500 transition-colors"
            >
              <X size={14} />
            </motion.button>
          )}
        </AnimatePresence>

        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default FileUpload;
