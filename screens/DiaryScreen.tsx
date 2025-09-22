import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DiaryEntry, Bandolero } from '../types';
import { Plus, Trash2, Feather, X, Image as ImageIcon, ArrowLeft } from 'lucide-react';

interface DiaryScreenProps {
    entries: DiaryEntry[];
    setEntries: React.Dispatch<React.SetStateAction<DiaryEntry[]>>;
    bandoleros: Bandolero[];
}

const MOOD_OPTIONS = ['💖', '😊', '🤔', '😢', '🔥'];

// --- Diary Editor Component (Full Screen Modal) ---
const DiaryEditor: React.FC<{
    entry: Partial<DiaryEntry>;
    onSave: (entry: DiaryEntry) => void;
    onClose: () => void;
    onDelete: (id: string) => void;
    bandoleros: Bandolero[];
}> = ({ entry, onSave, onClose, onDelete, bandoleros }) => {
    const [currentEntry, setCurrentEntry] = useState<Partial<DiaryEntry>>(entry);
    const isEditing = !!currentEntry.id;
    const highlightDivRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);


    useEffect(() => {
        // Prevent body scroll when editor is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const highlightedContent = useMemo(() => {
        const text = currentEntry.content || '';
        if (!bandoleros || bandoleros.length === 0) {
            return text.replace(/\n/g, '<br />');;
        }

        // Escape special characters for regex and sort by length descending to match longer names first
        const names = bandoleros.map(b => b.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).sort((a, b) => b.length - a.length);
        if (names.length === 0) {
             return text.replace(/\n/g, '<br />');
        }
        
        const regex = new RegExp(`(${names.join('|')})`, 'gi');

        const highlighted = text.replace(regex, (match) => {
            return `<strong class="bg-[#E0B1CB]/50 dark:bg-[#5E548E]/70 text-[#9F86C0] dark:text-[#E0B1CB] rounded px-1 font-semibold">${match}</strong>`;
        });
        
        return highlighted.replace(/\n/g, '<br />');
    }, [currentEntry.content, bandoleros]);

    const handleSave = () => {
        if (currentEntry.title && currentEntry.content) {
             // Detect mentions
            const mentionedIds = new Set<string>();
            const text = currentEntry.content || '';
            if (bandoleros && bandoleros.length > 0) {
                bandoleros.forEach(b => {
                    const regex = new RegExp(b.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
                    if (regex.test(text)) {
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
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCurrentEntry({ ...currentEntry, coverImage: reader.result as string });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCurrentEntry({ ...currentEntry, content: e.target.value });
    };

    const handleScroll = () => {
        if (textareaRef.current && highlightDivRef.current) {
            highlightDivRef.current.scrollTop = textareaRef.current.scrollTop;
            highlightDivRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    }

    return (
        <div className="fixed inset-0 bg-[#FFF8F9] dark:bg-[#2E294E] z-50 animate-slide-up-fast flex flex-col">
            <style>{`
                @keyframes slide-up-fast { 0% { transform: translateY(100%); } 100% { transform: translateY(0); } }
            `}</style>
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-[#E0B1CB] dark:border-[#3E3561] flex-shrink-0">
                <button onClick={onClose} className="flex items-center text-[#9A86A8] hover:text-[#5E548E] dark:text-gray-400 dark:hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex items-center space-x-4">
                    {isEditing && (
                        <button onClick={() => onDelete(currentEntry.id!)} className="text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 size={20} />
                        </button>
                    )}
                    <button onClick={handleSave} className="bg-[#BE95C4] text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-[#9F86C0] dark:bg-[#9F86C0] dark:hover:bg-[#BE95C4] transition-colors">
                        Guardar
                    </button>
                </div>
            </header>
            
            {/* Editor Body */}
            <div className="flex-grow overflow-y-auto">
                 {/* Cover Image */}
                <div className="h-48 bg-gray-200 dark:bg-[#3E3561] relative group">
                    {currentEntry.coverImage ? (
                        <img src={currentEntry.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : null}
                     <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <div className="text-center text-white">
                            <ImageIcon size={32} />
                            <p className="text-sm mt-1">{currentEntry.coverImage ? 'Cambiar portada' : 'Añadir portada'}</p>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                </div>

                <div className="p-4 md:p-8">
                    {/* Mood Selector */}
                    <div className="flex items-center space-x-2 mb-4">
                        {MOOD_OPTIONS.map(mood => (
                            <button key={mood} onClick={() => setCurrentEntry({...currentEntry, mood})} className={`text-3xl transition-transform duration-200 transform hover:scale-125 ${currentEntry.mood === mood ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                                {mood}
                            </button>
                        ))}
                    </div>

                    {/* Title */}
                    <input
                        type="text"
                        placeholder="El título de tu día..."
                        value={currentEntry.title || ''}
                        onChange={e => setCurrentEntry({ ...currentEntry, title: e.target.value })}
                        className="w-full text-3xl md:text-4xl font-bold bg-transparent focus:outline-none text-[#5E548E] dark:text-white placeholder-gray-400 dark:placeholder-gray-600 mb-4"
                    />

                    {/* Content */}
                    <div className="relative w-full h-[40vh]">
                        <div
                            ref={highlightDivRef}
                            aria-hidden="true"
                            className="w-full h-full p-0 m-0 overflow-y-auto bg-transparent focus:outline-none text-[#5E548E] dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap selection:bg-transparent"
                            dangerouslySetInnerHTML={{ __html: highlightedContent }}
                        />
                        <textarea
                            ref={textareaRef}
                            placeholder="Escribe lo que sientes..."
                            value={currentEntry.content || ''}
                            onChange={handleContentChange}
                            onScroll={handleScroll}
                            className="absolute inset-0 w-full h-full p-0 m-0 bg-transparent focus:outline-none text-transparent selection:bg-[#BE95C4]/50 caret-[#BE95C4] dark:caret-[#9F86C0] text-lg leading-relaxed resize-none"
                            spellCheck="false"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Diary Card Component ---
const DiaryCard: React.FC<{ entry: DiaryEntry; onClick: () => void }> = ({ entry, onClick }) => {
    return (
        <div onClick={onClick} className="bg-white dark:bg-[#3E3561] rounded-xl shadow-md overflow-hidden cursor-pointer transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
            {entry.coverImage ? (
                <img src={entry.coverImage} alt={entry.title} className="h-32 w-full object-cover" />
            ) : (
                <div className="h-32 w-full bg-[#E0B1CB]/30 dark:bg-[#5E548E]/50 flex items-center justify-center text-[#BE95C4] dark:text-[#9F86C0]">
                    <Feather size={32} />
                </div>
            )}
            <div className="p-3 flex flex-col flex-grow">
                 <h3 className="font-bold text-[#5E548E] dark:text-white truncate">{entry.title}</h3>
                 <div className="flex items-center justify-between text-xs text-[#9A86A8] dark:text-gray-400 mt-auto pt-2">
                    <span>{new Date(entry.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</span>
                    <span className="text-lg">{entry.mood}</span>
                 </div>
            </div>
        </div>
    );
};


// --- Main Diary Screen Component ---
const DiaryScreen: React.FC<DiaryScreenProps> = ({ entries, setEntries, bandoleros }) => {
    const [editingEntry, setEditingEntry] = useState<Partial<DiaryEntry> | null>(null);
    
    const handleOpenEditor = (entry: Partial<DiaryEntry> | null) => {
        if(entry) {
            setEditingEntry(entry);
        } else {
            setEditingEntry({ title: '', content: '', mood: '😊' }); // Default new entry
        }
    };

    const handleCloseEditor = () => {
        setEditingEntry(null);
    };

    const handleSaveEntry = (entryToSave: DiaryEntry) => {
        const index = entries.findIndex(e => e.id === entryToSave.id);
        if (index > -1) {
            // Update existing
            const updatedEntries = [...entries];
            updatedEntries[index] = entryToSave;
            setEntries(updatedEntries);
        } else {
            // Add new
            setEntries([entryToSave, ...entries]);
        }
        handleCloseEditor();
    };

    const handleDeleteEntry = (id: string) => {
        setEntries(entries.filter(e => e.id !== id));
        handleCloseEditor();
    };


    return (
        <div className="p-4 animate-swoop-in h-full">
            {editingEntry && (
                <DiaryEditor 
                    entry={editingEntry}
                    onSave={handleSaveEntry}
                    onClose={handleCloseEditor}
                    onDelete={handleDeleteEntry}
                    bandoleros={bandoleros}
                />
            )}
            {entries.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                    {entries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                        <DiaryCard key={entry.id} entry={entry} onClick={() => handleOpenEditor(entry)} />
                    ))}
                </div>
            ) : (
                 <div className="flex flex-col items-center justify-center h-full text-center p-8 -mt-16 text-[#9A86A8] dark:text-gray-400">
                    <div className="text-[#BE95C4] dark:text-[#9F86C0] mb-4">
                        <Feather size={64} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-bold text-[#5E548E] dark:text-white mb-2">Un lienzo en blanco</h2>
                    <p className="max-w-xs">Tus pensamientos merecen ser escritos. ¡Crea tu primera entrada con el botón '+'!</p>
                </div>
            )}
            <button
                onClick={() => handleOpenEditor(null)}
                className="fixed bottom-24 right-5 bg-[#BE95C4] text-white p-4 rounded-full shadow-lg hover:bg-[#9F86C0] dark:bg-[#9F86C0] dark:hover:bg-[#BE95C4] transition-transform duration-300 transform hover:scale-110 z-40"
            >
                <Plus size={28} />
            </button>
        </div>
    );
};

export default DiaryScreen;