

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DiaryEntry, Bandolero } from '../types';
import { Plus, Trash2, Feather, X, Image as ImageIcon, ArrowLeft, Bot, Volume2, Sparkles } from 'lucide-react';
import PuterImage from '../components/PuterImage';
import Modal from '../components/Modal';

declare global {
    interface Window {
        puter: any;
    }
}

interface DiaryEditorProps {
    entry: Partial<DiaryEntry>;
    onSave: (entry: DiaryEntry) => void;
    onClose: () => void;
    onDelete: (id: string) => void;
    bandoleros: Bandolero[];
}

const MOOD_OPTIONS = ['💖', '😊', '🤔', '😢', '🔥'];

const DiaryEditor: React.FC<DiaryEditorProps> = ({ entry, onSave, onClose, onDelete, bandoleros }) => {
    const [currentEntry, setCurrentEntry] = useState<Partial<DiaryEntry>>(entry);
    const [isImproving, setIsImproving] = useState(false);
    const isEditing = !!currentEntry.id;
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [mentionPopup, setMentionPopup] = useState<{ show: boolean, top: number, left: number, filter: string }>({ show: false, top: 0, left: 0, filter: '' });

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    const handleSave = () => {
        if (currentEntry.title && currentEntry.content) {
            const mentionedIds = new Set<string>();
            const text = currentEntry.content || '';
            if (bandoleros?.length > 0) {
                bandoleros.forEach(b => {
                    if (text.includes(b.name)) {
                        mentionedIds.add(b.id);
                    }
                });
            }
            const finalEntry: DiaryEntry = {
                id: currentEntry.id || Date.now().toString(),
                date: currentEntry.date || new Date().toISOString(),
                ...currentEntry,
                mentionedBandoleroIds: Array.from(mentionedIds),
            } as DiaryEntry;
            onSave(finalEntry);
        }
    };
    
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const fileName = `diary_${Date.now()}_${file.name}`;
            try {
                const puterFile = await window.puter.fs.write(fileName, file);
                setCurrentEntry({ ...currentEntry, coverImage: puterFile.path });
            } catch (error) { console.error("Error uploading cover image:", error); }
        }
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setCurrentEntry({ ...currentEntry, content: text });
        
        const cursorPos = e.target.selectionStart;
        const textUpToCursor = text.substring(0, cursorPos);
        const mentionMatch = textUpToCursor.match(/\/(\w*)$/);

        if (mentionMatch) {
            const rect = e.target.getBoundingClientRect();
            setMentionPopup({ show: true, top: rect.top + 20, left: rect.left, filter: mentionMatch[1] });
        } else {
            setMentionPopup({ show: false, top: 0, left: 0, filter: '' });
        }
    };

    const handleMentionSelect = (name: string) => {
        if (textareaRef.current) {
            const text = textareaRef.current.value;
            const cursorPos = textareaRef.current.selectionStart;
            const textUpToCursor = text.substring(0, cursorPos);
            
            const newText = textUpToCursor.replace(/\/(\w*)$/, name + ' ');
            const finalContent = newText + text.substring(cursorPos);
            
            setCurrentEntry({ ...currentEntry, content: finalContent });
            setMentionPopup({ show: false, top: 0, left: 0, filter: '' });
            textareaRef.current.focus();
        }
    };
    
    const handleImproveContent = async () => {
        if (!currentEntry.content) return;
        setIsImproving(true);
        try {
            const prompt = `Reescribe la siguiente entrada de diario para que suene más aesthetic, poética y evocadora, pero manteniendo el significado y sentimiento original. No añadas emojis. Texto original: "${currentEntry.content}"`;
            const response = await window.puter.ai.chat(prompt, { stream: true, model: 'openrouter:openai/gpt-4o' });
            
            setCurrentEntry(prev => ({...prev, content: ''}));
            for await (const chunk of response.stream) {
                setCurrentEntry(prev => ({...prev, content: (prev.content || '') + chunk.text}));
            }
        } catch (error) {
            console.error("AI Improve Error:", error);
        } finally {
            setIsImproving(false);
        }
    }

    const filteredBandoleros = useMemo(() => {
        return bandoleros.filter(b => b.name.toLowerCase().includes(mentionPopup.filter.toLowerCase()));
    }, [bandoleros, mentionPopup.filter]);


    return (
        <div className="fixed inset-0 bg-[#FFF8F9] dark:bg-[#2E294E] z-50 animate-slide-up-fast flex flex-col">
            <header className="flex items-center justify-between p-4 border-b border-[#E0B1CB] dark:border-[#3E3561] flex-shrink-0">
                <button onClick={onClose} className="p-2 -ml-2 text-[#9A86A8] hover:text-[#5E548E] dark:text-gray-400 dark:hover:text-white transition-colors"><ArrowLeft size={24} /></button>
                <div className="flex items-center space-x-2">
                    <button onClick={handleImproveContent} disabled={isImproving || !currentEntry.content} className="flex items-center gap-1 bg-white dark:bg-[#3E3561] px-3 py-1.5 rounded-full shadow-sm text-sm font-semibold text-[#9381FF] dark:text-[#fbc2eb] disabled:opacity-50">
                        <Sparkles size={14} /> {isImproving ? 'Mejorando...' : 'Mejorar'}
                    </button>
                    {isEditing && <button onClick={() => onDelete(currentEntry.id!)} className="text-red-400 hover:text-red-600 transition-colors p-2"><Trash2 size={20} /></button>}
                    <button onClick={handleSave} className="bg-[#BE95C4] text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-[#9F86C0] dark:bg-[#9F86C0] dark:hover:bg-[#BE95C4] transition-colors">Guardar</button>
                </div>
            </header>
            
            <div className="flex-grow overflow-y-auto">
                <div className="h-48 bg-gray-200 dark:bg-[#3E3561] relative group">
                    {currentEntry.coverImage && <PuterImage puterPath={currentEntry.coverImage} alt="Cover" className="w-full h-full object-cover" />}
                     <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <div className="text-center text-white"><ImageIcon size={32} /><p className="text-sm mt-1">{currentEntry.coverImage ? 'Cambiar' : 'Añadir portada'}</p></div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                </div>

                <div className="p-4 md:p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 mb-4">
                            {MOOD_OPTIONS.map(mood => (
                                <button key={mood} onClick={() => setCurrentEntry({...currentEntry, mood})} className={`text-3xl transition-transform duration-200 transform hover:scale-125 ${currentEntry.mood === mood ? 'grayscale-0' : 'grayscale opacity-50'}`}>{mood}</button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#5E548E] dark:text-gray-300 mb-4">
                            <input type="checkbox" id="is-dream" checked={!!currentEntry.isDream} onChange={e => setCurrentEntry({...currentEntry, isDream: e.target.checked})} className="w-4 h-4 text-[#BE95C4] bg-gray-100 border-gray-300 rounded focus:ring-[#9F86C0] dark:bg-[#3E3561] dark:border-gray-500"/>
                            <label htmlFor="is-dream">Es un sueño</label>
                        </div>
                    </div>
                    <input type="text" placeholder="El título de tu día..." value={currentEntry.title || ''} onChange={e => setCurrentEntry({ ...currentEntry, title: e.target.value })} className="w-full text-3xl md:text-4xl font-bold bg-transparent focus:outline-none text-[#5E548E] dark:text-white placeholder-gray-400 dark:placeholder-gray-600 mb-4" />
                    <textarea ref={textareaRef} placeholder="Escribe lo que sientes... (usa '/' para mencionar)" value={currentEntry.content || ''} onChange={handleContentChange} className="w-full h-[40vh] bg-transparent focus:outline-none text-[#5E548E] dark:text-gray-300 text-lg leading-relaxed resize-none" />
                </div>
            </div>

            {mentionPopup.show && (
                 <div style={{ top: mentionPopup.top, left: mentionPopup.left }} className="absolute bg-white dark:bg-[#3D315B] rounded-lg shadow-xl border border-[#E0B1CB] dark:border-[#5E548E] z-10 max-h-48 overflow-y-auto">
                     {filteredBandoleros.length > 0 ? filteredBandoleros.map(b => (
                         <div key={b.id} onClick={() => handleMentionSelect(b.name)} className="p-2 hover:bg-[#F3D9E9] dark:hover:bg-[#5E548E] cursor-pointer text-sm text-[#5E548E] dark:text-white">
                             {b.name}
                         </div>
                     )) : <div className="p-2 text-sm text-gray-400">No se encontraron bandoleros</div>}
                 </div>
            )}
        </div>
    );
};

const DiaryCard: React.FC<{ entry: DiaryEntry; onClick: () => void, onInterpret: () => void }> = ({ entry, onClick, onInterpret }) => {
    return (
        <div onClick={onClick} className="bg-white dark:bg-[#3E3561] rounded-xl shadow-md overflow-hidden cursor-pointer transform hover:-translate-y-1 transition-transform duration-300 flex flex-col group">
            <div className="h-32 w-full bg-[#E0B1CB]/30 dark:bg-[#5E548E]/50 flex items-center justify-center text-[#BE95C4] dark:text-[#9F86C0] relative">
                {entry.coverImage ? <PuterImage puterPath={entry.coverImage} className="h-32 w-full object-cover" /> : <Feather size={32} />}
                {entry.isDream && <div className="absolute top-2 left-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><Bot size={12}/> Sueño</div>}
            </div>
            <div className="p-3 flex flex-col flex-grow">
                 <h3 className="font-bold text-[#5E548E] dark:text-white truncate">{entry.title}</h3>
                 <div className="flex items-center justify-between text-xs text-[#9A86A8] dark:text-gray-400 mt-auto pt-2">
                    <span>{new Date(entry.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</span>
                    <span className="text-lg">{entry.mood}</span>
                 </div>
            </div>
             {entry.isDream && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onInterpret(); }} 
                    className="absolute bottom-2 right-2 px-2.5 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5" 
                    title="Interpretar sueño"
                >
                    <Sparkles size={14}/>
                    <span>Interpretar Sueño</span>
                </button>
            )}
        </div>
    );
};

interface DiaryScreenProps {
    entries: DiaryEntry[];
    setEntries: React.Dispatch<React.SetStateAction<DiaryEntry[]>>;
    bandoleros: Bandolero[];
}

const DiaryScreen: React.FC<DiaryScreenProps> = ({ entries, setEntries, bandoleros }) => {
    const [editingEntry, setEditingEntry] = useState<Partial<DiaryEntry> | null>(null);
    const [summary, setSummary] = useState<string>('');
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [interpretation, setInterpretation] = useState('');
    const [isInterpretationModalOpen, setIsInterpretationModalOpen] = useState(false);
    
    const handleSaveEntry = (entryToSave: DiaryEntry) => {
        const index = entries.findIndex(e => e.id === entryToSave.id);
        if (index > -1) {
            setEntries(entries.map(e => e.id === entryToSave.id ? entryToSave : e));
        } else {
            setEntries([entryToSave, ...entries]);
        }
        setEditingEntry(null);
    };

    const handleDeleteEntry = (id: string) => {
        setEntries(entries.filter(e => e.id !== id));
        setEditingEntry(null);
    };

    const handleSummarize = async () => {
        const latestEntry = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        if (!latestEntry) return;
        
        setIsSummaryModalOpen(true);
        setSummary('');
        try {
            const prompt = `Resume la siguiente entrada de diario en un párrafo corto y con un tono aesthetic y positivo. El título es "${latestEntry.title}". Contenido: "${latestEntry.content}"`;
            const response = await window.puter.ai.chat(prompt, { stream: true });
            for await (const chunk of response.stream) {
                setSummary(prev => prev + chunk.text);
            }
        } catch (error) {
            console.error("AI Summary Error:", error);
            setSummary("No pude resumir tu día, ¡pero seguro que fue genial!");
        }
    }
    
    const handleInterpretDream = async (entry: DiaryEntry) => {
        setIsInterpretationModalOpen(true);
        setInterpretation('');
        try {
            const prompt = `Interpreta el siguiente sueño de una manera mística, aesthetic y positiva. Dale un significado simbólico a los elementos del sueño. El título es "${entry.title}" y el contenido es "${entry.content}".`;
            const response = await window.puter.ai.chat(prompt, { stream: true, model: 'openrouter:openai/gpt-4o' });
            for await (const chunk of response.stream) {
                setInterpretation(prev => prev + chunk.text);
            }
        } catch (error) {
            console.error("AI Dream Interpretation Error:", error);
            setInterpretation("A veces los sueños son solo sueños, pero este seguro que escondía algo mágico.");
        }
    }
    
    const handlePlayTTS = (entry: DiaryEntry) => {
        const textToRead = `${entry.title}. ${entry.content}`;
        window.puter.ai.txt2speech(textToRead).then((audio: HTMLAudioElement) => audio.play());
    }

    return (
        <div className="p-4 h-full">
            {editingEntry && <DiaryEditor entry={editingEntry} onSave={handleSaveEntry} onClose={() => setEditingEntry(null)} onDelete={handleDeleteEntry} bandoleros={bandoleros}/>}
            
            <div className="flex justify-end mb-4 -mt-2">
                <button onClick={handleSummarize} disabled={entries.length === 0} className="flex items-center gap-2 bg-white dark:bg-[#3E3561] px-4 py-2 rounded-full shadow text-sm font-semibold text-[#9381FF] dark:text-[#fbc2eb] disabled:opacity-50 disabled:cursor-not-allowed">
                    <Bot size={16}/> Resumir mi día
                </button>
            </div>
            
            {entries.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                    {entries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                        <div key={entry.id} className="relative group">
                            <DiaryCard entry={entry} onClick={() => setEditingEntry(entry)} onInterpret={() => handleInterpretDream(entry)} />
                            <button onClick={(e) => { e.stopPropagation(); handlePlayTTS(entry); }} className="absolute top-2 right-2 p-1.5 bg-black/30 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity" title="Leer en voz alta">
                                <Volume2 size={14}/>
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="flex flex-col items-center justify-center h-full text-center p-8 -mt-24 text-[#9A86A8] dark:text-gray-400">
                    <div className="text-[#BE95C4] dark:text-[#9F86C0] mb-4"><Feather size={64} strokeWidth={1.5} /></div>
                    <h2 className="text-xl font-bold text-[#5E548E] dark:text-white mb-2">Un lienzo en blanco</h2>
                    <p className="max-w-xs">Tus pensamientos merecen ser escritos. ¡Crea tu primera entrada con el botón '+'!</p>
                </div>
            )}
            <button onClick={() => setEditingEntry({ title: '', content: '', mood: '😊' })} className="fixed bottom-24 right-5 bg-[#BE95C4] text-white p-4 rounded-full shadow-lg hover:bg-[#9F86C0] dark:bg-[#9F86C0] dark:hover:bg-[#BE95C4] transition-transform duration-300 transform hover:scale-110 z-40"><Plus size={28} /></button>
            
            <Modal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} title="Resumen del Día">
                <p className="text-[#585076] dark:text-[#DCD7F5] whitespace-pre-wrap">{summary || 'Generando resumen...'}</p>
            </Modal>
            <Modal isOpen={isInterpretationModalOpen} onClose={() => setIsInterpretationModalOpen(false)} title="El Oráculo de los Sueños">
                <p className="text-[#585076] dark:text-[#DCD7F5] whitespace-pre-wrap">{interpretation || 'Interpretando tu sueño...'}</p>
            </Modal>
        </div>
    );
};

export default DiaryScreen;