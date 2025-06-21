
import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Bot, User, Code, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Question } from '../types/Question';

interface ChatbotPanelProps {
  question: Question | null;
  onClose: () => void;
}

const ChatbotPanel = ({ question, onClose }: ChatbotPanelProps) => {
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'bot'; content: string}>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const sendMessage = () => {
    if (!currentMessage.trim()) return;
    
    setChatMessages(prev => [...prev, { role: 'user', content: currentMessage }]);
    
    // Simulate bot response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'bot', 
        content: `Here's my analysis of "${question?.title}". This is a ${question?.difficulty} level problem that can be solved using ${question?.tags.join(', ')}. Would you like me to generate a code solution?`
      }]);
    }, 1000);
    
    setCurrentMessage('');
  };

  const generateCode = () => {
    const sampleCode = `
def solution(nums):
    """
    Solution for ${question?.title}
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    # Implementation here
    result = []
    
    for i, num in enumerate(nums):
        # Process each element
        result.append(num)
    
    return result

# Test the solution
if __name__ == "__main__":
    test_input = [1, 2, 3, 4, 5]
    print(solution(test_input))
`;
    setGeneratedCode(sampleCode);
    setChatMessages(prev => [...prev, { 
      role: 'bot', 
      content: 'I\'ve generated a code solution for you! Check the code panel below.'
    }]);
  };

  const saveCode = () => {
    console.log('Saving code for question:', question?.id);
    // Here you would save the generated code
  };

  return (
    <motion.div
      initial={{ x: '-100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 120 }}
      className="fixed left-0 top-0 h-full w-96 z-50"
    >
      <div className="h-full glass-strong border-r border-white/10 flex flex-col backdrop-blur-xl">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-blue-400 flex items-center">
            <Bot size={20} className="mr-2" />
            AI Assistant
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-white/10 flex-shrink-0"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {chatMessages.length === 0 && (
            <div className="text-center py-8">
              <Bot size={48} className="mx-auto mb-4 text-blue-400/50" />
              <p className="text-gray-400 mb-4">
                I'm here to help you understand and solve coding problems!
              </p>
              <Button
                onClick={generateCode}
                className="glass-light border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
              >
                <Code size={16} className="mr-2" />
                Generate Solution
              </Button>
            </div>
          )}
          
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-blue-400" />
                </div>
              )}
              <div className={`max-w-[280px] p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-500/20 text-blue-100' 
                  : 'glass-light text-gray-300'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Generated Code Display */}
        {generatedCode && (
          <div className="border-t border-white/10 p-4 max-h-64 overflow-y-auto">
            <div className="code-viewer p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-blue-400">Generated Solution</span>
                <Button
                  onClick={saveCode}
                  size="sm"
                  className="glass-light border-green-500/30 text-green-400 hover:bg-green-500/20 text-xs px-3 py-1 h-auto"
                >
                  <Save size={12} className="mr-1" />
                  Save
                </Button>
              </div>
              <pre className="text-xs text-gray-300 overflow-x-auto">{generatedCode}</pre>
            </div>
          </div>
        )}

        {/* Chat Input */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <div className="flex space-x-2">
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Ask about the solution approach..."
              className="glass-light border-gray-600 text-white placeholder:text-gray-400 resize-none text-sm"
              rows={3}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            />
            <Button
              onClick={sendMessage}
              className="bg-blue-500 hover:bg-blue-600 text-white self-end"
              size="sm"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatbotPanel;
