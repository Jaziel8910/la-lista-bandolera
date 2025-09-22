import React, { useState, useMemo } from 'react';
import { Bandolero } from '../types';
import Modal from '../components/Modal';
import StarRating from '../components/StarRating';
import { Plus, Trash2, Image as ImageIcon, Heart, Palette, Quote } from 'lucide-react';

const THEME_COLORS = ['#FADADD', '#FDEEBF', '#CFF6CF', '#BDE0FE', '#E0B1CB', '#D9D7F1'];

interface BandolerosScreenProps {
    bandoleros: Bandolero[];
    setBandoleros: React.Dispatch<React.SetStateAction<Bandolero[]>>;
}

const BandolerosScreen: React.FC<BandolerosScreenProps> = ({ bandoleros, setBandoleros }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBandolero, setEditingBandolero] = useState<Partial<Bandolero> & { tagsString?: string }>({ name: '', rating: 0, notes: '', origin: '', tagsString: '', themeColor: THEME_COLORS[4], favoriteQuote: '' });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [activeTags, setActiveTags] = useState<string[]>([]);

    const allTags = useMemo(() => {
        return [...new Set(bandoleros.flatMap(b => b.tags || []))].sort();
    }, [bandoleros]);

    const handleTagFilterClick = (tag: string) => {
        setActiveTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const filteredBandoleros = useMemo(() => {
        if (activeTags.length === 0) {
            return bandoleros;
        }
        return bandoleros.filter(b =>
            activeTags.some(tag => b.tags?.includes(tag))
        );
    }, [bandoleros, activeTags]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setEditingBandolero({ ...editingBandolero, image: base64String });
                setImagePreview(base64String);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const openModalNew = () => {
        setEditingBandolero({ name: '', rating: 0, notes: '', origin: '', tagsString: '', themeColor: THEME_COLORS[4], favoriteQuote: '' });
        setImagePreview(null);
        setIsModalOpen(true);
    }
    
    const handleSave = () => {
        if (editingBandolero.name && editingBandolero.rating) {
            const tags = editingBandolero.tagsString ? editingBandolero.tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];
            const bandoleroToSave: Bandolero = { 
                id: editingBandolero.id || Date.now().toString(),
                name: editingBandolero.name,
                rating: editingBandolero.rating,
                notes: editingBandolero.notes || '',
                origin: editingBandolero.origin || '',
                image: editingBandolero.image,
                tags,
                themeColor: editingBandolero.themeColor || THEME_COLORS[4],
                favoriteQuote: editingBandolero.favoriteQuote || '',
            };
            setBandoleros(prev => {
                const existing = prev.find(b => b.id === bandoleroToSave.id);
                if (existing) {
                    return prev.map(b => b.id === bandoleroToSave.id ? bandoleroToSave : b);
                }
                return [...prev, bandoleroToSave];
            });
            setIsModalOpen(false);
        }
    };

    const handleDelete = (id: string) => {
        setBandoleros(bandoleros.filter(b => b.id !== id));
    };

    return (
        <div className="animate-swoop-in h-full">
            {allTags.length > 0 && (
                <div className="px-4 mb-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                        <button
                            onClick={() => setActiveTags([])}
                            className={`flex-shrink-0 px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${activeTags.length === 0 ? 'bg-[#E54F6D] text-white shadow-md' : 'bg-white dark:bg-[#3D315B] text-[#585076] dark:text-gray-300'}`}
                        >
                            Todos
                        </button>
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => handleTagFilterClick(tag)}
                                className={`flex-shrink-0 px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${activeTags.includes(tag) ? 'bg-[#E54F6D] text-white shadow-md' : 'bg-white dark:bg-[#3D315B] text-[#585076] dark:text-gray-300'}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <div className="px-4">
                {filteredBandoleros.length > 0 ? (
                    <div className="space-y-4">
                        {filteredBandoleros.sort((a,b) => b.rating - a.rating).map(b => (
                            <div key={b.id} className="bg-white dark:bg-[#3D315B] rounded-2xl shadow-lg overflow-hidden relative" style={{'--theme-color': b.themeColor} as React.CSSProperties}>
                                <div className="h-2 w-full bg-[var(--theme-color)]"></div>
                                <div className="p-4 flex items-start space-x-4">
                                    {b.image ? (
                                        <img src={b.image} alt={b.name} className="w-24 h-24 rounded-lg object-cover border-4 border-white dark:border-[#3D315B] shadow-md -mt-8" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-lg bg-[var(--theme-color)] flex items-center justify-center text-white/70 flex-shrink-0 border-4 border-white dark:border-[#3D315B] shadow-md -mt-8">
                                            <Heart size={40} />
                                        </div>
                                    )}
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-xl text-[#3D315B] dark:text-white">{b.name}</h3>
                                        <p className="text-sm text-[#8E82AE] dark:text-gray-400">{b.origin}</p>
                                        <StarRating rating={b.rating} />
                                        {b.favoriteQuote && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">"{b.favoriteQuote}"</p>}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {b.tags?.map(tag => (
                                                <span key={tag} className="text-xs bg-[var(--theme-color)]/50 text-[#3D315B] dark:text-white/80 px-2 py-0.5 rounded-full font-medium">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(b.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 -mt-16 text-[#A093C7] dark:text-gray-400">
                        <div className="text-[#E54F6D] mb-4">
                            <Heart size={64} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-xl font-bold text-[#3D315B] dark:text-white mb-2">{bandoleros.length === 0 ? '¡Tu lista está vacía!' : 'Sin resultados'}</h2>
                        <p className="max-w-xs">{bandoleros.length === 0 ? "Toca el botón '+' para añadir a tu primer bandolero y empezar la colección." : "Prueba a seleccionar otros tags o limpia los filtros."}</p>
                    </div>
                )}
            </div>
             <button
                onClick={openModalNew}
                className="fixed bottom-24 right-5 bg-gradient-to-br from-[#E54F6D] to-[#FAA9BE] text-white p-4 rounded-full shadow-lg hover:from-[#9381FF] hover:to-[#B8B0FF] dark:from-[#9381FF] dark:to-[#B8B0FF] dark:hover:from-[#E54F6D] dark:hover:to-[#FAA9BE] transition-all duration-300 transform hover:scale-110 z-30"
            >
                <Plus size={28} />
            </button>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Añadir Bandolero">
                <div className="space-y-4">
                    <input type="text" placeholder="Nombre" value={editingBandolero.name || ''} onChange={e => setEditingBandolero({ ...editingBandolero, name: e.target.value })} className="w-full p-3 border border-[#F3D9E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54F6D] bg-transparent dark:border-[#3D315B] dark:focus:ring-[#9381FF] dark:text-white" />
                    <input type="text" placeholder="Origen (serie, película, libro...)" value={editingBandolero.origin || ''} onChange={e => setEditingBandolero({ ...editingBandolero, origin: e.target.value })} className="w-full p-3 border border-[#F3D9E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54F6D] bg-transparent dark:border-[#3D315B] dark:focus:ring-[#9381FF] dark:text-white" />
                    <input type="text" placeholder="Tags (separados por coma)" value={editingBandolero.tagsString || ''} onChange={e => setEditingBandolero({ ...editingBandolero, tagsString: e.target.value })} className="w-full p-3 border border-[#F3D9E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54F6D] bg-transparent dark:border-[#3D315B] dark:focus:ring-[#9381FF] dark:text-white" />
                    <input type="text" placeholder="Cita favorita..." value={editingBandolero.favoriteQuote || ''} onChange={e => setEditingBandolero({ ...editingBandolero, favoriteQuote: e.target.value })} className="w-full p-3 border border-[#F3D9E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54F6D] bg-transparent dark:border-[#3D315B] dark:focus:ring-[#9381FF] dark:text-white" />
                    
                    <div className="flex items-center justify-between">
                        <span className="text-[#585076] dark:text-white font-medium">Ranking:</span>
                        <StarRating rating={editingBandolero.rating || 0} setRating={r => setEditingBandolero({ ...editingBandolero, rating: r })} size={28} />
                    </div>
                    
                    <div>
                        <span className="text-[#585076] dark:text-white font-medium mb-2 block">Color del tema:</span>
                        <div className="flex items-center space-x-2">
                        {THEME_COLORS.map(color => (
                            <button key={color} onClick={() => setEditingBandolero({...editingBandolero, themeColor: color})} className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 ${editingBandolero.themeColor === color ? 'ring-2 ring-offset-2 dark:ring-offset-[#3E3561] ring-[#E54F6D]' : ''}`} style={{backgroundColor: color}}></button>
                        ))}
                        </div>
                    </div>
                    
                     <label className="w-full flex items-center justify-center p-4 border-2 border-dashed border-[#F3D9E9] dark:border-[#3D315B] rounded-lg cursor-pointer hover:bg-[#F3D9E9]/40 dark:hover:bg-[#3D315B]/60">
                        {imagePreview ? (
                            <img src={imagePreview} alt="preview" className="w-24 h-24 object-cover rounded-lg"/>
                        ) : (
                            <div className="text-center text-[#A093C7] dark:text-gray-400">
                                <ImageIcon className="mx-auto" />
                                <span>Añadir foto principal</span>
                            </div>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                    <button onClick={handleSave} className="w-full bg-[#E54F6D] text-white py-3 rounded-lg font-semibold hover:bg-[#9381FF] dark:bg-[#9381FF] dark:hover:bg-[#E54F6D] transition-colors shadow-md">Guardar</button>
                </div>
            </Modal>
        </div>
    );
};

export default BandolerosScreen;