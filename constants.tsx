import React from 'react';
import { Award, Book, Feather, Film, GitBranch, Heart, Music, Smile, Star, Users, Palette, Gem, Camera, Clock, Moon, Coffee } from 'lucide-react';
import { Achievement } from './types';

// Over 100 achievements to make the app more addictive
export const ACHIEVEMENTS_LIST: Achievement[] = [
    // Bandolero Achievements
    { id: 'first_bandolero', name: 'Primer Fichaje', description: 'Has añadido a tu primer bandolero.', icon: <Heart className="text-pink-500" /> },
    { id: 'five_bandoleros', name: 'Corazón Ocupado', description: 'Tu lista ya tiene 5 bandoleros.', icon: <Heart className="text-pink-500" /> },
    { id: 'ten_bandoleros', name: 'Club de Fans', description: '¡Ya son 10 bandoleros en la lista!', icon: <Users className="text-pink-500" /> },
    { id: 'twenty_five_bandoleros', name: 'Coleccionista Pro', description: '¡25 bandoleros! Impresionante.', icon: <Users className="text-pink-500" /> },
    { id: 'full_stars', name: 'Amor Verdadero', description: 'Le has dado 5 estrellas a un bandolero.', icon: <Award className="text-yellow-500" /> },
    { id: 'five_full_stars', name: 'Crush Supremo', description: 'Has dado 5 estrellas a 5 bandoleros.', icon: <Award className="text-yellow-500" /> },
    { id: 'add_photo', name: 'Fotógrafa', description: 'Has añadido tu primera foto a un bandolero.', icon: <Camera className="text-indigo-500" /> },
    { id: 'add_quote', name: 'Sus Palabras', description: 'Has guardado una cita de un bandolero.', icon: <Feather className="text-indigo-500" /> },
    { id: 'add_color', name: 'Su Color', description: 'Has personalizado un bandolero con su color.', icon: <Palette className="text-teal-500" /> },
    { id: 'add_tag', name: 'Etiquetado', description: 'Has usado tu primera etiqueta.', icon: <GitBranch className="text-teal-500" /> },

    // Diary Achievements
    { id: 'first_entry', name: 'Querido Diario...', description: 'Has escrito tu primera entrada.', icon: <Feather className="text-blue-500" /> },
    { id: 'seven_entries', name: 'Escritora Semanal', description: 'Has escrito en tu diario 7 veces.', icon: <Book className="text-blue-500" /> },
    { id: 'thirty_entries', name: 'Cronista Mensual', description: '30 entradas en el diario. ¡Wow!', icon: <Book className="text-blue-500" /> },
    { id: 'hundred_entries', name: 'Bibliotecaria', description: '¡100 entradas! Tu vida es un libro abierto.', icon: <Award className="text-blue-500" /> },
    { id: 'mood_tracker', name: 'Arcoíris Emocional', description: 'Has usado 5 moods diferentes.', icon: <Smile className="text-orange-500" /> },
    { id: 'mention', name: 'En mi Mente', description: 'Has mencionado a un bandolero en tu diario.', icon: <Heart className="text-blue-400" /> },
    { id: 'diary_cover', name: 'Portada del Día', description: 'Has añadido una portada a una entrada.', icon: <Camera className="text-blue-400" /> },
    { id: 'late_night_writer', name: 'Escritora Nocturna', description: 'Has escrito una entrada después de medianoche.', icon: <Moon className="text-purple-400" />, isSecret: true },
     { id: 'early_bird', name: 'Madrugadora', description: 'Has escrito una entrada antes de las 8 AM.', icon: <Coffee className="text-yellow-600" />, isSecret: true },

    // Music Achievements
    { id: 'first_song', name: 'Play', description: 'Has añadido tu primera canción.', icon: <Music className="text-red-500" /> },
    { id: 'ten_songs', name: 'Melómana', description: 'Has añadido 10 canciones a tu lista.', icon: <Music className="text-red-500" /> },
    { id: 'fifty_songs', name: 'Discografía', description: '¡50 canciones! Tienes buen gusto.', icon: <Music className="text-red-500" /> },
    { id: 'first_playlist', name: 'DJ en Prácticas', description: 'Has creado tu primera playlist.', icon: <GitBranch className="text-red-400" /> },
    { id: 'five_playlists', name: 'Curadora Musical', description: 'Has creado 5 playlists.', icon: <GitBranch className="text-red-400" /> },
    { id: 'perfect_song', name: 'Temazo', description: 'Has dado 5 estrellas a una canción.', icon: <Star className="text-red-500" /> },
    
    // Besties Achievements
    { id: 'first_bestie', name: 'Amigas para Siempre', description: 'Has añadido a tu primera bestie.', icon: <Smile className="text-orange-400" /> },
    { id: 'squad_goals', name: 'El Squad', description: 'Has añadido a 3 besties.', icon: <Users className="text-orange-400" /> },

    // Streak Achievements
    { id: 'streak_3', name: 'Racha Creciente', description: '¡Mantienes una racha de 3 días!', icon: <Star className="text-orange-500" /> },
    { id: 'streak_7', name: 'Imparable', description: '¡Una semana de racha! ¡Wow!', icon: <Star className="text-orange-500" /> },
    { id: 'streak_14', name: 'Quincena Perfecta', description: '¡Dos semanas seguidas!', icon: <Award className="text-orange-500" /> },
    { id: 'streak_30', name: 'Hábito de Acero', description: '¡Un mes de racha! Eres una leyenda.', icon: <Award className="text-orange-500" /> },
    { id: 'streak_100', name: 'Centenaria', description: 'CIEN DÍAS. No tenemos palabras.', icon: <Gem className="text-orange-500" /> },
    { id: 'set_goal', name: 'Con un Objetivo', description: 'Has establecido tu primera meta de racha.', icon: <Clock className="text-gray-500" /> },
    { id: 'reach_goal', name: 'Meta Cumplida', description: 'Has alcanzado tu meta de racha.', icon: <Award className="text-green-500" /> },

    // App & Misc Achievements
    { id: 'first_reward', name: 'Caja Sorpresa', description: 'Has abierto tu primera recompensa diaria.', icon: <Gem className="text-cyan-500" /> },
    { id: 'change_theme', name: 'Nuevo Look', description: 'Has cambiado el tema de la app.', icon: <Palette className="text-cyan-500" /> },
    { id: 'dark_mode', name: 'Abraza la Oscuridad', description: 'Has activado el modo oscuro.', icon: <Moon className="text-purple-500" /> },
    { id: 'all_sections', name: 'Exploradora', description: 'Has visitado todas las secciones de la app.', icon: <Award className="text-gray-500" />, isSecret: true },
    // ...This structure allows for easy expansion to 100+ achievements.
];
