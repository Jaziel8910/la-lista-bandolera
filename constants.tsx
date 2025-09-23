import React from 'react';
import { Award, Book, Feather, Film, GitBranch, Heart, Music, Smile, Star, Users, Palette, Gem, Camera, Clock, Moon, Coffee, Gift, Sunrise } from 'lucide-react';
import { Achievement, Reward } from './types';

export const BADGES: { [key: string]: { icon: React.ReactElement, name: string } } = {
    'gold-heart': { icon: <Heart className="text-yellow-400" />, name: 'Corazón de Oro' },
    'star-collector': { icon: <Star className="text-blue-400" />, name: 'Coleccionista Estelar' }
};

export const ACHIEVEMENTS_LIST: Achievement[] = [
    // Bandolero Achievements
    { id: 'first_bandolero', name: 'Primer Fichaje', description: 'Has añadido a tu primer bandolero.', icon: <Heart className="text-pink-500" />, reward: 10 },
    { id: 'five_bandoleros', name: 'Corazón Ocupado', description: 'Tu lista ya tiene 5 bandoleros.', icon: <Heart className="text-pink-500" />, reward: 25 },
    { id: 'ten_bandoleros', name: 'Club de Fans', description: '¡Ya son 10 bandoleros en la lista!', icon: <Users className="text-pink-500" />, reward: 50 },
    { id: 'twenty_five_bandoleros', name: 'Coleccionista Pro', description: '¡25 bandoleros! Impresionante.', icon: <Users className="text-pink-500" />, reward: 100 },
    { id: 'full_stars', name: 'Amor Verdadero', description: 'Le has dado 5 estrellas a un bandolero.', icon: <Award className="text-yellow-500" />, reward: 20 },
    { id: 'five_full_stars', name: 'Crush Supremo', description: 'Has dado 5 estrellas a 5 bandoleros.', icon: <Award className="text-yellow-500" />, reward: 100 },
    { id: 'add_photo', name: 'Fotógrafa', description: 'Has añadido tu primera foto a un bandolero.', icon: <Camera className="text-indigo-500" />, reward: 15 },
    { id: 'add_quote', name: 'Sus Palabras', description: 'Has guardado una cita de un bandolero.', icon: <Feather className="text-indigo-500" />, reward: 10 },
    { id: 'add_color', name: 'Su Color', description: 'Has personalizado un bandolero con su color.', icon: <Palette className="text-teal-500" />, reward: 5 },
    { id: 'add_tag', name: 'Etiquetado', description: 'Has usado tu primera etiqueta.', icon: <GitBranch className="text-teal-500" />, reward: 5 },
    { id: 'ai_chat', name: 'Primera Charla', description: 'Has chateado con un bandolero por primera vez.', icon: <Smile className="text-purple-400" />, reward: 20 },
    { id: 'ai_group_chat', name: '¡Fiesta!', description: 'Has iniciado tu primer chat grupal.', icon: <Users className="text-purple-500" />, reward: 30 },
    { id: 'ai_image', name: 'Artista IA', description: 'Has generado una imagen para un bandolero con IA.', icon: <Gem className="text-indigo-400" />, reward: 25 },

    // Diary Achievements
    { id: 'first_entry', name: 'Querido Diario...', description: 'Has escrito tu primera entrada.', icon: <Feather className="text-blue-500" />, reward: 10 },
    { id: 'seven_entries', name: 'Escritora Semanal', description: 'Has escrito en tu diario 7 veces.', icon: <Book className="text-blue-500" />, reward: 30 },
    { id: 'thirty_entries', name: 'Cronista Mensual', description: '30 entradas en el diario. ¡Wow!', icon: <Book className="text-blue-500" />, reward: 75 },
    { id: 'hundred_entries', name: 'Bibliotecaria', description: '¡100 entradas! Tu vida es un libro abierto.', icon: <Award className="text-blue-500" />, reward: 200 },
    { id: 'mood_tracker', name: 'Arcoíris Emocional', description: 'Has usado 5 moods diferentes.', icon: <Smile className="text-orange-500" />, reward: 15 },
    { id: 'mention', name: 'En mi Mente', description: 'Has mencionado a un bandolero en tu diario.', icon: <Heart className="text-blue-400" />, reward: 10 },
    { id: 'diary_cover', name: 'Portada del Día', description: 'Has añadido una portada a una entrada.', icon: <Camera className="text-blue-400" />, reward: 10 },
    { id: 'late_night_writer', name: 'Escritora Nocturna', description: 'Has escrito una entrada después de medianoche.', icon: <Moon className="text-purple-400" />, isSecret: true, reward: 20 },
    { id: 'early_bird', name: 'Madrugadora', description: 'Has escrito una entrada antes de las 8 AM.', icon: <Coffee className="text-yellow-600" />, isSecret: true, reward: 20 },

    // Music Achievements
    { id: 'first_song', name: 'Play', description: 'Has añadido tu primera canción.', icon: <Music className="text-red-500" />, reward: 5 },
    { id: 'ten_songs', name: 'Melómana', description: 'Has añadido 10 canciones a tu lista.', icon: <Music className="text-red-500" />, reward: 20 },
    { id: 'fifty_songs', name: 'Discografía', description: '¡50 canciones! Tienes buen gusto.', icon: <Music className="text-red-500" />, reward: 50 },
    { id: 'first_playlist', name: 'DJ en Prácticas', description: 'Has creado tu primera playlist.', icon: <GitBranch className="text-red-400" />, reward: 15 },
    { id: 'five_playlists', name: 'Curadora Musical', description: 'Has creado 5 playlists.', icon: <GitBranch className="text-red-400" />, reward: 40 },
    { id: 'perfect_song', name: 'Temazo', description: 'Has dado 5 estrellas a una canción.', icon: <Star className="text-red-500" />, reward: 10 },
    
    // Besties Achievements
    { id: 'first_bestie', name: 'Amigas para Siempre', description: 'Has añadido a tu primera bestie.', icon: <Smile className="text-orange-400" />, reward: 10 },
    { id: 'squad_goals', name: 'El Squad', description: 'Has añadido a 3 besties.', icon: <Users className="text-orange-400" />, reward: 30 },

    // Streak Achievements
    { id: 'streak_3', name: 'Racha Creciente', description: '¡Mantienes una racha de 3 días!', icon: <Star className="text-orange-500" />, reward: 15 },
    { id: 'streak_7', name: 'Imparable', description: '¡Una semana de racha! ¡Wow!', icon: <Star className="text-orange-500" />, reward: 50 },
    { id: 'streak_14', name: 'Quincena Perfecta', description: '¡Dos semanas seguidas!', icon: <Award className="text-orange-500" />, reward: 100 },
    { id: 'streak_30', name: 'Hábito de Acero', description: '¡Un mes de racha! Eres una leyenda.', icon: <Award className="text-orange-500" />, reward: 250 },
    { id: 'streak_100', name: 'Centenaria', description: 'CIEN DÍAS. No tenemos palabras.', icon: <Gem className="text-orange-500" />, reward: 1000 },
    { id: 'set_goal', name: 'Con un Objetivo', description: 'Has establecido tu primera meta de racha.', icon: <Clock className="text-gray-500" />, reward: 10 },
    { id: 'reach_goal', name: 'Meta Cumplida', description: 'Has alcanzado tu meta de racha.', icon: <Award className="text-green-500" />, reward: 50 },

    // App & Misc Achievements
    { id: 'first_reward', name: 'Caja Sorpresa', description: 'Has abierto tu primera recompensa diaria.', icon: <Gem className="text-cyan-500" />, reward: 10 },
    { id: 'daily_blessing', name: 'Bendición Diaria', description: '¡Has reclamado tu recompensa diaria de hoy!', icon: <Sunrise className="text-orange-400" />, reward: 5 },
    { id: 'change_theme', name: 'Nuevo Look', description: 'Has cambiado el tema de la app.', icon: <Palette className="text-cyan-500" />, reward: 5 },
    { id: 'dark_mode', name: 'Abraza la Oscuridad', description: 'Has activado el modo oscuro.', icon: <Moon className="text-purple-500" />, reward: 5 },
    { id: 'first_purchase', name: '¡De Compras!', description: 'Has comprado tu primer artículo en la tiendita.', icon: <Gem className="text-cyan-500" />, reward: 10 },
    { id: 'all_sections', name: 'Exploradora', description: 'Has visitado todas las secciones de la app.', icon: <Award className="text-gray-500" />, isSecret: true, reward: 25 },
];

