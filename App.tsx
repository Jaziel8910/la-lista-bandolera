
import React, { useState, useEffect, useCallback } from 'react';
import { Home, BookOpen, Music, Users, Star, Heart, Award, Gift, ShoppingBag, MessageCircle } from 'lucide-react';
import { usePuterStorage } from './hooks/usePuterStorage';
import { Screen, Bandolero, DiaryEntry, Song, Playlist, Bestie, Achievement, StreakHistoryEntry, UserProfile, ChatSession } from './types';
import BandolerosScreen from './screens/BandolerosScreen';
import DiaryScreen from './screens/DiaryScreen';
import MusicScreen from './screens/MusicScreen';
import BestiesScreen from './screens/BestiesScreen';
import ProfileScreen from './screens/ProfileScreen';
import ShopScreen from './screens/ShopScreen';
import ChatScreen from './screens/ChatScreen';
import Modal from './components/Modal';
import { ACHIEVEMENTS_LIST, DAILY_QUESTS } from './constants';

type Theme = 'light' | 'dark';

declare global {
    interface Window {
        puter: any;
    }
}

const App: React.FC = () => {
    const [activeScreen, setActiveScreen] = useState<Screen>(Screen.BANDOLEROS);
    const [theme, setTheme] = usePuterStorage<Theme>('theme', 'light');
    
    // Data state now uses Puter for cloud storage
    const [bandoleros, setBandoleros] = usePuterStorage<Bandolero[]>('bandoleros', []);
    const [diaryEntries, setDiaryEntries] = usePuterStorage<DiaryEntry[]>('diaryEntries', []);
    const [songs, setSongs] = usePuterStorage<Song[]>('songs', []);
    const [playlists, setPlaylists] = usePuterStorage<Playlist[]>('playlists', []);
    const [besties, setBesties] = usePuterStorage<Bestie[]>('besties', []);
    const [unlockedAchievements, setUnlockedAchievements] = usePuterStorage<string[]>('unlockedAchievements', []);
    const [chatSessions, setChatSessions] = usePuterStorage<ChatSession[]>('chatSessions', []);
    const [unlockedRewards, setUnlockedRewards] = usePuterStorage<string[]>('unlockedRewards', []);
    
    // User Profile & Currency
    const [userProfile, setUserProfile] = usePuterStorage<UserProfile>('userProfile', { username: null, corazones: 0, storyTokens: 0 });

    // Streak State
    const [streak, setStreak] = usePuterStorage<number>('streak', 0);
    const [lastLogin, setLastLogin] = usePuterStorage<string | null>('lastLogin', null);
    const [streakHistory, setStreakHistory] = usePuterStorage<StreakHistoryEntry[]>('streakHistory', []);
    const [streakGoal, setStreakGoal] = usePuterStorage<number>('streakGoal', 7);
    const [streakModal, setStreakModal] = useState<{type: 'goal' | 'broken' | 'achievement', message: string} | null>(null);

    // Daily Quests State
    const [dailyQuestState, setDailyQuestState] = usePuterStorage<{ date: string, completed: string[] }>('dailyQuestState', { date: '', completed: [] });


    // Navigation state for chat
    const [pendingChatBandolero, setPendingChatBandolero] = useState<Bandolero | null>(null);

    useEffect(() => {
        if (pendingChatBandolero) {
            setActiveScreen(Screen.CHAT);
        }
    }, [pendingChatBandolero]);


    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
    }, [theme]);

    // Check and reset daily quests
    useEffect(() => {
        const today = new Date().toDateString();
        if (dailyQuestState.date !== today) {
            setDailyQuestState({ date: today, completed: [] });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
     useEffect(() => {
        const fetchUser = async () => {
            try {
                // Wait for puter to be ready
                if (window.puter && typeof window.puter.auth.isSignedIn === 'function') {
                    if (await window.puter.auth.isSignedIn()) {
                        const user = await window.puter.auth.getUser();
                        setUserProfile(p => ({...p, username: user.username}));
                    }
                } else {
                    // Retry if puter is not ready
                    setTimeout(fetchUser, 300);
                }
            } catch (error) {
                console.log("User not signed in yet.");
            }
        };
        fetchUser();
    }, [setUserProfile]);

    useEffect(() => {
        const today = new Date();
        const todayString = today.toDateString();

        if (lastLogin !== todayString) {
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            const yesterdayString = yesterday.toDateString();

            if (lastLogin === yesterdayString) {
                const newStreak = streak + 1;
                setStreak(newStreak);
                const rewardAmount = Math.min(newStreak, 50); // Cap at 50
                setUserProfile(p => ({ ...p, corazones: p.corazones + rewardAmount }));
                
                let message = `¡Tu racha es de ${newStreak} días! Has ganado ${rewardAmount} corazones.`;

                if (streakGoal > 0 && newStreak === streakGoal) {
                     message += ` ¡Y has alcanzado tu meta de ${streakGoal} días!`;
                     if (!unlockedAchievements.includes('reach_goal')) {
                        setUnlockedAchievements(prev => [...new Set([...prev, 'reach_goal'])]);
                     }
                }
                setStreakModal({type: 'goal', message });

            } else {
                if (streak > 0 && lastLogin) {
                     setStreakModal({type: 'broken', message: `¡Oh, no! Tu racha de ${streak} días ha terminado. ¡Empieza una nueva hoy!`});
                    const streakEndDate = new Date(lastLogin);
                    const streakStartDate = new Date(lastLogin);
                    streakStartDate.setDate(streakStartDate.getDate() - (streak - 1));

                    setStreakHistory(prev => [
                        { startDate: streakStartDate.toISOString(), endDate: streakEndDate.toISOString(), length: streak },
                        ...prev,
                    ]);
                }
                setStreak(1);
            }
            setLastLogin(todayString);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const checkAchievements = useCallback(() => {
        const newAchievements: string[] = [];
        const check = (id: string, condition: boolean) => {
            if (condition && !unlockedAchievements.includes(id)) {
                newAchievements.push(id);
            }
        };
        
        const allAchievements = ACHIEVEMENTS_LIST;

        check('first_bandolero', bandoleros.length >= 1);
        check('five_bandoleros', bandoleros.length >= 5);
        check('ten_bandoleros', bandoleros.length >= 10);
        check('twenty_five_bandoleros', bandoleros.length >= 25);
        check('full_stars', bandoleros.some(b => b.rating === 5));
        check('five_full_stars', bandoleros.filter(b => b.rating === 5).length >= 5);
        check('add_photo', bandoleros.some(b => !!b.image));
        check('add_quote', bandoleros.some(b => !!b.favoriteQuote));
        check('add_color', bandoleros.some(b => b.themeColor !== '#E0B1CB'));
        check('add_tag', bandoleros.some(b => b.tags && b.tags.length > 0));
        check('ai_chat', chatSessions.some(c => c.type === 'solo'));
        check('ai_group_chat', chatSessions.some(c => c.type === 'group'));

        check('first_entry', diaryEntries.length >= 1);
        check('seven_entries', diaryEntries.length >= 7);
        check('thirty_entries', diaryEntries.length >= 30);
        check('hundred_entries', diaryEntries.length >= 100);
        const moods = new Set(diaryEntries.map(e => e.mood).filter(Boolean));
        check('mood_tracker', moods.size >= 5);
        check('mention', diaryEntries.some(e => e.mentionedBandoleroIds && e.mentionedBandoleroIds.length > 0));
        check('diary_cover', diaryEntries.some(e => !!e.coverImage));

        check('first_song', songs.length >= 1);
        check('ten_songs', songs.length >= 10);
        check('fifty_songs', songs.length >= 50);
        check('first_playlist', playlists.length >= 1);
        check('five_playlists', playlists.length >= 5);
        check('perfect_song', songs.some(s => s.rating === 5));

        check('first_bestie', besties.length >= 1);
        check('squad_goals', besties.length >= 3);
        
        check('streak_3', streak >= 3);
        check('streak_7', streak >= 7);
        check('streak_14', streak >= 14);
        check('streak_30', streak >= 30);
        check('streak_100', streak >= 100);
        
        if (newAchievements.length > 0) {
            setUnlockedAchievements(prev => [...new Set([...prev, ...newAchievements])]);
            const newlyUnlocked = allAchievements.filter(ach => newAchievements.includes(ach.id));
            const totalReward = newlyUnlocked.reduce((sum, ach) => sum + ach.reward, 0);
            setUserProfile(p => ({...p, corazones: p.corazones + totalReward}));
            const achievementNames = newlyUnlocked.map(a => a.name).join(', ');
            setStreakModal({type: 'achievement', message: `¡Nuevo logro desbloqueado: ${achievementNames}! Has ganado ${totalReward} corazones.`});
        }
    }, [unlockedAchievements, bandoleros, diaryEntries, songs, playlists, besties, streak, chatSessions, setUnlockedAchievements, setUserProfile]);


    useEffect(() => {
        checkAchievements();
    }, [checkAchievements]);

    const renderScreen = () => {
        switch (activeScreen) {
            case Screen.BANDOLEROS:
                return <BandolerosScreen bandoleros={bandoleros} setBandoleros={setBandoleros} setUnlockedAchievements={setUnlockedAchievements} onStartChat={setPendingChatBandolero} />;
            case Screen.DIARY:
                return <DiaryScreen entries={diaryEntries} setEntries={setDiaryEntries} bandoleros={bandoleros} />;
            case Screen.CHAT:
                 return <ChatScreen 
                    bandoleros={bandoleros} 
                    sessions={chatSessions} 
                    setSessions={setChatSessions} 
                    initialBandolero={pendingChatBandolero}
                    clearInitialBandolero={() => setPendingChatBandolero(null)}
                    setUnlockedAchievements={setUnlockedAchievements}
                    diaryEntries={diaryEntries}
                    streak={streak}
                    />;
            case Screen.MUSIC:
                return <MusicScreen songs={songs} setSongs={setSongs} playlists={playlists} setPlaylists={setPlaylists} />;
            case Screen.BESTIES:
                return <BestiesScreen besties={besties} setBesties={setBesties} />;
            case Screen.SHOP:
                return <ShopScreen 
                    userProfile={userProfile} 
                    setUserProfile={setUserProfile} 
                    setUnlockedAchievements={setUnlockedAchievements} 
                    unlockedRewards={unlockedRewards}
                    setUnlockedRewards={setUnlockedRewards}
                    // FIX: Pass unlockedAchievements to ShopScreen to resolve reference errors.
                    unlockedAchievements={unlockedAchievements}
                    dailyQuestState={dailyQuestState}
                    setDailyQuestState={setDailyQuestState}
                />;
            case Screen.PROFILE:
                return <ProfileScreen 
                    streak={streak} 
                    achievements={ACHIEVEMENTS_LIST} 
                    unlockedAchievements={unlockedAchievements} 
                    theme={theme}
                    setTheme={setTheme}
                    streakGoal={streakGoal}
                    setStreakGoal={setStreakGoal}
                    streakHistory={streakHistory}
                    userProfile={userProfile}
                    dailyQuestsCompleted={dailyQuestState.completed}
                    />;
            default:
                return <BandolerosScreen bandoleros={bandoleros} setBandoleros={setBandoleros} setUnlockedAchievements={setUnlockedAchievements} onStartChat={setPendingChatBandolero}/>;
        }
    };

    const NavItem: React.FC<{ screen: Screen; icon: React.ReactNode; label: string }> = ({ screen, icon, label }) => {
        const isActive = activeScreen === screen;
        return (
            <button
                onClick={() => setActiveScreen(screen)}
                className={`relative flex flex-col items-center justify-center w-full h-full transition-colors duration-300 ease-in-out group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D94C6E] rounded-md ${isActive ? 'text-[#D94C6E]' : 'text-[#A093C7] dark:text-gray-400'}`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={label}
            >
                <div 
                    className={`absolute top-0 h-1 w-10 bg-[#D94C6E] dark:bg-[#fbc2eb] rounded-full transition-transform duration-300 ease-out ${isActive ? 'scale-x-100' : 'scale-x-0'}`} 
                />
                <div className={`p-2 rounded-full transform transition-all duration-300 ${isActive ? 'bg-[#FCEFF9]/80 dark:bg-[#D94C6E]/20 scale-110' : 'group-hover:scale-110'}`}>
                    {icon}
                </div>
                <span className="text-xs mt-1 font-medium">{label}</span>
            </button>
        );
    };

    return (
        <div className="bandolera-app-container flex flex-col h-screen bg-[#FDF2F8] dark:bg-[#2A2438] overflow-hidden">
            <main key={Screen[activeScreen]} className="flex-grow overflow-y-auto pb-24 flex flex-col animate-swoop-in pt-6">
                {renderScreen()}
            </main>
            <nav className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto h-20 bg-white/70 dark:bg-[#3D315B]/70 backdrop-blur-lg border-t border-[#F3D9E9] dark:border-t-[#3D315B] flex justify-evenly items-center px-1">
                <NavItem screen={Screen.BANDOLEROS} icon={<Heart size={24} />} label="Bandoleros" />
                <NavItem screen={Screen.DIARY} icon={<BookOpen size={24} />} label="Diario" />
                <NavItem screen={Screen.CHAT} icon={<MessageCircle size={24} />} label="Chat" />
                <NavItem screen={Screen.SHOP} icon={<ShoppingBag size={24} />} label="Tiendita" />
                <NavItem screen={Screen.MUSIC} icon={<Music size={24} />} label="Música" />
                <NavItem screen={Screen.PROFILE} icon={<Star size={24} />} label="Perfil" />
            </nav>
            <Modal isOpen={!!streakModal} onClose={() => setStreakModal(null)} title={
                streakModal?.type === 'goal' ? '¡Racha y Recompensa!' :
                streakModal?.type === 'achievement' ? '¡Logro Desbloqueado!' : 'Racha Terminada'
            }>
               {streakModal && (<div className="text-center">
                    <div className="flex justify-center mb-4 animate-bounce">
                        {streakModal.type === 'goal' || streakModal.type === 'achievement' ? <Award size={52} className="text-yellow-500" /> : <Heart size={52} className="text-red-400 opacity-50" />}
                    </div>
                    <p className="text-lg text-[#585076] dark:text-[#DCD7F5]">{streakModal.message}</p>
                </div>)}
            </Modal>
        </div>
    );
};

export default App;
