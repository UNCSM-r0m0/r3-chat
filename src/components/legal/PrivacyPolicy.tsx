import React, { useEffect } from 'react';

export const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    // Actualizar la fecha automáticamente
    const dateElement = document.getElementById('date');
    if (dateElement) {
      dateElement.textContent = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-600 border-b-4 border-blue-600 pb-4 mb-6">
          Política de Privacidad de R3.Chat
        </h1>
        
        <p className="text-gray-500 italic mb-8">
          Última actualización: <span id="date"></span>
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            1. Información que Recopilamos
          </h2>
          <p className="text-gray-700 mb-4">
            R3.Chat recopila la siguiente información cuando utilizas nuestra aplicación:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>
              <strong>Información de Autenticación:</strong> Cuando inicias sesión con Google o GitHub, recopilamos tu
              dirección de correo electrónico, nombre y foto de perfil (si está disponible).
            </li>
            <li>
              <strong>Tokens de Acceso:</strong> Almacenamos tokens de autenticación de forma segura en tu dispositivo
              para mantener tu sesión activa.
            </li>
            <li>
              <strong>Datos de Chat:</strong> Los mensajes y conversaciones que envías a través de la aplicación se
              almacenan en nuestros servidores para proporcionar el servicio de chat.
            </li>
            <li>
              <strong>Información del Dispositivo:</strong> Recopilamos información básica del dispositivo (tipo de
              dispositivo, sistema operativo) para mejorar la experiencia de la aplicación.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            2. Cómo Utilizamos tu Información
          </h2>
          <p className="text-gray-700 mb-4">
            Utilizamos la información recopilada para:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Proporcionar y mantener el servicio de chat</li>
            <li>Autenticarte y mantener tu sesión activa</li>
            <li>Mejorar y personalizar tu experiencia en la aplicación</li>
            <li>Enviar notificaciones relacionadas con el servicio (si las has habilitado)</li>
            <li>Detectar y prevenir fraudes o abusos</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            3. Compartir Información
          </h2>
          <p className="text-gray-700 mb-4">
            No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto en las siguientes
            circunstancias:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>
              <strong>Proveedores de Servicios:</strong> Utilizamos servicios de terceros (como Google Sign-In y
              GitHub OAuth) para la autenticación. Estos servicios tienen sus propias políticas de privacidad.
            </li>
            <li>
              <strong>Cumplimiento Legal:</strong> Podemos divulgar información si es requerido por ley o para
              proteger nuestros derechos legales.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            4. Seguridad de los Datos
          </h2>
          <p className="text-gray-700 mb-4">
            Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Los tokens de autenticación se almacenan de forma segura usando Flutter Secure Storage</li>
            <li>Utilizamos conexiones encriptadas (HTTPS) para todas las comunicaciones</li>
            <li>Los datos se almacenan en servidores seguros con acceso restringido</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            5. Retención de Datos
          </h2>
          <p className="text-gray-700">
            Conservamos tu información personal mientras tu cuenta esté activa o según sea necesario para proporcionar
            nuestros servicios. Puedes solicitar la eliminación de tu cuenta y datos en cualquier momento
            contactándonos.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            6. Tus Derechos
          </h2>
          <p className="text-gray-700 mb-4">
            Tienes derecho a:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Acceder a tu información personal</li>
            <li>Corregir información inexacta</li>
            <li>Solicitar la eliminación de tu cuenta y datos</li>
            <li>Oponerte al procesamiento de tus datos</li>
            <li>Exportar tus datos</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            7. Cookies y Tecnologías Similares
          </h2>
          <p className="text-gray-700">
            Nuestra aplicación utiliza tokens de autenticación almacenados localmente en tu dispositivo para mantener tu
            sesión activa. Estos no son cookies tradicionales pero cumplen una función similar.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            8. Servicios de Terceros
          </h2>
          <p className="text-gray-700 mb-4">
            Nuestra aplicación utiliza los siguientes servicios de terceros:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>
              <strong>Google Sign-In:</strong> Para autenticación con Google. Consulta la{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Política de Privacidad de Google
              </a>
            </li>
            <li>
              <strong>GitHub OAuth:</strong> Para autenticación con GitHub. Consulta la{' '}
              <a
                href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Política de Privacidad de GitHub
              </a>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            9. Cambios a esta Política
          </h2>
          <p className="text-gray-700">
            Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos de cualquier cambio
            publicando la nueva política en esta página y actualizando la fecha de "Última actualización".
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            10. Información de Contacto
          </h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-700 mb-4">
              Si tienes preguntas sobre esta Política de Privacidad, puedes contactarnos:
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Email:</strong>{' '}
              <a
                href="mailto:r0lm0.dev@gmail.com"
                className="text-blue-600 hover:underline"
              >
                r0lm0.dev@gmail.com
              </a>
            </p>
            <p className="text-gray-700">
              <strong>Sitio Web:</strong>{' '}
              <a
                href="https://app.r0lm0.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://app.r0lm0.dev
              </a>
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            11. Consentimiento
          </h2>
          <p className="text-gray-700">
            Al utilizar R3.Chat, consientes la recopilación y el uso de información de acuerdo con esta Política de
            Privacidad.
          </p>
        </section>
      </div>
    </div>
  );
};

