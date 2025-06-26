import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Bot, User, Code, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Question } from '../types/Question';
import { aiChat, questionsAPI } from '../lib/api';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface ChatbotPanelProps {
  question: Question | null;
  onClose: () => void;
}

const ChatbotPanel = ({ question, onClose }: ChatbotPanelProps) => {
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'bot'; content: string}>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [language, setLanguage] = useState('Python');
  const [loading, setLoading] = useState(false);

  function isCodeRequest(message) {
    const codeKeywords = [
      'code', 'solution', 'implement', 'write in', 'generate', 'show me', 'how to solve', 'give me', 'program', 'algorithm'
    ];
    return codeKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  // Helper to parse AI reply into text and code blocks
  function parseAIReply(reply) {
    // Split by triple backticks (```)
    const parts = reply.split(/```/);
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        // This is a code block, optionally extract language
        const lines = part.split('\n');
        let lang = '';
        if (lines[0].match(/^[a-zA-Z]+/)) {
          lang = lines[0].trim();
          lines.shift();
        }
        return { type: 'code', lang, content: lines.join('\n') };
      } else {
        // This is text
        return { type: 'text', content: part.trim() };
      }
    }).filter(section => section.content.trim() !== '');
  }

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;
    setChatMessages(prev => [...prev, { role: 'user', content: currentMessage }]);
    setLoading(true);
    try {
      let systemPrompt;
      if (isCodeRequest(currentMessage)) {
        systemPrompt = `You are Gemini, an expert coding assistant. The user is working on the following question:\nTitle: ${question?.title}\nDescription: ${question?.description}\nIf the user asks for code, generate only the code solution in ${language}. Otherwise, answer concisely.`;
      } else {
        systemPrompt = `You are Gemini, a friendly coding assistant. Respond conversationally and concisely unless the user asks for code or an explanation.`;
      }
      const { reply } = await aiChat({
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatMessages,
          { role: 'user', content: currentMessage }
        ],
        question,
        language
      });
      setChatMessages(prev => [...prev, { role: 'bot', content: reply }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'bot', content: 'AI error. Please try again.' }]);
    }
    setLoading(false);
    setCurrentMessage('');
  };

  const generateCode = async () => {
    setLoading(true);
    try {
      const systemPrompt = `You are Gemini, an expert coding assistant. The user is working on the following question:\nTitle: ${question?.title}\nDescription: ${question?.description}\nGenerate only the code solution for this question in ${language}. Do not include any explanation or comments outside the code.`;
      const { reply } = await aiChat({
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatMessages,
          { role: 'user', content: `Generate only the code solution for this question in ${language}.` }
        ],
        question,
        language
      });
      setGeneratedCode(reply);
      setChatMessages(prev => [
        ...prev,
        { role: 'bot', content: `Here is the ${language} code solution. You can save it below.` }
      ]);
    } catch (e) {
      setChatMessages(prev => [
        ...prev,
        { role: 'bot', content: 'AI error. Please try again.' }
      ]);
    }
    setLoading(false);
  };

  const saveCode = async () => {
    if (!generatedCode || !question?.id) return;
    try {
      await questionsAPI.saveCode(question.id, generatedCode);
      toast.success('Code saved!');
    } catch (e) {
      toast.error('Failed to save code.');
    }
  };

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%'}}
      // transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      transition={{ type: 'tween', duration: 0.5, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full w-2/5 z-50"
    >
      <div className="h-full glass-strong border-r border-white/10 flex flex-col backdrop-blur-xl">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-blue-400 flex items-center">
            <img src="/algosync-ai-logo.png" alt="AlgoSync AI" className="opacity-60 w-40 h-12 object-contain" />
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
            <div className="text-center flex flex-col items-center justify-center py-8">
              <img src="/ai-logo.png" alt="AlgoSync AI" className="mb-4 w-40 h-16 object-contain opacity-30" />
              <p className="text-gray-400 mb-4">
                Hey There, I'm AlgoSync ChatBot here to help you understand and solve coding problems!
              </p>
              {/* <Button
                onClick={generateCode}
                className="glass-light border-blue-500/30 text-gray-300 hover:bg-blue-500/20"
                disabled={loading}
              >
                <Code size={16} className="mr-2" />
                Generate Solution
              </Button> */}
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
                <div className="w-8 h-8 rounded-full glass-strong flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img src="/favicon.ico" alt="AlgoSync Logo" className=" w-6 h-6 object-contain" />
                </div>
              )}
              <div className={`max-w-[480px] p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-500/20 text-blue-100' 
                  : 'glass-light text-gray-300'
              }`}>
                {parseAIReply(message.content).map((section, i) =>
                  section.type === 'code' ? (
                    <div key={i} className="relative">
                      <pre className="bg-gray-900 text-green-300 rounded p-2 my-2 overflow-x-auto text-xs">
                        <code>{section.content}</code>
                      </pre>
                      {message.role === 'bot' && question?.id && (
                        <Button
                          size="sm"
                          className="absolute top-2 right-2 glass-light border-green-500/30 text-green-400 hover:bg-green-500/20 text-xs px-3 py-1 h-auto"
                          onClick={async () => {
                            try {
                              await questionsAPI.saveCode(question.id, section.content);
                              toast.success('Code saved!');
                            } catch {
                              toast.error('Failed to save code.');
                            }
                          }}
                        >
                          <Save size={12} className="mr-1" />
                          Save
                        </Button>
                      )}
                    </div>
                  ) : (
                    <ReactMarkdown
                      key={i}
                      components={{
                        p: ({node, ...props}) => <p className="text-sm leading-relaxed mb-2 whitespace-pre-line" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                        em: ({node, ...props}) => <em className="italic text-gray-300" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc ml-5" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal ml-5" {...props} />,
                        li: ({node, ...props}) => <li {...props} />,
                        code: ({node, ...props}) => <code className=" glass-strong px-1 rounded text-gray-300" {...props} />,
                      }}
                    >
                      {section.content}
                    </ReactMarkdown>
                  )
                )}
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-gray-400" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="text-center text-blue-300 text-xs py-2">AI is typing...</div>
          )}
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
            {/* <div className="mb-2">
              <label className="text-xs text-gray-400 mr-2">Language:</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-gray-800 text-white rounded px-2 py-1 text-xs">
                <option>Python</option>
                <option>JavaScript</option>
                <option>Java</option>
                <option>C++</option>
                <option>C#</option>
                <option>Go</option>
                <option>TypeScript</option>
                <option>Ruby</option>
                <option>PHP</option>
                <option>Swift</option>
                <option>Kotlin</option>
                <option>Rust</option>
              </select>
            </div> */}
            <Button
              onClick={sendMessage}
              className="bg-blue-500 hover:bg-blue-600 text-white self-end"
              size="sm"
              disabled={loading}
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
