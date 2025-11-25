import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { adminAPI } from '@/lib/api';
import { authStorage } from '@/lib/auth';

type AdminClinic = {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
};

type AdminProps = {
  onBack: () => void;
};

const Admin = ({ onBack }: AdminProps) => {
  const [clinics, setClinics] = useState<AdminClinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    services: '',
    schedule: ''
  });

  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    try {
      const token = authStorage.getToken();
      if (!token) {
        toast({
          title: 'Ошибка',
          description: 'Необходима авторизация',
          variant: 'destructive'
        });
        onBack();
        return;
      }

      const data = await adminAPI.getClinics(token);
      setClinics(data);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось загрузить клиники',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClinic = async () => {
    try {
      const token = authStorage.getToken();
      if (!token) return;

      const services = formData.services.split(',').map(s => s.trim()).filter(Boolean);
      const scheduleLines = formData.schedule.split('\n').filter(Boolean);
      const schedule: { [key: string]: string } = {};
      
      scheduleLines.forEach(line => {
        const [days, hours] = line.split(':').map(s => s.trim());
        if (days && hours) {
          schedule[days] = hours;
        }
      });

      await adminAPI.createClinic(token, {
        ...formData,
        services,
        schedule
      });

      toast({
        title: 'Успех',
        description: 'Клиника создана'
      });

      setDialogOpen(false);
      setFormData({
        name: '',
        image_url: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        description: '',
        services: '',
        schedule: ''
      });
      loadClinics();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать клинику',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteClinic = async (clinicId: number) => {
    if (!confirm('Удалить клинику?')) return;

    try {
      const token = authStorage.getToken();
      if (!token) return;

      await adminAPI.deleteClinic(token, clinicId);

      toast({
        title: 'Успех',
        description: 'Клиника удалена'
      });

      loadClinics();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить клинику',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} className="hover-scale">
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Назад
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Icon name="Shield" className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-gradient">Админ-панель</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Управление клиниками</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white">
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить клинику
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Новая клиника</DialogTitle>
                <DialogDescription>
                  Заполните информацию о клинике
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium">Название *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Стоматология Премиум"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">URL изображения *</label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Адрес *</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="ул. Баумана, 1, Казань"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Телефон *</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+7 (843) 555-00-00"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="info@clinic.ru"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Сайт</label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    placeholder="https://clinic.ru"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Описание *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Современная стоматология..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Услуги (через запятую)</label>
                  <Input
                    value={formData.services}
                    onChange={(e) => setFormData({...formData, services: e.target.value})}
                    placeholder="Имплантация, Отбеливание, Брекеты"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Расписание (каждая строка: Дни: Часы)</label>
                  <Textarea
                    value={formData.schedule}
                    onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                    placeholder="Пн-Пт: 9:00 - 20:00&#10;Сб: 10:00 - 18:00&#10;Вс: Выходной"
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleCreateClinic}
                  className="w-full gradient-primary text-white"
                  disabled={!formData.name || !formData.address || !formData.phone || !formData.email}
                >
                  Создать клинику
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinics.map(clinic => (
            <Card key={clinic.id} className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">{clinic.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon name="MapPin" size={16} className="text-primary" />
                    <span className="text-gray-600">{clinic.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Phone" size={16} className="text-primary" />
                    <span className="text-gray-600">{clinic.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Mail" size={16} className="text-primary" />
                    <span className="text-gray-600">{clinic.email}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteClinic(clinic.id)}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {clinics.length === 0 && (
          <div className="text-center py-20">
            <Icon name="Building2" size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">Клиник пока нет</h3>
            <p className="text-gray-500">Добавьте первую клинику</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
