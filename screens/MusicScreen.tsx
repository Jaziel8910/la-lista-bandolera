import React, { useState } from 'react';
import { Song, Playlist } from '../types';
import StarRating from '../components/StarRating';
import { Plus, Trash2, Music, ListMusic, Image as ImageIcon } from 'lucide-react';
import Modal from '../components/Modal';

interface MusicScreenProps {
    songs: Song[];
    setSongs: React.Dispatch<React.SetStateAction<Song[]>>;
    playlists: Playlist[];
    setPlaylists: React.Dispatch<React.SetStateAction<Playlist[]>>;
}

const MusicScreen: React.FC<MusicScreenProps> = ({ songs, setSongs, playlists, setPlaylists }) => {
    const [activeTab, setActiveTab] = useState('songs');
    const [isSongModalOpen, setIsSongModalOpen] = useState(false);
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [newSong, setNewSong] = useState<Partial<Song>>({ title: '', artist: '', rating: 0 });
    const [newPlaylist, setNewPlaylist] = useState<Partial<Playlist>>({ name: '', songIds: [] });
    const [playlistImagePreview, setPlaylistImagePreview] = useState<string | null>(null);

    const handleSaveSong = () => {
        if (newSong.title && newSong.artist && newSong.rating) {
            setSongs([...songs, { id: Date.now().toString(), ...newSong } as Song]);
            setIsSongModalOpen(false);
            setNewSong({ title: '', artist: '', rating: 0 });
        }
    };
    
    const handleDeleteSong = (id: string) => {
        setSongs(songs.filter(s => s.id !== id));
        setPlaylists(playlists.map(p => ({ ...p, songIds: p.songIds.filter(songId => songId !== id) })));
    };

    const handlePlaylistImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setNewPlaylist({ ...newPlaylist, coverImage: base64String });
                setPlaylistImagePreview(base64String);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSavePlaylist = () => {
        if (newPlaylist.name) {
            setPlaylists([...playlists, { id: Date.now().toString(), ...newPlaylist } as Playlist]);
            setIsPlaylistModalOpen(false);
            setNewPlaylist({ name: '', songIds: [] });
            setPlaylistImagePreview(null);
        }
    };
    
    const handleDeletePlaylist = (id: string) => {
        setPlaylists(playlists.filter(p => p.id !== id));
    };

    const toggleSongInPlaylist = (songId: string) => {
        const currentIds = newPlaylist.songIds || [];
        if (currentIds.includes(songId)) {
            setNewPlaylist({ ...newPlaylist, songIds: currentIds.filter(id => id !== songId) });
        } else {
            setNewPlaylist({ ...newPlaylist, songIds: [...currentIds, songId] });
        }
    };

    return (
        <div className="animate-swoop-in h-full">
            <div className="flex justify-center p-1.5 bg-white/50 dark:bg-[#3D315B]/50 rounded-full mx-4 mb-4 shadow-sm">
                <button onClick={() => setActiveTab('songs')} className={`w-1/2 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'songs' ? 'bg-[#E54F6D] text-white shadow' : 'text-[#8E82AE] dark:text-gray-400'}`}>Canciones</button>
                <button onClick={() => setActiveTab('playlists')} className={`w-1/2 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'playlists' ? 'bg-[#E54F6D] text-white shadow' : 'text-[#8E82AE] dark:text-gray-400'}`}>Playlists</button>
            </div>
            <div className="p-4">
                {activeTab === 'songs' && (
                    songs.length > 0 ? (
                        <div className="space-y-3">
                        {songs.sort((a, b) => b.rating - a.rating).map(song => (
                            <div key={song.id} className="bg-white dark:bg-[#3D315B] rounded-xl shadow-md p-4 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg text-[#3D315B] dark:text-white">{song.title}</h3>
                                    <p className="text-sm text-[#8E82AE] dark:text-gray-400">{song.artist}</p>
                                    <StarRating rating={song.rating} />
                                </div>
                                <button onClick={() => handleDeleteSong(song.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 mt-10 text-[#A093C7] dark:text-gray-400">
                            <div className="text-[#E54F6D] mb-4">
                                <Music size={64} strokeWidth={1.5} />
                            </div>
                            <h2 className="text-xl font-bold text-[#3D315B] dark:text-white mb-2">Silencio por ahora...</h2>
                            <p className="max-w-xs">Añade tus canciones favoritas y crea la banda sonora de tu vida.</p>
                        </div>
                    )
                )}
                {activeTab === 'playlists' && (
                     playlists.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {playlists.map(playlist => (
                                <div key={playlist.id} className="bg-white dark:bg-[#3D315B] rounded-xl shadow-md overflow-hidden group relative">
                                    {playlist.coverImage ? (
                                        <img src={playlist.coverImage} alt={playlist.name} className="h-24 w-full object-cover"/>
                                    ) : (
                                        <div className="h-24 w-full bg-gradient-to-br from-[#E54F6D] to-[#FAA9BE] flex items-center justify-center text-white/80">
                                            <ListMusic size={32}/>
                                        </div>
                                    )}
                                    <div className="p-3">
                                        <h3 className="font-bold text-base text-[#3D315B] dark:text-white truncate">{playlist.name}</h3>
                                        <p className="text-xs text-[#8E82AE] dark:text-gray-400">{playlist.songIds.length} {playlist.songIds.length === 1 ? 'canción' : 'canciones'}</p>
                                    </div>
                                    <button onClick={() => handleDeletePlaylist(playlist.id)} className="absolute top-2 right-2 bg-black/30 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 mt-10 text-[#A093C7] dark:text-gray-400">
                            <div className="text-[#E54F6D] mb-4">
                                <ListMusic size={64} strokeWidth={1.5} />
                            </div>
                            <h2 className="text-xl font-bold text-[#3D315B] dark:text-white mb-2">Crea tu primera playlist</h2>
                            <p className="max-w-xs">Organiza tus canciones en playlists para cada mood.</p>
                        </div>
                    )
                )}
            </div>
            <button
                onClick={() => activeTab === 'songs' ? setIsSongModalOpen(true) : setIsPlaylistModalOpen(true)}
                className="fixed bottom-24 right-5 bg-gradient-to-br from-[#E54F6D] to-[#FAA9BE] text-white p-4 rounded-full shadow-lg hover:from-[#9381FF] hover:to-[#B8B0FF] dark:from-[#9381FF] dark:to-[#B8B0FF] dark:hover:from-[#E54F6D] dark:hover:to-[#FAA9BE] transition-all duration-300 transform hover:scale-110"
            >
                <Plus size={28} />
            </button>

            <Modal isOpen={isSongModalOpen} onClose={() => setIsSongModalOpen(false)} title="Añadir Canción">
                 <div className="space-y-4">
                    <input type="text" placeholder="Título" value={newSong.title || ''} onChange={e => setNewSong({ ...newSong, title: e.target.value })} className="w-full p-3 border border-[#F3D9E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54F6D] bg-transparent dark:border-[#3D315B] dark:focus:ring-[#9381FF] dark:text-white" />
                    <input type="text" placeholder="Artista" value={newSong.artist || ''} onChange={e => setNewSong({ ...newSong, artist: e.target.value })} className="w-full p-3 border border-[#F3D9E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54F6D] bg-transparent dark:border-[#3D315B] dark:focus:ring-[#9381FF] dark:text-white" />
                    <div className="flex items-center justify-between">
                        <span className="text-[#585076] dark:text-white font-medium">Ranking:</span>
                        <StarRating rating={newSong.rating || 0} setRating={r => setNewSong({ ...newSong, rating: r })} size={28} />
                    </div>
                    <button onClick={handleSaveSong} className="w-full bg-[#E54F6D] text-white py-3 rounded-lg font-semibold hover:bg-[#9381FF] dark:bg-[#9381FF] dark:hover:bg-[#E54F6D] transition-colors shadow-md">Guardar</button>
                </div>
            </Modal>
            
            <Modal isOpen={isPlaylistModalOpen} onClose={() => setIsPlaylistModalOpen(false)} title="Crear Playlist">
                <div className="space-y-4">
                    <input type="text" placeholder="Nombre de la Playlist" value={newPlaylist.name || ''} onChange={e => setNewPlaylist({ ...newPlaylist, name: e.target.value })} className="w-full p-3 border border-[#F3D9E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54F6D] bg-transparent dark:border-[#3D315B] dark:focus:ring-[#9381FF] dark:text-white" />
                    <label className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#F3D9E9] dark:border-[#3D315B] rounded-lg cursor-pointer hover:bg-[#F3D9E9]/40 dark:hover:bg-[#3D315B]/60">
                        {playlistImagePreview ? (
                            <img src={playlistImagePreview} alt="preview" className="w-24 h-24 object-cover rounded-lg"/>
                        ) : (
                            <div className="text-center text-[#A093C7] dark:text-gray-400">
                                <ImageIcon className="mx-auto" />
                                <span className="text-sm">Añadir portada (opcional)</span>
                            </div>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handlePlaylistImageChange} />
                    </label>
                    <h4 className="font-semibold text-[#585076] dark:text-white pt-2">Añadir canciones:</h4>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2 text-[#585076] dark:text-gray-300">
                        {songs.map(song => (
                            <div key={song.id} onClick={() => toggleSongInPlaylist(song.id)} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-[#F3D9E9]/40 dark:hover:bg-[#3D315B]/60">
                                <input type="checkbox" readOnly checked={newPlaylist.songIds?.includes(song.id)} className="form-checkbox h-5 w-5 text-[#E54F6D] rounded focus:ring-[#9381FF] bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500" />
                                <span>{song.title} - {song.artist}</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleSavePlaylist} className="w-full bg-[#E54F6D] text-white py-3 rounded-lg font-semibold hover:bg-[#9381FF] dark:bg-[#9381FF] dark:hover:bg-[#E54F6D] transition-colors shadow-md">Guardar Playlist</button>
                </div>
            </Modal>
        </div>
    );
};

export default MusicScreen;