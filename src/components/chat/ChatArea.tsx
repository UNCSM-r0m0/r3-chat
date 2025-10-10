import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Sparkles, Folder, Code, GraduationCap, ArrowDown } from 'lucide-react';
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
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { currentChat, sendMessage, isStreaming, startNewChat, isLimitReached, clearError } = useChat();
  const { selectedModel, selectModel } = useModels();


  // Función para limpiar contenido (salvaguarda adicional)
  const cleanContent = (content: string) => {
    return content.replace(/<think>[\s\S]*?<\/think>\s*/g, '').trim();
  };

  // Scroll suave al bottom, pero solo si autoScrollEnabled
  const scrollToBottom = () => {
    if (messagesEndRef.current && autoScrollEnabled) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  // Detecta si usuario scrollea manualmente (desactiva auto-scroll temporalmente)
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5; // Tolerancia de 5px
      setAutoScrollEnabled(isAtBottom);
      setShowScrollButton(!isAtBottom);
    }
  };

  // Scroll automático mejorado: useLayoutEffect para síncrono
  useLayoutEffect(() => {
    if (currentChat?.messages && currentChat.messages.length > 0) {
      scrollToBottom();
    }
  }, [currentChat?.messages?.length, autoScrollEnabled]);

  // Scroll durante streaming (más frecuente)
  useEffect(() => {
    if (isStreaming) {
      const interval = setInterval(() => {
        scrollToBottom();
      }, 200); // Cada 200ms durante streaming
      return () => clearInterval(interval);
    } else if (currentChat?.messages && currentChat.messages.length > 0) {
      scrollToBottom();
    }
  }, [isStreaming, currentChat?.messages?.length]);


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

  // Render del botón "Scroll to bottom" (como en Grok)
  const renderScrollButton = () => (
    <button
      onClick={scrollToBottom}
      className="fixed bottom-32 right-4 z-20 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full shadow-lg transition-all"
      aria-label="Scroll to bottom"
    >
      <ArrowDown className="h-4 w-4" />
    </button>
  );

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
        <div ref={messagesEndRef} />
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
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden">

      {/* Messages Container - con ref y event listener para scroll */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 pb-32 overscroll-contain" 
        style={{ scrollBehavior: 'smooth' }}
        onScroll={handleScroll}
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {currentChat.messages.map((msg, index) => {
            const isLastMessage = index === currentChat.messages.length - 1;
            const isAssistantMessage = msg.role === 'assistant';
            const isStreamingMessage = isAssistantMessage && isLastMessage && isStreaming;

            return (
              <div key={msg.id}>
                <div className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3",
                      msg.role === "user" ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white" : "bg-gray-900/50 border border-gray-800/50 text-gray-100",
                    )}
                  >
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    ) : (
                      <div className="relative">
                        <MarkdownRenderer 
                          content={cleanContent(msg.content)} 
                          className="break-words prose prose-invert max-w-none" 
                        />
                        {/* Efecto typing: cursor parpadeante solo en streaming */}
                        {isStreamingMessage && (
                          <div className="absolute -bottom-1 right-0 w-1 h-5 bg-purple-500 animate-pulse"></div>
                        )}
                        {/* Dots animados al final si el contenido es corto */}
                        {isStreamingMessage && msg.content.length < 10 && (
                          <span className="ml-1 text-purple-400 animate-pulse">...</span>
                        )}
                      </div>
                    )}
                    <p className="text-[10px] opacity-60 mt-2 text-right">{formatDate(msg.createdAt)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll Button - solo si showScrollButton */}
      {showScrollButton && renderScrollButton()}

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