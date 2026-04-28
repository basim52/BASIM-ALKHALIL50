/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Sparkles, 
  PenTool, 
  Video, 
  Layout, 
  Menu, 
  X, 
  ArrowRight, 
  CheckCircle2,
  Globe,
  Share2,
  Heart,
  Bot,
  Wand2,
  ChevronLeft,
  Bold,
  Italic,
  List,
  ListOrdered,
  Type,
  Palette,
  User,
  Plus,
  ChevronDown,
  LogIn,
  UserPlus,
  LogOut,
  ShieldCheck,
  Copy,
  History,
  Bookmark,
  Trash2,
  Send,
  Zap,
  Settings,
  Image as ImageIcon,
  Mic
} from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  limit,
  Timestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { auth, googleProvider, db } from './lib/firebase';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

// Initialize AI models within functions where the API key is retrieved dynamically.

const NAVBAR_LINKS = [
  { name: 'الرئيسية', href: '#' },
  { name: 'المميزات', href: '#features' },
  { name: 'المدونة', href: '#' },
];

const CREATION_TOOLS = [
  { title: 'كتابة المنشورات', id: 'posts', icon: <PenTool size={18} /> },
  { title: 'تصميم الصور', id: 'designs', icon: <Layout size={18} /> },
  { title: 'إنشاء الفيديوهات', id: 'videos', icon: <Video size={18} /> },
  { title: 'ترندات رائجة', id: 'trends', icon: <Sparkles size={18} /> },
  { title: 'تعليق صوتي', id: 'voiceover', icon: <ArrowRight size={18} /> },
  { title: 'خطة محتوى', id: 'monthly-plan', icon: <PenTool size={18} /> },
  { title: 'الهوية المرئية', id: 'branding', icon: <Layout size={18} /> },
  { title: 'تقويم المناسبات', id: 'calendar', icon: <ArrowRight size={18} /> },
];

