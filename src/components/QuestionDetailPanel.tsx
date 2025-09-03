import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Question } from '../types/Question';
import { questionsAPI } from '../lib/api';
import { toast } from 'sonner';

interface QuestionDetailPanelProps {
  question: Question;
  onClose: () => void;
  onShowChatbot: () => void;
  onQuestionDeleted?: (questionId: string) => void;
}

const QuestionDetailPanel = ({ question, onClose, onShowChatbot, onQuestionDeleted }: QuestionDetailPanelProps) => {
  const [showSavedCode, setShowSavedCode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openInCodeEditor = () => {
    const token = localStorage.getItem("token"); // or wherever your token is stored
    const url = `http://localhost:8081/?question_id=${question.id}&token=${token}`;
    window.open(url, "_blank");
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await questionsAPI.deleteQuestion(question.id);
      toast.success('Question deleted successfully');
      onQuestionDeleted?.(question.id);
      onClose();
    } catch (error: any) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 120 }}
      className="fixed right-0 top-0 h-full w-2/5  z-50" //sm:w-[650px]
    >
      <div className="h-full glass-strong border-l border-white/10 flex flex-col backdrop-blur-xl">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-blue-400 truncate pr-2">{question.title}</h2>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {question.savedCode && (
              <Button
                onClick={() => setShowSavedCode(!showSavedCode)}
                variant="ghost"
                size="sm"
                className="text-green-400 hover:text-green-300 hover:bg-green-500/20"
              >
                {showSavedCode ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            )}
            <Button
              onClick={handleDelete}
              variant="ghost"
              size="sm"
              disabled={isDeleting}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
            >
              <Trash2 size={18} />
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex flex-wrap gap-1">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              question.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
              question.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {question.difficulty}
            </span>
            {question.topicTags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-300">Description</h3>
            <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
              {question.description}
            </p>
          </div>

          {question.examples && question.examples.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-gray-300">Examples</h3>
              <div className="space-y-2">
                {question.examples.map((example, index) => (
                  <div key={index} className="code-viewer p-3 rounded-lg">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap">{example}</pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {question.constraints && question.constraints.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-gray-300">Constraints</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {question.constraints.map((constraint, index) => (
                  <li key={index} className="text-xs">{constraint}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
            <Button
              onClick={onShowChatbot}
              className="glass-strong hover:glass-light text-white flex items-center text-sm px-3 py-2 w-full sm:w-auto"
            >
              <Code size={14} className="mr-1" />
              AlgoSync AI
            </Button>
            <Button
              onClick={openInCodeEditor}
              className="glass-strong hover:glass-light text-white flex items-center text-sm px-3 py-2 w-full sm:w-auto"
            >
              <Code size={14} className="mr-1" />
              Code Editor
            </Button>
          </div>

          {/* Saved Code Viewer */}
          <AnimatePresence>
            {showSavedCode && question.savedCode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-light p-4 rounded-lg border border-green-500/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-green-400">Saved Solution</h4>
                  <Button
                    onClick={() => setShowSavedCode(false)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white p-1 h-auto"
                  >
                    <X size={14} />
                  </Button>
                </div>
                <div className="code-viewer p-3 rounded border border-gray-600/50">
                  <pre className="text-xs text-gray-300 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap">
                    {question.savedCode}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionDetailPanel;
