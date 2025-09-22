export enum Screen {
    BANDOLEROS,
    DIARY,
    MUSIC,
    BESTIES,
    PROFILE,
    REWARDS, // GRAN FUNCIÓN: Pantalla de recompensas diarias
}

export interface Bandolero {
    id: string;
    name: string;
    rating: number;
    image?: string; // Main image (base64)
    notes: string;
    origin: string;
    tags?: string[];
    // MÁS PERSONALIZACIÓN:
    themeColor: string; // e.g., a hex code for UI accents
    favoriteQuote: string;
    gallery?: string[]; // Multiple images
}

export interface DiaryEntry {
    id:string;
    date: string;
    title: string;
    content: string;
    mood?: string; // emoji character
    coverImage?: string; // base64 string
    mentionedBandoleroIds?: string[];
    // NUEVA FUNCIÓN: Stickers en el diario
    stickers?: { id: string, x: number, y: number }[]; 
}

export interface Song {
    id: string;
    title: string;
    artist: string;
    rating: number;
}

export interface Playlist {
    id: string;
    name: string;
    songIds: string[];
    // NUEVA FUNCIÓN: Portadas para playlists
    coverImage?: string; 
}

export interface Bestie {
    id: string;
    name: string;
    image?: string; // base64 string
    anniversary: string;
    favoriteMemory: string;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: React.ReactElement;
    isSecret?: boolean;
}

export interface StreakHistoryEntry {
    startDate: string;
    endDate: string;
    length: number;
}

// GRAN FUNCIÓN: Tipos para el sistema de Recompensas
export interface Reward {
    id: string;
    type: 'theme' | 'sticker-pack';
    name: string;
    description: string;
    value: string; // e.g., theme name or sticker pack ID
    rarity: 'common' | 'rare' | 'epic';
}

export interface Sticker {
    id: string;
    packId: string;
    url: string; // Could be base64 or a URL
}
