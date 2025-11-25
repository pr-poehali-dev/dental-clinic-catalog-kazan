import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import type { Clinic } from '@/App';

type IndexProps = {
  clinics: Clinic[];
  onSelectClinic: (id: number) => void;
};

const Index = ({ clinics, onSelectClinic }: IndexProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<string>('');

  const allServices = Array.from(new Set(clinics.flatMap(c => c.services)));

  const filteredClinics = clinics.filter(clinic => {
    const matchesSearch = clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         clinic.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesService = !selectedService || clinic.services.includes(selectedService);
    return matchesSearch && matchesService;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Icon name="Sparkles" className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gradient">ДентКазань</h1>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white hover-scale">
                <Icon name="LogIn" size={18} className="mr-2" />
                Войти
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Вход в личный кабинет</DialogTitle>
                <DialogDescription>
                  Войдите, чтобы оставлять отзывы и сохранять любимые клиники
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input placeholder="Email" type="email" />
                <Input placeholder="Пароль" type="password" />
                <Button className="w-full gradient-primary text-white">Войти</Button>
                <p className="text-center text-sm text-muted-foreground">
                  Нет аккаунта? <span className="text-primary cursor-pointer hover:underline">Зарегистрироваться</span>
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </nav>

      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h2 className="text-5xl font-bold mb-6 text-gradient">
              Лучшие стоматологии Казани
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Найдите идеальную клинику для вашей улыбки. Проверенные отзывы, удобный поиск, актуальная информация.
            </p>
            
            <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">
              <div className="relative">
                <Icon name="Search" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Поиск по названию или адресу клиники..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg border-2 focus:border-primary"
                />
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant={selectedService === '' ? 'default' : 'outline'}
                  onClick={() => setSelectedService('')}
                  className={selectedService === '' ? 'gradient-primary text-white' : ''}
                >
                  Все услуги
                </Button>
                {allServices.slice(0, 5).map(service => (
                  <Button
                    key={service}
                    variant={selectedService === service ? 'default' : 'outline'}
                    onClick={() => setSelectedService(service)}
                    className={selectedService === service ? 'gradient-primary text-white' : ''}
                  >
                    {service}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle2" size={18} className="text-primary" />
                <span>{clinics.length} проверенных клиник</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Star" size={18} className="text-primary" />
                <span>Реальные отзывы пациентов</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="MapPin" size={18} className="text-primary" />
                <span>Удобный поиск по районам</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-bold">
            Найдено клиник: <span className="text-gradient">{filteredClinics.length}</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClinics.map(clinic => (
            <Card 
              key={clinic.id} 
              className="hover-scale cursor-pointer overflow-hidden border-2 hover:border-primary transition-all duration-300 animate-fade-in"
              onClick={() => onSelectClinic(clinic.id)}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={clinic.image} 
                  alt={clinic.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-bold">{clinic.rating}</span>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-xl">{clinic.name}</CardTitle>
                <CardDescription className="flex items-start gap-2">
                  <Icon name="MapPin" size={16} className="mt-1 flex-shrink-0 text-primary" />
                  <span>{clinic.address}</span>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon name="MessageSquare" size={16} className="text-primary" />
                  <span>{clinic.reviewCount} отзывов</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {clinic.services.slice(0, 3).map(service => (
                    <Badge key={service} variant="secondary" className="bg-blue-50 text-blue-700">
                      {service}
                    </Badge>
                  ))}
                  {clinic.services.length > 3 && (
                    <Badge variant="outline">+{clinic.services.length - 3}</Badge>
                  )}
                </div>
                
                <div className="pt-4 flex items-center gap-3">
                  <Button className="flex-1 gradient-primary text-white">
                    Подробнее
                    <Icon name="ArrowRight" size={16} className="ml-2" />
                  </Button>
                  <Button variant="outline" size="icon" className="hover:text-red-500 hover:border-red-500">
                    <Icon name="Heart" size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClinics.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <Icon name="SearchX" size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">Клиники не найдены</h3>
            <p className="text-gray-500">Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </section>

      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Icon name="Sparkles" className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold">ДентКазань</h3>
              </div>
              <p className="text-gray-400">
                Справочник стоматологических клиник Казани с реальными отзывами и актуальной информацией.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Контакты</h4>
              <div className="space-y-2 text-gray-400">
                <p className="flex items-center gap-2">
                  <Icon name="Phone" size={16} />
                  +7 (843) 123-45-67
                </p>
                <p className="flex items-center gap-2">
                  <Icon name="Mail" size={16} />
                  info@dentkazan.ru
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Социальные сети</h4>
              <div className="flex gap-3">
                <Button variant="outline" size="icon" className="bg-white/10 border-white/20 hover:bg-white/20">
                  <Icon name="MessageCircle" size={20} />
                </Button>
                <Button variant="outline" size="icon" className="bg-white/10 border-white/20 hover:bg-white/20">
                  <Icon name="Send" size={20} />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            © 2024 ДентКазань. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
