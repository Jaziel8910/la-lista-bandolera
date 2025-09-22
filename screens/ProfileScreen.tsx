import React, { useState, useMemo } from 'react';
import { Achievement, StreakHistoryEntry } from '../types';
import { Flame, Sun, Moon, Target, History, Check, Trophy } from 'lucide-react';

type Theme = 'light' | 'dark';

interface ProfileScreenProps {
    streak: number;
    achievements: Achievement[];
    unlockedAchievements: string[];
    theme: Theme;
    setTheme: (theme: Theme) => void;
    streakGoal: number;
    setStreakGoal: (goal: number) => void;
    streakHistory: StreakHistoryEntry[];
}

const ThemeSwitcher: React.FC<{ theme: Theme; setTheme: (theme: Theme) => void }> = ({ theme, setTheme }) => {
    const isDark = theme === 'dark';
    const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

    return (
        <button onClick={toggleTheme} className="flex items-center justify-between w-full p-4 bg-white dark:bg-[#3D315B] rounded-2xl shadow-lg">
            <span className="font-semibold text-lg text-[#3D315B] dark:text-white">Tema de la App</span>
            <div className="relative w-16 h-8 flex items-center bg-[#F3D9E9] dark:bg-[#2A2438] rounded-full p-1 transition-colors duration-300">
                <div className="w-6 h-6 rounded-full bg-white absolute shadow-md transition-transform duration-300 transform flex items-center justify-center" style={{transform: isDark ? 'translateX(32px)' : 'translateX(0px)'}}>
                    {isDark ? <Moon size={16} className="text-purple-400" /> : <Sun size={16} className="text-yellow-500" />}
                </div>
            </div>
        </button>
    );
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ streak, achievements, unlockedAchievements, theme, setTheme, streakGoal, setStreakGoal, streakHistory }) => {
    const [goalInput, setGoalInput] = useState<string>(streakGoal.toString());
    const progress = streakGoal > 0 ? Math.min((streak / streakGoal) * 100, 100) : 0;
    
    const longestStreak = useMemo(() => {
        if (streakHistory.length === 0) return streak;
        return Math.max(streak, ...streakHistory.map(h => h.length));
    }, [streak, streakHistory]);

    const handleSetGoal = () => {
        const newGoal = parseInt(goalInput, 10);
        if (!isNaN(newGoal) && newGoal > 0) {
            setStreakGoal(newGoal);
            if (!unlockedAchievements.includes('set_goal')) {
                // This state update needs to be lifted to App.tsx to work
                console.log("Achievement 'set_goal' unlocked logic should be in App.tsx");
            }
        }
    }
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }

    return (
        <div className="p-4 animate-swoop-in space-y-6">
            <ThemeSwitcher theme={theme} setTheme={setTheme} />
            
            {/* Streak Section */}
            <div className="bg-white dark:bg-[#3D315B] rounded-2xl shadow-lg p-6 text-center">
                 <h2 className="text-lg font-semibold text-[#3D315B] dark:text-white mb-4">Tu Progreso de Racha</h2>
                <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                     <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-gray-200 dark:text-[#2A2438]" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                        <circle
                            className="text-[#E54F6D] dark:text-[#fbc2eb]"
                            strokeWidth="10"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                            style={{ strokeDasharray: 283, strokeDashoffset: 283 - (progress / 100) * 283, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                            transform="rotate(-90 50 50)"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <Flame className="text-[#E54F6D] dark:text-[#fbc2eb]" size={40} />
                        <span className="text-5xl font-bold text-[#3D315B] dark:text-white">{streak}</span>
                         <p className="text-sm text-[#8E82AE] -mt-1">{streak === 1 ? 'día' : 'días'}</p>
                    </div>
                </div>
                <div className="flex justify-around mt-6 text-center">
                    <div>
                        <p className="text-xs text-[#8E82AE]">Meta</p>
                        <p className="font-bold text-lg text-[#3D315B] dark:text-white">{streakGoal}</p>
                    </div>
                     <div>
                        <p className="text-xs text-[#8E82AE]">Racha Máx</p>
                        <p className="font-bold text-lg text-[#3D315B] dark:text-white">{longestStreak}</p>
                    </div>
                </div>
            </div>

            {/* Streak Goal & History */}
            <div className="bg-white dark:bg-[#3D315B] rounded-2xl shadow-lg p-6 space-y-4">
                 <h2 className="text-lg font-semibold text-[#3D315B] dark:text-white text-center flex items-center justify-center"><Target size={20} className="mr-2"/>Tu Meta</h2>
                 <div className="flex items-center space-x-2">
                    <input type="number" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} className="w-full p-2 border border-[#F3D9E9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54F6D] bg-transparent dark:border-[#5E548E] dark:focus:ring-[#9381FF] dark:text-white" placeholder="Ej: 30" />
                    <button onClick={handleSetGoal} className="bg-[#E54F6D] text-white p-2 rounded-lg hover:opacity-80 transition-opacity"><Check size={24}/></button>
                 </div>
                 <hr className="border-t border-gray-200 dark:border-gray-700 my-2"/>
                 <h2 className="text-lg font-semibold text-[#3D315B] dark:text-white text-center flex items-center justify-center pt-2"><History size={20} className="mr-2"/>Historial de Rachas</h2>
                 {streakHistory.length > 0 ? (
                     <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                         {streakHistory.map((entry, index) => (
                             <li key={index} className="flex justify-between items-center bg-gray-100 dark:bg-[#2A2438] p-2 rounded-lg">
                                 <span className="text-sm font-medium text-[#585076] dark:text-gray-300">{formatDate(entry.startDate)} - {formatDate(entry.endDate)}</span>
                                 <span className="font-bold text-[#9381FF] dark:text-[#fbc2eb]">{entry.length} {entry.length === 1 ? 'día' : 'días'}</span>
                             </li>
                         ))}
                     </ul>
                 ) : (
                     <p className="text-center text-sm text-[#A093C7] dark:text-gray-400">Aún no tienes rachas completadas. ¡Sigue así!</p>
                 )}
            </div>


            {/* Achievements Section */}
            <div className="bg-white dark:bg-[#3D315B] rounded-2xl shadow-lg p-6">
                <div className="text-center mb-4">
                    <h2 className="text-lg font-semibold text-[#3D315B] dark:text-white">Logros Desbloqueados</h2>
                    <p className="text-sm font-bold text-[#9381FF] dark:text-[#fbc2eb]">{unlockedAchievements.length} / {achievements.length}</p>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    {achievements.filter(a => !a.isSecret).slice(0, 12).map(ach => {
                        const isUnlocked = unlockedAchievements.includes(ach.id);
                        return (
                            <div
                                key={ach.id}
                                className={`flex flex-col items-center p-2 rounded-lg text-center transition-all duration-300 transform ${isUnlocked ? 'scale-105' : 'opacity-60'}`}
                                title={isUnlocked ? ach.description : '???' }
                            >
                                <div className={`w-14 h-14 flex items-center justify-center rounded-full mb-2 transition-colors ${
                                    isUnlocked ? 'bg-gradient-to-br from-[#E54F6D] to-[#FAA9BE]' : 'bg-gray-200 dark:bg-[#2A2438]'
                                }`}>
                                    {isUnlocked ? React.cloneElement<{ className?: string; size?: number }>(ach.icon, { className: 'text-white', size: 28 }) : <span className="text-2xl text-gray-400 dark:text-gray-500">?</span>}
                                </div>
                                <h3 className={`text-xs font-semibold ${isUnlocked ? 'text-[#3D315B] dark:text-white' : 'text-gray-400'}`}>
                                    {isUnlocked ? ach.name : 'Bloqueado'}
                                </h3>
                            </div>
                        );
                    })}
                </div>
                 <button className="w-full text-center mt-4 text-sm font-bold text-[#E54F6D] dark:text-[#fbc2eb] hover:underline">Ver todos los logros</button>
            </div>
        </div>
    );
};

export default ProfileScreen;