const FEATURES = [
  {
    title: '60+ ترند رائج شهرياً',
    description: '30 ترند من إنستقرام + 30 من تيك توك محدثة دائماً لتتصدر النتائج.',
    icon: <Sparkles className="w-6 h-6 text-emerald-500" />,
    id: 'trends',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=400'
  },
  {
    title: 'النشر عبر منصات التواصل',
    description: 'تستطيع النشر عبر المنصات وسائل التواصل الاجتماعي والجدولة من داخل باسم AI.',
    icon: <ArrowRight className="w-6 h-6 text-emerald-500" />,
    id: 'scheduling',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=400'
  },
  {
    title: 'أضف منتجاتك أو خدماتك',
    description: 'احفظ معلومات منتجاتك مرة واحدة واستخدمها دائماً في كل منشور.',
    icon: <Bot className="w-6 h-6 text-emerald-500" />,
    id: 'products',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400'
  },
  {
    title: 'حدد هويتك المرئية',
    description: 'اختر ألوان ونمط محتواك في ثوانٍ لتضمن تناسق حسابك بالكامل.',
    icon: <Layout className="w-6 h-6 text-emerald-500" />,
    id: 'branding',
    image: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=400'
  },
  {
    title: 'خدمة التعليق الصوتي',
    description: 'تعليقات صوتية بلهجات محلية بكل سهولة وبجودة استوديو احترافية.',
    icon: <ArrowRight className="w-6 h-6 text-emerald-500" />,
    id: 'voiceover',
    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=400'
  },
  {
    title: 'خطة محتوى شهرية',
    description: 'نظم وجدول محتواك بكل احترافية لترتاح طوال الشهر مع نظام جدولة متطور.',
    icon: <PenTool className="w-6 h-6 text-emerald-500" />,
    id: 'monthly-plan',
    image: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&w=400'
  },
  {
    title: 'استوديو الصور',
    description: 'استوديو صور سلس وسهل لإنشاء صور منتجاتك بشكل احترافي بضغطة زر.',
    icon: <Layout className="w-6 h-6 text-emerald-500" />,
    id: 'photo-studio',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=400'
  },
  {
    title: 'تقويم المناسبات السنوية',
    description: 'لا تفوت أي مناسبة مهمة لجمهورك، كن حاضراً دائماً مع تقويم ذكي.',
    icon: <ArrowRight className="w-6 h-6 text-emerald-500" />,
    id: 'calendar',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=400'
  }
];

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [currentPage, setCurrentPage] = useState<'home' | 'privacy' | 'terms' | 'support' | 'contact' | 'blog'>('home');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [groundingLinks, setGroundingLinks] = useState<{title: string, uri: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [selectedTone, setSelectedTone] = useState('احترافي');
  const [selectedPlatform, setSelectedPlatform] = useState('انستقرام');
  const [history, setHistory] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Multi-account management states
  const [accounts, setAccounts] = useState([
    { id: '1', name: 'باسم - مطور تقني', platform: 'تويتر', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' },
    { id: '2', name: 'مدونة باسم AI', platform: 'انستقرام', avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop' },
    { id: '3', name: 'قناة باسم التقنية', platform: 'تيك توك', avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop' },
    { id: '4', name: 'براند باسم الفاخر', platform: 'لينكد إن', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop' },
    { id: '5', name: 'متجر باسم الإلكتروني', platform: 'فيسبوك', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop' },
  ]);
  const [activeAccount, setActiveAccount] = useState(accounts[0]);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Image editing states
  const [imageSettings, setImageSettings] = useState({
    brightness: 100,
    contrast: 100,
    filter: 'none',
    text: '',
    textColor: '#ffffff',
    textSize: 24,
  });

  // Tones and Platforms for professional control
  const TONES = ['احترافي', 'مرح', 'ملهم', 'جاد', 'سحابي'];
  const PLATFORMS = ['انستقرام', 'تويتر', 'تيك توك', 'لينكد إن'];
  const FILTERS = [
    { name: 'بدون', value: 'none' },
    { name: 'رمادي', value: 'grayscale(100%)' },
    { name: 'عتيق', value: 'sepia(100%)' },
    { name: 'مشبع', value: 'saturate(200%)' },
    { name: 'بارد', value: 'hue-rotate(180deg)' },
    { name: 'دافئ', value: 'hue-rotate(30deg) saturate(120%)' },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setAccounts(prev => {
          const newAccs = [...prev];
          newAccs[0] = {
            ...newAccs[0],
            name: currentUser.displayName || 'مستخدم باسم AI',
            avatar: currentUser.photoURL || newAccs[0].avatar
          };
          return newAccs;
        });
        setActiveAccount(prev => ({
          ...prev,
          name: currentUser.displayName || 'مستخدم باسم AI',
          avatar: currentUser.photoURL || prev.avatar
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync history with Firestore if user is authenticated
  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem('basim_ai_history');
      if (saved) setHistory(JSON.parse(saved));
      return;
    }

    const q = query(
      collection(db, 'generations'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(items);
    });

    return () => unsubscribe();
  }, [user]);

  const saveToHistory = async (item: any) => {
    if (user) {
      try {
        await addDoc(collection(db, 'generations'), {
          ...item,
          userId: user.uid,
          createdAt: Timestamp.now()
        });
      } catch (e) {
        console.error('Error saving to history:', e);
      }
    } else {
      const newHistory = [{ id: Date.now().toString(), ...item, createdAt: new Date() }, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('basim_ai_history', JSON.stringify(newHistory));
    }
  };

  const deleteFromHistory = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'generations', id));
      } catch (e) {
        console.error('Error deleting:', e);
      }
    } else {
      const filtered = history.filter(h => h.id !== id);
      setHistory(filtered);
      localStorage.setItem('basim_ai_history', JSON.stringify(filtered));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text.replace(/<br \/>/g, '\n'));
    // Could add a toast here
  };

  const generateContent = async () => {
    if (!prompt) return;

    // Veo and certain image models require user-selected API key in AI Studio environment
    if ((activeTab === 'videos' || activeTab === 'voiceover') && typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
    }

    setIsGenerating(true);
    setResult('');
    setGeneratedImage(null);
    setGeneratedVideo(null);
    setGeneratedAudio(null);
    setGroundingLinks([]);
    setLoadingMessage('جاري التفكير وتحضير الإجابة...');

    // Use fresh instance for API calls to ensure it uses the most up-to-date key
    // Supporting various environment names and platforms
    // Note: VITE_ prefix is required for client-side access in Vite environments like Vercel
    const getEnvKey = () => {
      try {
        // 1. Try process.env if available (Node/Some shims)
        if (typeof process !== 'undefined' && process.env) {
          const k = (process.env as any).API_KEY || process.env.GEMINI_API_KEY || (process.env as any).VITE_GEMINI_API_KEY;
          if (k) return k;
        }
        // 2. Try import.meta.env (Standard Vite)
        const viteKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;
        if (viteKey) return viteKey;
      } catch (e) {
        console.warn('Error accessing environment variables:', e);
      }
      return undefined;
    };

    const rawKey = getEnvKey();
    const apiKey = typeof rawKey === 'string' ? rawKey.trim() : rawKey;
    
    if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || apiKey === '') {
      const missingKeyMsg = 'Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in your deployment environment (e.g. Vercel).';
      console.error(missingKeyMsg);
      setResult('عذراً، مفتاح الـ API غير متوفر حالياً. إذا كنت تستخدم الرابط الخارجي (Vercel)، يرجى التأكد من إضافة VITE_GEMINI_API_KEY في إعدادات البيئة.');
      if (typeof window !== 'undefined' && (window as any).aistudio) {
        await (window as any).aistudio.openSelectKey();
      }
      setIsGenerating(false);
      setLoadingMessage('');
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      let promptPrefix = `أنت خبير في صناعة المحتوى العربي الرقمي. النمط المطلوب: ${selectedTone}. المنصة المستهدفة: ${selectedPlatform}. 
يجب أن يكون المحتوى جذاباً جداً، يستخدم لغة حديثة، ويتبع أفضل ممارسات السيؤ (SEO) للسوشيال ميديا.
استخدم تنسيق Markdown بشكل مكثف (عناوين، نص عريض، قوائم نقطية). \n\n`;
      
      if (activeTab === 'posts') {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `${promptPrefix} اكتب لي منشور احترافي وجذاب ومعبر جداً عن الموضوع التالي: ${prompt}. يجب أن يتضمن استخدام ذكي للايموجي والهاشتاقات. قسم المنشور إلى (العنوان، المحتوى الأساسي، دعوة لاتخاذ إجراء CTA).`,
        });
        const text = response.text || 'لم نتمكن من إنشاء المحتوى حالياً.';
        const formattedText = text.replace(/\n/g, '<br />');
        setResult(formattedText);
        saveToHistory({ type: 'text', content: formattedText, prompt, platform: selectedPlatform });
      } else if (activeTab === 'designs') {
        setLoadingMessage('جاري تصميم الصورة باستخدام الذكاء الاصطناعي...');
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: [{ text: prompt }],
          config: {
            imageConfig: { aspectRatio: "1:1" }
          }
        });
        
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          }
        }
      } else if (activeTab === 'videos') {
        setLoadingMessage('بدء عملية إنشاء الفيديو... قد يستغرق هذا بضع دقائق.');
        let operation = await ai.models.generateVideos({
          model: 'veo-3.1-lite-generate-preview',
          prompt: prompt,
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
          }
        });

        const messages = [
          'جاري تحريك المشاهد...',
          'إضافة اللمسات الإبداعية...',
          'معالجة الإطارات بدقة عالية...',
          'أوشكنا على الانتهاء...'
        ];
        let msgIndex = 0;

        while (!operation.done) {
          setLoadingMessage(messages[msgIndex % messages.length]);
          msgIndex++;
          await new Promise(resolve => setTimeout(resolve, 10000));
          operation = await (ai.operations as any).getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
          const fetchResponse = await fetch(downloadLink, {
            method: 'GET',
            headers: {
              'x-goog-api-key': apiKey as string,
            },
          });
          const blob = await fetchResponse.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setGeneratedVideo(reader.result as string);
          };
          reader.readAsDataURL(blob);
        } else {
          setResult('حدث خطأ أثناء إنشاء الفيديو.');
        }
      } else if (activeTab === 'trends') {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `ما هي أحدث الترندات الرائجة حالياً في السوشيال ميديا العربية (تيك توك وانستقرام) لموضوع: ${prompt}؟ اعطني أفكار محتوى قوية.`,
          config: { tools: [{ googleSearch: {} }] }
        });
        setResult(response.text || '');
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
          const links = chunks.map((c: any) => ({ 
            title: c.web?.title || 'رابط خارجي', 
            uri: c.web?.uri || c.maps?.uri 
          }));
          setGroundingLinks(links.filter((l: any) => l.uri));
        }
      } else if (activeTab === 'voiceover') {
        setLoadingMessage('جاري تحويل النص إلى صوت احترافي...');
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-tts-preview",
          contents: [{ parts: [{ text: `بلهجة عربية احترافية وملهمة، انطق النص التالي: ${prompt}` }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
          }
        });
        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (audioData) {
          setGeneratedAudio(`data:audio/mpeg;base64,${audioData}`);
        }
      } else if (activeTab === 'monthly-plan') {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `صمم لي خطة محتوى شهرية (4 أسابيع) لمشروع: ${prompt}. الخطة يجب أن تكون متنوعة (تعليمي، تفاعلي، بيعي، ترفيهي) ومنظمة بشكل جيد.`,
        });
        setResult(response.text || '');
      } else if (activeTab === 'branding') {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `اقترح لي هوية مرئية متكاملة لبراند يدور حول: ${prompt}. اقترح ألوان (Hex codes)، خطوط، وأنماط بصرية تناسب الفئة المستهدفة.`,
        });
        setResult(response.text || '');
      } else if (activeTab === 'calendar') {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `ما هي أهم المناسبات العالمية والعربية القادمة التي يمكن لبراند ${prompt} استغلالها في صناعة المحتوى؟`,
          config: { tools: [{ googleSearch: {} }] }
        });
        setResult(response.text || '');
      }
    } catch (error: any) {
      console.error(error);
      const isAIStudio = typeof window !== 'undefined' && (window as any).aistudio;
      if (error?.message?.includes('Requested entity was not found') || error?.message?.includes('API key not found')) {
        setResult('يرجى اختيار مفتاح API صالح (Paid) والمحاولة مرة أخرى لتتمكن من استخدام ميزات الذكاء الاصطناعي المتقدمة.');
        if (isAIStudio) await (window as any).aistudio.openSelectKey();
      } else if (error?.message?.includes('API_KEY_INVALID')) {
        setResult('مفتاح الـ API المستخدم غير صالح. يرجى إعادة اختياره.');
        if (isAIStudio) await (window as any).aistudio.openSelectKey();
      } else {
        setResult('حدث خطأ في الاتصال بالذكاء الاصطناعي. قد يكون ذلك بسبب ضغط على الخادم أو مشكلة في إعدادات المفتاح. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsGenerating(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] overflow-x-hidden arabic-text" dir="rtl">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2 hover:scale-105 transition-all">
              <div className="accent-bg p-2 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-gray-900">باسم AI</span>
            </button>

              <div className="hidden md:flex items-center gap-6">
                {/* Account Switcher */}
                <div className="relative">
                  <button 
                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl hover:bg-white hover:shadow-sm transition-all group"
                  >
                    <img src={activeAccount.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-emerald-100" />
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-gray-900 leading-none mb-0.5">{activeAccount.name}</p>
                       <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-wider">{activeAccount.platform}</p>
                    </div>
                    <ChevronDown size={14} className={`text-gray-400 group-hover:text-emerald-500 transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isAccountMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl p-2 z-[60] overflow-hidden"
                      >
                        <p className="text-[10px] font-bold text-gray-400 mb-2 px-2 uppercase tracking-widest">تبديل الحساب</p>
                        <div className="space-y-1">
                          {accounts.map(acc => (
                             <button 
                               key={acc.id}
                               onClick={() => {
                                 setActiveAccount(acc);
                                 setIsAccountMenuOpen(false);
                               }}
                               className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${
                                 activeAccount.id === acc.id ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-50 text-gray-600'
                               }`}
                             >
                                <img src={acc.avatar} alt={acc.name} className="w-8 h-8 rounded-full border" />
                                <div className="text-right flex-1">
                                  <p className="text-xs font-bold">{acc.name}</p>
                                  <p className="text-[9px] opacity-70">{acc.platform}</p>
                                </div>
                                {activeAccount.id === acc.id && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                             </button>
                          ))}
                        </div>
                        <div className="border-t border-gray-50 mt-2 pt-2">
                           <button 
                             onClick={() => {
                               const name = window.prompt('أدخل اسم الحساب الجديد:');
                               if (name) {
                                  const newAcc = {
                                    id: Date.now().toString(),
                                    name,
                                    platform: 'جديد',
                                    avatar: `https://ui-avatars.com/api/?name=${name}&background=10b981&color=fff`
                                  };
                                  setAccounts([...accounts, newAcc]);
                                  setActiveAccount(newAcc);
                                  setIsAccountMenuOpen(false);
                               }
                             }}
                             className="w-full flex items-center gap-3 p-2 rounded-xl text-gray-500 hover:bg-gray-50 transition-all font-sans"
                           >
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                <Plus size={16} />
                              </div>
                              <span className="text-xs font-medium">إضافة حساب جديد</span>
                           </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="w-[1px] h-8 bg-gray-100 mx-2" />

                {NAVBAR_LINKS.map((link) => (
                  <button 
                    key={link.name} 
                    onClick={() => {
                      if (link.name === 'المدونة') {
                        setCurrentPage('blog');
                      } else if (link.name === 'الرئيسية') {
                        setCurrentPage('home');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                         setCurrentPage('home');
                         // wait for state change then scroll
                         setTimeout(() => {
                           const el = document.querySelector(link.href);
                           if (el) el.scrollIntoView({ behavior: 'smooth' });
                         }, 100);
                      }
                    }}
                    className="text-gray-600 hover:text-emerald-600 font-medium transition-colors"
                  >
                    {link.name}
                  </button>
                ))}
              <div className="flex items-center gap-4">
                {user ? (
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => signOut(auth)}
                      className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                      title="تسجيل الخروج"
                    >
                      <LogOut size={20} />
                    </button>
                    <div className="w-10 h-10 rounded-full border-2 border-emerald-500 p-0.5">
                      <img src={user.photoURL || activeAccount.avatar} alt="User" className="w-full h-full rounded-full object-cover" />
                    </div>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
                      className="text-gray-600 font-bold px-4 py-2 hover:text-emerald-600 transition-colors flex items-center gap-2"
                    >
                      <LogIn size={18} />
                      <span className="hidden sm:inline">تسجيل الدخول</span>
                    </button>
                    <button 
                      onClick={() => {
                        const previewSection = document.getElementById('ai-preview');
                        if (previewSection) {
                          previewSection.scrollIntoView({ behavior: 'smooth' });
                          setTimeout(() => {
                            document.getElementById('ai-input')?.focus();
                          }, 800);
                        }
                      }}
                      className="accent-bg text-white px-6 py-2.5 rounded-full font-bold hover:scale-105 transition-all shadow-xl shadow-emerald-100 flex items-center gap-2"
                    >
                      <Sparkles size={18} />
                      <span>ابدأ التجربة</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-0 w-full bg-white border-b border-gray-100 p-4 md:hidden flex flex-col gap-4 shadow-xl"
            >
              {NAVBAR_LINKS.map((link) => (
                <a key={link.name} href={link.href} className="text-lg font-medium text-gray-700 p-2">
                  {link.name}
                </a>
              ))}
              {!user && (
                <div className="space-y-3 pt-4 border-t border-gray-50">
                   <button 
                    onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); setIsMenuOpen(false); }}
                    className="w-full py-3 rounded-xl font-bold border border-gray-100 text-gray-600 flex items-center justify-center gap-2"
                  >
                    <LogIn size={18} />
                    تسجيل الدخول
                  </button>
                  <button 
                    onClick={() => { setAuthMode('register'); setIsAuthModalOpen(true); setIsMenuOpen(false); }}
                    className="w-full py-3 rounded-xl font-bold bg-emerald-50 text-emerald-600 flex items-center justify-center gap-2"
                  >
                    <UserPlus size={18} />
                    إنشاء حساب جديد
                  </button>
                  <button 
                    onClick={() => {
                        setIsMenuOpen(false);
                        const previewSection = document.getElementById('ai-preview');
                        if (previewSection) previewSection.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="accent-bg text-white w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <Sparkles size={18} />
                    ابدأ الآن
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {currentPage === 'home' ? (
        <>
          {/* Hero Section */}
          <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(5,150,105,0.1),transparent_50%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 text-right">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black mb-8 border border-emerald-100 shadow-sm">
                  <Wand2 className="w-3.5 h-3.5" />
                  منصة باسم AI الإصدار 3.0
                </span>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-[1.05] mb-8 tracking-tighter">
                  صناعة المحتوى <br />
                  أسماها <span className="bg-clip-text text-transparent bg-gradient-to-l from-emerald-600 via-emerald-500 to-teal-400">باسم</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-500 max-w-xl leading-relaxed mb-12 font-medium">
                  المنصة العربية الأولى المدعومة بالذكاء الاصطناعي التي تفهم لهجتك، ثروك، واحتياجات جمهورك المحلي.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button 
                    onClick={() => document.getElementById('ai-preview')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full sm:w-auto px-10 py-5 accent-bg text-white rounded-2xl text-lg font-black hover:scale-[1.02] transition-all shadow-2xl shadow-emerald-200 flex items-center justify-center gap-3 group"
                  >
                    ابدأ رحلتك المجانية
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full sm:w-auto px-10 py-5 bg-white text-gray-700 border border-gray-100 rounded-2xl text-lg font-bold hover:bg-gray-50 transition-all shadow-sm"
                  >
                    استكشف الأدوات
                  </button>
                </div>

                <div className="mt-12 flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 w-fit">
                   <div className="flex -space-x-2 space-x-reverse">
                      {[1,2,3,4].map(i => (
                        <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-8 h-8 rounded-full border-2 border-white" alt="user" />
                      ))}
                   </div>
                   <p className="text-xs font-bold text-gray-500">انضم إلى <span className="text-gray-900">+50,000</span> صانع محتوى</p>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: 10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ delay: 0.2, duration: 1, type: 'spring' }}
              className="lg:w-1/2 relative perspective-1000"
            >
              <div className="relative z-10 bg-white p-2 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(5,150,105,0.15)] border border-emerald-50/50">
                 <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-gray-50 relative group">
                    <img 
                      src="https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&w=1200" 
                      className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-1000"
                      alt="Productivity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent" />
                    
                    <div className="absolute top-6 left-6 animate-bounce">
                       <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-100">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-[10px] font-black">تصميم مولد بذكاء</span>
                       </div>
                    </div>

                    <div className="absolute bottom-8 right-8 flex flex-col gap-3">
                       <div className="bg-white/95 backdrop-blur shadow-2xl p-4 rounded-3xl border border-gray-100 w-48 stagger-item">
                          <div className="flex items-center gap-2 mb-2">
                             <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                             </div>
                             <span className="text-[10px] font-bold">نمو الحساب</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: '85%' }}
                               transition={{ delay: 1.5, duration: 1.5 }}
                               className="h-full accent-bg" 
                             />
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 mt-2 text-left">+85%</p>
                       </div>
                    </div>
                 </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-200/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-200/20 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
            {[
              { label: 'مستخدم نشط', val: '10K+' },
              { label: 'محتوى مولد', val: '500K+' },
              { label: 'تقييم إيجابي', val: '4.9/5' },
              { label: 'دول مدعومة', val: '22' }
            ].map((s, i) => (
              <div key={i} className="text-center group">
                <p className="text-3xl md:text-5xl font-black text-emerald-600 mb-2 group-hover:scale-110 transition-transform">{s.val}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 flex flex-wrap justify-center gap-x-2">
              <span>كل ما تحتاجه للنجاح</span>
              <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-8">تحت سقف واحد</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">
              مجموعة متكاملة من الأدوات المدعومة بالذكاء الاصطناعي لتسهيل رحلة صناعة المحتوى الخاصة بك.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature, idx) => (
              <motion.button
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                onClick={() => {
                  const mapping: Record<string, string> = {
                    'trends': 'trends',
                    'scheduling': 'posts',
                    'products': 'posts',
                    'branding': 'branding',
                    'voiceover': 'voiceover',
                    'monthly-plan': 'monthly-plan',
                    'photo-studio': 'designs',
                    'calendar': 'calendar'
                  };
                  setActiveTab(mapping[feature.id] || 'posts');
                  setResult('');
                  setGeneratedImage(null);
                  setGeneratedVideo(null);
                  setGeneratedAudio(null);
                  setGroundingLinks([]);
                  const previewSection = document.getElementById('ai-preview');
                  if (previewSection) {
                    previewSection.scrollIntoView({ behavior: 'smooth' });
                    setTimeout(() => {
                      document.getElementById('ai-input')?.focus();
                    }, 800);
                  }
                }}
                className="bg-white text-right rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden flex flex-col transition-all hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] hover:border-emerald-100 cursor-pointer group"
              >
                {/* Mockup Area */}
                <div className="relative h-56 bg-gradient-to-br from-emerald-50 via-white to-teal-50 overflow-hidden flex items-center justify-center p-6 w-full">
                  <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,transparent_100%)] from-emerald-500" />
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover rounded-2xl shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 p-2 bg-white/80 backdrop-blur rounded-xl border border-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Wand2 size={14} className="text-emerald-500" />
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-grow w-full relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-emerald-50 p-2 rounded-xl group-hover:rotate-12 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-black text-gray-900 leading-tight">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed flex-grow font-medium">
                    {feature.description}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-emerald-600 font-black text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                     <span>جربه الآن</span>
                     <ChevronLeft size={14} />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2 space-y-8">
              <h2 className="text-4xl md:text-5xl font-black leading-tight">ابدأ رحلة الإبداع <br /><span className="text-emerald-400">في 3 خطوات بسيطة</span></h2>
              <div className="space-y-12">
                {[
                  { step: '01', title: 'وصف الفكرة', desc: 'اكتب ببساطة ما يدور في ذهنك، سواء كان منشوراً طويلاً أو فكرة لصورة.' },
                  { step: '02', title: 'التعديل والتحسين', desc: 'اختر النبرة المناسبة والمنصة، واترك الذكاء الاصطناعي يقوم بالسحر.' },
                  { step: '03', title: 'النشر والانطلاق', desc: 'احصل على النتيجة فوراً، وقم بتحميلها أو نسخها لتشاركها مع عالمك.' }
                ].map((s, i) => (
                  <div key={i} className="flex gap-6">
                    <span className="text-4xl font-black text-emerald-500/20">{s.step}</span>
                    <div className="space-y-2">
                       <h4 className="text-xl font-bold">{s.title}</h4>
                       <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:w-1/2 relative">
               <div className="absolute -inset-20 bg-emerald-500/20 blur-[120px] rounded-full" />
               <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 aspect-square flex items-center justify-center">
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 rounded-3xl bg-emerald-500 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/40">
                      <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">باسم AI جاهز للعمل</p>
                    <p className="text-gray-400">انزل للأسفل لتجرب بنفسك</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive AI Preview */}
      <section id="ai-preview" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                جرب قوة الذكاء الاصطناعي <br />
                <span className="text-emerald-600 font-mono tracking-tight">في صناعة المحتوى</span>
              </h2>
              <p className="text-lg text-gray-500 max-w-lg">
                اكتب فكرتك أو المنتج الذي تود التسويق له، وسيقوم محرك باسم AI بإنشاء مسودة منشور احترافية لك في ثوانٍ.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium text-gray-700">تحسين محركات البحث SEO</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium text-gray-700">تحليل الاتجاهات والتريندات</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium text-gray-700">دعم كافة منصات التواصل</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-100 to-teal-100 blur-3xl opacity-50 -z-10 rounded-[4rem]" />
              <div className="glass-card rounded-3xl shadow-2xl p-8">
                <div className="flex items-center gap-3 mb-6 p-1 bg-gray-100 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth">
                  {CREATION_TOOLS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveTab(t.id);
                        setResult('');
                        setGeneratedImage(null);
                        setGeneratedVideo(null);
                        setGeneratedAudio(null);
                        setGroundingLinks([]);
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                        activeTab === t.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {t.icon}
                      {t.title}
                    </button>
                  ))}
                </div>

                <div className="space-y-6">
                  {/* Professional Options Bar */}
                  {(activeTab === 'posts' || activeTab === 'designs' || activeTab === 'voiceover') && (
                    <div className="flex flex-wrap gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                      <div className="flex-1 min-w-[120px]">
                        <label className="text-[10px] font-bold text-emerald-600 block mb-1 uppercase tracking-wider">نبرة الصوت</label>
                        <select 
                          value={selectedTone}
                          onChange={(e) => setSelectedTone(e.target.value)}
                          className="w-full bg-white border border-emerald-100 rounded-lg px-2 py-1.5 text-xs text-gray-700 outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <label className="text-[10px] font-bold text-emerald-600 block mb-1 uppercase tracking-wider">المنصة</label>
                        <select 
                          value={selectedPlatform}
                          onChange={(e) => setSelectedPlatform(e.target.value)}
                          className="w-full bg-white border border-emerald-100 rounded-lg px-2 py-1.5 text-xs text-gray-700 outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      {activeTab === 'posts' ? 'عن ماذا تود الكتابة؟' : 
                       activeTab === 'designs' ? 'صف الصورة التي تتخيلها' : 
                       activeTab === 'videos' ? 'صف مشهد الفيديو' :
                       activeTab === 'trends' ? 'ما هو مجالك للبحث عن الترندات؟' :
                       activeTab === 'voiceover' ? 'اكتب النص الذي تود تحويله لصوت' :
                       activeTab === 'monthly-plan' ? 'اسم المشروع أو الفكرة للخطة' :
                       activeTab === 'branding' ? 'اسم البراند ومجاله للهوية' :
                       'المجال للبحث عن المناسبات'}
                    </label>
                    <textarea 
                      id="ai-input"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={
                        activeTab === 'posts' ? 'مثال: مطعم سحابي جديد في الرياض يقدم وجبات صحية' :
                        activeTab === 'designs' ? 'مثال: تفاحة زجاجية على طاولة رخامية بإضاءة سينمائية' :
                        activeTab === 'videos' ? 'مثال: قطة رائد فضاء تحلق في المجرة بأسلوب نيون' :
                        'مثال: العطور والجمال، التجارة الإلكترونية، العقارات...'
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all h-32 resize-none"
                    />
                  </div>
                  <button 
                    onClick={generateContent}
                    disabled={isGenerating || !prompt}
                    className="w-full py-4 accent-bg text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50 transition-all shadow-xl shadow-emerald-100"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span className="animate-pulse">{loadingMessage || 'جاري الإنشاء...'}</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>أنشئ السحر الآن</span>
                      </>
                    )}
                  </button>

                   {/* Templates Hub */}
                  {!result && !isGenerating && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-8 space-y-4"
                    >
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">أو ابدأ باستخدام نموذج جاهز</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[
                          { label: 'قصة نجاح مؤثرة', prompt: 'اكتب قصة نجاح قصيرة وملهمة عن شركتي الناشئة في مجال التقنية' },
                          { label: '3 نصائح سريعة', prompt: 'اعطني 3 نصائح ذهبية لزيادة الإنتاجية في العمل' },
                          { label: 'إعلان منتج جديد', prompt: 'صمم إعلان مشوق لإطلاق عطر جديد برائحة المسك' },
                          { label: 'سلسلة تغريدات (Thread)', prompt: 'اكتب سلسلة تغريدات تشرح أهمية الذكاء الاصطناعي في حياتنا اليومية' },
                        ].map((t, i) => (
                          <button 
                            key={i}
                            onClick={() => setPrompt(t.prompt)}
                            className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-bold text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all shadow-sm"
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {(result || generatedImage || generatedVideo || generatedAudio || groundingLinks.length > 0) && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        {/* Universal Result Viewer */}
                        {result && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
                                  <Zap className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-black text-gray-900 leading-none mb-1">المحتوى الذكي</h4>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{activeTab}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => copyToClipboard(result)}
                                  className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all text-gray-600 hover:text-emerald-600 shadow-sm"
                                  title="نسخ"
                                >
                                  <Copy size={16} />
                                </button>
                                <button 
                                  className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all text-gray-600 hover:text-emerald-600 shadow-sm"
                                  title="حفظ"
                                >
                                  <Bookmark size={16} />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                              <div className="lg:col-span-7 space-y-6">
                                <div className="bg-white border border-gray-50 rounded-[2.5rem] p-8 md:p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-bl-full -translate-y-8 translate-x-8 transition-transform group-hover:translate-y-0 group-hover:translate-x-0" />
                                  <div className="relative z-10 font-sans prose prose-emerald max-w-none text-right" dir="rtl">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {result.replace(/<br \/>/g, '\n')}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                                
                                {groundingLinks.length > 0 && (
                                  <div className="space-y-3">
                                    <p className="text-xs font-black text-gray-400 px-2">المصادر الموثقة</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {groundingLinks.map((l, i) => (
                                        <a key={i} href={l.uri} target="_blank" className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl hover:border-emerald-300 hover:shadow-lg transition-all group">
                                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                            <Globe size={14} />
                                          </div>
                                          <span className="text-[11px] font-bold text-gray-700 truncate">{l.title}</span>
                                          <ArrowRight size={14} className="-rotate-45 text-gray-300 group-hover:text-emerald-500 mr-auto transition-colors" />
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="lg:col-span-5 flex flex-col gap-6">
                                {activeTab === 'posts' && (
                                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                                    <div className="relative z-10">
                                      <div className="flex items-center justify-between mb-6">
                                        <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-[10px] font-black text-white/70 tracking-widest uppercase">معاينة المنشور</span>
                                        <div className="flex gap-1">
                                          <div className="w-2 h-2 rounded-full bg-red-400" />
                                          <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                          <div className="w-2 h-2 rounded-full bg-green-400" />
                                        </div>
                                      </div>
                                      
                                      <div className="bg-white rounded-3xl p-5 shadow-inner">
                                        <div className="flex items-center gap-3 mb-4">
                                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg">
                                            <img src={activeAccount.avatar} className="w-full h-full rounded-full object-cover border-2 border-white" alt="avatar" />
                                          </div>
                                          <div>
                                            <p className="text-xs font-black text-gray-900">{activeAccount.name}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase">{activeAccount.platform}</p>
                                          </div>
                                        </div>
                                        <div className="text-[11px] text-gray-700 leading-relaxed font-sans line-clamp-[12] overflow-hidden">
                                           {result.replace(/<br \/>/g, '\n').split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)}
                                        </div>
                                        <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                                           <div className="flex gap-4">
                                              <div className="w-5 h-5 rounded-full bg-gray-100" />
                                              <div className="w-5 h-5 rounded-full bg-gray-100" />
                                              <div className="w-5 h-5 rounded-full bg-gray-100" />
                                           </div>
                                           <div className="w-12 h-3 bg-gray-100 rounded-full" />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {history.length > 0 && (
                                  <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm overflow-hidden">
                                    <div className="flex items-center justify-between mb-4">
                                      <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <History size={14} />
                                        السجلات الأخيرة
                                      </h5>
                                    </div>
                                    <div className="space-y-3">
                                      {history.slice(0, 3).map((h, i) => (
                                        <button 
                                          key={i} 
                                          onClick={() => setResult(h.content || h.result)}
                                          className="w-full text-right p-3 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group flex items-start gap-3"
                                        >
                                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors flex-shrink-0">
                                            {h.type === 'text' ? <PenTool size={14} /> : <ImageIcon size={14} />}
                                          </div>
                                          <div className="flex-1 truncate">
                                            <p className="text-[11px] font-bold text-gray-700 truncate">{h.prompt}</p>
                                            <p className="text-[9px] text-gray-400">{h.platform}</p>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Media Renderers */}
                        <div className="space-y-4">
                          <div className="rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-50 relative group/img-preview">
                            {generatedImage && (
                              <div className="relative">
                                <img 
                                  src={generatedImage} 
                                  alt="AI Result" 
                                  className="w-full h-auto transition-all duration-300" 
                                  style={{ 
                                    filter: `${imageSettings.filter} brightness(${imageSettings.brightness}%) contrast(${imageSettings.contrast}%)`
                                  }}
                                />
                                {imageSettings.text && (
                                  <div 
                                    className="absolute inset-0 flex items-center justify-center pointer-events-none p-4"
                                    style={{ 
                                      color: imageSettings.textColor,
                                      fontSize: `${imageSettings.textSize}px`,
                                      fontWeight: 'bold',
                                      textAlign: 'center',
                                      textShadow: '2px 2px 8px rgba(0,0,0,0.5)'
                                    }}
                                  >
                                    {imageSettings.text}
                                  </div>
                                )}
                              </div>
                            )}
                            {generatedVideo && <video src={generatedVideo} controls className="w-full" />}
                            {generatedAudio && (
                              <div className="p-6 space-y-4">
                                <audio src={generatedAudio} controls className="w-full" />
                                <p className="text-[10px] text-center text-gray-400">تم توليد هذا الصوت باستخدام الذكاء الاصطناعي الفني</p>
                              </div>
                            )}
                          </div>

                          {/* Image Editing Tools */}
                          {generatedImage && activeTab === 'designs' && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl space-y-6"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className="accent-bg p-1.5 rounded-lg">
                                  <PenTool className="w-4 h-4 text-white" />
                                </div>
                                <h5 className="font-bold text-gray-900 text-sm">أدوات تحرير الصور الاحترافية</h5>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Adjustment Sliders */}
                                <div className="space-y-4">
                                  <div>
                                    <div className="flex justify-between mb-1">
                                      <label className="text-xs font-bold text-gray-500">السطوع</label>
                                      <span className="text-xs text-emerald-600 font-mono">{imageSettings.brightness}%</span>
                                    </div>
                                    <input 
                                      type="range" min="0" max="200" value={imageSettings.brightness}
                                      onChange={(e) => setImageSettings({...imageSettings, brightness: parseInt(e.target.value)})}
                                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                  </div>
                                  <div>
                                    <div className="flex justify-between mb-1">
                                      <label className="text-xs font-bold text-gray-500">التباين</label>
                                      <span className="text-xs text-emerald-600 font-mono">{imageSettings.contrast}%</span>
                                    </div>
                                    <input 
                                      type="range" min="0" max="200" value={imageSettings.contrast}
                                      onChange={(e) => setImageSettings({...imageSettings, contrast: parseInt(e.target.value)})}
                                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                  </div>
                                </div>

                                {/* Filters */}
                                <div className="space-y-2">
                                   <label className="text-xs font-bold text-gray-500 block mb-2">الفلاتر البصرية</label>
                                   <div className="flex flex-wrap gap-2">
                                      {FILTERS.map((f) => (
                                        <button 
                                          key={f.value}
                                          onClick={() => setImageSettings({...imageSettings, filter: f.value})}
                                          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                                            imageSettings.filter === f.value ? 'accent-bg text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                          }`}
                                        >
                                          {f.name}
                                        </button>
                                      ))}
                                   </div>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {/* Text Overlay */}
                                 <div className="space-y-2">
                                   <label className="text-xs font-bold text-gray-500">إضافة نص / شعار</label>
                                   <input 
                                      type="text" 
                                      placeholder="اكتب شيئاً هنا..."
                                      value={imageSettings.text}
                                      onChange={(e) => setImageSettings({...imageSettings, text: e.target.value})}
                                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                                   />
                                 </div>
                                 <div className="flex gap-4">
                                    <div className="flex-1">
                                      <label className="text-xs font-bold text-gray-500 block mb-1">لون النص</label>
                                      <input 
                                        type="color" 
                                        value={imageSettings.textColor}
                                        onChange={(e) => setImageSettings({...imageSettings, textColor: e.target.value})}
                                        className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <label className="text-xs font-bold text-gray-500 block mb-1">حجم الخط</label>
                                      <select 
                                        value={imageSettings.textSize}
                                        onChange={(e) => setImageSettings({...imageSettings, textSize: parseInt(e.target.value)})}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5 text-xs outline-none"
                                      >
                                        {[12, 16, 24, 32, 48, 64, 82].map(s => <option key={s} value={s}>{s}px</option>)}
                                      </select>
                                    </div>
                                 </div>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {groundingLinks.length > 0 && (
                          <div className="grid grid-cols-1 gap-2">
                             <p className="text-[10px] font-bold text-gray-400 mb-1">المصادر والروابط ذات الصلة:</p>
                             {groundingLinks.map((l, i) => (
                               <a key={i} href={l.uri} target="_blank" className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-emerald-300 transition-colors group">
                                 <span className="text-[11px] font-medium text-gray-700 truncate max-w-[200px]">{l.title}</span>
                                 <ArrowRight size={12} className="-rotate-45 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                               </a>
                             ))}
                          </div>
                        )}

                        {/* Results for other types already handled by generic result block or specialized blocks */}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="accent-bg rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-emerald-100">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">هل أنت مستعد لدخول عالم صناعة المحتوى الذكي؟</h2>
              <p className="text-xl text-emerald-50 mb-12 max-w-2xl mx-auto">
                انضم إلى أكثر من 50,000 مبدع يستخدمون باسم AI يومياً لتنمية أعمالهم وزيادة تفاعلهم.
              </p>
              <button 
                onClick={() => {
                  const previewSection = document.getElementById('ai-preview');
                  if (previewSection) previewSection.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-12 py-5 bg-white text-emerald-600 rounded-full text-xl font-bold hover:scale-105 transition-all shadow-2xl"
              >
                ابدأ رحلتك المجانية الآن
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section inside Support/FAQ */}
      <section className="py-20 bg-gray-50/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
             <h2 className="text-3xl font-black text-gray-900 mb-4">الأسئلة الشائعة</h2>
             <p className="text-gray-500 font-medium italic">كل ما تحتاج معرفته عن منصة باسم</p>
          </div>
          <div className="space-y-4">
             {[
               { q: 'هل يدعم باسم AI جميع اللهجات العربية؟', a: 'نعم، المنصة مدربة على فهم واستجابة مختلف اللهجات العربية بذكاء، مما يجعل المحتوى يبدو طبيعياً وموجهاً لجمهورك المحلي.' },
               { q: 'كيف أحصل على مفتاح API؟', a: 'حالياً نقوم بتوفير المفاتيح ضمن اشتراكاتنا الاحترافية. يمكنك التواصل معنا عبر الدعم الفني للحصول على وصول خاص.' },
               { q: 'هل يمكنني استخدام الصور المولدة تجارياً؟', a: 'بالتأكيد، جميع المحتويات المولدة عبر باسم AI سواء كانت نصوصاً أو صوراً هي ملك لك بالكامل ويمكنك استخدامها في مشاريعك التجارية.' },
             ].map((item, i) => (
               <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-200 transition-all">
                  <h4 className="font-black text-gray-900 mb-2">{item.q}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">{item.a}</p>
               </div>
             ))}
          </div>
        </div>
      </section>
      </>
      ) : currentPage === 'privacy' ? (
        <LegalPage title="سياسة الخصوصية" content={PRIVACY_CONTENT} onBack={() => setCurrentPage('home')} />
      ) : currentPage === 'terms' ? (
        <LegalPage title="شروط الاستخدام" content={TERMS_CONTENT} onBack={() => setCurrentPage('home')} />
      ) : currentPage === 'support' ? (
        <SupportPage onBack={() => setCurrentPage('home')} />
      ) : currentPage === 'blog' ? (
        <BlogPage onBack={() => setCurrentPage('home')} />
      ) : (
        <ContactPage onBack={() => setCurrentPage('home')} />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-right">
            <div className="col-span-1 md:col-span-1 space-y-6">
              <div className="flex items-center gap-2">
                <div className="accent-bg p-2 rounded-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-gray-900">باسم AI</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                المنصة العربية الأولى المتكاملة لصناعة المحتوى الرقمي بذكاء اصطناعي فائق التطور. نساعدك لتنمو وتتصدر المشهد بلمحة بصر.
              </p>
              <div className="flex gap-4">
                {[Globe, Heart, Share2].map((Icon, i) => (
                  <button key={i} className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all">
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-widest">المنصة</h4>
              <ul className="space-y-4">
                {NAVBAR_LINKS.map(l => (
                  <li key={l.name}><a href={l.href} className="text-gray-500 hover:text-emerald-600 transition-colors text-sm">{l.name}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-widest">الدعم</h4>
              <ul className="space-y-4 text-sm">
                <li><button onClick={() => setCurrentPage('support')} className="text-gray-500 hover:text-emerald-600 transition-colors">مركز المساعدة</button></li>
                <li><button onClick={() => setCurrentPage('privacy')} className="text-gray-500 hover:text-emerald-600 transition-colors">سياسة الخصوصية</button></li>
                <li><button onClick={() => setCurrentPage('terms')} className="text-gray-500 hover:text-emerald-600 transition-colors">شروط الاستخدام</button></li>
                <li><button onClick={() => setCurrentPage('contact')} className="text-gray-500 hover:text-emerald-600 transition-colors">اتصل بنا</button></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-widest">النشرة الإخبارية</h4>
              <p className="text-gray-500 text-sm">احصل على أحدث الترندات وأخبار الذكاء الاصطناعي مباشرة في بريدك.</p>
              <div className="relative">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  alert('شكراً لاشتراكك! سيصلك كل جديد قريباً.');
                  (e.target as HTMLFormElement).reset();
                }}>
                  <input type="email" required placeholder="بريدك الإلكتروني" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                  <button type="submit" className="absolute left-1 top-1 bottom-1 px-4 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all">اشترك</button>
                </form>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
            <p className="text-gray-400 text-xs text-center">© {new Date().getFullYear()} باسم AI. جميع الحقوق محفوظة.</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>صنع بكل ❤️ لدعم المحتوى العربي</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 md:p-12 text-center"
            >
              <button 
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="accent-bg w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-3xl font-black text-gray-900 mb-2">
                {authMode === 'login' ? 'مرحباً بعودتك' : 'انضم إلينا اليوم'}
              </h2>
              <p className="text-gray-500 mb-8 font-sans">
                {authMode === 'login' ? 'سجل دخولك لمتابعة إبداعاتك' : 'ابدأ رحلة صناعة المحتوى الذكي مجاناً'}
              </p>

              <div className="space-y-4 text-right">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 mr-2 uppercase tracking-widest">الاسم الكامل</label>
                    <input type="text" placeholder="باسم محمد" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 mr-2 uppercase tracking-widest">البريد الإلكتروني</label>
                  <input type="email" placeholder="example@domain.com" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 mr-2 uppercase tracking-widest">كلمة المرور</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                </div>
              </div>

              <button 
                onClick={() => {
                  setIsAuthModalOpen(false);
                }}
                className="w-full accent-bg text-white py-5 rounded-2xl font-bold text-lg mt-8 shadow-xl shadow-emerald-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <ShieldCheck size={20} />
                {authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حسابي المجاني'}
              </button>

              <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col gap-4">
                <button 
                  onClick={async () => {
                    try {
                      await signInWithPopup(auth, googleProvider);
                      setIsAuthModalOpen(false);
                    } catch (error: any) {
                      if (error.code === 'auth/popup-closed-by-user') {
                        console.log('User closed the auth popup');
                        return;
                      }
                      console.error("Google login failed", error);
                      alert("فشل تسجيل الدخول. يرجى التأكد من السماح بالنوافذ المنبثقة والمحاولة مرة أخرى.");
                    }
                  }}
                  className="w-full py-4 rounded-2xl border border-gray-100 font-bold text-gray-600 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all">
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                  المتابعة باستخدام جوجل
                </button>
                
                <p className="text-gray-500 text-sm">
                  {authMode === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}{' '}
                  <button 
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="text-emerald-600 font-bold hover:underline"
                  >
                    {authMode === 'login' ? 'سجل الآن مجاناً' : 'سجل دخولك'}
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Subpage Components
const LegalPage = ({ title, content, onBack }: any) => (
  <div className="pt-32 pb-20 max-w-4xl mx-auto px-4">
    <button onClick={onBack} className="mb-8 flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all">
      <ChevronLeft className="rotate-180" size={18} />
      العودة للرئيسية
    </button>
    <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-gray-100">
      <h1 className="text-4xl font-black text-gray-900 mb-8">{title}</h1>
      <div className="prose prose-emerald max-w-none text-right" dir="rtl">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  </div>
);

const SupportPage = ({ onBack }: any) => (
  <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 text-right" dir="rtl">
     <button onClick={onBack} className="mb-8 flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all">
      <ChevronLeft className="rotate-180" size={18} />
      العودة للرئيسية
    </button>
    <div className="text-center mb-12">
      <h1 className="text-4xl font-black text-gray-900 mb-4">مركز المساعدة والأسئلة الشائعة</h1>
      <p className="text-gray-500">نحن هنا لمساعدتك في كل خطوة</p>
    </div>
    <div className="grid gap-6">
      {[
        { q: 'كيف أبدأ باستخدام المنصة؟', a: 'ببساطة قم بالتسجيل واختيار نوع المحتوى الذي ترغب في إنشائه، ثم اكتب وصفاً بسيطاً وسيقوم الذكاء الاصطناعي بالباقي.' },
        { q: 'هل المحتوى المولّد حصري لي؟', a: 'نعم، كل محتوى يتم توليده هو فريد تماماً ومخصص لطلبك ولا يتكرر.' },
        { q: 'ما هي طرق الدفع المتاحة؟', a: 'ندعم الدفع عبر البطاقات الائتمانية، ومدى، وبايبال.' },
        { q: 'كيف أتواصل مع الدعم الفني؟', a: 'يمكنك إرسال رسالة مباشرة عبر البريد الإلكتروني أو نموذج اتصل بنا أسفل الصفحة.' }
      ].map((item, i) => (
        <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:border-emerald-200 transition-all cursor-pointer group">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">{item.q}</h3>
            <ChevronDown className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
          </div>
          <p className="mt-4 text-gray-500 text-sm leading-relaxed hidden group-hover:block">{item.a}</p>
        </div>
      ))}
    </div>
    <div className="mt-12 p-8 bg-emerald-50 rounded-[2rem] text-center">
      <h4 className="font-bold text-emerald-900 mb-2">ما زلت بحاجة للمساعدة؟</h4>
      <p className="text-emerald-700 text-sm mb-6">فريقنا متاح دائماً للإجابة على استفساراتك</p>
      <button className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all">تحدث معنا الآن</button>
    </div>
  </div>
);

const BlogPage = ({ onBack }: any) => (
  <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 text-right" dir="rtl">
    <button onClick={onBack} className="mb-8 flex items-center gap-2 text-emerald-600 font-bold">
      <ChevronLeft className="rotate-180" size={18} />
      العودة للرئيسية
    </button>
    <div className="text-center mb-16">
      <h1 className="text-4xl font-black text-gray-900 mb-4">مدونة باسم AI</h1>
      <p className="text-gray-500">مواضيع تهمك عن الذكاء الاصطناعي والتسويق الرقمي</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-xl transition-all">
          <div className="h-56 overflow-hidden">
            <img src={`https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&u=${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
          </div>
          <div className="p-8">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-emerald-600 uppercase tracking-widest">
              <Sparkles size={12} />
              <span>تقنية</span>
            </div>
            <h3 className="font-bold text-xl mb-4 group-hover:text-emerald-600 transition-colors">مستقبل المحتوى العربي في عصر الذكاء الاصطناعي</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">كيف يمكن للذكاء الاصطناعي تغيير قواعد اللعبة للمؤثرين والشركات في منطقة الشرق الأوسط...</p>
            <button className="flex items-center gap-2 text-gray-900 font-bold text-sm border-b-2 border-transparent hover:border-emerald-500 transition-all pb-1">
              اقرأ المزيد 
              <ArrowRight size={14} className="rotate-180" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ContactPage = ({ onBack }: any) => {
  const [submitted, setSubmitted] = useState(false);
  
  return (
    <div className="pt-32 pb-20 max-w-2xl mx-auto px-4">
      <button onClick={onBack} className="mb-8 flex items-center gap-2 text-emerald-600 font-bold">
        <ChevronLeft className="rotate-180" size={18} />
        العودة للرئيسية
      </button>
      <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-gray-100">
        <h1 className="text-4xl font-black text-gray-900 mb-8 text-center">تواصل معنا</h1>
        {submitted ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">تم الإرسال بنجاح!</h2>
            <p className="text-gray-500 leading-relaxed mb-8">نشكرك على تواصلك معنا، سيقوم فريقنا بالرد عليك في أقرب وقت ممكن.</p>
            <button onClick={() => setSubmitted(false)} className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">إرسال رسالة أخرى</button>
          </div>
        ) : (
          <form className="space-y-6 text-right" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
            <div className="grid grid-cols-2 gap-4 text-right">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 mr-2 uppercase tracking-widest">الاسم</label>
                <input required type="text" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 mr-2 uppercase tracking-widest">رقم الهاتف</label>
                <input type="tel" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 mr-2 uppercase tracking-widest">البريد الإلكتروني</label>
              <input required type="email" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 mr-2 uppercase tracking-widest">موضوع الرسالة</label>
              <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 mr-2 uppercase tracking-widest">الرسالة</label>
              <textarea required className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500 h-40 resize-none"></textarea>
            </div>
            <button className="w-full accent-bg text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-emerald-100 hover:scale-[1.02] active:scale-95 transition-all">إرسال الرسالة</button>
          </form>
        )}
      </div>
    </div>
  );
};

// Constants for legal content
const PRIVACY_CONTENT = `
# سياسة الخصوصية لمنصة باسم AI

نحن في **باسم AI** نقدر خصوصيتك ونتعهد بحماية بياناتك الشخصية وفقاً لأعلى معايير الأمان.

### 1. البيانات التي نجمعها
نحن نجمع البيانات الضرورية فقط لتقديم خدماتنا، بما في ذلك:
- **معلومات الحساب:** الاسم، البريد الإلكتروني، والصورة الشخصية (في حال التسجيل عبر جوجل).
- **البيانات التقنية:** مثل عنوان IP ونوع المتصفح لتحسين استقرار المنصة.
- **سجلات التوليد:** المحتوى الذي يتم إنشاؤه عبر الذكاء الاصطناعي يتم حفظه لتسهيل الرجوع إليه في "سجل العمليات".

### 2. كيف نستخدم بياناتك
نستخدم المعلومات التي نجمعها لـ:
- تقديم وتحسين وظائف المنصة.
- تخصيص تجربة المستخدم (مثل ترشيحات المحتوى).
- التواصل معك بخصوص التحديثات الهامة أو العروض الخاصة.

### 3. أمن البيانات
نستخدم تقنيات التشفير المتقدمة (SSL) لحماية بياناتك من الوصول غير المصرح به. يتم تخزين البيانات بشكل آمن في قواعد بيانات مشفرة.

### 4. حقوقك
لك الحق في:
- الوصول إلى بياناتك الشخصية أو تعديلها.
- طلب حذف حسابك وبياناتك بالكامل في أي وقت.

---
*آخر تحديث: أبريل 2026*
`;

const TERMS_CONTENT = `
# شروط الاستخدام لمنصة باسم AI

باستخدامك لمنصة **باسم AI**، فإنك تقر وتوافق على الالتزام بالشروط والأحكام التالية:

### 1. الاستخدام المقبول
يجب استخدام المنصة في أغراض قانونية وأخلاقية فقط. يُحظر تماماً استخدام المنصة لإنتاج:
- محتوى يحض على الكراهية أو العنف.
- معلومات مضللة أو غير صحيحة بشكل متعمد.
- انتهاك حقوق الملكية الفكرية للآخرين.

### 2. الملكية الفكرية
- **المحتوى المولد:** جميع النصوص والصور والفيديوهات التي يتم إنشاؤها عبر باسم AI هي **ملك للمستخدم بالكامل**، وله كامل الحق في استخدامها تجارياً.
- **حقوق النظام:** تظل حقوق البرنامج والواجهات والعلامة التجارية "باسم AI" ملكية حصرية لنا.

### 3. الحسابات
- المستخدم مسؤول عن الحفاظ على سرية معلومات حسابه.
- يحق للمنصة إيقاف أي حساب ينتهك شروط الاستخدام دون إشعار مسبق.

### 4. حدود المسؤولية
بينما نسعى لتقديم أدق النتائج باستخدام تقنيات Gemini المتقدمة، إلا أننا لا نتحمل المسؤولية عن أي خسائر مباشرة أو غير مباشرة ناتجة عن استخدام المحتوى المولد.

---
*باستخدامك للمنصة، أنت توافق على هذه الشروط.*
`;
