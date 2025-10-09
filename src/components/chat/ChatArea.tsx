import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Folder, Code, GraduationCap, Search } from 'lucide-react';
import { Button, MarkdownRenderer, LimitNotification } from '../ui';
import { useChat } from '../../hooks/useChat';
import { useModels } from '../../hooks/useModels';
import { ModelSelector } from './ModelSelector';
import { SUGGESTED_QUESTIONS, QUICK_ACTIONS } from '../../constants';
import { formatDate } from '../../helpers/format';
import { cn } from '../../utils/cn';

export const ChatArea: React.FC = () => {
  const [message, setMessage] = useState('');
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentChat, sendMessage, isStreaming, startNewChat, isLimitReached, clearError } = useChat();
  const { selectedModel, selectModel } = useModels();

  // Función para convertir IDs de modelo a nombres legibles
  const prettyModelName = (id?: string) => {
    if (!id) return '';
    if (id.startsWith('deepseek-r1')) return 'DeepSeek R1 7B';
    if (id.startsWith('llama3.2')) return 'Llama 3.2 3B';
    if (id.startsWith('gemini-2.5-flash')) return 'Gemini 2.5 Flash';
    if (id.startsWith('gemini-2.5-pro')) return 'Gemini 2.5 Pro';
    if (id.startsWith('gpt-4o-mini')) return 'GPT-4o Mini';
    if (id.startsWith('gpt-4o')) return 'GPT-4o';
    return id;
  };

  // Función para limpiar contenido (salvaguarda adicional)
  const cleanContent = (content: string) => {
    return content.replace(/<think>[\s\S]*?<\/think>\s*/g, '').trim();
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  useEffect(() => {
    // Scroll solo cuando se agregan nuevos mensajes, no cuando cambia el chat
    if (currentChat?.messages && currentChat.messages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100); // Pequeño delay para asegurar que el DOM se actualice
      
      return () => clearTimeout(timer);
    }
  }, [currentChat?.messages?.length]); // Solo cuando cambia la cantidad de mensajes

  const handleSendMessage = async () => {
    if (!message.trim() || isStreaming) return;

    if (!selectedModel) {
      console.error('No hay modelo seleccionado');
      return;
    }

    const messageToSend = message.trim();
    setMessage('');

    try {
      await sendMessage(messageToSend);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = async (question: string) => {
    if (!selectedModel) {
      console.error('No hay modelo seleccionado');
      return;
    }
    
    // Si no hay chat actual, crear uno nuevo con la pregunta
    if (!currentChat) {
      try {
        await startNewChat(question);
      } catch (error) {
        console.error('Error al crear chat con pregunta sugerida:', error);
      }
    } else {
      // Si ya hay un chat, enviar la pregunta directamente
      setMessage(question);
      await sendMessage(question);
    }
  };

  const handleQuickAction = (action: string) => {
    // Implementar acciones rápidas
    console.log('Quick action:', action);
  };

  const getActionIcon = (iconName: string) => {
    const icons = {
      sparkles: Sparkles,
      folder: Folder,
      code: Code,
      'graduation-cap': GraduationCap,
    };
    const IconComponent = icons[iconName as keyof typeof icons] || Sparkles;
    return <IconComponent className="h-4 w-4" />;
  };

  if (!currentChat) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-100">
        <div className="w-full max-w-4xl mx-auto flex flex-col h-[90vh] border border-gray-800 rounded-xl overflow-hidden bg-gray-900 shadow-lg">
          {/* Header */}
          <div className="p-4 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">R3.chat</h1>
                <p className="text-sm text-gray-400">Tu asistente de IA</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModelSelectorOpen(true)}
                className="text-gray-300 border-gray-600 hover:bg-gray-800"
              >
                <Folder className="h-4 w-4 mr-2" />
                Cambiar Modelo
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => startNewChat()}
                className="text-gray-300 border-gray-600 hover:bg-gray-800"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Nuevo Chat
              </Button>
            </div>
          </div>

          {/* Welcome Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="max-w-2xl w-full text-center">
              <h1 className="text-4xl font-bold text-white mb-8">
                ¿En qué puedo ayudarte?
              </h1>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.id)}
                    className="p-4 rounded-lg bg-gray-800 border border-gray-700 hover:border-purple-600 transition-colors group"
                  >
                    <div className="flex items-center justify-center mb-2">
                      {getActionIcon(action.icon)}
                    </div>
                    <h3 className="font-medium text-white mb-1">
                      {action.label}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {action.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* Suggested Questions */}
              <div className="space-y-3 mb-8">
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="block w-full p-3 text-left rounded-lg bg-gray-800 border border-gray-700 hover:border-purple-600 transition-colors text-gray-300 hover:text-white"
                  >
                    {question}
                  </button>
                ))}
              </div>

              {/* Model Selector */}
              {selectedModel && (
                <div className="mb-8 p-4 rounded-lg bg-gray-800 border border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">
                    Modelo actual:
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white">
                      {selectedModel.name}
                    </p>
                    <button
                      onClick={() => setModelSelectorOpen(true)}
                      className="text-sm text-purple-400 hover:text-purple-300"
                    >
                      Cambiar modelo
                    </button>
                  </div>
                </div>
              )}

              {/* Start Chat Button */}
              <div className="mb-8">
                <button
                  onClick={() => startNewChat()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center mx-auto"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Iniciar Nuevo Chat
                </button>
              </div>
            </div>
          </div>

          {/* Model Selector Modal */}
          <ModelSelector
            isOpen={modelSelectorOpen}
            onClose={() => setModelSelectorOpen(false)}
            onSelectModel={selectModel}
            selectedModel={selectedModel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-100">
      <div className="w-full max-w-4xl mx-auto flex flex-col h-[90vh] border border-gray-800 rounded-xl overflow-hidden bg-gray-900 shadow-lg">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {currentChat.title}
              </h2>
              <p className="text-sm text-gray-400">
                {prettyModelName(selectedModel?.id || selectedModel?.name)} • {formatDate(currentChat.updatedAt)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModelSelectorOpen(true)}
              className="text-gray-300 border-gray-600 hover:bg-gray-800"
            >
              <Folder className="h-4 w-4 mr-2" />
              Cambiar Modelo
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => startNewChat()}
              className="text-gray-300 border-gray-600 hover:bg-gray-800"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Nuevo Chat
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentChat.messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex',
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[80%] rounded-lg px-3 py-3',
                msg.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              )}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <MarkdownRenderer 
                  content={cleanContent(msg.content)}
                  className="break-words overflow-wrap-anywhere"
                />
              )}
              <p className="text-[10px] opacity-60 mt-2 text-right">
                {formatDate(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        
        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg px-3 py-3 max-w-[80%]">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm text-gray-300 font-medium">Pensando...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 p-3 bg-gray-900">
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isStreaming}
              className="flex-1 bg-gray-800 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-100 placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={!message.trim() || isStreaming}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          
          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              <span>Make sure you agree to our</span>
              <a href="#" className="text-purple-400 hover:underline">Terms</a>
              <span>and our</span>
              <a href="#" className="text-purple-400 hover:underline">Privacy Policy</a>
              <span>I agree</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>{selectedModel?.name}</span>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-300">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Model Selector Modal */}
      <ModelSelector
        isOpen={modelSelectorOpen}
        onClose={() => setModelSelectorOpen(false)}
        onSelectModel={selectModel}
        selectedModel={selectedModel}
      />

      {/* Limit Notification */}
      <LimitNotification
        isVisible={isLimitReached}
        onClose={clearError}
        onUpgrade={() => {
          // TODO: Implementar upgrade
          console.log('Upgrade clicked');
        }}
      />
    </div>
  );
};
