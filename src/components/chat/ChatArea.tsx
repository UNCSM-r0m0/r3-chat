import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Folder, Code, GraduationCap, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button, Input } from '../ui';
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
  const { currentChat, sendMessage, isStreaming, startNewChat } = useChat();
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            How can I help you?
          </h1>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.id)}
                className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors group"
              >
                <div className="flex items-center justify-center mb-2">
                  {getActionIcon(action.icon)}
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  {action.label}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
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
                className="block w-full p-3 text-left rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors text-gray-700 dark:text-gray-300"
              >
                {question}
              </button>
            ))}
          </div>

          {/* Model Selector */}
          {selectedModel && (
            <div className="mb-8 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Modelo actual:
              </p>
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedModel.name}
                </p>
                <button
                  onClick={() => setModelSelectorOpen(true)}
                  className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
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
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {currentChat.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {prettyModelName(selectedModel?.id || selectedModel?.name)} • {formatDate(currentChat.updatedAt)}
        </p>
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
                'max-w-3xl rounded-2xl px-4 py-3 shadow-sm',
                msg.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200/60 dark:border-gray-700/60'
              )}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none
                                prose-pre:rounded-lg prose-pre:bg-gray-900 prose-pre:overflow-x-auto
                                prose-code:px-1 prose-code:py-0.5 prose-code:bg-gray-100 dark:prose-code:bg-gray-900
                                prose-code:rounded prose-code:text-xs
                                prose-table:text-xs prose-table:overflow-x-auto
                                prose-img:max-w-full prose-img:h-auto
                                prose-blockquote:border-l-4 prose-blockquote:border-purple-500
                                prose-strong:text-purple-600 dark:prose-strong:text-purple-400
                                prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                                prose-p:text-gray-800 dark:prose-p:text-gray-200
                                prose-li:text-gray-800 dark:prose-li:text-gray-200
                                prose-a:text-purple-600 dark:prose-a:text-purple-400
                                prose-a:no-underline hover:prose-a:underline
                                break-words overflow-wrap-anywhere">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {cleanContent(msg.content)}
                  </ReactMarkdown>
                </div>
              )}
              <p className="text-[10px] opacity-60 mt-2 text-right">
                {formatDate(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        
        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 max-w-xs">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Pensando...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                disabled={isStreaming}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isStreaming}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>Make sure you agree to our</span>
              <a href="#" className="text-purple-600 hover:underline">Terms</a>
              <span>and our</span>
              <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>
              <span>I agree</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>{selectedModel?.name}</span>
              <Button variant="ghost" size="sm">
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
    </div>
  );
};
