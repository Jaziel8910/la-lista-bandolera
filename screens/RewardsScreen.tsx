import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, Palette, Star } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Reward } from '../types';
import Modal from '../components/Modal';

// Mock data for rewards, in a real app this could come from a server
const ALL_REWARDS: Reward[] = [
    { id: 'theme-cherry', type: 'theme', name: 'Tema Cereza', description: 'Un tema dulce en tonos rojos y rosas.', value: 'cherry', rarity: 'common' },
    { id: 'theme-ocean', type: 'theme', name: 'Tema Océano', description: 'Un tema refrescante en tonos azules.', value: 'ocean', rarity: 'common' },
    { id: 'theme-lavender', type: 'theme', name: 'Tema Lavanda', description: 'Un tema relajante en tonos morados.', value: 'rare', rarity: 'rare' },
    { id: 'theme-starlight', type: 'theme', name: 'Tema Estelar', description: 'Un tema mágico con brillos y estrellas.', value: 'starlight', rarity: 'epic' },
    { id: 'stickers-cute-animals', type: 'sticker-pack', name: 'Stickers: Animales', description: 'Un pack de stickers de animales adorables.', value: 'animals', rarity: 'common' },
    { id: 'stickers-kawaii-food', type: 'sticker-pack', name: 'Stickers: Comida Kawaii', description: 'Un pack de stickers de comida con caritas.', value: 'food', rarity: 'rare' },
];

const getRarityColor = (rarity: 'common' | 'rare' | 'epic') => {
    switch (rarity) {
        case 'common': return 'from-gray-400 to-gray-600';
        case 'rare': return 'from-blue-400 to-blue-600';
        case 'epic': return 'from-purple-500 to-pink-500';
    }
}

interface RewardsScreenProps {
    setUnlockedAchievements: React.Dispatch<React.SetStateAction<string[]>>;
}

const RewardsScreen: React.FC<RewardsScreenProps> = ({ setUnlockedAchievements }) => {
    const [lastClaimed, setLastClaimed] = useLocalStorage<string | null>('lastClaimedReward', null);
    const [canClaim, setCanClaim] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [claimedReward, setClaimedReward] = useState<Reward | null>(null);
    const [unlockedRewards, setUnlockedRewards] = useLocalStorage<string[]>('unlockedRewards', []);
    
    useEffect(() => {
        const todayString = new Date().toDateString();
        if (lastClaimed !== todayString) {
            setCanClaim(true);
        } else {
            setCanClaim(false);
        }
    }, [lastClaimed]);

    const handleClaim = () => {
        if (!canClaim) return;

        setIsClaiming(true);
        // Simple random reward logic
        const reward = ALL_REWARDS[Math.floor(Math.random() * ALL_REWARDS.length)];
        
        setTimeout(() => {
            setClaimedReward(reward);
            setLastClaimed(new Date().toDateString());
            setCanClaim(false);
            if (!unlockedRewards.includes(reward.id)) {
                setUnlockedRewards(prev => [...prev, reward.id]);
            }
            setUnlockedAchievements(prev => [...new Set([...prev, 'first_reward'])]);
        }, 2000); // Simulate animation
    };

    const closeModal = () => {
        setClaimedReward(null);
        setIsClaiming(false);
    }
    
    return (
        <div className="p-4 animate-swoop-in text-center flex flex-col items-center justify-center h-full">
            <div className="text-[#9381FF]">
                <Gift size={80} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-[#3D315B] dark:text-white mt-4 mb-2">Caja de Recuerdos</h2>
            <p className="text-[#8E82AE] dark:text-gray-400 max-w-sm mb-8">
                ¡Vuelve cada día para abrir una caja y conseguir recompensas exclusivas como temas para la app y stickers para tu diario!
            </p>
            
            <button 
                onClick={handleClaim}
                disabled={!canClaim || isClaiming}
                className={`w-full max-w-xs py-4 px-6 rounded-2xl font-bold text-white transition-all duration-300 transform shadow-lg
                    ${!canClaim ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-br from-[#E54F6D] to-[#FAA9BE] hover:scale-105'}
                    ${isClaiming ? 'animate-pulse' : ''}`}
            >
                {isClaiming ? 'Abriendo...' : (canClaim ? '¡Reclamar Recompensa!' : 'Vuelve Mañana')}
            </button>
            
            <div className="mt-12 w-full max-w-sm">
                <h3 className="text-lg font-semibold text-[#3D315B] dark:text-white mb-4">Recompensas Obtenidas</h3>
                {unlockedRewards.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                        {ALL_REWARDS.filter(r => unlockedRewards.includes(r.id)).map(reward => (
                             <div key={reward.id} className="bg-white dark:bg-[#3D315B] p-3 rounded-xl shadow-md text-center">
                                <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-gradient-to-br mb-2 ${getRarityColor(reward.rarity)}`}>
                                    {reward.type === 'theme' ? <Palette size={24} className="text-white"/> : <Sparkles size={24} className="text-white"/>}
                                 </div>
                                 <p className="text-xs font-semibold text-[#585076] dark:text-gray-300 truncate">{reward.name}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-[#A093C7] dark:text-gray-400">Aún no has desbloqueado recompensas. ¡Abre tu primera caja!</p>
                )}
            </div>

            <Modal isOpen={!!claimedReward} onClose={closeModal} title="¡Has conseguido un premio!">
                {claimedReward && (
                    <div className="text-center flex flex-col items-center">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br mb-4 animate-bounce ${getRarityColor(claimedReward.rarity)}`}>
                             {claimedReward.type === 'theme' ? <Palette size={48} className="text-white"/> : <Sparkles size={48} className="text-white"/>}
                        </div>
                        <span className={`px-3 py-1 text-xs font-bold text-white rounded-full bg-gradient-to-br mb-2 ${getRarityColor(claimedReward.rarity)}`}>{claimedReward.rarity.toUpperCase()}</span>
                        <h3 className="text-2xl font-bold text-[#3D315B] dark:text-white">{claimedReward.name}</h3>
                        <p className="text-[#8E82AE] dark:text-gray-400 mt-1">{claimedReward.description}</p>
                         <button onClick={closeModal} className="mt-6 w-full bg-[#E54F6D] text-white py-2 rounded-lg font-semibold hover:opacity-90">¡Genial!</button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default RewardsScreen;
