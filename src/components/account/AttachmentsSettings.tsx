import React from 'react';
import { Paperclip, Bell } from 'lucide-react';
import { Button } from '../ui';

export const AttachmentsSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Attachments */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Paperclip className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            En Desarrollo
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Esta funcionalidad estará disponible próximamente. Estamos trabajando en traerte las mejores características de gestión de archivos adjuntos.
          </p>
        </div>

        {/* Próximas características */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Próximas características:
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-left max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">Subida de imágenes y documentos</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">Análisis de PDFs y documentos</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">Gestión de archivos adjuntos</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">Compresión automática de imágenes</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">Soporte para múltiples formatos</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300">Almacenamiento seguro en la nube</span>
            </div>
          </div>
        </div>

        <Button className="bg-gray-800 dark:bg-gray-600 hover:bg-gray-900 dark:hover:bg-gray-500 text-white px-8 py-3">
          <Bell className="h-4 w-4 mr-2" />
          Notificarme cuando esté disponible
        </Button>
      </div>
    </div>
  );
};