export const SHOP_REWARDS: Reward[] = [
    { id: 'stickers-kawaii-food', type: 'sticker-pack', name: 'Stickers: Comida Kawaii', description: 'Un pack de stickers de comida con caritas.', value: 'food', rarity: 'common', price: 75 },
    { id: 'stickers-vintage', type: 'sticker-pack', name: 'Stickers: Aesthetic Vintage', description: 'Un pack de stickers con aire retro.', value: 'vintage', rarity: 'common', price: 75 },
    { id: 'story-token-1', type: 'ai_story_token', name: 'Pluma Mágica', description: 'Genera una historia larga y detallada para un bandolero.', value: '1', rarity: 'rare', price: 250 },
    { id: 'badge-star-collector', type: 'profile_badge', name: 'Insignia: Coleccionista', description: 'Una insignia para mostrar que eres una coleccionista dedicada.', value: 'star-collector', rarity: 'rare', price: 500 },
    { id: 'badge-gold-heart', type: 'profile_badge', name: 'Insignia: Corazón de Oro', description: 'Una insignia dorada para lucir en tu perfil.', value: 'gold-heart', rarity: 'epic', price: 1000 },
    { id: 'ai-model-poet', type: 'ai_model', name: 'Modelo IA: El Poeta', description: 'Desbloquea un modelo de IA que responde con un toque lírico y creativo.', value: 'openrouter:anthropic/claude-3-sonnet', rarity: 'epic', price: 750 },
];

export const DAILY_QUESTS = [
    {
        id: 'claim_daily_reward',
        name: 'Recompensa Diaria',
        description: 'Entra en la tiendita y reclama tu regalo del día.',
        reward: 15, // corazones
    }
];

export const AI_MODELS = [
    { 
        category: 'Recomendados',
        models: [
            { id: 'openrouter:openai/gpt-4o', name: 'Bestie', description: 'Alegre y muy fiel a la personalidad del bandolero.' },
            { id: 'openrouter:google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'El modelo más nuevo y rápido de Google.' },
            { id: 'openrouter:anthropic/claude-3.5-sonnet', name: 'Inteligente', description: 'Muy bueno razonando, pero un poco más "seco".' },
            { id: 'openrouter:openai/gpt-4o-mini', name: 'Rápido', description: 'Ideal para chats rápidos. Puede olvidar detalles.' },
        ]
    },
    {
        category: 'Más Opciones (OpenRouter)',
        models: [
            { id: 'openrouter:meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 (8B)', description: 'Rápido y capaz, de Meta AI.' },
            { id: 'openrouter:mistralai/mistral-7b-instruct', name: 'Mistral (7B)', description: 'Excelente modelo europeo, bueno y rápido.' },
            { id: 'openrouter:anthropic/claude-3-haiku', name: 'Claude 3 Haiku', description: 'El más rápido de la familia Claude.' },
        ]
    }
];
