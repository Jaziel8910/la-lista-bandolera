

import React, { useState, useMemo } from 'react';
import { Bandolero } from '../types';
import Modal from '../components/Modal';
import StarRating from '../components/StarRating';
import { Plus, Trash2, Image as ImageIcon, Heart, Palette, Quote, MessageSquare, Sparkles, Volume2, Edit } from 'lucide-react';
import PuterImage from '../components/PuterImage';


const THEME_COLORS = ['#FADADD', '#FDEEBF', '#CFF6CF', '#BDE0FE', '#E0B1CB', '#D9D7F1'];

declare global {
    interface Window {
        puter: any;
    }
}

interface BandolerosScreenProps {
    bandoleros: Bandolero[];
    setBandoleros: React.Dispatch<React.SetStateAction<Bandolero[]>>;
    setUnlockedAchievements: React.Dispatch<React.SetStateAction<string[]>>;
    onStartChat: (bandolero: Bandolero) => void;
}

const BandolerosScreen: React.FC<BandolerosScreenProps> = ({ bandoleros, setBandoleros, setUnlockedAchievements, onStartChat }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAiImageModalOpen, setIsAiImageModalOpen] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isGeneratingBackstory, setIsGeneratingBackstory] = useState(false);
    const [editingBandolero, setEditingBandolero] = useState<Partial<Bandolero> & { tagsString?: string }>({});
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
        if (activeTags.length === 0) return bandoleros;
        return bandoleros.filter(b => activeTags.some(tag => b.tags?.includes(tag)));
    }, [bandoleros, activeTags]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const fileName = `bandolero_${Date.now()}_${file.name}`;
            try {
                const puterFile = await window.puter.fs.write(fileName, file);
                setEditingBandolero({ ...editingBandolero, image: puterFile.path });
            } catch (error) {
                console.error("Error uploading image to Puter:", error);
            }
        }
    };
    
    const handleGenerateAiImage = async () => {
        if (!editingBandolero.appearanceDescription) return;
        setIsGeneratingImage(true);
        try {
            const prompt = `${editingBandolero.appearanceDescription}, portrait of ${editingBandolero.name} from ${editingBandolero.origin}, detailed, high quality.`;
            const image = await window.puter.ai.txt2img(prompt, { model: 'dall-e-3', quality: 'standard' });
            
            const response = await fetch(image.src);
            const blob = await response.blob();
            
            const fileName = `bandolero_ai_${Date.now()}.png`;
            const puterFile = await window.puter.fs.write(fileName, blob);

            setEditingBandolero({ ...editingBandolero, image: puterFile.path });
            setUnlockedAchievements(prev => [...new Set([...prev, 'ai_image'])]);
            setIsAiImageModalOpen(false);
        } catch (error) {
            console.error("Error generating AI image:", error);
        } finally {
            setIsGeneratingImage(false);
        }
    }

    const handleGenerateBackstory = async () => {
        if (!editingBandolero.name || !editingBandolero.origin || !editingBandolero.personality) {
            alert("Por favor, rellena el nombre, origen y personalidad para crear una historia.");
            return;
        }
        setIsGeneratingBackstory(true);
        try {
            const prompt = `Crea una historia de fondo corta y creativa (2-3 párrafos) para el personaje ${editingBandolero.name} de ${editingBandolero.origin}. Su personalidad es: ${editingBandolero.personality}. Escribe en un estilo evocador y un poco dramático, perfecto para un diario aesthetic.`;
            const response = await window.puter.ai.chat(prompt, { stream: true, model: 'openrouter:openai/gpt-4o' });
            
            setEditingBandolero(prev => ({ ...prev, notes: '' }));
            for await (const chunk of response.stream) {
                 setEditingBandolero(prev => ({ ...prev, notes: (prev.notes || '') + chunk.text }));
            }
        } catch (error) {
            console.error("Error generating backstory:", error);
             setEditingBandolero(prev => ({ ...prev, notes: 'No se pudo generar la historia.' }));
        } finally {
            setIsGeneratingBackstory(false);
        }
    }

    const openModal = (bandolero: Partial<Bandolero> | null = null) => {
        if (bandolero) {
            setEditingBandolero({...bandolero, tagsString: bandolero.tags?.join(', ') });
        } else {
             setEditingBandolero({ name: '', rating: 0, notes: '', origin: '', tagsString: '', themeColor: THEME_COLORS[4], favoriteQuote: '', personality: '', style: '', topics: '', appearanceDescription: '' });
        }
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
                personality: editingBandolero.personality || '',
                style: editingBandolero.style || '',
                topics: editingBandolero.topics || '',
                appearanceDescription: editingBandolero.appearanceDescription || '',
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

    const handlePlayQuote = (quote: string) => {
        if (!quote) return;
        window.puter.ai.txt2speech(quote).then((audio: HTMLAudioElement) => audio.play());
    }

    return (
        <div className="flex flex-col flex-grow">
            <div>
                {allTags.length > 0 && (
                    <div className="px-4 mb-4">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                            <button onClick={() => setActiveTags([])} className={`flex-shrink-0 px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${activeTags.length === 0 ? 'bg-[#E54F6D] text-white shadow-md' : 'bg-white dark:bg-[#3D315B] text-[#585076] dark:text-gray-300'}`}>Todos</button>
                            {allTags.map(tag => (
                                <button key={tag} onClick={() => handleTagFilterClick(tag)} className={`flex-shrink-0 px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${activeTags.includes(tag) ? 'bg-[#E54F6D] text-white shadow-md' : 'bg-white dark:bg-[#3D315B] text-[#585076] dark:text-gray-300'}`}>{tag}</button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="px-4 flex flex-col flex-grow">
                {filteredBandoleros.length > 0 ? (
                    <div className="space-y-4 w-full">
                        {filteredBandoleros.sort((a,b) => b.rating - a.rating).map(b => (
                            <div key={b.id} className="bg-white dark:bg-[#3D315B] rounded-2xl shadow-lg overflow-hidden relative group" style={{'--theme-color': b.themeColor} as React.CSSProperties}>
                                <div className="h-2 w-full bg-[var(--theme-color)]"></div>
                                <div className="p-4 flex items-start space-x-4">
                                    <PuterImage puterPath={b.image || ''} className="w-24 h-24 rounded-lg object-cover border-4 border-white dark:border-[#3D315B] shadow-md -mt-8 flex-shrink-0" alt={b.name} fallback={<div className="w-24 h-24 rounded-lg bg-[var(--theme-color)] flex items-center justify-center text-white/70 flex-shrink-0 border-4 border-white dark:border-[#3D315B] shadow-md -mt-8"><Heart size={40} /></div>} />
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-xl text-[#3D315B] dark:text-white">{b.name}</h3>
                                        <p className="text-sm text-[#8E82AE] dark:text-gray-400">{b.origin}</p>
                                        <StarRating rating={b.rating} />
                                        {b.favoriteQuote && <div className="flex items-center gap-2 mt-1"><p className="text-xs text-gray-500 dark:text-gray-400 italic">"{b.favoriteQuote}"</p><button onClick={() => handlePlayQuote(b.favoriteQuote)} className="text-gray-400 hover:text-[#E54F6D] flex-shrink-0"><Volume2 size={14}/></button></div>}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {b.tags?.map(tag => (<span key={tag} className="text-xs bg-[var(--theme-color)]/50 text-[#3D315B] dark:text-white/80 px-2 py-0.5 rounded-full font-medium">{tag}</span>))}
                                        </div>
                                    </div>
                                    <div className="absolute top-2 right-2 flex gap-1 bg-white/50 dark:bg-[#2A2438]/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onStartChat(b)} className="text-gray-400 hover:text-purple-500 transition-colors p-1"><MessageSquare size={16} /></button>
                                        <button onClick={() => openModal(b)} className="text-gray-400 hover:text-blue-500 transition-colors p-1"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(b.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-grow text-center p-8 text-[#A093C7] dark:text-gray-400 w-full">
                        <div className="text-[#E54F6D] mb-4"><Heart size={64} strokeWidth={1.5} /></div>
                        <h2 className="text-xl font-bold text-[#3D315B] dark:text-white mb-2">{bandoleros.length === 0 ? '¡Tu lista está vacía!' : 'Sin resultados'}</h2>
                        <p className="max-w-xs">{bandoleros.length === 0 ? "Toca el botón '+' para añadir a tu primer bandolero y empezar la colección." : "Prueba a seleccionar otros tags o limpia los filtros."}</p>
                    </div>
                )}
            </div>
             <button onClick={() => openModal()} className="fixed bottom-24 right-5 bg-gradient-to-br from-[#E54F6D] to-[#FAA9BE] text-white p-4 rounded-full shadow-lg hover:from-[#9381FF] hover:to-[#B8B0FF] dark:from-[#9381FF] dark:to-[#B8B0FF] dark:hover:from-[#E54F6D] dark:hover:to-[#FAA9BE] transition-all duration-300 transform hover:scale-110 z-30"><Plus size={28} /></button>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBandolero.id ? "Editar Bandolero" : "Añadir Bandolero"}>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-2">
                    <input type="text" placeholder="Nombre" value={editingBandolero.name || ''} onChange={e => setEditingBandolero({ ...editingBandolero, name: e.target.value })} className="w-full p-3 border border-[#F3D9E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54F6D] bg-transparent dark:border-[#3D315B] dark:focus:ring-[#9381FF] dark:text-white" />
                    <input type="text" placeholder="Origen (serie, película, libro...)" value={editingBandolero.origin || ''} onChange={e => setEditingBandolero({ ...editingBandolero, origin: e.target.value })} className="w-full p-3 border border-[#F3D9E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54F6D] bg-transparent dark:border-[#3D315B] dark:focus:ring-[#9381FF] dark:text-white" />
                    <input type="text" placeholder="Tags (separados por coma)" value={editingBandolero.tagsString || ''} onChange={e => setEditingBandolero({ ...editingBandolero, tagsString: e.target.value })} className="w-full p-3 border border-[#F3D9E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54F6D] bg-transparent dark:border-[#3D315B] dark:focus:ring-[#9381FF] dark:text-white" />
                    <input type="text" placeholder="Cita favorita..." value={editingBandolero.favoriteQuote || ''} onChange={e => setEditingBandolero({ ...editingBandolero, favoriteQuote: e.target.value })} className="w-full p-3 border border-[#F3D9E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54F6D] bg-transparent dark:border-[#3D315B] dark:focus:ring-[#9381FF] dark:text-white" />
                    <div className="flex items-center justify-between p-2"><span className="text-[#585076] dark:text-white font-medium">Ranking:</span><StarRating rating={editingBandolero.rating || 0} setRating={r => setEditingBandolero({ ...editingBandolero, rating: r })} size={28} /></div>
                    <div className="p-2">
                        <span className="text-[#585076] dark:text-white font-medium mb-2 block">Color del tema:</span>
                        <div className="flex items-center space-x-2">{THEME_COLORS.map(color => (<button key={color} onClick={() => setEditingBandolero({...editingBandolero, themeColor: color})} className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 ${editingBandolero.themeColor === color ? 'ring-2 ring-offset-2 dark:ring-offset-[#3E3561] ring-[#E54F6D]' : ''}`} style={{backgroundColor: color}}></button>))}</div>
                    </div>
                    
                    <div className="text-[#585076] dark:text-white font-medium border-t border-[#F3D9E9] dark:border-[#3D315B] pt-4 p-2">Personalidad (para Chat AI)</div>
                    <textarea placeholder="Describe su personalidad..." value={editingBandolero.personality || ''} onChange={e => setEditingBandolero({ ...editingBandolero, personality: e.target.value })} className="w-full p-3 border border-[#F3D9E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54F6D] bg-transparent dark:border-[#3D315B] dark:focus:ring-[#9381FF] dark:text-white" rows={2}/>
                    <textarea placeholder="¿Cómo habla? (tono, estilo, etc.)" value={editingBandolero.style || ''} onChange={e => setEditingBandolero({ ...editingBandolero, style: e.target.value })} className="w-full p-3 border border-[#F3D9E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54F6D] bg-transparent dark:border-[#3D315B] dark:focus:ring-[#9381FF] dark:text-white" rows={2}/>
                    <input type="text" placeholder="Temas de interés (separados por coma)" value={editingBandolero.topics || ''} onChange={e => setEditingBandolero({ ...editingBandolero, topics: e.target.value })} className="w-full p-3 border border-[#F3D9E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54F6D] bg-transparent dark:border-[#3D315B] dark:focus:ring-[#9381FF] dark:text-white" />

                     <div className="flex items-center gap-2 pt-2">
                        <label className="w-1/2 flex flex-col items-center justify-center p-3 h-28 border-2 border-dashed border-[#F3D9E9] dark:border-[#3D315B] rounded-lg cursor-pointer hover:bg-[#F3D9E9]/40 dark:hover:bg-[#3D315B]/60">
                            {editingBandolero.image ? (<PuterImage puterPath={editingBandolero.image} className="w-full h-full object-cover rounded-lg"/>) : (<div className="text-center text-[#A093C7] dark:text-gray-400"><ImageIcon className="mx-auto" /><span>Subir foto</span></div>)}
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                        <button onClick={() => setIsAiImageModalOpen(true)} className="w-1/2 flex flex-col items-center justify-center p-3 h-28 border-2 border-dashed border-[#F3D9E9] dark:border-[#3D315B] rounded-lg cursor-pointer hover:bg-[#F3D9E9]/40 dark:hover:bg-[#3D315B]/60 text-center text-[#A093C7] dark:text-gray-400">
                             <Sparkles className="mx-auto" /><span>Generar con IA</span>
                        </button>
                     </div>
                     <div className="text-[#585076] dark:text-white font-medium border-t border-[#F3D9E9] dark:border-[#3D315B] pt-4 p-2 flex justify-between items-center">
                        <span>Notas / Historia</span>
                        <button onClick={handleGenerateBackstory} disabled={isGeneratingBackstory} className="text-sm flex items-center gap-1 text-[#9381FF] hover:text-[#E54F6D] disabled:opacity-50">
                            <Sparkles size={16} /> {isGeneratingBackstory ? 'Creando...' : 'Generar con IA'}
                        </button>
                    </div>
                    <textarea placeholder="Notas, historia, detalles..." value={editingBandolero.notes || ''} onChange={e => setEditingBandolero({ ...editingBandolero, notes: e.target.value })} className="w-full p-3 border border-[#F3D9E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54F6D] bg-transparent dark:border-[#3D315B] dark:focus:ring-[#9381FF] dark:text-white" rows={4}/>

                    <button onClick={handleSave} className="w-full bg-[#E54F6D] text-white py-3 rounded-lg font-semibold hover:bg-[#9381FF] dark:bg-[#9381FF] dark:hover:bg-[#E54F6D] transition-colors shadow-md mt-2">Guardar</button>
                </div>
            </Modal>
            
            <Modal isOpen={isAiImageModalOpen} onClose={() => setIsAiImageModalOpen(false)} title="Generar Imagen con IA">
                <div className="space-y-4">
                    <p className="text-sm text-[#585076] dark:text-gray-300">Describe la apariencia de {editingBandolero.name || 'tu bandolero'} para generar una imagen.</p>
                     <textarea placeholder="Ej: Pelo oscuro y rizado, ojos verdes, una pequeña cicatriz en la ceja, viste una chaqueta de cuero..." value={editingBandolero.appearanceDescription || ''} onChange={e => setEditingBandolero({ ...editingBandolero, appearanceDescription: e.target.value })} className="w-full p-3 border border-[#F3D9E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54F6D] bg-transparent dark:border-[#3D315B] dark:focus:ring-[#9381FF] dark:text-white" rows={4}/>
                     <button onClick={handleGenerateAiImage} disabled={isGeneratingImage || !editingBandolero.appearanceDescription} className="w-full bg-[#9381FF] text-white py-3 rounded-lg font-semibold hover:bg-[#E54F6D] transition-colors shadow-md disabled:bg-gray-400 flex items-center justify-center gap-2">
                        {isGeneratingImage ? 'Generando...' : 'Generar Imagen'}
                        <Sparkles size={18} />
                     </button>
                </div>
            </Modal>
        </div>
    );
};

export default BandolerosScreen;