import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Folder, Code, GraduationCap } from 'lucide-react';
import { MarkdownRenderer, LimitNotification } from '../ui';
import { useChat } from '../../hooks/useChat';
import { useModels } from '../../hooks/useModels';
import { ModelSelector } from './ModelSelector';
import { SUGGESTED_QUESTIONS, QUICK_ACTIONS } from '../../constants';
import { formatDate } from '../../helpers/format';
import { cn } from '../../utils/cn';

interface ChatAreaProps {
  sidebarOpen?: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = () => {
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
    // Solo hacer scroll automático si el usuario está cerca del final
    // Esto evita que se pierdan mensajes anteriores cuando el usuario está leyendo
    if (currentChat?.messages && currentChat.messages.length > 0) {
      const scrollContainer = messagesEndRef.current?.parentElement?.parentElement;
      if (scrollContainer) {
        const isNearBottom = scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 100;
        
        if (isNearBottom) {
          const timer = setTimeout(() => {
            scrollToBottom();
          }, 100);
          
          return () => clearTimeout(timer);
        }
      }
    }
  }, [currentChat?.messages?.length]);

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
      <div className="flex flex-col h-full bg-[#0a0612] text-gray-100">
        {/* Welcome Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="max-w-2xl w-full text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
              ¿En qué puedo ayudarte?
            </h1>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  className="p-4 rounded-lg bg-gray-900/50 border border-gray-800/50 hover:border-purple-500/50 hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="flex items-center justify-center mb-2">
                    {getActionIcon(action.icon)}
                  </div>
                  <h3 className="font-medium text-white text-sm mb-1">
                    {action.label}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {action.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Suggested Questions */}
            <div className="space-y-2 mb-8">
              {SUGGESTED_QUESTIONS.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="block w-full p-3 text-left rounded-lg bg-gray-900/30 border border-gray-800/50 hover:border-purple-500/50 hover:bg-gray-800/50 transition-colors text-gray-300 hover:text-white text-sm"
                >
                  {question}
                </button>
              ))}
            </div>

            {/* Model Info */}
            {selectedModel && (
              <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800/50 text-center">
                <p className="text-sm text-gray-400 mb-2">Modelo actual:</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="font-medium text-white">{selectedModel.name}</p>
                  <button
                    onClick={() => setModelSelectorOpen(true)}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Cambiar
                  </button>
                </div>
              </div>
            )}
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
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0612] text-gray-100">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        <div className="max-w-3xl mx-auto space-y-6">
          {currentChat.messages.map((msg) => (
            <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  msg.role === "user" ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white" : "bg-gray-900/50 border border-gray-800/50 text-gray-100",
                )}
              >
                {msg.role === "user" ? (
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                ) : (
                  <MarkdownRenderer content={cleanContent(msg.content)} className="break-words" />
                )}
                <p className="text-[10px] opacity-60 mt-2 text-right">{formatDate(msg.createdAt)}</p>
              </div>
            </div>
          ))}

          {isStreaming && (
            <div className="flex justify-start">
              <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl px-4 py-3 max-w-[85%]">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-300">Pensando...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0612]/95 backdrop-blur-md p-4 z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 mb-2">
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message here..."
                disabled={isStreaming}
                rows={1}
                className="w-full bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-gray-100 placeholder-gray-500 resize-none min-h-[48px] max-h-32"
                style={{
                  height: "auto",
                  minHeight: "48px",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = Math.min(target.scrollHeight, 128) + "px";
                }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isStreaming}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 px-4 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[48px]"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 text-xs text-gray-400">
            <div className="flex flex-wrap items-center justify-center gap-1">
              <span className="hidden sm:inline">Make sure you agree to our</span>
              <a href="#" className="text-purple-400 hover:underline">
                Terms
              </a>
              <span className="hidden sm:inline">and</span>
              <a href="#" className="text-purple-400 hover:underline">
                Privacy Policy
              </a>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setModelSelectorOpen(true)}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                {prettyModelName(selectedModel?.id || selectedModel?.name)}
              </button>
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