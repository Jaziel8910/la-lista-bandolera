import React, { useState } from 'react';
import { Bestie } from '../types';
import Modal from '../components/Modal';
import { Plus, Trash2, Image as ImageIcon, Users } from 'lucide-react';

interface BestiesScreenProps {
    besties: Bestie[];
    setBesties: React.Dispatch<React.SetStateAction<Bestie[]>>;
}

const BestiesScreen: React.FC<BestiesScreenProps> = ({ besties, setBesties }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBestie, setNewBestie] = useState<Partial<Bestie>>({ name: '', anniversary: '', favoriteMemory: '' });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setNewBestie({ ...newBestie, image: base64String });
                setImagePreview(base64String);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSave = () => {
        if (newBestie.name) {
            setBesties([...besties, { id: Date.now().toString(), ...newBestie } as Bestie]);
            setIsModalOpen(false);
            setNewBestie({ name: '', anniversary: '', favoriteMemory: '' });
            setImagePreview(null);
        }
    };
    
    const handleDelete = (id: string) => {
        setBesties(besties.filter(b => b.id !== id));
    };

    return (
        <div className="p-4 animate-swoop-in h-full">
            {besties.length > 0 ? (
                <div className="space-y-4">
                    {besties.map(b => (
                        <div key={b.id} className="bg-white dark:bg-[#3E3561] rounded-xl shadow-md p-4 flex items-center space-x-4 relative">
                            {b.image ? (
                                <img src={b.image} alt={b.name} className="w-20 h-20 rounded-full object-cover" />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-[#E0B1CB] dark:bg-[#5E548E] flex items-center justify-center text-white">
                                    <Users size={40} />
                                </div>
                            )}
                            <div className="flex-grow">
                                <h3 className="font-bold text-lg text-[#5E548E] dark:text-white">{b.name}</h3>
                                <p className="text-sm text-[#9A86A8] dark:text-gray-400">Aniversario: {b.anniversary}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">"{b.favoriteMemory}"</p>
                            </div>
                            <button onClick={() => handleDelete(b.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="flex flex-col items-center justify-center h-full text-center p-8 -mt-16 text-[#9A86A8] dark:text-gray-400">
                    <div className="text-[#BE95C4] dark:text-[#9F86C0] mb-4">
                        <Users size={64} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-bold text-[#5E548E] dark:text-white mb-2">¡Celebra a tus besties!</h2>
                    <p className="max-w-xs">Añade a tus amigas más especiales y guarda vuestros mejores recuerdos.</p>
                </div>
            )}
             <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-24 right-5 bg-[#BE95C4] text-white p-4 rounded-full shadow-lg hover:bg-[#9F86C0] dark:bg-[#9F86C0] dark:hover:bg-[#BE95C4] transition-transform duration-300 transform hover:scale-110"
            >
                <Plus size={28} />
            </button>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Añadir Bestie">
                <div className="space-y-4">
                    <input type="text" placeholder="Nombre" value={newBestie.name || ''} onChange={e => setNewBestie({ ...newBestie, name: e.target.value })} className="w-full p-2 border border-[#E0B1CB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE95C4] bg-transparent dark:border-[#5E548E] dark:focus:ring-[#9F86C0] dark:text-white" />
                    <input type="text" placeholder="Aniversario de amistad" value={newBestie.anniversary || ''} onChange={e => setNewBestie({ ...newBestie, anniversary: e.target.value })} className="w-full p-2 border border-[#E0B1CB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE95C4] bg-transparent dark:border-[#5E548E] dark:focus:ring-[#9F86C0] dark:text-white" />
                    <textarea placeholder="Recuerdo favorito..." value={newBestie.favoriteMemory || ''} onChange={e => setNewBestie({ ...newBestie, favoriteMemory: e.target.value })} className="w-full p-2 border border-[#E0B1CB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE95C4] bg-transparent dark:border-[#5E548E] dark:focus:ring-[#9F86C0] dark:text-white" rows={2}></textarea>
                    <label className="w-full flex items-center justify-center p-4 border-2 border-dashed border-[#E0B1CB] dark:border-[#5E548E] rounded-lg cursor-pointer hover:bg-[#E0B1CB]/20 dark:hover:bg-[#5E548E]/40">
                        {imagePreview ? (
                            <img src={imagePreview} alt="preview" className="w-24 h-24 object-cover rounded-lg"/>
                        ) : (
                            <div className="text-center text-[#9A86A8] dark:text-gray-400">
                                <ImageIcon className="mx-auto" />
                                <span>Añadir foto</span>
                            </div>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                    <button onClick={handleSave} className="w-full bg-[#BE95C4] text-white py-2 rounded-lg font-semibold hover:bg-[#9F86C0] dark:bg-[#9F86C0] dark:hover:bg-[#BE95C4] transition-colors">Guardar</button>
                </div>
            </Modal>
        </div>
    );
};

export default BestiesScreen;
