import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import ClinicDetail from './pages/ClinicDetail';

const queryClient = new QueryClient();

export type Clinic = {
  id: number;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  services: string[];
  schedule: { [key: string]: string };
  reviews: Review[];
};

export type Review = {
  id: number;
  author: string;
  rating: number;
  date: string;
  text: string;
  avatar?: string;
};

const clinicsData: Clinic[] = [
  {
    id: 1,
    name: 'Стоматология "Белый Кит"',
    image: 'https://cdn.poehali.dev/projects/2aa2b148-44c7-4f4d-95d3-92715d54ad4e/files/fedcde2a-f6c0-4a94-a74e-490854a950ec.jpg',
    rating: 4.8,
    reviewCount: 342,
    address: 'ул. Баумана, 58, Казань',
    phone: '+7 (843) 555-01-01',
    email: 'info@belykitdent.ru',
    website: 'https://belykitdent.ru',
    description: 'Современная стоматологическая клиника с новейшим оборудованием и командой профессионалов. Специализируемся на имплантации, протезировании и эстетической стоматологии.',
    services: ['Имплантация', 'Протезирование', 'Отбеливание', 'Лечение кариеса', 'Брекеты', 'Детская стоматология'],
    schedule: {
      'Пн-Пт': '8:00 - 21:00',
      'Сб': '9:00 - 18:00',
      'Вс': '10:00 - 16:00'
    },
    reviews: [
      {
        id: 1,
        author: 'Анна Петрова',
        rating: 5,
        date: '2024-11-20',
        text: 'Отличная клиника! Делала имплантацию у доктора Иванова. Всё прошло безболезненно, персонал очень внимательный. Рекомендую!'
      },
      {
        id: 2,
        author: 'Дмитрий Смирнов',
        rating: 4,
        date: '2024-11-15',
        text: 'Хорошее оборудование, современный подход. Единственный минус - иногда приходится долго ждать приёма.'
      }
    ]
  },
  {
    id: 2,
    name: 'Дентал Клиник',
    image: 'https://cdn.poehali.dev/projects/2aa2b148-44c7-4f4d-95d3-92715d54ad4e/files/0b52ebc8-a6e9-45b8-b941-cfbd0f34dbb0.jpg',
    rating: 4.9,
    reviewCount: 567,
    address: 'пр. Победы, 125, Казань',
    phone: '+7 (843) 555-02-02',
    email: 'info@dentalclinic.ru',
    website: 'https://dentalclinic.ru',
    description: 'Премиальная стоматология европейского уровня. Используем только сертифицированные материалы от ведущих производителей.',
    services: ['Имплантация', 'Виниры', 'Отбеливание Zoom', 'Лечение под микроскопом', 'Ортодонтия', '3D-диагностика'],
    schedule: {
      'Пн-Пт': '9:00 - 20:00',
      'Сб-Вс': '10:00 - 18:00'
    },
    reviews: [
      {
        id: 3,
        author: 'Елена Волкова',
        rating: 5,
        date: '2024-11-22',
        text: 'Лучшая клиника в городе! Поставила виниры - результат превзошел все ожидания. Доктор Соколов - настоящий профессионал!'
      }
    ]
  },
  {
    id: 3,
    name: 'СмайлПлюс',
    image: 'https://cdn.poehali.dev/projects/2aa2b148-44c7-4f4d-95d3-92715d54ad4e/files/0879615b-4e06-4e60-96a3-22d4bffb27d1.jpg',
    rating: 4.6,
    reviewCount: 234,
    address: 'ул. Петербургская, 45, Казань',
    phone: '+7 (843) 555-03-03',
    email: 'info@smileplus.ru',
    website: 'https://smileplus.ru',
    description: 'Семейная стоматология с демократичными ценами. Работаем для всей вашей семьи - от детей до взрослых.',
    services: ['Лечение кариеса', 'Удаление зубов', 'Детская стоматология', 'Профгигиена', 'Пломбы', 'Коронки'],
    schedule: {
      'Пн-Пт': '8:00 - 20:00',
      'Сб': '9:00 - 15:00',
      'Вс': 'Выходной'
    },
    reviews: [
      {
        id: 4,
        author: 'Игорь Козлов',
        rating: 5,
        date: '2024-11-18',
        text: 'Отличное соотношение цены и качества. Лечил зубы всей семьей. Все довольны!'
      }
    ]
  },
  {
    id: 4,
    name: 'Зубная Фея',
    image: 'https://cdn.poehali.dev/projects/2aa2b148-44c7-4f4d-95d3-92715d54ad4e/files/fedcde2a-f6c0-4a94-a74e-490854a950ec.jpg',
    rating: 4.7,
    reviewCount: 189,
    address: 'ул. Пушкина, 27, Казань',
    phone: '+7 (843) 555-04-04',
    email: 'info@zubnayafeya.ru',
    website: 'https://zubnayafeya.ru',
    description: 'Специализированная детская стоматология. Создаем комфортную атмосферу для маленьких пациентов.',
    services: ['Детская стоматология', 'Серебрение зубов', 'Фторирование', 'Лечение молочных зубов', 'Ортодонтия для детей'],
    schedule: {
      'Пн-Пт': '9:00 - 19:00',
      'Сб': '10:00 - 16:00',
      'Вс': 'Выходной'
    },
    reviews: [
      {
        id: 5,
        author: 'Мария Соколова',
        rating: 5,
        date: '2024-11-10',
        text: 'Прекрасная клиника для детей! Ребенок больше не боится стоматолога. Спасибо докторам!'
      }
    ]
  },
  {
    id: 5,
    name: 'Дент Престиж',
    image: 'https://cdn.poehali.dev/projects/2aa2b148-44c7-4f4d-95d3-92715d54ad4e/files/0b52ebc8-a6e9-45b8-b941-cfbd0f34dbb0.jpg',
    rating: 4.9,
    reviewCount: 412,
    address: 'ул. Чернышевского, 33, Казань',
    phone: '+7 (843) 555-05-05',
    email: 'info@dentprestige.ru',
    website: 'https://dentprestige.ru',
    description: 'VIP-стоматология для требовательных клиентов. Индивидуальный подход и высочайший уровень сервиса.',
    services: ['Имплантация Nobel', 'Люминиры', 'Седация', 'Комплексная реабилитация', 'Эстетика улыбки', 'Пародонтология'],
    schedule: {
      'Пн-Сб': '9:00 - 21:00',
      'Вс': 'По записи'
    },
    reviews: [
      {
        id: 6,
        author: 'Александр Морозов',
        rating: 5,
        date: '2024-11-23',
        text: 'Выбираю только лучшее. Дент Престиж полностью оправдал ожидания. Профессионализм на высшем уровне!'
      }
    ]
  },
  {
    id: 6,
    name: 'Стома Лайф',
    image: 'https://cdn.poehali.dev/projects/2aa2b148-44c7-4f4d-95d3-92715d54ad4e/files/fedcde2a-f6c0-4a94-a74e-490854a950ec.jpg',
    rating: 4.5,
    reviewCount: 156,
    address: 'ул. Декабристов, 89, Казань',
    phone: '+7 (843) 555-06-06',
    email: 'info@stomalife.ru',
    website: 'https://stomalife.ru',
    description: 'Многопрофильная стоматология с опытными врачами. Работаем на результат, который радует годами.',
    services: ['Терапия', 'Хирургия', 'Ортопедия', 'Имплантация', 'Профилактика', 'Отбеливание'],
    schedule: {
      'Пн-Пт': '8:00 - 20:00',
      'Сб': '9:00 - 17:00',
      'Вс': 'Выходной'
    },
    reviews: [
      {
        id: 7,
        author: 'Ольга Никитина',
        rating: 4,
        date: '2024-11-12',
        text: 'Хорошая клиника, опытные врачи. Цены средние по городу.'
      }
    ]
  }
];

const AppContent = () => {
  const [selectedClinic, setSelectedClinic] = useState<number | null>(null);
  const currentClinic = selectedClinic ? clinicsData.find(c => c.id === selectedClinic) : null;

  return (
    <div className="min-h-screen">
      {selectedClinic && currentClinic ? (
        <ClinicDetail 
          clinic={currentClinic} 
          onBack={() => setSelectedClinic(null)}
        />
      ) : (
        <Index 
          clinics={clinicsData}
          onSelectClinic={setSelectedClinic}
        />
      )}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
