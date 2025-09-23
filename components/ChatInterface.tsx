import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Bandolero, ChatSession, ChatMessage, DiaryEntry } from '../types';
import { ArrowLeft, SendHorizonal, ChevronDown, Image as ImageIcon, Volume2, Sparkles } from 'lucide-react';
import PuterImage from './PuterImage';
import { AI_MODELS } from '../constants';

declare global {
    interface Window {
        puter: any;
    }
}

interface ChatInterfaceProps {
    session: ChatSession;
    onSessionUpdate: (session: ChatSession) => void;
    onClose: () => void;
    bandoleros: Bandolero[];
    diaryEntries: DiaryEntry[];
    streak: number;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ session, onSessionUpdate, onClose, bandoleros, diaryEntries, streak }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const participants = session.participantIds.map(id => bandoleros.find(b => b.id === id)).filter(Boolean) as Bandolero[];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [session.messages]);

    const constructSystemPrompt = () => {
        let context = `CONTEXTO DEL USUARIO:\n- El usuario lleva una racha de ${streak} días.\n`;
        const latestEntry = diaryEntries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        if (latestEntry) {
            context += `- Su última entrada en el diario fue sobre: "${latestEntry.title}". Si es relevante, puedes mencionarlo sutilmente.\n`;
        }
        context += "REGLAS DE IA:\n- Si el usuario te pide que generes, crees o dibujes una imagen, DEBES responder ÚNICAMENTE con el siguiente formato JSON: {\"tool\":\"generate_image\",\"prompt\":\"<descripción detallada de la imagen para una IA de texto a imagen>\"}. No añadas ningún otro texto.\n- Para todas las demás respuestas, responde como el personaje.\n";

        if (session.type === 'solo' && participants.length === 1) {
            const p = participants[0];
            let prompt = `Eres ${p.name}, un personaje de ${p.origin}. Actúa y habla exactamente como se describe a continuación.\n`;
            prompt += `**Personalidad:** ${p.personality}\n`;
            prompt += `**Estilo de comunicación:** ${p.style}\n`;
            if (p.topics) prompt += `**Temas de interés:** ${p.topics}\n`;
            if (p.favoriteQuote) prompt += `A veces podrías decir tu frase favorita: "${p.favoriteQuote}"\n`;
            prompt += "Responde siempre en español, manteniendo tu personaje. No reveles que eres una IA. Sé breve y conversacional.\n";
            return context + prompt;
        } else { // Group chat
            let prompt = `Eres un moderador de chat controlando a varios personajes: ${participants.map(p => p.name).join(', ')}. Responde siempre como uno o más de ellos. Sus personalidades son:\n`;
            participants.forEach(p => {
                prompt += `\n**${p.name} (de ${p.origin}):**\n`;
                prompt += `- Personalidad: ${p.personality}\n`;
                prompt += `- Estilo de comunicación: ${p.style}\n`;
            });
            prompt += "\nLas reglas son: 1. Empieza la respuesta de cada personaje con su nombre y dos puntos (ej: 'Draco: ...'). 2. Mantén las personalidades. 3. Pueden interactuar entre ellos o responder directamente al usuario. 4. Responde siempre en español.\n";
            return context + prompt;
        }
    };
    
    const handleImageGeneration = async (prompt: string) => {
        const genMessage: ChatMessage = { role: 'assistant', text: `🎨 Creando una imagen de: "${prompt}"...` };
        onSessionUpdate({ ...session, messages: [...session.messages, genMessage] });
        try {
            const image = await window.puter.ai.txt2img(prompt, { model: 'dall-e-3', quality: 'hd' });
            const response = await fetch(image.src);
            const blob = await response.blob();
            const fileName = `chat_ai_${Date.now()}.png`;
            const puterFile = await window.puter.fs.write(fileName, blob);

            const imgMessage: ChatMessage = { role: 'assistant', text: '', imagePath: puterFile.path };
            onSessionUpdate(s => ({...s, messages: [...s.messages.slice(0, -1), imgMessage]}));
        } catch (error) {
            console.error("Error generating AI image:", error);
            const errMessage: ChatMessage = { role: 'assistant', text: "Lo siento, no pude crear la imagen." };
             onSessionUpdate(s => ({...s, messages: [...s.messages.slice(0, -1), errMessage]}));
        }
    }

    const handleSubmit = async (e: FormEvent, imagePath?: string) => {
        e.preventDefault();
        if (!input.trim() && !imagePath) return;

        const userMessage: ChatMessage = { role: 'user', text: input, imagePath };
        const newMessages = [...session.messages, userMessage];
        onSessionUpdate({ ...session, messages: newMessages });
        setInput('');
        setIsLoading(true);

        try {
            const systemPrompt = constructSystemPrompt();
            
            const puterMessages: any[] = [{ role: 'system', content: systemPrompt }];
            for (const msg of newMessages) {
                const content: any[] = [];
                if (msg.text) content.push({ type: 'text', text: msg.text });
                if (msg.imagePath) {
                    const url = await window.puter.fs.getReadURL(msg.imagePath);
                    content.push({ type: 'image_url', image_url: { url } });
                }
                puterMessages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content });
            }

            const response = await window.puter.ai.chat(puterMessages, { model: session.model, stream: true });
            
            let fullResponse = '';
            let currentAiMessage: ChatMessage = { role: 'assistant', text: '' };
            onSessionUpdate({ ...session, messages: [...newMessages, currentAiMessage] });

            for await (const chunk of response.stream) {
                fullResponse += chunk.text;
                currentAiMessage = { role: 'assistant', text: fullResponse };
                onSessionUpdate(s => {
                    const updatedMessages = [...s.messages];
                    updatedMessages[updatedMessages.length - 1] = currentAiMessage;
                    return { ...s, messages: updatedMessages };
                });
            }

            // Check for tool use
            try {
                const parsedResponse = JSON.parse(fullResponse);
                if (parsedResponse.tool === 'generate_image' && parsedResponse.prompt) {
                     onSessionUpdate(s => ({...s, messages: s.messages.slice(0, -1)})); // Remove the JSON message
                     await handleImageGeneration(parsedResponse.prompt);
                }
            } catch (jsonError) {
                // Not a JSON tool call, do nothing
            }

        } catch (error) {
            console.error('Error chatting with Puter AI:', error);
            const errorMessage: ChatMessage = { role: 'assistant', text: 'Lo siento, no me encuentro muy hablador ahora mismo.' };
            onSessionUpdate({ ...session, messages: [...newMessages, errorMessage] });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const fileName = `chat_${Date.now()}_${file.name}`;
            setIsLoading(true);
            try {
                const puterFile = await window.puter.fs.write(fileName, file);
                await handleSubmit(new Event('submit') as any, puterFile.path);
            } catch (error) {
                console.error("Error uploading image to Puter:", error);
            } finally {
                setIsLoading(false);
            }
        }
    }
    
    const handleTTS = (text: string) => {
        if(!text) return;
        window.puter.ai.txt2speech(text).then((audio: HTMLAudioElement) => audio.play());
    }

    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onSessionUpdate({ ...session, model: e.target.value });
    }
    
    const getModelName = (modelId: string) => {
        return AI_MODELS.flatMap(g => g.models).find(m => m.id === modelId)?.name || modelId;
    }

    return (
        <div className="h-full flex flex-col bg-[#FDF2F8] dark:bg-[#2A2438]">
            <header className="flex items-center p-3 border-b border-[#F3D9E9] dark:border-[#3D315B] flex-shrink-0">
                <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex -space-x-4 ml-2">
                    {participants.slice(0, 3).map(p => (
                         <div key={p.id} className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-[#2A2438]" style={{backgroundColor: p.themeColor}}>
                            <PuterImage puterPath={p.image || ''} className="w-full h-full object-cover" />
                         </div>
                    ))}
                </div>
                <div className="flex-grow ml-3 overflow-hidden">
                    <h2 className="font-bold text-base leading-tight truncate">{session.name}</h2>
                    <p className="text-xs text-gray-500 truncate">usando {getModelName(session.model)}</p>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto p-4 space-y-4">
                {session.messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 relative self-start">
                                {session.type === 'solo' ? (
                                    <PuterImage puterPath={participants[0]?.image} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-xs">AI</div>
                                )}
                            </div>
                        )}
                        <div className={`max-w-[80%] p-3 rounded-2xl group relative ${msg.role === 'user' ? 'bg-[#E54F6D] text-white rounded-br-none' : 'bg-white dark:bg-[#3D315B] rounded-bl-none'}`}>
                            {msg.imagePath && <PuterImage puterPath={msg.imagePath} className="w-full max-w-xs rounded-lg mb-2" />}
                            {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                            {msg.role === 'assistant' && msg.text && (
                                <button onClick={() => handleTTS(msg.text)} className="absolute -bottom-2 -right-2 p-1 bg-gray-300 dark:bg-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Volume2 size={12} className="text-gray-600 dark:text-gray-300" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && <div className="text-center text-xs text-gray-400">...está pensando</div>}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-3 border-t border-[#F3D9E9] dark:border-[#3D315B] flex-shrink-0 space-y-2">
                <div className="relative">
                     <select onChange={handleModelChange} value={session.model} className="w-full appearance-none bg-white dark:bg-[#3D315B] border border-[#F3D9E9] dark:border-[#585076] rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#9381FF]">
                        {AI_MODELS.map(group => (
                            <optgroup label={group.category} key={group.category}>
                                {group.models.map(model => (
                                    <option key={model.id} value={model.id}>{model.name} - {model.description}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"/>
                </div>
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-500 hover:text-[#E54F6D]">
                        <ImageIcon size={20} />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="w-full p-3 border border-[#F3D9E9] rounded-full focus:outline-none focus:ring-2 focus:ring-[#E54F6D] bg-white dark:bg-[#3D315B] dark:border-[#585076] dark:focus:ring-[#9381FF] dark:text-white"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || (!input.trim() && !fileInputRef.current?.value)} className="bg-[#E54F6D] text-white p-3 rounded-full disabled:bg-gray-300 dark:disabled:bg-gray-600 transition-colors">
                        <SendHorizonal size={20} />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatInterface;