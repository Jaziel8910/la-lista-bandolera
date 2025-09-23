import React from 'react';

export enum Screen {
    BANDOLEROS,
    DIARY,
    MUSIC,
    BESTIES,
    PROFILE,
    SHOP,
    CHAT,
}

export interface Bandolero {
    id: string;
    name: string;
    rating: number;
    image?: string; // Puter file path
    notes: string;
    origin: string;
    tags?: string[];
    themeColor: string;
    favoriteQuote: string;
    gallery?: string[]; // Array of Puter file paths
    // AI Chat Personality
    personality: string; // Detailed personality description
    style: string; // Their communication style
    topics: string; // Topics they like to talk about
    appearanceDescription: string; // For AI image generation
}

export interface DiaryEntry {
    id:string;
    date: string;
    title: string;
    content: string;
    mood?: string;
    coverImage?: string; // Puter file path
    mentionedBandoleroIds?: string[];
    stickers?: { id: string, x: number, y: number }[]; 
    isDream?: boolean;
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
    coverImage?: string; // Puter file path
}

export interface Bestie {
    id: string;
    name: string;
    image?: string; // Puter file path
    anniversary: string;
    favoriteMemory: string;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: React.ReactElement;
    isSecret?: boolean;
    reward: number; // Corazones awarded for unlocking
}

export interface StreakHistoryEntry {
    startDate: string;
    endDate: string;
    length: number;
}

export interface UserProfile {
    username: string | null;
    corazones: number;
    activeBadgeId?: string;
    storyTokens?: number;
}

export interface Reward {
    id: string;
    type: 'sticker-pack' | 'ai_model' | 'profile_badge' | 'ai_story_token';
    name: string;
    description: string;
    value: string;
    rarity: 'common' | 'rare' | 'epic';
    price: number;
}

export interface Sticker {
    id: string;
    packId: string;
    url: string; // Could be base64 or a URL
}

// AI Chat Types
export interface ChatMessage {
    role: 'user' | 'assistant';
    text: string;
    imagePath?: string; // A Puter path to an image sent OR received
    senderName?: string; // For group chats, to show which bandolero is talking
}

export interface ChatSession {
    id: string;
    type: 'solo' | 'group';
    participantIds: string[];
    messages: ChatMessage[];
    model: string;
    name: string; // e.g., "Chat with Draco" or "Loki & Sylvie"
    image?: string; // single image or a composite for group
}
