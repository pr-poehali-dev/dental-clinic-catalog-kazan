import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import type { Clinic } from '@/App';

type ClinicDetailProps = {
  clinic: Clinic;
  onBack: () => void;
};

const StarRating = ({ rating, size = 20, editable = false, onChange }: { 
  rating: number; 
  size?: number; 
  editable?: boolean;
  onChange?: (rating: number) => void;
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => {
        const filled = editable ? (hoverRating || rating) >= star : rating >= star;
        return (
          <Icon
            key={star}
            name="Star"
            size={size}
            className={`${filled ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} ${editable ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onMouseEnter={() => editable && setHoverRating(star)}
            onMouseLeave={() => editable && setHoverRating(0)}
            onClick={() => editable && onChange?.(star)}
          />
        );
      })}
    </div>
  );
};

const ClinicDetail = ({ clinic, onBack }: ClinicDetailProps) => {
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');

  const handleSubmitReview = () => {
    console.log('New review:', { rating: newReviewRating, text: newReviewText });
    setNewReviewText('');
    setNewReviewRating(5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="hover-scale">
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            Назад
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Icon name="Sparkles" className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gradient">ДентКазань</h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="relative h-80 rounded-3xl overflow-hidden mb-8 animate-fade-in shadow-2xl">
          <img 
            src={clinic.image} 
            alt={clinic.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div className="absolute bottom-8 left-8 text-white">
            <h1 className="text-5xl font-bold mb-4">{clinic.name}</h1>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                <Icon name="Star" size={20} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xl font-bold">{clinic.rating}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                <Icon name="MessageSquare" size={20} />
                <span>{clinic.reviewCount} отзывов</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="animate-fade-in border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="FileText" className="text-primary" />
                  О клинике
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-lg leading-relaxed">{clinic.description}</p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Stethoscope" className="text-primary" />
                  Услуги
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {clinic.services.map(service => (
                    <Badge key={service} variant="secondary" className="px-4 py-2 text-sm bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 hover:from-blue-100 hover:to-purple-100">
                      {service}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="reviews" className="animate-fade-in">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="reviews" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
                  <Icon name="MessageSquare" size={18} className="mr-2" />
                  Отзывы ({clinic.reviews.length})
                </TabsTrigger>
                <TabsTrigger value="add-review" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
                  <Icon name="PenSquare" size={18} className="mr-2" />
                  Написать отзыв
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="reviews" className="space-y-4 mt-6">
                {clinic.reviews.map(review => (
                  <Card key={review.id} className="border-2 hover:border-primary transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{review.author}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-2">
                            <StarRating rating={review.rating} size={16} />
                            <span className="text-xs">
                              {new Date(review.date).toLocaleDateString('ru-RU', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{review.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="add-review" className="mt-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Поделитесь своим опытом</CardTitle>
                    <CardDescription>
                      Ваш отзыв поможет другим пациентам сделать правильный выбор
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Ваша оценка</label>
                      <StarRating 
                        rating={newReviewRating} 
                        size={32} 
                        editable 
                        onChange={setNewReviewRating}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Отзыв</label>
                      <Textarea 
                        placeholder="Расскажите о вашем опыте посещения клиники..."
                        value={newReviewText}
                        onChange={(e) => setNewReviewText(e.target.value)}
                        rows={6}
                        className="resize-none border-2 focus:border-primary"
                      />
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full gradient-primary text-white text-lg py-6"
                          disabled={!newReviewText.trim()}
                        >
                          <Icon name="Send" size={20} className="mr-2" />
                          Опубликовать отзыв
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Требуется авторизация</DialogTitle>
                          <DialogDescription>
                            Чтобы оставить отзыв, необходимо войти в свой аккаунт
                          </DialogDescription>
                        </DialogHeader>
                        <Button className="gradient-primary text-white">
                          <Icon name="LogIn" size={18} className="mr-2" />
                          Войти
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="animate-fade-in border-2 sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Info" className="text-primary" />
                  Контактная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Icon name="MapPin" className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-sm text-gray-500 mb-1">Адрес</p>
                    <p className="text-gray-900">{clinic.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <Icon name="Phone" className="text-secondary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-sm text-gray-500 mb-1">Телефон</p>
                    <a href={`tel:${clinic.phone}`} className="text-gray-900 hover:text-primary transition-colors">
                      {clinic.phone}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Icon name="Mail" className="text-primary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-sm text-gray-500 mb-1">Email</p>
                    <a href={`mailto:${clinic.email}`} className="text-gray-900 hover:text-primary transition-colors break-all">
                      {clinic.email}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <Icon name="Globe" className="text-secondary flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-sm text-gray-500 mb-1">Сайт</p>
                    <a 
                      href={clinic.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-900 hover:text-primary transition-colors break-all"
                    >
                      {clinic.website.replace('https://', '')}
                    </a>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name="Clock" className="text-primary" size={20} />
                    <h3 className="font-semibold">Режим работы</h3>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(clinic.schedule).map(([days, hours]) => (
                      <div key={days} className="flex justify-between text-sm">
                        <span className="text-gray-600">{days}</span>
                        <span className="font-medium text-gray-900">{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full gradient-primary text-white text-lg py-6 mt-4">
                  <Icon name="Phone" size={20} className="mr-2" />
                  Записаться на приём
                </Button>
                
                <Button variant="outline" className="w-full border-2 text-lg py-6">
                  <Icon name="MapPin" size={20} className="mr-2" />
                  Показать на карте
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicDetail;
