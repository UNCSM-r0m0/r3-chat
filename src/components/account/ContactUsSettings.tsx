import React from 'react';
import { MessageCircle, Bug, Mail, Users, FileText, Shield, ExternalLink } from 'lucide-react';
import { Button } from '../ui';
import { Link } from 'react-router-dom';

export const ContactUsSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">¡Estamos aquí para ayudarte!</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Elige la opción que mejor describa lo que necesitas.
        </p>
      </div>

      {/* Help Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-5 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl hover:border-[var(--border-hover)] transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-[var(--accent-primary)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              ¿Tienes una idea de función?
            </h3>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Comparte tus ideas y ayúdanos a mejorar R3.chat.
          </p>
          <Button 
            variant="outline" 
            className="w-full border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-white/[0.04]"
          >
            Solicitar Función
          </Button>
        </div>

        <div className="p-5 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl hover:border-[var(--border-hover)] transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Bug className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              ¿Encontraste un error?
            </h3>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Reporta errores y ayúdanos a corregirlos.
          </p>
          <Button 
            variant="outline" 
            className="w-full border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-white/[0.04]"
          >
            Reportar Error
          </Button>
        </div>

        <div className="p-5 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl hover:border-[var(--border-hover)] transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              ¿Problemas con tu cuenta?
            </h3>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Obtén ayuda con tu cuenta o preguntas de facturación.
          </p>
          <Button 
            variant="outline" 
            className="w-full border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-white/[0.04]"
          >
            Soporte por Email
          </Button>
        </div>

        <div className="p-5 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl hover:border-[var(--border-hover)] transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-emerald-500" />
            </div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              ¿Quieres unirte a la comunidad?
            </h3>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Conecta con otros usuarios y obtén soporte.
          </p>
          <Button 
            variant="outline" 
            className="w-full border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-white/[0.04]"
          >
            Unirse al Discord
          </Button>
        </div>

        <div className="p-5 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center">
              <FileText className="h-5 w-5 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Política de Privacidad
            </h3>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Aprende cómo protegemos tus datos y privacidad.
          </p>
          <Link 
            to="/privacy"
            target="_blank"
            className="inline-flex items-center gap-2 text-sm text-[var(--accent-primary)] hover:opacity-80 transition-colors"
          >
            Ver Política
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-5 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center">
              <Shield className="h-5 w-5 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Términos de Servicio
            </h3>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Lee nuestros términos y condiciones.
          </p>
          <Link 
            to="/terms"
            target="_blank"
            className="inline-flex items-center gap-2 text-sm text-[var(--accent-primary)] hover:opacity-80 transition-colors"
          >
            Ver Términos
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Immediate Help */}
      <div className="bg-gradient-to-r from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--accent-primary)]/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          ¿Necesitas ayuda inmediata?
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Para problemas urgentes, nuestro equipo de soporte está disponible 24/7.
        </p>
        <div className="flex gap-3">
          <Button className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:opacity-90 text-white">
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat en Vivo
          </Button>
          <Button 
            variant="outline"
            className="border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-white/[0.04]"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email de Soporte
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContactUsSettings;
