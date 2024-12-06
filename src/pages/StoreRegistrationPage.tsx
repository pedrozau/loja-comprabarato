import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ArrowLeft } from 'lucide-react';
import { LatLng } from 'leaflet';
import toast from 'react-hot-toast';
import { registerStore } from '../lib/stores';
import StoreRegistrationForm from '../components/forms/StoreRegistrationForm';
import 'leaflet/dist/leaflet.css';

export default function StoreRegistrationPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<LatLng | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    province: '',
    store_type: '',
    phone: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!position) {
      toast.error('Por favor, selecione a localização da sua loja');
      return;
    }

    setLoading(true);
    try {
      await registerStore({
        ...formData,
        latitude: position.lat,
        longitude: position.lng,
      });
      toast.success('Loja cadastrada com sucesso!');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Erro ao cadastrar loja');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button for mobile */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 px-4 py-3 sm:hidden">
        <Link
          to="/login"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Voltar para login
        </Link>
      </div>

      <div className="py-6 sm:py-12 px-4 sm:px-6 lg:px-8 mt-12 sm:mt-0">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <Store className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-indigo-600" />
            <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-gray-900">
              Cadastro de Loja
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Crie sua conta para começar a vender no Compra Barato
            </p>
          </div>

          <div className="bg-white py-6 sm:py-8 px-4 sm:px-10 shadow-xl rounded-lg">
            <StoreRegistrationForm
              formData={formData}
              setFormData={setFormData}
              position={position}
              setPosition={setPosition}
              loading={loading}
              onSubmit={handleSubmit}
            />

            {/* Back to login link for desktop */}
            <div className="mt-4 text-center hidden sm:block">
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Já tem uma conta? Faça login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}