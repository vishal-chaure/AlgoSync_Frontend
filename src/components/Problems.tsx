import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, SortAsc, SortDesc, ExternalLink, Youtube, Star, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Question } from '../types/Question';
import { questionsAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface ProblemsProps {
  onQuestionSelect: (question: Question) => void;
  hasLeftPanel?: boolean;
  hasRightPanel?: boolean;
}

type SortOption = 'alphabetical' | 'added' | 'difficulty-easy' | 'difficulty-hard';
type FilterOption = 'all' | 'solved' | 'unsolved' | 'important' | 'starred' | 'easy' | 'medium' | 'hard';

const Problems = ({ onQuestionSelect, hasLeftPanel = false, hasRightPanel = false }: ProblemsProps) => {
  const { isLoggedIn } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('added');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Fetch questions
  const fetchQuestions = async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    try {
      const data = await questionsAPI.getQuestions();
      setQuestions(data);
    } catch (error: any) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [isLoggedIn]);

  // Filter and sort questions
  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = questions;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(question =>
        question.title.toLowerCase().includes(query) ||
        question.description.toLowerCase().includes(query) ||
        question.topicTags.some(tag => tag.toLowerCase().includes(query)) ||
        question.topic.toLowerCase().includes(query)
      );
    }

    // Apply status/difficulty filter
    switch (filterBy) {
      case 'solved':
        filtered = filtered.filter(q => q.isSolved);
        break;
      case 'unsolved':
        filtered = filtered.filter(q => !q.isSolved);
        break;
      case 'important':
        filtered = filtered.filter(q => q.isImportant);
        break;
      case 'starred':
        filtered = filtered.filter(q => q.isImportant);
        break;
      case 'easy':
        filtered = filtered.filter(q => q.difficulty === 'Easy');
        break;
      case 'medium':
        filtered = filtered.filter(q => q.difficulty === 'Medium');
        break;
      case 'hard':
        filtered = filtered.filter(q => q.difficulty === 'Hard');
        break;
      default:
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'added':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'difficulty-easy':
        filtered.sort((a, b) => {
          const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        });
        break;
      case 'difficulty-hard':
        filtered.sort((a, b) => {
          const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
          return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
        });
        break;
    }

    return filtered;
  }, [questions, searchQuery, sortBy, filterBy]);

  const toggleStar = async (questionId: string) => {
    try {
      await questionsAPI.toggleImportant(questionId);
      fetchQuestions(); // Refresh data
      toast.success('Question updated');
    } catch (error: any) {
      toast.error('Failed to update question');
    }
  };

  const toggleCompleted = async (questionId: string) => {
    try {
      await questionsAPI.toggleSolved(questionId);
      fetchQuestions(); // Refresh data
      toast.success('Question updated');
    } catch (error: any) {
      toast.error('Failed to update question');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-blue-400 text-lg">Loading problems...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">Please log in to view your problems</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-blue-400 mb-2">All Problems</h1>
        <p className="text-gray-400">Browse and manage all your DSA problems</p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        className="glass rounded-xl p-6 space-y-4 overflow-x-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-col lg:flex-row gap-4 min-w-0">
          {/* Search */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problems by title, description, tags, or topic..."
                className="glass-light border-gray-600 text-white placeholder:text-gray-400 pl-10 w-full"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="lg:w-48 flex-shrink-0">
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="glass-light border-gray-600 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="glass-strong border-gray-600">
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="added">Recently Added</SelectItem>
                <SelectItem value="difficulty-easy">Easy to Hard</SelectItem>
                <SelectItem value="difficulty-hard">Hard to Easy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter */}
          <div className="lg:w-48 flex-shrink-0">
            <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
              <SelectTrigger className="glass-light border-gray-600 text-white">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent className="glass-strong border-gray-600">
                <SelectItem value="all">All Problems</SelectItem>
                <SelectItem value="solved">Solved</SelectItem>
                <SelectItem value="unsolved">Unsolved</SelectItem>
                <SelectItem value="important">Important</SelectItem>
                <SelectItem value="starred">Starred</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-400">
          Showing {filteredAndSortedQuestions.length} of {questions.length} problems
        </div>
      </motion.div>

      {/* Problems List */}
      <motion.div
        className="space-y-3 overflow-x-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {filteredAndSortedQuestions.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Problems Found</h3>
            <p className="text-gray-400">
              {searchQuery ? 'Try adjusting your search or filters' : 'Start by adding your first problem!'}
            </p>
          </div>
        ) : (
          filteredAndSortedQuestions.map((question, index) => (
            <motion.div
              key={question.id}
              className="glass-light rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer overflow-hidden"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => onQuestionSelect(question)}
            >
              <div className="flex items-center justify-between min-w-0">
                {/* Left side - Title and metadata */}
                <div className="flex items-center space-x-4 flex-1 min-w-0 overflow-hidden">
                  <h3 className={`font-semibold truncate ${
                    hasLeftPanel && hasRightPanel ? 'text-sm' : 
                    hasLeftPanel || hasRightPanel ? 'text-base' : 'text-lg'
                  }`}>{question.title}</h3>
                  
                  <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                    question.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                    question.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {question.difficulty}
                  </span>
                  
                  <span className="text-xs text-gray-400 bg-gray-500/20 px-2 py-1 rounded flex-shrink-0">
                    {question.topic}
                  </span>
                  
                  <div className="flex space-x-1 flex-shrink-0">
                    {question.topicTags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center space-x-3 flex-shrink-0">
                  {question.platformLink && (
                    <motion.a
                      href={question.platformLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={18} />
                    </motion.a>
                  )}
                  
                  {question.youtubeLink && (
                    <motion.a
                      href={question.youtubeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-red-400 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Youtube size={18} />
                    </motion.a>
                  )}
                  
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(question.id);
                    }}
                    className="text-gray-400 hover:text-yellow-400 transition-colors p-2 rounded-lg hover:bg-yellow-500/10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Star 
                      size={18} 
                      className={question.isImportant ? 'text-yellow-400 fill-current' : 'text-gray-400'} 
                    />
                  </motion.button>
                  
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCompleted(question.id);
                    }}
                    className="text-gray-400 hover:text-green-400 transition-colors p-2 rounded-lg hover:bg-green-500/10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <CheckCircle 
                      size={18} 
                      className={question.isSolved ? 'text-green-400 fill-current' : 'text-gray-400'} 
                    />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default Problems;
