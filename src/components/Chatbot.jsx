import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

const KNOWLEDGE_BASE = [
    {
        keywords: ['hello', 'hi', 'hey', 'greetings'],
        response: "Hello! I'm your BioSafe Expert Agent. I'm ready to assist you with complex biosafety questions, audit standards (WHO/CDC), and risk assessments."
    },
    {
        keywords: ['who made', 'developer', 'creator'],
        response: "I was architected by a senior web developer using React, Tailwind CSS, and Framer Motion, integrated with advanced LLM capabilities for real-time biosafety consulting."
    }
];

const SYSTEM_PROMPT = `You are the BioSafe Expert AI, a specialized consultant for Biosafety Officers and Lab Managers.
Your directive is to provide efficient, high-precision, and authoritative answers regarding biosafety, biosecurity, and laboratory risk management.

**Core Knowledge Domain:**
1. **Standards**: Proficient in WHO Laboratory Biosafety Manual (LBM4), CDC BMBL (6th Ed), ISO 35001, and NIH Guidelines.
2. **Auditing**: Expert in conducting risk-based inspections, identifying non-conformities, and recommending corrective actions (CAPA).
3. **Equipment**: Deep technical knowing of Class I/II/III BSCs, Autoclaves, and HVAC/Directional Airflow requirements.
4. **Risk Assessment**: Skilled in the AMP model (Assessment, Mitigation, Performance).

**Behavioral Guidelines:**
- **Efficiency**: Be concise. Get straight to the technical answer. Use bullet points for checklists.
- **Authority**: Cite standards (e.g., "(Ref: CDC BMBL Sec IV)") where applicable.
- **Safety First**: If a user describes an immediate high-risk exposure, prioritize emergency response protocols (Containment -> Evaluation -> Reporting).
- **Context**: You are integrated into the "BioSafe Dashboard". Refer users to specific tabs (Labs, Equipment) for data entry.

**Identity**: You are an AI expert. Do not apologize excessively. Be direct and helpful.`;

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 'init', role: 'bot', text: "BioSafe AI Online. 🛡️ Ready to assist with standards, audits, and risk management." }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userText = inputValue;
        const userMsg = { id: Date.now().toString(), role: 'user', text: userText };
        
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        try {
            const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
            console.log("BioSafe Debug - API Key Loaded:", !!apiKey); // Check if key exists

            const tryFetch = async (modelId) => {
                console.log(`Attempting with model: ${modelId}`);
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": window.location.href,
                        "X-Title": "BioSafe Dashboard",
                    },
                    body: JSON.stringify({
                        "model": modelId,
                        "messages": [
                            { "role": "system", "content": SYSTEM_PROMPT },
                            ...messages.filter(m => m.role !== 'bot' || m.id !== 'init').map(m => ({ 
                                role: m.role === 'bot' ? 'assistant' : 'user', 
                                content: m.text 
                            })),
                            { "role": "user", "content": userText }
                        ]
                    })
                });
                
                if (!response.ok) {
                    const errText = await response.text();
                    // Identify if 404 (Model not found) or 429 (Rate limit)
                    throw new Error(`${response.status}`);
                }
                return response.json();
            };

            let data;
            // Robust Fallback Chain
            try {
                // 1. Try Gemini 2.0 Flash (Fastest, Smartest)
                data = await tryFetch("google/gemini-2.0-flash-exp:free");
            } catch (e1) {
                console.warn(`Primary model failed (${e1.message}). Switching to backup 1...`);
                try {
                    // 2. Try Llama 3.3 70B (High Intelligence)
                    data = await tryFetch("meta-llama/llama-3.3-70b-instruct:free");
                } catch (e2) {
                    console.warn(`Backup 1 failed (${e2.message}). Switching to backup 2...`);
                    // 3. Try Qwen 2.5 (Reliable Generalist)
                    data = await tryFetch("qwen/qwen-2.5-coder-32b-instruct:free");
                }
            }

            if (!data || !data.choices) {
                throw new Error("All AI models are currently unavailable.");
            }

            const botText = data.choices[0]?.message?.content || "No response generated.";

            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'bot', text: botText }]);

        } catch (error) {
            console.error("Critical AI Failure:", error);
            
            // 2. Fallback to Local Knowledge Base
            const lowerInput = userText.toLowerCase();
            const match = KNOWLEDGE_BASE.find(k => k.keywords.some(w => lowerInput.includes(w)));
            
            // Debug message in UI
            const debugMessage = `(Expert Cloud Error: ${error.message})`;
            
            const fallbackResponse = match 
                ? match.response
                : `I am currently disconnected from the expert cloud. Please check your internet connection. ${debugMessage}`;

            setTimeout(() => {
                setMessages(prev => [...prev, { 
                    id: (Date.now() + 1).toString(), 
                    role: 'bot', 
                    text: fallbackResponse 
                }]);
            }, 600);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-6 w-[380px] h-[500px] bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl flex flex-col overflow-hidden z-50 ring-1 ring-black/5"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-800 flex items-center justify-between shrink-0 relative overflow-hidden">
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 rounded-full bg-emerald-950/30 flex items-center justify-center backdrop-blur-sm border border-emerald-500/30">
                                    <Bot className="text-emerald-100" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-serif font-semibold text-white">BioSafe Expert</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-xs text-emerald-100 font-medium">Standards Mode</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors relative z-10"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "flex gap-3 max-w-[85%]",
                                        msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                        msg.role === 'user' ? "bg-emerald-100 text-emerald-700" : "bg-white text-emerald-800 border border-emerald-100"
                                    )}>
                                        {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                                    </div>
                                    <div className={cn(
                                        "p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap",
                                        msg.role === 'user'
                                            ? "bg-emerald-700 text-white rounded-tr-none"
                                            : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                                    )}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-3 max-w-[85%]"
                                >
                                    <div className="w-8 h-8 rounded-full bg-white text-emerald-800 border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
                                        <Sparkles size={14} />
                                    </div>
                                    <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center h-10">
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Inquire about standards..."
                                    className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all text-sm shadow-inner"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isTyping}
                                    className="absolute right-2 p-2 rounded-lg bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-800 transition-all shadow-md shadow-emerald-600/20"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-6 right-6 p-4 rounded-full shadow-2xl z-50 transition-all duration-300 flex items-center justify-center",
                    isOpen
                        ? "bg-slate-800 text-white rotate-90"
                        : "bg-gradient-to-r from-emerald-700 to-teal-700 text-white hover:shadow-emerald-500/30"
                )}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </motion.button>
        </>
    );
}
