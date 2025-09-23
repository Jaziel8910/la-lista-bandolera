import React, { useState } from 'react';
import { Bandolero } from '../types';
import Modal from './Modal';
import PuterImage from './PuterImage';
import { User, Users } from 'lucide-react';

interface NewChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    bandoleros: Bandolero[];
    onCreateChat: (selected: Bandolero[]) => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose, bandoleros, onCreateChat }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleCreate = () => {
        const selectedBandoleros = bandoleros.filter(b => selectedIds.includes(b.id));
        onCreateChat(selectedBandoleros);
        setSelectedIds([]);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Chat">
            <div className="flex flex-col h-[60vh]">
                <p className="text-sm text-center text-[#8E82AE] dark:text-gray-400 mb-4">
                    Selecciona uno para un chat individual o varios para un chat grupal.
                </p>
                <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                    {bandoleros.map(b => (
                        <div
                            key={b.id}
                            onClick={() => toggleSelection(b.id)}
                            className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                                selectedIds.includes(b.id) ? 'bg-[#E54F6D]/20 dark:bg-[#9381FF]/20' : 'hover:bg-gray-100 dark:hover:bg-[#3D315B]'
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(b.id)}
                                readOnly
                                className="h-5 w-5 rounded text-[#E54F6D] focus:ring-[#9381FF] border-gray-300"
                            />
                            <div className="w-10 h-10 rounded-full mx-3 overflow-hidden" style={{backgroundColor: b.themeColor}}>
                                <PuterImage puterPath={b.image || ''} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-semibold text-[#3D315B] dark:text-white">{b.name}</span>
                        </div>
                    ))}
                </div>
                <button
                    onClick={handleCreate}
                    disabled={selectedIds.length === 0}
                    className="w-full mt-4 bg-[#9381FF] text-white py-3 rounded-lg font-semibold hover:bg-[#E54F6D] transition-colors shadow-md disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                    {selectedIds.length > 1 ? <Users size={20}/> : <User size={20}/>}
                    Iniciar Chat ({selectedIds.length})
                </button>
            </div>
        </Modal>
    );
};

export default NewChatModal;
