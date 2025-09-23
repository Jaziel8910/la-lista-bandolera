import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Bandolero } from '../types';
import { ArrowLeft, SendHorizonal, Sparkles } from 'lucide-react';
import PuterImage from './PuterImage';

declare global {
    interface Window {
        puter: any;
    }
}

interface ChatModalProps {
    bandolero: Bandolero;
    onClose: () => void;
}

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ bandolero, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const constructSystemPrompt = () => {
        let prompt = `Eres ${bandolero.name}, un personaje de ${bandolero.origin}. Actúa y habla exactamente como se describe a continuación.\n`;
        prompt += `**Personalidad:** ${bandolero.personality}\n`;
        prompt += `**Estilo de comunicación:** ${bandolero.style}\n`;
        if (bandolero.topics) {
             prompt += `**Temas de interés:** ${bandolero.topics}\n`;
        }
        if (bandolero.favoriteQuote) {
            prompt += `A veces podrías decir tu frase favorita: "${bandolero.favoriteQuote}"\n`;
        }
        prompt += "Responde siempre en español, manteniendo tu personaje. No reveles que eres una IA. Sé breve y conversacional.";
        return prompt;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const systemPrompt = constructSystemPrompt();
            const history = messages.map(m => ({
                role: m.sender === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }));

            const chat = window.puter.ai.chat([
                { role: 'system', content: systemPrompt },
                 ...messages.map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.text
                })),
                { role: 'user', content: input }
            ], { stream: true }); // This returns a promise for the response object
            
            let fullResponse = '';
            setMessages(prev => [...prev, { sender: 'ai', text: '...' }]);

            const response = await chat;
            for await (const chunk of response.stream) {
                fullResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { sender: 'ai', text: fullResponse };
                    return newMessages;
                });
            }

        } catch (error) {
            console.error('Error chatting with Puter AI:', error);
            setMessages(prev => [...prev, { sender: 'ai', text: 'Lo siento, no me encuentro muy hablador ahora mismo.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#FDF2F8] dark:bg-[#2A2438] z-50 animate-swoop-in flex flex-col">
            <header className="flex items-center p-4 border-b border-[#F3D9E9] dark:border-[#3D315B] flex-shrink-0" style={{'--theme-color': bandolero.themeColor} as React.CSSProperties}>
                <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                 <div className="w-10 h-10 rounded-full mx-3 overflow-hidden bg-[var(--theme-color)]">
                    <PuterImage puterPath={bandolero.image || ''} className="w-full h-full object-cover" />
                 </div>
                <h2 className="font-bold text-lg">{bandolero.name}</h2>
            </header>

            <main className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && <div className="w-6 h-6 rounded-full overflow-hidden bg-[var(--theme-color)] flex-shrink-0"><PuterImage puterPath={bandolero.image || ''} className="w-full h-full object-cover" /></div>}
                        <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-[#E54F6D] text-white rounded-br-none' : 'bg-white dark:bg-[#3D315B] rounded-bl-none'}`}>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && messages[messages.length-1]?.sender === 'ai' && (
                     <div className="flex items-end gap-2 justify-start">
                         <div className="w-6 h-6 rounded-full overflow-hidden bg-[var(--theme-color)] flex-shrink-0"><PuterImage puterPath={bandolero.image || ''} className="w-full h-full object-cover" /></div>
                         <div className="max-w-[80%] p-3 rounded-2xl bg-white dark:bg-[#3D315B] rounded-bl-none">
                             <div className="flex space-x-1">
                                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse [animation-delay:-.3s]"></span>
                                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse [animation-delay:-.15s]"></span>
                                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></span>
                             </div>
                         </div>
                     </div>
                 )}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-4 border-t border-[#F3D9E9] dark:border-[#3D315B] flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Escribe a ${bandolero.name}...`}
                        className="w-full p-3 border border-[#F3D9E9] rounded-full focus:outline-none focus:ring-2 focus:ring-[#E54F6D] bg-white dark:bg-[#3D315B] dark:border-[#585076] dark:focus:ring-[#9381FF] dark:text-white"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="bg-[#E54F6D] text-white p-3 rounded-full disabled:bg-gray-300 dark:disabled:bg-gray-600 transition-colors">
                        <SendHorizonal size={20} />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatModal;