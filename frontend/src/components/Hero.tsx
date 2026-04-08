"use client";

import { ArrowRight, Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { TopAuthorDto } from "@/lib/api";

interface AvatarData {
  name: string;
  avatar: string;
  x: number;
  y: number;
  size: number;
  post: {
    id?: string;
    title: string;
    coverGradient: string;
    likes: number;
    comments: number;
  };
  floatDuration: number;
  floatDelay: number;
  floatRangeX: number;
  floatRangeY: number;
}

const GRADIENTS = [
  "from-amber-100 to-orange-50",
  "from-blue-100 to-sky-50",
  "from-emerald-100 to-green-50",
  "from-violet-100 to-purple-50",
  "from-rose-100 to-pink-50",
  "from-teal-100 to-cyan-50",
  "from-fuchsia-100 to-pink-50",
  "from-sky-100 to-blue-50",
  "from-amber-100 to-yellow-50",
  "from-lime-100 to-green-50",
  "from-orange-100 to-amber-50",
  "from-indigo-100 to-blue-50",
  "from-rose-100 to-red-50",
  "from-cyan-100 to-teal-50",
  "from-purple-100 to-violet-50",
];

const AVATARS: AvatarData[] = [
  // Ring 1 — outer edge (top arc)
  { name: "Aziza Sultonova", avatar: "https://i.pravatar.cc/150?img=1", x: 50, y: 2, size: 40, post: { title: "5-sinf o'quvchilarini darsga qiziqtirishning 7 ta usuli", coverGradient: GRADIENTS[0], likes: 42, comments: 8 }, floatDuration: 6, floatDelay: 0, floatRangeX: 6, floatRangeY: 5 },
  { name: "Farxod Mirzayev", avatar: "https://i.pravatar.cc/150?img=12", x: 65, y: 4, size: 36, post: { title: "Sinf boshqaruvi: tajribali o'qituvchining maslahatlari", coverGradient: GRADIENTS[1], likes: 38, comments: 12 }, floatDuration: 7, floatDelay: 1.2, floatRangeX: 5, floatRangeY: 7 },
  { name: "Nodira Rahimova", avatar: "https://i.pravatar.cc/150?img=5", x: 78, y: 10, size: 42, post: { title: "Raqamli texnologiyalarni darsda qo'llash tajribasi", coverGradient: GRADIENTS[2], likes: 56, comments: 15 }, floatDuration: 5.5, floatDelay: 0.8, floatRangeX: 7, floatRangeY: 4 },
  { name: "Dilshod Karimov", avatar: "https://i.pravatar.cc/150?img=15", x: 90, y: 20, size: 38, post: { title: "Matematika darslarida o'yin elementlarini kiritish", coverGradient: GRADIENTS[3], likes: 29, comments: 6 }, floatDuration: 8, floatDelay: 2.5, floatRangeX: 4, floatRangeY: 6 },
  { name: "Zarina Abdullayeva", avatar: "https://i.pravatar.cc/150?img=9", x: 96, y: 34, size: 34, post: { title: "Ingliz tili darslarida kommunikativ yondashuv", coverGradient: GRADIENTS[4], likes: 47, comments: 21 }, floatDuration: 7.5, floatDelay: 0.3, floatRangeX: 5, floatRangeY: 6 },
  { name: "Laziz Tursunov", avatar: "https://i.pravatar.cc/150?img=18", x: 98, y: 50, size: 40, post: { title: "Maxsus ehtiyojli bolalar bilan ishlash usullari", coverGradient: GRADIENTS[5], likes: 61, comments: 18 }, floatDuration: 6.5, floatDelay: 1.8, floatRangeX: 6, floatRangeY: 4 },
  { name: "Malika Jumayeva", avatar: "https://i.pravatar.cc/150?img=23", x: 96, y: 65, size: 36, post: { title: "Boshlang'ich sinflarda ijodiy yozuv ko'nikmalari", coverGradient: GRADIENTS[6], likes: 35, comments: 9 }, floatDuration: 7, floatDelay: 3.1, floatRangeX: 5, floatRangeY: 5 },
  { name: "Rustam Baxtiyorov", avatar: "https://i.pravatar.cc/150?img=33", x: 90, y: 78, size: 38, post: { title: "Fizika fanini hayotiy misollar bilan o'qitish", coverGradient: GRADIENTS[7], likes: 44, comments: 11 }, floatDuration: 5, floatDelay: 0.5, floatRangeX: 7, floatRangeY: 5 },
  { name: "Hulkar Saidova", avatar: "https://i.pravatar.cc/150?img=25", x: 78, y: 88, size: 42, post: { title: "O'quvchilar motivatsiyasini oshirish sirlari", coverGradient: GRADIENTS[8], likes: 53, comments: 14 }, floatDuration: 6, floatDelay: 2.2, floatRangeX: 4, floatRangeY: 7 },
  { name: "Kamoliddin Valiyev", avatar: "https://i.pravatar.cc/150?img=53", x: 65, y: 95, size: 36, post: { title: "Biologiya darslarida laboratoriya tajribalari", coverGradient: GRADIENTS[9], likes: 27, comments: 5 }, floatDuration: 8, floatDelay: 1.5, floatRangeX: 6, floatRangeY: 4 },
  { name: "Ozoda Pulatova", avatar: "https://i.pravatar.cc/150?img=29", x: 50, y: 98, size: 40, post: { title: "Ona tili darslarida kitob o'qish madaniyati", coverGradient: GRADIENTS[10], likes: 39, comments: 7 }, floatDuration: 7.5, floatDelay: 3.5, floatRangeX: 5, floatRangeY: 4 },
  { name: "Timur G'aniyev", avatar: "https://i.pravatar.cc/150?img=60", x: 35, y: 95, size: 38, post: { title: "Tarix darslarida interfaol usullar", coverGradient: GRADIENTS[11], likes: 31, comments: 13 }, floatDuration: 6.5, floatDelay: 0.7, floatRangeX: 6, floatRangeY: 6 },
  { name: "Iroda Nazarova", avatar: "https://i.pravatar.cc/150?img=44", x: 22, y: 88, size: 34, post: { title: "Maktab va ota-onalar hamkorligi tajribasi", coverGradient: GRADIENTS[12], likes: 48, comments: 16 }, floatDuration: 5.5, floatDelay: 2.8, floatRangeX: 7, floatRangeY: 5 },
  { name: "Sardor Alimov", avatar: "https://i.pravatar.cc/150?img=68", x: 10, y: 78, size: 40, post: { title: "Kimyo fanida zamonaviy o'qitish texnologiyalari", coverGradient: GRADIENTS[13], likes: 22, comments: 4 }, floatDuration: 7, floatDelay: 1.0, floatRangeX: 5, floatRangeY: 6 },
  { name: "Yulduz Umarova", avatar: "https://i.pravatar.cc/150?img=47", x: 4, y: 65, size: 36, post: { title: "Musiqa darslari orqali bolalar rivojlanishi", coverGradient: GRADIENTS[14], likes: 36, comments: 10 }, floatDuration: 6, floatDelay: 3.8, floatRangeX: 6, floatRangeY: 5 },
  { name: "Bekzod Toshmatov", avatar: "https://i.pravatar.cc/150?img=52", x: 2, y: 50, size: 42, post: { title: "Jismoniy tarbiya darslarida salomatlik asoslari", coverGradient: GRADIENTS[0], likes: 33, comments: 7 }, floatDuration: 7.5, floatDelay: 0.2, floatRangeX: 4, floatRangeY: 7 },
  { name: "Shahlo Ergasheva", avatar: "https://i.pravatar.cc/150?img=32", x: 4, y: 34, size: 38, post: { title: "Geografiya darslarida xaritalar bilan ishlash", coverGradient: GRADIENTS[1], likes: 28, comments: 5 }, floatDuration: 6, floatDelay: 2.0, floatRangeX: 6, floatRangeY: 4 },
  { name: "Jamshid Xolmatov", avatar: "https://i.pravatar.cc/150?img=57", x: 10, y: 20, size: 36, post: { title: "O'quvchilarda tanqidiy fikrlashni rivojlantirish", coverGradient: GRADIENTS[2], likes: 51, comments: 19 }, floatDuration: 5.5, floatDelay: 1.4, floatRangeX: 7, floatRangeY: 5 },
  { name: "Dilfuza Mamatova", avatar: "https://i.pravatar.cc/150?img=16", x: 22, y: 10, size: 40, post: { title: "Maktabgacha ta'limda o'yin texnologiyalari", coverGradient: GRADIENTS[3], likes: 45, comments: 8 }, floatDuration: 8, floatDelay: 3.3, floatRangeX: 5, floatRangeY: 6 },
  { name: "Otabek Rahmonov", avatar: "https://i.pravatar.cc/150?img=61", x: 36, y: 4, size: 34, post: { title: "Informatika fanini qiziqarli qilish usullari", coverGradient: GRADIENTS[4], likes: 40, comments: 11 }, floatDuration: 7, floatDelay: 0.9, floatRangeX: 6, floatRangeY: 7 },

  // Ring 2 — inner ring
  { name: "Gulnora Karimova", avatar: "https://i.pravatar.cc/150?img=20", x: 50, y: 18, size: 44, post: { title: "Darsda guruh ishlari samaradorligi", coverGradient: GRADIENTS[5], likes: 55, comments: 17 }, floatDuration: 6.5, floatDelay: 0.4, floatRangeX: 5, floatRangeY: 5 },
  { name: "Anvar Yusupov", avatar: "https://i.pravatar.cc/150?img=51", x: 68, y: 22, size: 38, post: { title: "Chet tili darslarida audio materiallar", coverGradient: GRADIENTS[6], likes: 32, comments: 9 }, floatDuration: 7.5, floatDelay: 2.1, floatRangeX: 6, floatRangeY: 4 },
  { name: "Sevara Usmanova", avatar: "https://i.pravatar.cc/150?img=43", x: 80, y: 36, size: 42, post: { title: "Talabalar bilan individual yondashuv sirlari", coverGradient: GRADIENTS[7], likes: 49, comments: 14 }, floatDuration: 5, floatDelay: 1.6, floatRangeX: 4, floatRangeY: 6 },
  { name: "Nodir Xamrayev", avatar: "https://i.pravatar.cc/150?img=55", x: 84, y: 54, size: 36, post: { title: "Matematikadan olimpiada tayyorgarligi", coverGradient: GRADIENTS[8], likes: 63, comments: 22 }, floatDuration: 6, floatDelay: 3.0, floatRangeX: 7, floatRangeY: 5 },
  { name: "Madina Aliyeva", avatar: "https://i.pravatar.cc/150?img=26", x: 78, y: 70, size: 40, post: { title: "San'at darslari orqali ijodkorlikni rivojlantirish", coverGradient: GRADIENTS[9], likes: 37, comments: 6 }, floatDuration: 7, floatDelay: 0.6, floatRangeX: 5, floatRangeY: 7 },
  { name: "Ulugbek Nazarov", avatar: "https://i.pravatar.cc/150?img=59", x: 66, y: 82, size: 44, post: { title: "Pedagogik mahoratni oshirishning 10 ta yo'li", coverGradient: GRADIENTS[10], likes: 58, comments: 20 }, floatDuration: 8, floatDelay: 1.9, floatRangeX: 6, floatRangeY: 4 },
  { name: "Barno Tursunova", avatar: "https://i.pravatar.cc/150?img=21", x: 50, y: 86, size: 38, post: { title: "O'quvchilar uchun ijodiy uy vazifalar", coverGradient: GRADIENTS[11], likes: 41, comments: 13 }, floatDuration: 6.5, floatDelay: 2.7, floatRangeX: 4, floatRangeY: 6 },
  { name: "Sherzod Qodirov", avatar: "https://i.pravatar.cc/150?img=56", x: 34, y: 82, size: 42, post: { title: "Sport darslarida xavfsizlik qoidalari", coverGradient: GRADIENTS[12], likes: 25, comments: 4 }, floatDuration: 5.5, floatDelay: 3.6, floatRangeX: 7, floatRangeY: 5 },
  { name: "Nasiba Xasanova", avatar: "https://i.pravatar.cc/150?img=36", x: 22, y: 70, size: 36, post: { title: "Adabiyot darslarida munozara o'tkazish", coverGradient: GRADIENTS[13], likes: 43, comments: 15 }, floatDuration: 7.5, floatDelay: 0.1, floatRangeX: 5, floatRangeY: 6 },
  { name: "Firdavs Xoliqov", avatar: "https://i.pravatar.cc/150?img=62", x: 16, y: 54, size: 40, post: { title: "Dars rejalarini tuzishda kreativlik", coverGradient: GRADIENTS[14], likes: 34, comments: 8 }, floatDuration: 6, floatDelay: 2.4, floatRangeX: 6, floatRangeY: 4 },
  { name: "Robiya Mirzayeva", avatar: "https://i.pravatar.cc/150?img=38", x: 18, y: 36, size: 44, post: { title: "Matematikada amaliy masalalar yechish usullari", coverGradient: GRADIENTS[0], likes: 52, comments: 18 }, floatDuration: 7, floatDelay: 1.3, floatRangeX: 4, floatRangeY: 7 },
  { name: "Dostonbek Solijonov", avatar: "https://i.pravatar.cc/150?img=50", x: 30, y: 20, size: 38, post: { title: "Kompyuter savodxonligi asoslarini o'rgatish", coverGradient: GRADIENTS[1], likes: 30, comments: 7 }, floatDuration: 5, floatDelay: 3.4, floatRangeX: 7, floatRangeY: 5 },

  // Ring 3 — center cluster
  { name: "Kamola Ibragimova", avatar: "https://i.pravatar.cc/150?img=19", x: 42, y: 30, size: 48, post: { title: "Zamonaviy darsxonada interaktiv doska qo'llash", coverGradient: GRADIENTS[2], likes: 67, comments: 24 }, floatDuration: 6.5, floatDelay: 0.7, floatRangeX: 5, floatRangeY: 5 },
  { name: "Baxtiyor Ergashev", avatar: "https://i.pravatar.cc/150?img=14", x: 58, y: 34, size: 46, post: { title: "O'quvchilarda kitob o'qish ishtiyoqini uyg'otish", coverGradient: GRADIENTS[3], likes: 59, comments: 21 }, floatDuration: 7.5, floatDelay: 2.3, floatRangeX: 4, floatRangeY: 6 },
  { name: "Nilufar Sodiqova", avatar: "https://i.pravatar.cc/150?img=48", x: 66, y: 48, size: 50, post: { title: "Inklyuziv ta'limda muvaffaqiyat sirlari", coverGradient: GRADIENTS[4], likes: 72, comments: 28 }, floatDuration: 5.5, floatDelay: 1.1, floatRangeX: 6, floatRangeY: 4 },
  { name: "Abdullo Rajabov", avatar: "https://i.pravatar.cc/150?img=65", x: 60, y: 64, size: 44, post: { title: "Kimyoviy tajribalarni xavfsiz o'tkazish qoidalari", coverGradient: GRADIENTS[5], likes: 38, comments: 10 }, floatDuration: 8, floatDelay: 3.2, floatRangeX: 5, floatRangeY: 7 },
  { name: "Durdona Hamidova", avatar: "https://i.pravatar.cc/150?img=31", x: 44, y: 72, size: 46, post: { title: "Boshlang'ich sinflarda o'qishga o'rgatish metodlari", coverGradient: GRADIENTS[6], likes: 54, comments: 16 }, floatDuration: 6, floatDelay: 0.5, floatRangeX: 7, floatRangeY: 5 },
  { name: "Mirzo Umarov", avatar: "https://i.pravatar.cc/150?img=58", x: 30, y: 62, size: 42, post: { title: "Fizikadan tajriba darslarini tashkil etish", coverGradient: GRADIENTS[7], likes: 46, comments: 12 }, floatDuration: 7, floatDelay: 2.6, floatRangeX: 4, floatRangeY: 6 },
  { name: "Feruza Ortiqova", avatar: "https://i.pravatar.cc/150?img=39", x: 28, y: 44, size: 48, post: { title: "Bolalar psixologiyasi va o'qituvchi munosabati", coverGradient: GRADIENTS[8], likes: 65, comments: 25 }, floatDuration: 5, floatDelay: 1.7, floatRangeX: 6, floatRangeY: 4 },
  { name: "Sanjar Toshpulatov", avatar: "https://i.pravatar.cc/150?img=54", x: 38, y: 34, size: 36, post: { title: "Ona tilida imlo savodxonligini oshirish", coverGradient: GRADIENTS[9], likes: 33, comments: 9 }, floatDuration: 6.5, floatDelay: 3.9, floatRangeX: 5, floatRangeY: 5 },

  // Extra scattered
  { name: "Mohira Qosimova", avatar: "https://i.pravatar.cc/150?img=42", x: 50, y: 50, size: 54, post: { title: "Eng yaxshi o'qituvchi bo'lishning 5 ta siri", coverGradient: GRADIENTS[10], likes: 78, comments: 32 }, floatDuration: 7.5, floatDelay: 0.8, floatRangeX: 4, floatRangeY: 4 },
  { name: "Jasur Abduraximov", avatar: "https://i.pravatar.cc/150?img=63", x: 72, y: 60, size: 34, post: { title: "Texnologiya va an'anaviy dars metodlari uyg'unligi", coverGradient: GRADIENTS[11], likes: 41, comments: 11 }, floatDuration: 6, floatDelay: 2.9, floatRangeX: 7, floatRangeY: 6 },
  { name: "Lobar Nurmatova", avatar: "https://i.pravatar.cc/150?img=35", x: 14, y: 44, size: 32, post: { title: "Maktab kutubxonasidan samarali foydalanish", coverGradient: GRADIENTS[12], likes: 26, comments: 5 }, floatDuration: 8, floatDelay: 1.2, floatRangeX: 5, floatRangeY: 7 },
  { name: "Xurshid Razzaqov", avatar: "https://i.pravatar.cc/150?img=67", x: 86, y: 44, size: 32, post: { title: "O'zbek tili grammatikasini o'rgatish usullari", coverGradient: GRADIENTS[13], likes: 37, comments: 8 }, floatDuration: 5.5, floatDelay: 3.7, floatRangeX: 6, floatRangeY: 4 },
  { name: "Sitora Yoqubova", avatar: "https://i.pravatar.cc/150?img=41", x: 44, y: 14, size: 32, post: { title: "Darsda qo'shiq va she'rlardan foydalanish", coverGradient: GRADIENTS[14], likes: 44, comments: 14 }, floatDuration: 7, floatDelay: 0.3, floatRangeX: 4, floatRangeY: 6 },
  { name: "Ravshan Salimov", avatar: "https://i.pravatar.cc/150?img=64", x: 56, y: 16, size: 34, post: { title: "Ota-onalar yig'ilishini samarali o'tkazish", coverGradient: GRADIENTS[0], likes: 50, comments: 19 }, floatDuration: 6.5, floatDelay: 2.0, floatRangeX: 7, floatRangeY: 5 },
  { name: "Hilola Tojiboyeva", avatar: "https://i.pravatar.cc/150?img=30", x: 74, y: 14, size: 32, post: { title: "Bolalar ijodkorligini rivojlantirishda san'at roli", coverGradient: GRADIENTS[1], likes: 39, comments: 10 }, floatDuration: 5, floatDelay: 1.5, floatRangeX: 5, floatRangeY: 4 },
  { name: "Murod Xasanov", avatar: "https://i.pravatar.cc/150?img=66", x: 26, y: 54, size: 34, post: { title: "Tibbiyot fanlarini o'rgatishda simulyatsiyalar", coverGradient: GRADIENTS[2], likes: 28, comments: 6 }, floatDuration: 7.5, floatDelay: 3.3, floatRangeX: 6, floatRangeY: 7 },
  { name: "Gavhar Usmonova", avatar: "https://i.pravatar.cc/150?img=37", x: 40, y: 90, size: 34, post: { title: "Darsda vaqtni to'g'ri taqsimlash san'ati", coverGradient: GRADIENTS[3], likes: 45, comments: 13 }, floatDuration: 6, floatDelay: 0.6, floatRangeX: 4, floatRangeY: 5 },
];

function CardContent({ data, postHovered }: { data: AvatarData; postHovered: boolean }) {
  return (
    <>
      <div
        className={`h-28 bg-gradient-to-br ${data.post.coverGradient} transition-[filter] duration-300 ${
          postHovered ? "" : "blur-[6px]"
        }`}
      />
      <div className="p-4">
        <p
          className={`text-[14px] font-semibold leading-snug text-[#141414] line-clamp-2 transition-[filter] duration-300 ${
            postHovered ? "" : "blur-[5px]"
          }`}
        >
          {data.post.title}
        </p>
        <div className="mt-3 pt-3 border-t border-black/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[12px] text-[#141414]/40">
              <Heart size={13} strokeWidth={1.5} />
              {data.post.likes}
            </span>
            <span className="flex items-center gap-1.5 text-[12px] text-[#141414]/40">
              <MessageCircle size={13} strokeWidth={1.5} />
              {data.post.comments}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full overflow-hidden relative shrink-0">
              <Image
                src={data.avatar}
                alt={data.name}
                fill
                className="object-cover"
                sizes="20px"
                unoptimized
              />
            </div>
            <span className="text-[11px] text-[#141414]/45 font-medium truncate max-w-[100px]">
              {data.name}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

interface FloatingAvatarProps {
  data: AvatarData;
  index: number;
  isActive: boolean;
  anotherActive: boolean;
  onActivate: (index: number) => void;
  onDeactivate: (index: number) => void;
}

function FloatingAvatar({ data, index, isActive, anotherActive, onActivate, onDeactivate }: FloatingAvatarProps) {
  const [postHovered, setPostHovered] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [cardOffset, setCardOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isActive && wrapperRef.current && !isMobile) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const cardWidth = 288;
      const cardLeft = rect.left - cardWidth / 2;
      const cardRight = rect.left + cardWidth / 2;
      const padding = 12;

      if (cardLeft < padding) {
        setCardOffset(-cardLeft + padding);
      } else if (cardRight > window.innerWidth - padding) {
        setCardOffset(window.innerWidth - padding - cardRight);
      } else {
        setCardOffset(0);
      }
    } else {
      setCardOffset(0);
    }
  }, [isActive, data.x, isMobile]);

  const show = useCallback(() => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
    onActivate(index);
  }, [index, onActivate]);

  const hide = useCallback(() => {
    hideTimeout.current = setTimeout(() => {
      onDeactivate(index);
      setPostHovered(false);
    }, 200);
  }, [index, onDeactivate]);

  return (
    <div
      ref={wrapperRef}
      className="absolute"
      style={{
        left: `${data.x}%`,
        top: `${data.y}%`,
        zIndex: isActive ? 50 : 10 + Math.min(index, 39),
        pointerEvents: anotherActive ? "none" : "auto",
      }}
    >
      {/* Floating wrapper */}
      <div
        className="relative"
        style={{
          animation: `float-${index} ${data.floatDuration}s ease-in-out infinite`,
          animationDelay: `${data.floatDelay}s`,
        }}
      >
        {/* Avatar circle */}
        <div
          className="relative rounded-full overflow-hidden cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-2 border-white transition-transform duration-300"
          style={{
            width: data.size,
            height: data.size,
            transform: `translate(-50%, -50%) ${isActive ? "scale(1.15)" : "scale(1)"}`,
            pointerEvents: "auto",
          }}
          onMouseEnter={show}
          onMouseLeave={hide}
          onClick={() => { if (isMobile) { isActive ? onDeactivate(index) : onActivate(index); } }}
        >
          <Image
            src={data.avatar}
            alt={data.name}
            fill
            className="object-cover"
            sizes={`${data.size}px`}
            unoptimized
          />
        </div>

        {/* Invisible bridge between avatar and card (desktop only) */}
        {isActive && !isMobile && (
          <div
            className="absolute"
            style={{
              top: 0,
              left: `calc(50% + ${cardOffset}px)`,
              transform: "translateX(-50%)",
              width: 288,
              height: data.size / 2 + 10,
              pointerEvents: "auto",
            }}
            onMouseEnter={show}
            onMouseLeave={hide}
          />
        )}

        {/* Desktop post card (inside floating wrapper) */}
        {!isMobile && (
          <div
            className={`
              absolute rounded-2xl overflow-hidden
              bg-white border border-black/[0.06]
              cursor-pointer
              transition-all duration-300 ease-out
              ${isActive ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
              ${postHovered ? "shadow-[0_16px_50px_rgba(0,0,0,0.14)]" : "shadow-[0_12px_40px_rgba(0,0,0,0.10)]"}
            `}
            style={{
              width: 288,
              top: data.size / 2 + 8,
              left: `calc(50% + ${cardOffset}px)`,
              transform: `translateX(-50%) translateY(${isActive ? "0" : "8px"}) scale(${postHovered ? 1.02 : 1})`,
              zIndex: 300,
            }}
            onMouseEnter={() => { show(); setPostHovered(true); }}
            onMouseLeave={() => { hide(); setPostHovered(false); }}
            onClick={() => { /* TODO: navigate to post */ }}
          >
            <CardContent data={data} postHovered={postHovered} />
          </div>
        )}
      </div>

      {/* Mobile: portal card + backdrop outside transform parent */}
      {isMobile && typeof document !== "undefined" && createPortal(
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            style={{ zIndex: 299 }}
            onClick={() => { onDeactivate(index); setPostHovered(false); }}
          />
          {/* Card */}
          <div
            className={`
              fixed left-3 right-3 bottom-4
              rounded-2xl overflow-hidden
              bg-white border border-black/[0.06]
              cursor-pointer
              transition-all duration-300 ease-out
              ${isActive ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none translate-y-4"}
              ${postHovered ? "shadow-[0_16px_50px_rgba(0,0,0,0.14)]" : "shadow-[0_12px_40px_rgba(0,0,0,0.10)]"}
            `}
            style={{ zIndex: 300 }}
            onClick={() => { setPostHovered(true); }}
          >
            <CardContent data={data} postHovered={isActive} />
          </div>
        </>,
        document.body
      )}
    </div>
  );
}


function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function authorsToAvatars(authors: TopAuthorDto[]): AvatarData[] {
  const count = authors.length;
  if (count === 0) return AVATARS;

  const rand = seededRandom(42);
  return authors.map((a, i) => {
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
    const ringOffset = rand() * 0.3;
    const radius = 0.3 + ringOffset * 0.55;
    const x = 50 + radius * 45 * Math.cos(angle) + (rand() - 0.5) * 8;
    const y = 50 + radius * 45 * Math.sin(angle) + (rand() - 0.5) * 8;
    const size = 32 + Math.floor(rand() * 24);

    return {
      name: a.author.fullName,
      avatar: a.author.profilePictureUrl || `https://i.pravatar.cc/150?u=${a.author.id}`,
      x: Math.max(2, Math.min(98, x)),
      y: Math.max(2, Math.min(98, y)),
      size,
      post: {
        id: a.topPost.id,
        title: a.topPost.title,
        coverGradient: GRADIENTS[i % GRADIENTS.length],
        likes: a.topPost.likesCount,
        comments: a.topPost.commentsCount,
      },
      floatDuration: 5 + rand() * 3,
      floatDelay: rand() * 4,
      floatRangeX: 4 + Math.floor(rand() * 5),
      floatRangeY: 4 + Math.floor(rand() * 5),
    };
  });
}

export function Hero({ topAuthors }: { topAuthors: TopAuthorDto[] }) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const avatars = useMemo(() => authorsToAvatars(topAuthors), [topAuthors]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleActivate = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleDeactivate = useCallback((index: number) => {
    setActiveIndex((prev) => (prev === index ? null : prev));
  }, []);

  const keyframes = useMemo(() =>
    avatars.map((a, i) => `
      @keyframes float-${i} {
        0%, 100% { transform: translate(0px, 0px); }
        25% { transform: translate(${a.floatRangeX * 0.6}px, -${a.floatRangeY}px); }
        50% { transform: translate(-${a.floatRangeX}px, ${a.floatRangeY * 0.4}px); }
        75% { transform: translate(${a.floatRangeX * 0.3}px, ${a.floatRangeY * 0.7}px); }
      }
    `).join("\n"),
    [avatars]
  );

  return (
    <section className="pt-24 pb-12 sm:pt-32 sm:pb-20 md:pt-40 md:pb-28 px-4 sm:px-6">
      {mounted && (
        <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      )}
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-20">
        {/* Left — text */}
        <div className="flex-1 max-w-xl text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-[3.25rem] font-semibold leading-[1.1] tracking-tight text-[#141414]">
            Samarali usullarni ulashing.
            <br />
            Birgalikda o&apos;rganing.
          </h1>
          <p className="mt-4 sm:mt-6 text-[15px] sm:text-[17px] leading-relaxed text-[#141414]/55 max-w-md mx-auto lg:mx-0">
            Tajribali o&apos;qituvchilar, yangi pedagoglar va ma&apos;murlar
            O&apos;zbekiston bo&apos;ylab isbotlangan o&apos;qitish usullarini
            ulashish va o&apos;rganish uchun birlashadigan platforma.
          </p>
          <a
            href="/experiences"
            className="
              inline-flex items-center gap-2 mt-7 sm:mt-10
              px-6 py-3 rounded-full
              bg-[#69824f] text-white text-[14px] font-medium
              hover:bg-[#576d42] transition-colors duration-200
            "
          >
            Tajribalarni ko&apos;rish
            <ArrowRight size={15} strokeWidth={2} />
          </a>
        </div>

        {/* Right — floating avatar circle composition */}
        <div className="flex-1 flex justify-center w-full">
          <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[460px] md:h-[460px]">
            {/* Faint background circle */}
            <div className="absolute inset-4 rounded-full bg-[#f5f3f0]/40" />

            {mounted &&
              avatars.map((a, i) => (
                <FloatingAvatar
                  key={i}
                  data={a}
                  index={i}
                  isActive={activeIndex === i}
                  anotherActive={activeIndex !== null && activeIndex !== i}
                  onActivate={handleActivate}
                  onDeactivate={handleDeactivate}
                />
              ))}

            {/* Handwritten arrow + label */}
            <div className="absolute -bottom-10 left-0 sm:-bottom-12 sm:-left-4 md:-bottom-10 md:-left-8 flex items-end gap-1 select-none pointer-events-none">
              <span
                className="text-[12px] sm:text-[14px] md:text-[15px] text-[#141414]/35 italic leading-tight"
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
              >
                Bizning top<br />o&apos;qituvchilar
              </span>
              <svg
                width="48"
                height="52"
                viewBox="0 0 48 52"
                fill="none"
                className="text-[#141414]/25 -mb-1 ml-1"
              >
                <path
                  d="M4 48C8 32 18 16 36 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M30 4L37 8L32 14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
