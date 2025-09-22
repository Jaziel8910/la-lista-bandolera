import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 dark:bg-opacity-60 flex justify-center items-end sm:items-center z-50 p-4 animate-fade-in">
            <style>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                @keyframes slide-up { 0% { transform: translateY(100%); } 100% { transform: translateY(0); } }
                @media (min-width: 640px) { @keyframes slide-up { 0% { transform: translateY(20px) scale(0.98); opacity: 0.8; } 100% { transform: translateY(0) scale(1); opacity: 1; } } }
            `}</style>
            <div className="bg-[#FDF2F8] dark:bg-[#3E3561] rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-sm relative animate-slide-up overflow-hidden">
                <div className="p-4 bg-white/50 dark:bg-[#2A2438]/50 flex items-center justify-between border-b border-[#F3D9E9] dark:border-[#2A2438]">
                    <h2 className="text-xl font-bold text-center text-[#3D315B] dark:text-[#DCD7F5]">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-[#A093C7] hover:text-[#585076] dark:text-gray-400 dark:hover:text-white transition-colors"
                        aria-label="Cerrar modal"
                    >
                        <X size={24} />
                    </button>
                </div>
                 <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
