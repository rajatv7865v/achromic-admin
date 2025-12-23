import React from "react";
import ModalLayout from "../../../layout/modalLayout";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonColor = "bg-red-600",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <ModalLayout title={title} setIsModalShow={onClose}>
      <section className="py-6 px-5">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-700 text-base leading-relaxed">
              {message}
            </p>
            <p className="text-sm text-gray-500">
              This action cannot be undone.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full mt-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 py-2.5 px-4 rounded-md text-white font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${confirmButtonColor}`}
            >
              {isLoading ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </section>
    </ModalLayout>
  );
};

export default ConfirmModal;

