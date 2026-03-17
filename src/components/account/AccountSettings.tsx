import React, { useState } from 'react';
import { CreditCard, Trash2, Zap, Headphones, Rocket, Crown, Check, AlertTriangle } from 'lucide-react';
import { Button } from '../ui';
import { useSubscription } from '../../hooks/useSubscription';
import { apiService } from '../../services/api';

export const AccountSettings: React.FC = () => {
  const { subscription, isLoading } = useSubscription();
  const [emailReceipts, setEmailReceipts] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpgrade = async () => {
    try {
      const { url } = await apiService.createCheckoutSession('price_1SF3YiRv5o1GNKvmJ2zzM5Ip');
      window.location.href = url;
    } catch (error) {
      console.error('Error creando sesión de checkout:', error);
    }
  };

  const handleDeleteAccount = () => {
    if (showDeleteConfirm) {
      // Implementar eliminación de cuenta
      console.log('Eliminar cuenta');
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const isPro = subscription?.tier === 'PREMIUM';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upgrade to Pro Section */}
      {!isPro && (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06]">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/10 to-blue-600/20" />
          <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm" />
          
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Actualizar a Pro</h2>
                  <p className="text-sm text-zinc-400">Desbloquea todo el potencial de R3.chat</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-white">$8<span className="text-sm text-zinc-400 font-normal">/mes</span></span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[
                {
                  icon: Rocket,
                  title: 'Todos los Modelos',
                  desc: 'Acceso a Claude, o3-mini-high, Gemini 2.5 Flash y más'
                },
                {
                  icon: Zap,
                  title: 'Límites Generosos',
                  desc: '1500 créditos estándar + 100 premium por mes'
                },
                {
                  icon: Headphones,
                  title: 'Soporte Prioritario',
                  desc: 'Respuestas más rápidas y asistencia dedicada'
                }
              ].map((feature) => (
                <div key={feature.title} className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <feature.icon className="w-6 h-6 text-purple-400 mb-3" />
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-zinc-400">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleUpgrade}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium py-3 rounded-xl"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Actualizar Ahora
              </Button>
              <Button
                variant="outline"
                className="px-6 border-white/10 text-zinc-300 hover:bg-white/5"
              >
                Ver Facturas
              </Button>
            </div>

            <p className="text-xs text-zinc-500 mt-4">
              * Los créditos premium se usan para modelos marcados con gema. Incluye: o3, Claude Sonnet, 
              Gemini 2.5 Pro, GPT 5 (Reasoning), Grok 3/4. Créditos adicionales: $8 por 100.
            </p>
          </div>
        </div>
      )}

      {/* Pro Status */}
      {isPro && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Plan Pro Activo</h3>
              <p className="text-sm text-zinc-400">
                Tienes acceso a todas las funciones premium. ¡Gracias por apoyarnos!
              </p>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <Check className="w-5 h-5" />
              <span className="text-sm font-medium">Activo</span>
            </div>
          </div>
        </div>
      )}

      {/* Billing Preferences */}
      <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.06]">
        <h3 className="text-lg font-semibold text-white mb-4">Preferencias de Facturación</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Recibos por email</p>
            <p className="text-sm text-zinc-400">
              Enviar recibos a tu email cuando un pago sea exitoso.
            </p>
          </div>
          <button
            onClick={() => setEmailReceipts(!emailReceipts)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              emailReceipts ? 'bg-purple-600' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                emailReceipts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-red-400">Zona de Peligro</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">Eliminar Cuenta</p>
            <p className="text-sm text-zinc-400">
              Elimina permanentemente tu cuenta y todos los datos asociados.
            </p>
          </div>
          
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteAccount}
                className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Confirmar
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleDeleteAccount}
              className="px-4 py-2 text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Cuenta
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
