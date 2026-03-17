import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const TermsOfService: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: '1. Aceptación de los Términos',
      content: `Al acceder y utilizar R3.chat, aceptas estar sujeto a estos Términos de Servicio. 
      Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al servicio. 
      Nos reservamos el derecho de modificar estos términos en cualquier momento, y te notificaremos 
      de cambios significativos.`
    },
    {
      title: '2. Descripción del Servicio',
      content: `R3.chat es una plataforma de chat impulsada por inteligencia artificial que permite 
      a los usuarios interactuar con modelos de lenguaje avanzados. El servicio incluye:
      
      • Envío de mensajes y recepción de respuestas generadas por IA
      • Historial de conversaciones
      • Soporte para múltiples modelos de IA
      • Funciones premium para suscriptores Pro`
    },
    {
      title: '3. Cuentas de Usuario',
      content: `Para usar ciertas funciones, debes crear una cuenta. Eres responsable de:
      
      • Mantener la confidencialidad de tu cuenta
      • Todas las actividades que ocurran bajo tu cuenta
      • Notificarnos inmediatamente de cualquier uso no autorizado
      
      Nos reservamos el derecho de terminar cuentas que violen estos términos.`
    },
    {
      title: '4. Uso Aceptable',
      content: `Al usar R3.chat, aceptas NO:
      
      • Usar el servicio para actividades ilegales o no autorizadas
      • Intentar acceder a sistemas o datos sin autorización
      • Interferir con el funcionamiento del servicio
      • Usar el servicio para generar contenido dañino, discriminatorio o ilegal
      • Compartir información de cuenta con terceros
      • Intentar eludir límites de uso o restricciones de cuenta`
    },
    {
      title: '5. Contenido Generado',
      content: `Respecto al contenido generado por IA:
      
      • No garantizamos la exactitud o confiabilidad de las respuestas
      • El contenido generado no constituye asesoramiento profesional
      • Eres responsable de verificar la información importante
      • Conservas los derechos sobre tus mensajes de entrada
      • Las conversaciones pueden ser revisadas para mejorar el servicio`
    },
    {
      title: '6. Privacidad y Datos',
      content: `Tu privacidad es importante para nosotros. Consulta nuestra Política de Privacidad 
      para entender cómo recopilamos, usamos y protegemos tu información personal. 
      Al usar el servicio, aceptas nuestras prácticas de privacidad.`
    },
    {
      title: '7. Suscripciones y Pagos',
      content: `Para el plan Pro:
      
      • Los pagos se procesan a través de Stripe
      • Las suscripciones se renuevan automáticamente mensualmente
      • Puedes cancelar en cualquier momento desde tu cuenta
      • No se realizan reembolsos por períodos parciales
      • Nos reservamos el derecho de cambiar los precios con previo aviso`
    },
    {
      title: '8. Límites de Uso',
      content: `Implementamos límites de uso para mantener la calidad del servicio:
      
      • Límites diarios de mensajes según tu plan
      • Límites de caracteres por mensaje
      • Límites de almacenamiento de historial
      
      Estos límites pueden variar y se muestran en tu panel de cuenta.`
    },
    {
      title: '9. Disponibilidad del Servicio',
      content: `Hacemos esfuerzos razonables para mantener el servicio disponible, pero:
      
      • No garantizamos disponibilidad ininterrumpida
      • Pueden ocurrir mantenimientos programados
      • No somos responsables por pérdida de datos
      • Nos reservamos el derecho de suspender el servicio si es necesario`
    },
    {
      title: '10. Limitación de Responsabilidad',
      content: `En la máxima medida permitida por la ley:
      
      • No somos responsables por daños indirectos, incidentales o consecuentes
      • Nuestra responsabilidad total no excederá el monto pagado por el servicio en los últimos 12 meses
      • No garantizamos que el servicio cumplirá tus requisitos específicos`
    },
    {
      title: '11. Ley Aplicable',
      content: `Estos términos se rigen por las leyes de Paraguay. Cualquier disputa 
      será resuelta en los tribunales competentes de Asunción, Paraguay.`
    },
    {
      title: '12. Contacto',
      content: `Si tienes preguntas sobre estos términos, contáctanos:
      
      Email: r0lm0.dev@gmail.com
      Sitio Web: https://r3chat.r0lm0.dev`
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

            <div className="w-20" /> {/* Spacer for centering */}
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
              Términos de Servicio
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
          <div className="mb-12 p-6 rounded-2xl bg-zinc-900/50 border border-white/[0.06]">
            <p className="text-zinc-300 leading-relaxed">
              Bienvenido a R3.chat. Estos Términos de Servicio regulan tu uso de nuestra plataforma 
              de chat impulsada por inteligencia artificial. Por favor, léelos cuidadosamente antes 
              de usar el servicio.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-zinc-900/30 border border-white/[0.06]"
              >
                <h2 className="text-xl font-semibold text-white mb-4">
                  {section.title}
                </h2>
                <div className="text-zinc-400 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </motion.section>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-white/[0.06] text-center">
            <p className="text-zinc-500 text-sm mb-4">
              Al usar R3.chat, aceptas estos términos y nuestra{' '}
              <Link to="/privacy" className="text-purple-400 hover:text-purple-300 underline">
                Política de Privacidad
              </Link>
              .
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

export default TermsOfService;
