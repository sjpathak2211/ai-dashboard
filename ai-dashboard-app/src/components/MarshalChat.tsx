import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { claudeService, type ChatMessage } from '../services/claude';
import './MarshalChat.css';

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
        className="marshal-chat-container"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="marshal-chat-header">
          <div className="marshal-info">
            <div className="marshal-avatar">
              <Bot size={20} />
            </div>
            <div>
              <h3>Marshal AI Assistant</h3>
              <p>Let's create your AI project request together</p>
            </div>
          </div>
          <button className="marshal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="marshal-chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`marshal-message ${message.role}`}
            >
              <div className="message-avatar">
                {message.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="message-content">
                <p>{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="marshal-message assistant">
              <div className="message-avatar">
                <Bot size={16} />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="marshal-chat-footer">
          {messages.length >= 3 && (
            <button
              className="generate-form-btn"
              onClick={handleGenerateForm}
              disabled={isGenerating}
            >
              <Sparkles size={16} />
              {isGenerating ? 'Generating...' : 'Generate Form Fields'}
            </button>
          )}
          
          <div className="marshal-chat-input">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="send-btn"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MarshalChat;