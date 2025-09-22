import React, { useState, useEffect, useCallback } from 'react';
import { Home, BookOpen, Music, Users, Star, Heart, Award, Gift } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Screen, Bandolero, DiaryEntry, Song, Playlist, Bestie, Achievement, StreakHistoryEntry } from './types';
import BandolerosScreen from './screens/BandolerosScreen';
import DiaryScreen from './screens/DiaryScreen';
import MusicScreen from './screens/MusicScreen';
import BestiesScreen from './screens/BestiesScreen';
import ProfileScreen from './screens/ProfileScreen';
import RewardsScreen from './screens/RewardsScreen'; // Big new feature
import Modal from './components/Modal';
import { ACHIEVEMENTS_LIST } from './constants';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
    const [activeScreen, setActiveScreen] = useState<Screen>(Screen.BANDOLEROS);
    const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');
    
    const [bandoleros, setBandoleros] = useLocalStorage<Bandolero[]>('bandoleros', []);
    const [diaryEntries, setDiaryEntries] = useLocalStorage<DiaryEntry[]>('diaryEntries', []);
    const [songs, setSongs] = useLocalStorage<Song[]>('songs', []);
    const [playlists, setPlaylists] = useLocalStorage<Playlist[]>('playlists', []);
    const [besties, setBesties] = useLocalStorage<Bestie[]>('besties', []);
    const [unlockedAchievements, setUnlockedAchievements] = useLocalStorage<string[]>('unlockedAchievements', []);
    
    // Streak State
    const [streak, setStreak] = useLocalStorage<number>('streak', 0);
    const [lastLogin, setLastLogin] = useLocalStorage<string | null>('lastLogin', null);
    const [streakHistory, setStreakHistory] = useLocalStorage<StreakHistoryEntry[]>('streakHistory', []);
    const [streakGoal, setStreakGoal] = useLocalStorage<number>('streakGoal', 7);
    const [streakModal, setStreakModal] = useState<{type: 'goal' | 'broken' | null, message: string}>({type: null, message: ''});


    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
    }, [theme]);
    
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
                if (streakGoal > 0 && newStreak === streakGoal) {
                     setStreakModal({type: 'goal', message: `¡Felicidades! ¡Has alcanzado tu meta de ${streakGoal} días!`});
                     if (!unlockedAchievements.includes('reach_goal')) {
                        setUnlockedAchievements(prev => [...new Set([...prev, 'reach_goal'])]);
                     }
                }
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

        // Bandolero achievements
        check('first_bandolero', bandoleros.length >= 1);
        check('five_bandoleros', bandoleros.length >= 5);
        check('ten_bandoleros', bandoleros.length >= 10);
        check('twenty_five_bandoleros', bandoleros.length >= 25);
        check('full_stars', bandoleros.some(b => b.rating === 5));
        check('five_full_stars', bandoleros.filter(b => b.rating === 5).length >= 5);
        check('add_photo', bandoleros.some(b => !!b.image));
        check('add_quote', bandoleros.some(b => !!b.favoriteQuote));
        check('add_color', bandoleros.some(b => b.themeColor !== '#E0B1CB')); // Default color check
        check('add_tag', bandoleros.some(b => b.tags && b.tags.length > 0));

        // Diary achievements
        check('first_entry', diaryEntries.length >= 1);
        check('seven_entries', diaryEntries.length >= 7);
        check('thirty_entries', diaryEntries.length >= 30);
        check('hundred_entries', diaryEntries.length >= 100);
        const moods = new Set(diaryEntries.map(e => e.mood).filter(Boolean));
        check('mood_tracker', moods.size >= 5);
        check('mention', diaryEntries.some(e => e.mentionedBandoleroIds && e.mentionedBandoleroIds.length > 0));
        check('diary_cover', diaryEntries.some(e => !!e.coverImage));

        // Music achievements
        check('first_song', songs.length >= 1);
        check('ten_songs', songs.length >= 10);
        check('fifty_songs', songs.length >= 50);
        check('first_playlist', playlists.length >= 1);
        check('five_playlists', playlists.length >= 5);
        check('perfect_song', songs.some(s => s.rating === 5));

        // Besties achievements
        check('first_bestie', besties.length >= 1);
        check('squad_goals', besties.length >= 3);
        
        // Streak achievements
        check('streak_3', streak >= 3);
        check('streak_7', streak >= 7);
        check('streak_14', streak >= 14);
        check('streak_30', streak >= 30);
        check('streak_100', streak >= 100);
        
        if (newAchievements.length > 0) {
            setUnlockedAchievements(prev => [...new Set([...prev, ...newAchievements])]);
        }
    }, [unlockedAchievements, bandoleros, diaryEntries, songs, playlists, besties, streak]);


    useEffect(() => {
        checkAchievements();
    }, [checkAchievements]);

    const renderScreen = () => {
        switch (activeScreen) {
            case Screen.BANDOLEROS:
                return <BandolerosScreen bandoleros={bandoleros} setBandoleros={setBandoleros} />;
            case Screen.DIARY:
                return <DiaryScreen entries={diaryEntries} setEntries={setDiaryEntries} bandoleros={bandoleros} />;
            case Screen.MUSIC:
                return <MusicScreen songs={songs} setSongs={setSongs} playlists={playlists} setPlaylists={setPlaylists} />;
            case Screen.BESTIES:
                return <BestiesScreen besties={besties} setBesties={setBesties} />;
            case Screen.REWARDS:
                return <RewardsScreen setUnlockedAchievements={setUnlockedAchievements} />;
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
                    />;
            default:
                return <BandolerosScreen bandoleros={bandoleros} setBandoleros={setBandoleros} />;
        }
    };

    const NavItem: React.FC<{ screen: Screen; icon: React.ReactNode; label: string }> = ({ screen, icon, label }) => (
        <button
            onClick={() => setActiveScreen(screen)}
            className={`flex flex-col items-center justify-center w-full transition-all duration-300 ease-in-out group ${activeScreen === screen ? 'text-[#D94C6E]' : 'text-[#A093C7] dark:text-gray-400'}`}
        >
            <div className={`p-2 rounded-full transform transition-transform duration-300 ${activeScreen === screen ? 'bg-[#FCEFF9]/80 dark:bg-[#D94C6E]/20 scale-110' : 'group-hover:scale-110'}`}>
                {icon}
            </div>
            <span className="text-xs mt-1 font-medium">{label}</span>
        </button>
    );

    return (
        <div className="bandolera-app-container flex flex-col h-screen bg-[#FDF2F8] dark:bg-[#2A2438] overflow-hidden">
            <header className="p-4 pt-6 text-center">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#E54F6D] to-[#9381FF] dark:from-[#fbc2eb] dark:to-[#a6c1ee]">la lista bandolera de mikaela</h1>
            </header>
            <main className="flex-grow overflow-y-auto pb-24">
                {renderScreen()}
            </main>
            <nav className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto h-20 bg-white/70 dark:bg-[#3D315B]/70 backdrop-blur-lg border-t border-[#F3D9E9] dark:border-t-[#3D315B] flex justify-around items-center">
                <NavItem screen={Screen.BANDOLEROS} icon={<Heart size={24} />} label="Bandoleros" />
                <NavItem screen={Screen.DIARY} icon={<BookOpen size={24} />} label="Diario" />
                <NavItem screen={Screen.REWARDS} icon={<Gift size={26} />} label="Premios" />
                <NavItem screen={Screen.MUSIC} icon={<Music size={24} />} label="Música" />
                <NavItem screen={Screen.PROFILE} icon={<Star size={24} />} label="Perfil" />
            </nav>
            <Modal isOpen={!!streakModal.type} onClose={() => setStreakModal({type: null, message: ''})} title={streakModal.type === 'goal' ? '¡Meta Alcanzada!' : 'Racha Terminada'}>
                <div className="text-center">
                    <div className="flex justify-center mb-4 animate-bounce">
                        {streakModal.type === 'goal' ? <Award size={52} className="text-yellow-500" /> : <Heart size={52} className="text-red-400 opacity-50" />}
                    </div>
                    <p className="text-lg text-[#585076] dark:text-[#DCD7F5]">{streakModal.message}</p>
                </div>
            </Modal>
        </div>
    );
};

export default App;