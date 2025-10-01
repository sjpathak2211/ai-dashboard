import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { claudeService, type ChatMessage } from '../services/claude';
import { Button } from './ui/Button';

interface MarshalChatProps {
  isOpen: boolean;
  onClose: () => void;
  onFormGenerated: (fields: { title: string; description: string; estimatedImpact: string }) => void;
}

const INITIAL_MESSAGE = "Hi! I'm Marshal, your AI assistant. I'm here to help you create a comprehensive AI project request. Could you start by telling me about the problem or opportunity you'd like to address with AI?";

const MarshalChat: React.FC<MarshalChatProps> = ({ isOpen, onClose, onFormGenerated }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: INITIAL_MESSAGE }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      console.log('Sending messages to Claude:', newMessages);
      const response = await claudeService.getChatResponse(newMessages);
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or fill out the form manually.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateForm = async () => {
    if (messages.length < 3) {
      alert('Please have a conversation with Marshal first to provide more details about your project.');
      return;
    }

    setIsGenerating(true);
    try {
      const formFields = await claudeService.generateFormFields(messages);
      onFormGenerated(formFields);

      // Add a success message
      setMessages([...messages, {
        role: 'assistant',
        content: 'Great! I\'ve generated the form fields based on our conversation. Feel free to review and edit them as needed before submitting.'
      }]);
    } catch (error) {
      console.error('Failed to generate form:', error);
      alert('Failed to generate form fields. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed right-5 bottom-5 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-[1001] border border-gray-200 max-md:fixed max-md:inset-0 max-md:w-full max-md:h-full max-md:rounded-none"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-br from-primary-blue to-primary-cyan text-white rounded-t-2xl max-md:rounded-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="m-0 text-base font-semibold">Marshal AI Assistant</h3>
              <p className="m-0 text-xs opacity-90">Let's create your AI project request together</p>
            </div>
          </div>
          <button
            className="bg-transparent border-none text-white cursor-pointer p-2 rounded-lg hover:bg-white/20 transition-colors"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-2 animate-[messageSlide_0.3s_ease-out] ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'assistant'
                  ? 'bg-gradient-to-br from-primary-blue to-primary-cyan text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {message.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className={`max-w-[75%] px-4 py-3 rounded-xl ${
                message.role === 'user'
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="m-0 text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 animate-[messageSlide_0.3s_ease-out]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary-blue to-primary-cyan text-white">
                <Bot size={16} />
              </div>
              <div className="max-w-[75%] px-4 py-3 rounded-xl bg-gray-100">
                <div className="flex gap-1 py-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-[typing_1.4s_infinite]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-[typing_1.4s_infinite_0.2s]" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-[typing_1.4s_infinite_0.4s]" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex flex-col gap-3">
          {messages.length >= 3 && (
            <Button
              onClick={handleGenerateForm}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-primary-cyan to-primary-blue text-white hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              <Sparkles size={16} className="mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Form Fields'}
            </Button>
          )}

          <div className="flex gap-2 items-end">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-lg resize-none font-inherit text-sm leading-relaxed min-h-[40px] max-h-[120px] focus:outline-none focus:border-primary-blue disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 bg-primary-blue text-white border-none rounded-lg cursor-pointer flex items-center justify-center transition-all hover:bg-primary-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        <style>{`
          @keyframes messageSlide {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes typing {
            0%, 60%, 100% {
              transform: translateY(0);
            }
            30% {
              transform: translateY(-10px);
            }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};

export default MarshalChat;
