
import React, { useState, useEffect } from 'react';
import { Bandolero, ChatSession, DiaryEntry } from '../types';
import { Plus, Users, MessageCircle } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import NewChatModal from '../components/NewChatModal';
import PuterImage from '../components/PuterImage';

interface ChatScreenProps {
    bandoleros: Bandolero[];
    sessions: ChatSession[];
    setSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
    initialBandolero: Bandolero | null;
    clearInitialBandolero: () => void;
    setUnlockedAchievements: React.Dispatch<React.SetStateAction<string[]>>;
    diaryEntries: DiaryEntry[];
    streak: number;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ bandoleros, sessions, setSessions, initialBandolero, clearInitialBandolero, setUnlockedAchievements, diaryEntries, streak }) => {
    const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

    useEffect(() => {
        if (initialBandolero) {
            const existingSession = sessions.find(s => s.type === 'solo' && s.participantIds[0] === initialBandolero.id);
            if (existingSession) {
                setActiveSession(existingSession);
            } else {
                handleCreateNewChat([initialBandolero]);
            }
            clearInitialBandolero();
        }
    }, [initialBandolero, sessions, clearInitialBandolero]);

    const handleSessionUpdate = (updatedSession: ChatSession) => {
        setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
        setActiveSession(updatedSession);
    };

    const handleCreateNewChat = (selectedBandoleros: Bandolero[]) => {
        if (selectedBandoleros.length === 0) return;
        
        const isGroup = selectedBandoleros.length > 1;
        const newSession: ChatSession = {
            id: Date.now().toString(),
            type: isGroup ? 'group' : 'solo',
            participantIds: selectedBandoleros.map(b => b.id),
            messages: [],
            model: 'openrouter:openai/gpt-4o', // Default model
            name: isGroup ? selectedBandoleros.map(b => b.name).join(', ') : `Chat con ${selectedBandoleros[0].name}`,
            image: isGroup ? undefined : selectedBandoleros[0].image,
        };
        
        setSessions(prev => [newSession, ...prev]);
        setActiveSession(newSession);
        setIsNewChatModalOpen(false);
        if(isGroup) {
            setUnlockedAchievements(prev => [...new Set([...prev, 'ai_group_chat'])]);
        }
    };
    
    const getParticipantDetails = (participantIds: string[]) => {
        return participantIds.map(id => bandoleros.find(b => b.id === id)).filter(Boolean) as Bandolero[];
    };
    
    const getSessionImage = (session: ChatSession) => {
        if (session.type === 'solo' && session.participantIds.length > 0) {
            const bandolero = bandoleros.find(b => b.id === session.participantIds[0]);
            return bandolero?.image;
        }
        return undefined; // Group chats won't have a single image for now
    }


    if (activeSession) {
        return (
            <ChatInterface
                session={activeSession}
                onSessionUpdate={handleSessionUpdate}
                onClose={() => setActiveSession(null)}
                bandoleros={bandoleros}
                diaryEntries={diaryEntries}
                streak={streak}
            />
        );
    }

    return (
        <div className="p-4 h-full">
            {sessions.length > 0 ? (
                <div className="space-y-3">
                    {sessions.map(session => (
                        <div key={session.id} onClick={() => setActiveSession(session)} className="bg-white dark:bg-[#3D315B] rounded-xl shadow-md p-3 flex items-center space-x-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#4a416f]">
                            <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-[#2A2438] flex-shrink-0 flex items-center justify-center relative">
                                {session.type === 'solo' ? (
                                    <PuterImage puterPath={getSessionImage(session)} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <Users className="text-gray-500"/>
                                )}
                            </div>
                            <div className="flex-grow overflow-hidden">
                                <h3 className="font-bold text-base text-[#3D315B] dark:text-white truncate">{session.name}</h3>
                                <p className="text-sm text-[#8E82AE] dark:text-gray-400 truncate">
                                    {session.messages.length > 0 ? (session.messages[session.messages.length - 1].imagePath ? '📷 Imagen' : session.messages[session.messages.length - 1].text) : 'Sin mensajes aún'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 -mt-16 text-[#A093C7] dark:text-gray-400">
                    <div className="text-[#9381FF] dark:text-[#fbc2eb] mb-4"><MessageCircle size={64} strokeWidth={1.5} /></div>
                    <h2 className="text-xl font-bold text-[#3D315B] dark:text-white mb-2">Inicia una conversación</h2>
                    <p className="max-w-xs">Chatea con tus bandoleros uno a uno, o crea un chat grupal para ver qué pasa.</p>
                </div>
            )}
             <button onClick={() => setIsNewChatModalOpen(true)} className="fixed bottom-24 right-5 bg-gradient-to-br from-[#9381FF] to-[#B8B0FF] text-white p-4 rounded-full shadow-lg hover:from-[#E54F6D] hover:to-[#FAA9BE] transition-all duration-300 transform hover:scale-110"><Plus size={28} /></button>
            
            <NewChatModal
                isOpen={isNewChatModalOpen}
                onClose={() => setIsNewChatModalOpen(false)}
                bandoleros={bandoleros}
                onCreateChat={handleCreateNewChat}
            />
        </div>
    );
};

export default ChatScreen;
