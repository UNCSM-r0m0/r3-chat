import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Shield, Lock, Eye, Trash2, Share2, Cookie, ExternalLink } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      icon: Shield,
      title: '1. Información que Recopilamos',
      content: `R3.chat recopila la siguiente información cuando utilizas nuestra aplicación:

• Información de Autenticación: Cuando inicias sesión con Google o GitHub, recopilamos tu dirección de correo electrónico, nombre y foto de perfil.
• Tokens de Acceso: Almacenamos tokens de autenticación de forma segura para mantener tu sesión activa.
• Datos de Chat: Los mensajes y conversaciones se almacenan en nuestros servidores para proporcionar el servicio.
• Información del Dispositivo: Tipo de dispositivo y sistema operativo para mejorar la experiencia.`
    },
    {
      icon: Eye,
      title: '2. Cómo Utilizamos tu Información',
      content: `Utilizamos la información recopilada para:

• Proporcionar y mantener el servicio de chat
• Autenticarte y mantener tu sesión activa
• Mejorar y personalizar tu experiencia
• Enviar notificaciones relacionadas con el servicio
• Detectar y prevenir fraudes o abusos
• Analizar el uso para mejorar nuestros servicios`
    },
    {
      icon: Share2,
      title: '3. Compartir Información',
      content: `No vendemos ni alquilamos tu información personal. Solo compartimos datos con:

• Proveedores de Servicios: Google Sign-In y GitHub OAuth para autenticación
• Cumplimiento Legal: Cuando sea requerido por ley o para proteger nuestros derechos
• Protección: Para prevenir fraudes o situaciones de emergencia que involucren seguridad`
    },
    {
      icon: Lock,
      title: '4. Seguridad de los Datos',
      content: `Implementamos medidas de seguridad robustas:

• Tokens de autenticación almacenados de forma segura
• Conexiones encriptadas (HTTPS/TLS) para todas las comunicaciones
• Servidores seguros con acceso restringido
• Monitoreo continuo de actividades sospechosas
• Actualizaciones regulares de seguridad`
    },
    {
      icon: Trash2,
      title: '5. Retención de Datos',
      content: `Conservamos tu información mientras tu cuenta esté activa o según sea necesario para proporcionar nuestros servicios. Puedes:

• Solicitar la eliminación de tu cuenta en cualquier momento
• Exportar tus datos antes de eliminar la cuenta
• Solicitar información sobre los datos que tenemos de ti

Los datos se eliminan permanentemente dentro de los 30 días posteriores a la solicitud de eliminación.`
    },
    {
      icon: Cookie,
      title: '6. Cookies y Tecnologías Similares',
      content: `Utilizamos cookies y tecnologías similares para:

• Mantener tu sesión activa de forma segura
• Recordar tus preferencias
• Analizar el uso del servicio
• Mejorar la seguridad

Puedes configurar tu navegador para rechazar cookies, pero esto puede afectar la funcionalidad.`
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Volver</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-zinc-800 to-black rounded-lg flex items-center justify-center border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-white tracking-tight">R3.chat</span>
            </div>

            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <div className="mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Política de Privacidad
            </h1>
            <p className="text-zinc-400">
              Última actualización: {new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Introduction */}
          <div className="mb-12 p-6 rounded-2xl bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20">
            <p className="text-zinc-300 leading-relaxed">
              En R3.chat, tu privacidad es nuestra prioridad. Esta política explica cómo recopilamos, 
              usamos y protegemos tu información personal cuando usas nuestra plataforma de chat 
              impulsada por inteligencia artificial.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.section
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-zinc-900/30 border border-white/[0.06] hover:border-white/[0.1] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-white mb-3">
                        {section.title}
                      </h2>
                      <div className="text-zinc-400 leading-relaxed whitespace-pre-line text-sm">
                        {section.content}
                      </div>
                    </div>
                  </div>
                </motion.section>
              );
            })}
          </div>

          {/* Third Party Services */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 p-6 rounded-2xl bg-zinc-900/30 border border-white/[0.06]"
          >
            <h2 className="text-lg font-semibold text-white mb-4">
              Servicios de Terceros
            </h2>
            <div className="space-y-3">
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/[0.08] transition-colors group"
              >
                <div>
                  <p className="text-white font-medium">Google Sign-In</p>
                  <p className="text-sm text-zinc-500">Para autenticación</p>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400" />
              </a>
              <a
                href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/[0.08] transition-colors group"
              >
                <div>
                  <p className="text-white font-medium">GitHub OAuth</p>
                  <p className="text-sm text-zinc-500">Para autenticación</p>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400" />
              </a>
            </div>
          </motion.section>

          {/* Contact */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.06]"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Contacto</h2>
            <p className="text-zinc-400 mb-4">
              Si tienes preguntas sobre esta Política de Privacidad, contáctanos:
            </p>
            <div className="space-y-2">
              <p className="text-zinc-300">
                <span className="text-zinc-500">Email:</span>{' '}
                <a href="mailto:r0lm0.dev@gmail.com" className="text-purple-400 hover:text-purple-300">
                  r0lm0.dev@gmail.com
                </a>
              </p>
              <p className="text-zinc-300">
                <span className="text-zinc-500">Sitio Web:</span>{' '}
                <a href="https://r3chat.r0lm0.dev" className="text-purple-400 hover:text-purple-300">
                  https://r3chat.r0lm0.dev
                </a>
              </p>
            </div>
          </motion.section>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-white/[0.06] text-center">
            <p className="text-zinc-500 text-sm mb-4">
              Al utilizar R3.chat, consientes la recopilación y uso de información de acuerdo con esta política.
            </p>
            <p className="text-zinc-600 text-sm">
              © {new Date().getFullYear()} R3.chat. Todos los derechos reservados.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
