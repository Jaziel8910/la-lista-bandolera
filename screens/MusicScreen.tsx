
import React, { useState } from 'react';
import { Song, Playlist } from '../types';
import StarRating from '../components/StarRating';
import { Plus, Trash2, Music, ListMusic, Image as ImageIcon, ArrowLeft, Edit, Sparkles } from 'lucide-react';
import Modal from '../components/Modal';
import PuterImage from '../components/PuterImage';

declare global {
    interface Window {
        puter: any;
    }
}

interface MusicScreenProps {
    songs: Song[];
    setSongs: React.Dispatch<React.SetStateAction<Song[]>>;
    playlists: Playlist[];
    setPlaylists: React.Dispatch<React.SetStateAction<Playlist[]>>;
}

const PlaylistDetailView: React.FC<{ playlist: Playlist; onBack: () => void; onEdit: (playlist: Playlist) => void; allSongs: Song[]; }> = ({ playlist, onBack, onEdit, allSongs }) => {
    const playlistSongs = allSongs.filter(song => playlist.songIds.includes(song.id));

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 flex items-center gap-4 flex-shrink-0">
                <button onClick={onBack} className="p-2 -ml-2 text-[#8E82AE] hover:text-[#3D315B] dark:text-gray-400 dark:hover:text-white"><ArrowLeft size={24} /></button>
                <PuterImage
                    puterPath={playlist.coverImage || ''}
                    className="w-20 h-20 rounded-lg object-cover shadow-lg"
                    alt={playlist.name}
                    fallback={<div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#E54F6D] to-[#FAA9BE] flex items-center justify-center text-white/80 shadow-lg"><ListMusic size={32}/></div>}
                />
                <div className="flex-grow">
                    <h2 className="text-2xl font-bold text-[#3D315B] dark:text-white">{playlist.name}</h2>
                    <p className="text-sm text-[#8E82AE] dark:text-gray-400">{playlist.songIds.length} {playlist.songIds.length === 1 ? 'canción' : 'canciones'}</p>
                </div>
                <button onClick={() => onEdit(playlist)} className="bg-white dark:bg-[#3D315B] p-2.5 rounded-full text-[#8E82AE] shadow-sm hover:text-[#E54F6D]"><Edit size={20}/></button>
            </header>
            <main className="flex-grow overflow-y-auto px-4 space-y-3 pb-4">
                {playlistSongs.length > 0 ? playlistSongs.map(song => (
                    <div key={song.id} className="bg-white dark:bg-[#3D315B] rounded-xl p-3 flex items-center gap-4">
                        <img src={`https://picsum.photos/seed/${song.id}/100/100`} alt={song.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-grow">
                            <h3 className="font-semibold text-[#3D315B] dark:text-white">{song.title}</h3>
                            <p className="text-xs text-[#8E82AE] dark:text-gray-400">{song.artist}</p>
                        </div>
                        <StarRating rating={song.rating} size={16} />
                    </div>
                )) : (
                    <div className="text-center pt-16 text-[#A093C7] dark:text-gray-400">
                        <p>Esta playlist está vacía.</p>
                        <button onClick={() => onEdit(playlist)} className="mt-2 text-[#E54F6D] font-semibold">Añade canciones</button>
                    </div>
                )}
            </main>
        </div>
    );
};

const MusicScreen: React.FC<MusicScreenProps> = ({ songs, setSongs, playlists, setPlaylists }) => {
    const [activeTab, setActiveTab] = useState('songs');
    const [isSongModalOpen, setIsSongModalOpen] = useState(false);
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [editingSong, setEditingSong] = useState<Partial<Song> | null>(null);
    const [editingPlaylist, setEditingPlaylist] = useState<Partial<Playlist> | null>(null);
    const [viewingPlaylist, setViewingPlaylist] = useState<Playlist | null>(null);
    const [isGeneratingCover, setIsGeneratingCover] = useState(false);

    const openSongModal = (song: Song | null) => {
        setEditingSong(song ? { ...song } : { title: '', artist: '', rating: 0 });
        setIsSongModalOpen(true);
    };

    const openPlaylistModal = (playlist: Playlist | null) => {
        setEditingPlaylist(playlist ? { ...playlist } : { name: '', songIds: [] });
        setIsPlaylistModalOpen(true);
    };

    const handleSaveSong = () => {
        if (editingSong?.title && editingSong?.artist) {
            if (editingSong.id) {
                setSongs(songs.map(s => s.id === editingSong.id ? editingSong as Song : s));
            } else {
                setSongs([...songs, { id: Date.now().toString(), ...editingSong } as Song]);
            }
            setIsSongModalOpen(false);
            setEditingSong(null);
        }
    };
    
    const handleDeleteSong = (id: string) => {
        setSongs(songs.filter(s => s.id !== id));
        setPlaylists(playlists.map(p => ({ ...p, songIds: p.songIds.filter(songId => songId !== id) })));
    };

    const handlePlaylistImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const fileName = `playlist_${Date.now()}_${file.name}`;
            try {
                const puterFile = await window.puter.fs.write(fileName, file);
                setEditingPlaylist(p => p ? { ...p, coverImage: puterFile.path } : null);
            } catch (error) { console.error("Error uploading playlist cover:", error); }
        }
    };
    
    const handleGenerateAiCover = async () => {
        if (!editingPlaylist?.name) return;
        setIsGeneratingCover(true);
        try {
            const prompt = `Album cover art for a playlist called "${editingPlaylist.name}", aesthetic, vibrant, digital painting, lofi anime style.`;
            const image = await window.puter.ai.txt2img(prompt, { model: 'dall-e-3' });
            const response = await fetch(image.src);
            const blob = await response.blob();
            const fileName = `playlist_cover_ai_${Date.now()}.png`;
            const puterFile = await window.puter.fs.write(fileName, blob);
            setEditingPlaylist(p => p ? { ...p, coverImage: puterFile.path } : null);
        } catch (error) {
            console.error("AI Cover Generation Error:", error);
        } finally {
            setIsGeneratingCover(false);
        }
    }

    const handleSavePlaylist = () => {
        if (editingPlaylist?.name) {
            if (editingPlaylist.id) {
                const updatedPlaylist = editingPlaylist as Playlist;
                setPlaylists(playlists.map(p => p.id === updatedPlaylist.id ? updatedPlaylist : p));
                if (viewingPlaylist?.id === updatedPlaylist.id) {
                    setViewingPlaylist(updatedPlaylist);
                }
            } else {
                setPlaylists([...playlists, { id: Date.now().toString(), ...editingPlaylist } as Playlist]);
            }
            setIsPlaylistModalOpen(false);
            setEditingPlaylist(null);
        }
    };
    
    const handleDeletePlaylist = (id: string) => {
        setPlaylists(playlists.filter(p => p.id !== id));
    };

    const toggleSongInPlaylist = (songId: string) => {
        if (!editingPlaylist) return;
        const currentIds = editingPlaylist.songIds || [];
        if (currentIds.includes(songId)) {
            setEditingPlaylist({ ...editingPlaylist, songIds: currentIds.filter(id => id !== songId) });
        } else {
            setEditingPlaylist({ ...editingPlaylist, songIds: [...currentIds, songId] });
        }
    };

    if (viewingPlaylist) {
        return <PlaylistDetailView playlist={viewingPlaylist} onBack={() => setViewingPlaylist(null)} onEdit={openPlaylistModal} allSongs={songs} />;
    }

    return (
        <div className="h-full flex flex-col">
            <div className="px-4 pt-2">
                <div className="flex justify-center p-1.5 bg-white/50 dark:bg-[#3D315B]/50 rounded-full mx-4 mb-4 shadow-sm">
                    <button onClick={() => setActiveTab('songs')} className={`w-1/2 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'songs' ? 'bg-[#E54F6D] text-white shadow' : 'text-[#8E82AE] dark:text-gray-400'}`}>Canciones</button>
                    <button onClick={() => setActiveTab('playlists')} className={`w-1/2 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'playlists' ? 'bg-[#E54F6D] text-white shadow' : 'text-[#8E82AE] dark:text-gray-400'}`}>Playlists</button>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto px-4 pb-4">
                {activeTab === 'songs' && (
                    songs.length > 0 ? (
                        <div className="space-y-3">
                        {songs.sort((a, b) => b.rating - a.rating).map(song => (
                            <div key={song.id} className="bg-white dark:bg-[#3D315B] rounded-xl shadow-md p-3 flex items-center gap-4 group">
                                <img src={`https://picsum.photos/seed/${song.id}/100/100`} alt={song.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                                <div className="flex-grow overflow-hidden">
                                    <h3 className="font-bold text-lg text-[#3D315B] dark:text-white truncate">{song.title}</h3>
                                    <p className="text-sm text-[#8E82AE] dark:text-gray-400 truncate">{song.artist}</p>
                                    <StarRating rating={song.rating} />
                                </div>
                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openSongModal(song)} className="text-gray-400 hover:text-blue-500"><Edit size={18} /></button>
                                    <button onClick={() => handleDeleteSong(song.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 text-[#A093C7] dark:text-gray-400">
                            <div className="text-[#E54F6D] mb-4"><Music size={64} strokeWidth={1.5} /></div>
                            <h2 className="text-xl font-bold text-[#3D315B] dark:text-white mb-2">Silencio por ahora...</h2>
                            <p className="max-w-xs">Añade tus canciones favoritas y crea la banda sonora de tu vida.</p>
                        </div>
                    )
                )}
                {activeTab === 'playlists' && (
                     playlists.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {playlists.map(playlist => (
                                <div key={playlist.id} onClick={() => setViewingPlaylist(playlist)} className="bg-white dark:bg-[#3D315B] rounded-xl shadow-md overflow-hidden group relative cursor-pointer transform hover:-translate-y-1 transition-transform">
                                    <PuterImage 
                                        puterPath={playlist.coverImage || ''} 
                                        className="h-24 w-full object-cover"
                                        alt={playlist.name}
                                        fallback={<div className="h-24 w-full bg-gradient-to-br from-[#E54F6D] to-[#FAA9BE] flex items-center justify-center text-white/80"><ListMusic size={32}/></div>}
                                    />
                                    <div className="p-3">
                                        <h3 className="font-bold text-base text-[#3D315B] dark:text-white truncate">{playlist.name}</h3>
                                        <p className="text-xs text-[#8E82AE] dark:text-gray-400">{playlist.songIds.length} {playlist.songIds.length === 1 ? 'canción' : 'canciones'}</p>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeletePlaylist(playlist.id); }} className="absolute top-2 right-2 bg-black/30 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 text-[#A093C7] dark:text-gray-400">
                            <div className="text-[#E54F6D] mb-4"><ListMusic size={64} strokeWidth={1.5} /></div>
                            <h2 className="text-xl font-bold text-[#3D315B] dark:text-white mb-2">Crea tu primera playlist</h2>
                            <p className="max-w-xs">Organiza tus canciones en playlists para cada mood.</p>
                        </div>
                    )
                )}
            </div>
            {!viewingPlaylist && (
                 <button
                    onClick={() => activeTab === 'songs' ? openSongModal(null) : openPlaylistModal(null)}
                    className="fixed bottom-24 right-5 bg-gradient-to-br from-[#E54F6D] to-[#FAA9BE] text-white p-4 rounded-full shadow-lg hover:from-[#9381FF] hover:to-[#B8B0FF] dark:from-[#9381FF] dark:to-[#B8B0FF] dark:hover:from-[#E54F6D] dark:hover:to-[#FAA9BE] transition-all duration-300 transform hover:scale-110"
                ><Plus size={28} /></button>
            )}

            <Modal isOpen={isSongModalOpen} onClose={() => setIsSongModalOpen(false)} title={editingSong?.id ? "Editar Canción" : "Añadir Canción"}>
                 <div className="space-y-4">
                    <input type="text" placeholder="Título" value={editingSong?.title || ''} onChange={e => setEditingSong({ ...editingSong, title: e.target.value })} className="w-full p-3 border border-[#F3D9E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54F6D] bg-transparent dark:border-[#3D315B] dark:focus:ring-[#9381FF] dark:text-white" />
                    <input type="text" placeholder="Artista" value={editingSong?.artist || ''} onChange={e => setEditingSong({ ...editingSong, artist: e.target.value })} className="w-full p-3 border border-[#F3D9E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54F6D] bg-transparent dark:border-[#3D315B] dark:focus:ring-[#9381FF] dark:text-white" />
                    <div className="flex items-center justify-between">
                        <span className="text-[#585076] dark:text-white font-medium">Ranking:</span>
                        <StarRating rating={editingSong?.rating || 0} setRating={r => setEditingSong({ ...editingSong, rating: r })} size={28} />
                    </div>
                    <button onClick={handleSaveSong} className="w-full bg-[#E54F6D] text-white py-3 rounded-lg font-semibold hover:bg-[#9381FF] dark:bg-[#9381FF] dark:hover:bg-[#E54F6D] transition-colors shadow-md">Guardar</button>
                </div>
            </Modal>
            
            <Modal isOpen={isPlaylistModalOpen} onClose={() => setIsPlaylistModalOpen(false)} title={editingPlaylist?.id ? "Editar Playlist" : "Crear Playlist"}>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-2">
                    <input type="text" placeholder="Nombre de la Playlist" value={editingPlaylist?.name || ''} onChange={e => setEditingPlaylist(p => p ? { ...p, name: e.target.value } : null)} className="w-full p-3 border border-[#F3D9E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54F6D] bg-transparent dark:border-[#3D315B] dark:focus:ring-[#9381FF] dark:text-white" />
                    
                    <div className="flex items-center gap-2 pt-2">
                        <label className="w-1/2 flex flex-col items-center justify-center p-3 h-28 border-2 border-dashed border-[#F3D9E9] dark:border-[#3D315B] rounded-lg cursor-pointer hover:bg-[#F3D9E9]/40 dark:hover:bg-[#3D315B]/60">
                            {editingPlaylist?.coverImage ? (<PuterImage puterPath={editingPlaylist.coverImage} className="w-full h-full object-cover rounded-lg"/>) : (<div className="text-center text-[#A093C7] dark:text-gray-400"><ImageIcon className="mx-auto" /><span>Subir portada</span></div>)}
                            <input type="file" accept="image/*" className="hidden" onChange={handlePlaylistImageChange} />
                        </label>
                        <button onClick={handleGenerateAiCover} disabled={isGeneratingCover || !editingPlaylist?.name} className="w-1/2 flex flex-col items-center justify-center p-3 h-28 border-2 border-dashed border-[#F3D9E9] dark:border-[#3D315B] rounded-lg cursor-pointer hover:bg-[#F3D9E9]/40 dark:hover:bg-[#3D315B]/60 text-center text-[#A093C7] dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed">
                             <Sparkles className="mx-auto" /><span>{isGeneratingCover ? 'Generando...' : 'Generar con IA'}</span>
                        </button>
                     </div>

                    <h4 className="font-semibold text-[#585076] dark:text-white pt-2">Añadir canciones:</h4>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2 text-[#585076] dark:text-gray-300">
                        {songs.length > 0 ? songs.map(song => (
                            <div key={song.id} onClick={() => toggleSongInPlaylist(song.id)} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-[#F3D9E9]/40 dark:hover:bg-[#3D315B]/60">
                                <input type="checkbox" readOnly checked={editingPlaylist?.songIds?.includes(song.id)} className="form-checkbox h-5 w-5 text-[#E54F6D] rounded focus:ring-[#9381FF] bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500" />
                                <span>{song.title} - {song.artist}</span>
                            </div>
                        )) : <p className="text-sm text-center text-gray-400">Añade algunas canciones primero.</p>}
                    </div>
                    <button onClick={handleSavePlaylist} className="w-full bg-[#E54F6D] text-white py-3 rounded-lg font-semibold hover:bg-[#9381FF] dark:bg-[#9381FF] dark:hover:bg-[#E54F6D] transition-colors shadow-md mt-2">Guardar Playlist</button>
                </div>
            </Modal>
        </div>
    );
};

export default MusicScreen;
