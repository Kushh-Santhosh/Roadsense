import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, CheckCircle2, Info, HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  confirmLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  confirmLoading = false
}) => {
  const iconConfig = {
    danger: { icon: AlertTriangle, bg: 'bg-red-50 text-brand-red border-red-200' },
    warning: { icon: AlertTriangle, bg: 'bg-orange-50 text-brand-orange border-orange-200' },
    primary: { icon: Info, bg: 'bg-blue-50 text-brand-navy border-blue-200' }
  };

  const buttonConfig = {
    danger: 'bg-brand-red hover:bg-red-700 text-white',
    warning: 'bg-brand-orange hover:bg-brand-orange-hover text-white',
    primary: 'bg-brand-navy hover:bg-brand-navy-light text-white'
  };

  const currentIcon = iconConfig[variant] || iconConfig.primary;
  const IconComponent = currentIcon.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl border flex-shrink-0 ${currentIcon.bg}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <p className="text-xs text-brand-slate leading-relaxed pt-0.5">{description}</p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-neutral-grey/60">
          <button
            type="button"
            onClick={onClose}
            disabled={confirmLoading}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-brand-neutral-grey text-brand-navy hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={confirmLoading}
            className={`px-4 py-2 text-xs font-bold rounded-xl shadow-subtle transition-all cursor-pointer ${buttonConfig[variant]}`}
          >
            {confirmLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
