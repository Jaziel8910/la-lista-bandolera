

import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, Star, Heart, Feather } from 'lucide-react';
import { usePuterStorage } from '../hooks/usePuterStorage';
import { Reward, UserProfile } from '../types';
import Modal from '../components/Modal';
import { SHOP_REWARDS, DAILY_QUESTS } from '../constants';

const getRarityColor = (rarity: 'common' | 'rare' | 'epic') => {
    switch (rarity) {
        case 'common': return 'from-gray-400 to-gray-600';
        case 'rare': return 'from-blue-400 to-blue-600';
        case 'epic': return 'from-purple-500 to-pink-500';
    }
}

interface ShopScreenProps {
    userProfile: UserProfile;
    setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
    setUnlockedAchievements: React.Dispatch<React.SetStateAction<string[]>>;
    unlockedRewards: string[];
    setUnlockedRewards: React.Dispatch<React.SetStateAction<string[]>>;
    unlockedAchievements: string[];
    dailyQuestState: { date: string, completed: string[] };
    setDailyQuestState: React.Dispatch<React.SetStateAction<{ date: string, completed: string[] }>>;
}

const ShopScreen: React.FC<ShopScreenProps> = ({ userProfile, setUserProfile, setUnlockedAchievements, unlockedRewards, setUnlockedRewards, unlockedAchievements, dailyQuestState, setDailyQuestState }) => {
    const [lastClaimed, setLastClaimed] = usePuterStorage<string | null>('lastClaimedReward', null);
    const [canClaim, setCanClaim] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [claimedReward, setClaimedReward] = useState<Reward | null>(null);
    
    useEffect(() => {
        const todayString = new Date().toDateString();
        setCanClaim(lastClaimed !== todayString);
    }, [lastClaimed]);

    const handleClaim = () => {
        if (!canClaim) return;
        setIsClaiming(true);
        const reward = SHOP_REWARDS[Math.floor(Math.random() * SHOP_REWARDS.length)];
        
        setTimeout(() => {
            setClaimedReward(reward);
            setLastClaimed(new Date().toDateString());
            setCanClaim(false);
            if (!unlockedRewards.includes(reward.id)) {
                setUnlockedRewards(prev => [...prev, reward.id]);
            }
            if (!unlockedAchievements.includes('first_reward')) {
                setUnlockedAchievements(prev => [...new Set([...prev, 'first_reward'])]);
            }

            // Complete daily quest
            const quest = DAILY_QUESTS.find(q => q.id === 'claim_daily_reward');
            if (quest && !dailyQuestState.completed.includes(quest.id)) {
                setUserProfile(p => ({ ...p, corazones: p.corazones + quest.reward }));
                setDailyQuestState(s => ({...s, completed: [...s.completed, quest.id]}));
                setUnlockedAchievements(prev => [...new Set([...prev, 'daily_blessing'])]);
            }
        }, 1500);
    };

    const handlePurchase = (item: Reward) => {
        if (userProfile.corazones >= item.price && !unlockedRewards.includes(item.id)) {
            setUserProfile(prev => ({ ...prev, corazones: prev.corazones - item.price }));
            setUnlockedRewards(prev => [...prev, item.id]);

            // Handle different reward types
            switch(item.type) {
                case 'profile_badge':
                    // Auto-equip the badge if none is active
                    if (!userProfile.activeBadgeId) {
                        setUserProfile(p => ({ ...p, activeBadgeId: item.value }));
                    }
                    break;
                case 'ai_story_token':
                    setUserProfile(p => ({ ...p, storyTokens: (p.storyTokens || 0) + parseInt(item.value, 10) }));
                    break;
                // ai_model and sticker-pack unlocks are handled by adding to unlockedRewards list
            }
            
            if (!unlockedAchievements.includes('first_purchase')) {
                 setUnlockedAchievements(prev => [...new Set([...prev, 'first_purchase'])]);
            }
        }
    }

    const closeModal = () => {
        setClaimedReward(null);
        setIsClaiming(false);
    }
    
    return (
        <div className="p-4 text-center flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold text-[#3D315B] dark:text-white">La Tiendita</h2>
                 <div className="flex items-center gap-2 bg-white/70 dark:bg-[#3D315B]/70 px-4 py-2 rounded-full shadow-sm">
                     <span className="font-bold text-lg text-[#3D315B] dark:text-white">{userProfile.corazones}</span>
                     <Heart className="text-[#E54F6D]" fill="#E54F6D" size={20}/>
                 </div>
            </div>
           
            {/* Daily Reward */}
            <div className="bg-white dark:bg-[#3D315B] rounded-2xl shadow-lg p-6 mb-6">
                <Gift size={40} className="mx-auto text-[#9381FF] mb-2"/>
                <h3 className="text-xl font-bold text-[#3D315B] dark:text-white">Tu Regalo Diario</h3>
                <p className="text-sm text-[#8E82AE] dark:text-gray-400 mt-1 mb-4">¡Abre tu caja sorpresa de hoy!</p>
                <button 
                    onClick={handleClaim}
                    disabled={!canClaim || isClaiming}
                    className={`w-full max-w-xs py-3 px-6 rounded-xl font-bold text-white transition-all duration-300 transform shadow-md
                        ${!canClaim ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-br from-[#E54F6D] to-[#FAA9BE] hover:scale-105'}
                        ${isClaiming ? 'animate-pulse' : ''}`}
                >
                    {isClaiming ? 'Abriendo...' : (canClaim ? 'Reclamar' : 'Vuelve Mañana')}
                </button>
            </div>
            
            {/* Shop Items */}
            <div className="flex-grow space-y-4 overflow-y-auto">
                 {SHOP_REWARDS.map(item => {
                    const isUnlocked = unlockedRewards.includes(item.id);
                    const canAfford = userProfile.corazones >= item.price;
                    return (
                        <div key={item.id} className="bg-white dark:bg-[#3D315B] p-4 rounded-xl shadow-md flex items-center justify-between">
                            <div className="flex items-center gap-4 text-left">
                                <div className={`w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${getRarityColor(item.rarity)}`}>
                                    {item.type === 'profile_badge' ? <Star size={32} className="text-white"/> : item.type === 'ai_story_token' ? <Feather size={32} className="text-white"/> : <Sparkles size={32} className="text-white"/>}
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#3D315B] dark:text-white">{item.name}</h4>
                                    <p className="text-xs text-[#8E82AE] dark:text-gray-400">{item.description}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handlePurchase(item)}
                                disabled={isUnlocked || !canAfford}
                                className="py-2 px-4 rounded-lg font-semibold text-sm text-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-1.5"
                                style={{backgroundColor: isUnlocked ? '#4CAF50' : (canAfford ? '#9381FF' : '#A093C7')}}
                            >
                                {isUnlocked ? 'Comprado' : (
                                    <>
                                        <span>{item.price}</span>
                                        <Heart fill="white" size={14}/>
                                    </>
                                )}
                            </button>
                        </div>
                    );
                 })}
            </div>

            <Modal isOpen={!!claimedReward} onClose={closeModal} title="¡Has conseguido un premio!">
                {claimedReward && (
                    <div className="text-center flex flex-col items-center">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br mb-4 animate-bounce ${getRarityColor(claimedReward.rarity)}`}>
                             {claimedReward.type === 'profile_badge' ? <Star size={48} className="text-white"/> : claimedReward.type === 'ai_story_token' ? <Feather size={48} className="text-white"/> : <Sparkles size={48} className="text-white"/>}
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

export default ShopScreen;