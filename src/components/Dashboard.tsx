import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Star, CheckCircle, ExternalLink, Youtube } from 'lucide-react';
import { Question, TopicSection } from '../types/Question';
import { questionsAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface DashboardProps {
  onQuestionSelect: (question: Question) => void;
  hasLeftPanel?: boolean;
  hasRightPanel?: boolean;
}

const Dashboard = ({ onQuestionSelect, hasLeftPanel = false, hasRightPanel = false }: DashboardProps) => {
  const { isLoggedIn } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    solved: 0,
    easy: 0,
    medium: 0,
    hard: 0
  });

  const [topics, setTopics] = useState<TopicSection[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate text size based on available space
  const getTextSize = () => {
    if (hasLeftPanel && hasRightPanel) {
      return 'text-xs'; // Smallest when both panels are open
    } else if (hasLeftPanel || hasRightPanel) {
      return 'text-sm'; // Medium when one panel is open
    } else {
      return 'text-base'; // Largest when no panels are open
    }
  };

  const getTitleSize = () => {
    if (hasLeftPanel && hasRightPanel) {
      return 'text-base'; // Smallest when both panels are open
    } else if (hasLeftPanel || hasRightPanel) {
      return 'text-lg'; // Medium when one panel is open
    } else {
      return 'text-xl'; // Largest when no panels are open
    }
  };

  // Fetch questions and stats
  const fetchData = async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    try {
      const [questions, statsData] = await Promise.all([
        questionsAPI.getQuestions(),
        questionsAPI.getStats()
      ]);

      // Process questions into topic sections
      const topicMap = new Map<string, Question[]>();

      questions.forEach((question: Question) => {
        if (!topicMap.has(question.topic)) {
          topicMap.set(question.topic, []);
        }
        topicMap.get(question.topic)!.push(question);
      });

      // Preserve existing expanded states
      const currentTopics = topics;
      const topicSections: TopicSection[] = Array.from(topicMap.entries()).map(([name, questions]) => {
        // Find existing topic to preserve its expanded state
        const existingTopic = currentTopics.find(topic => topic.name === name);
        return {
          name,
          questions,
          isExpanded: existingTopic ? existingTopic.isExpanded : false
        };
      });

      setTopics(topicSections);

      // Update stats
      if (statsData.overall) {
        setStats({
          total: statsData.overall.total,
          solved: statsData.overall.solved,
          easy: statsData.overall.easy,
          medium: statsData.overall.medium,
          hard: statsData.overall.hard
        });
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isLoggedIn]);

  const toggleTopic = (topicName: string) => {
    setTopics(topics.map(topic =>
      topic.name === topicName
        ? { ...topic, isExpanded: !topic.isExpanded }
        : topic
    ));
  };

  const handleTopicContainerClick = (event: React.MouseEvent, topicName: string) => {
    const target = event.target as HTMLElement;

    // Check if the click was inside the expanded content
    const expandedContent = target.closest('.topic-expanded-content');
    if (expandedContent) {
      // Don't toggle if clicking inside expanded content
      return;
    }

    // Check if the click was on the header area
    const headerArea = target.closest('.topic-header');
    if (headerArea) {
      toggleTopic(topicName);
    }
  };

  const toggleStar = async (questionId: string) => {
    try {
      await questionsAPI.toggleImportant(questionId);
      // Refresh data
      fetchData();
      toast.success('Question updated');
    } catch (error: any) {
      toast.error('Failed to update question');
    }
  };

  const toggleCompleted = async (questionId: string) => {
    try {
      await questionsAPI.toggleSolved(questionId);
      // Refresh data
      fetchData();
      toast.success('Question updated');
    } catch (error: any) {
      toast.error('Failed to update question');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-blue-400 text-lg">Loading questions...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">Please log in to view your questions</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Questions</h3>
          <p className="text-3xl font-bold text-blue-400">{stats.total}</p>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Solved</h3>
          <p className="text-3xl font-bold text-green-400">{stats.solved}</p>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">By Difficulty</h3>
          <div className="flex space-x-4">
            <span className="text-sm"><span className="text-green-400 font-semibold">{stats.easy}</span> Easy</span>
            <span className="text-sm"><span className="text-yellow-400 font-semibold">{stats.medium}</span> Medium</span>
            <span className="text-sm"><span className="text-red-400 font-semibold">{stats.hard}</span> Hard</span>
          </div>
        </div>
      </motion.div>

      {/* Topics Section */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {topics.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Questions Yet</h3>
            <p className="text-gray-400">Start by adding your first question!</p>
          </div>
        ) : (
          topics.map((topic) => (
            <div key={topic.name} className="glass rounded-xl overflow-hidden" onClick={(event) => handleTopicContainerClick(event, topic.name)}>
              <motion.div
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer topic-header"
                animate={{
                  fontSize: hasLeftPanel && hasRightPanel ? '14px' : hasLeftPanel || hasRightPanel ? '16px' : '20px'
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="flex items-center space-x-3">
                  {topic.isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  <h3 className={`font-semibold ${hasLeftPanel && hasRightPanel ? 'text-base' :
                      hasLeftPanel || hasRightPanel ? 'text-xl' : 'text-xl'
                    }`}>{topic.name}</h3>
                  <span className={`text-gray-400 ${hasLeftPanel && hasRightPanel ? 'text-xs' :
                      hasLeftPanel || hasRightPanel ? 'text-base' : 'text-base'
                    }`}>({topic.questions.length} questions)</span>
                </div>
              </motion.div>

              <AnimatePresence>
                {topic.isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden topic-expanded-content"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-4 pt-0 space-y-2" onClick={(e) => e.stopPropagation()}>
                      {topic.questions.map((question) => (
                        <motion.div
                          key={question.id}
                          className="glass-light rounded-lg p-4 hover:bg-white/5 transition-colors w-full"
                          whileHover={{ scale: 1 }}
                          whileTap={{ scale: 0.99 }}
                          animate={{
                            fontSize: hasLeftPanel && hasRightPanel ? '12px' : hasLeftPanel || hasRightPanel ? '14px' : '16px'
                          }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="flex items-center justify-between w-full">
                            {/* Left side - Title and difficulty (clickable area) */}
                            <div
                              className="flex items-center space-x-4 flex-1 cursor-pointer"
                              onClick={() => onQuestionSelect(question)}
                            >
                              <h4 className={`font-semibold ${hasLeftPanel && hasRightPanel ? 'text-sm' :
                                  hasLeftPanel || hasRightPanel ? 'text-lg' : 'text-lg'
                                }`}>{question.title}</h4>
                              <span className={`px-2 py-1 rounded font-medium ${question.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                  question.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-red-500/20 text-red-400'
                                } ${hasLeftPanel && hasRightPanel ? 'text-xs' :
                                  hasLeftPanel || hasRightPanel ? 'text-xs' : 'text-xs'
                                }`}>
                                {question.difficulty}
                              </span>
                              <div className="flex space-x-1">
                                {question.topicTags.slice(0, 2).map((tag) => (
                                  <span key={tag} className={`px-2 py-1 bg-blue-500/20 text-blue-400 rounded ${hasLeftPanel && hasRightPanel ? 'text-xs' :
                                      hasLeftPanel || hasRightPanel ? 'text-xs' : 'text-xs'
                                    }`}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Right side - Actions (non-clickable for panel opening) */}
                            <div className="flex items-center space-x-3">
                              {question.platformLink && (
                                <motion.a
                                  href={question.platformLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-${getTextSize()} text-gray-400 hover:text-blue-400 transition-colors`}
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
                                  className={`text-${getTextSize()} text-gray-400 hover:text-red-400 transition-colors`}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Youtube size={18} />
                                </motion.a>
                              )}

                              <motion.button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  (e.nativeEvent as any).stopImmediatePropagation();
                                  toggleStar(question.id);
                                }}
                                className={`text-${getTextSize()} text-gray-400 hover:text-yellow-400 transition-colors p-2 rounded-lg hover:bg-yellow-500/10`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Star
                                  size={20}
                                  className={question.isImportant ? 'text-yellow-400 fill-current' : 'text-gray-400'}
                                />
                              </motion.button>

                              <motion.button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  (e.nativeEvent as any).stopImmediatePropagation();
                                  toggleCompleted(question.id);
                                }}
                                className={`text-${getTextSize()} text-gray-400 hover:text-green-400 transition-colors p-2 rounded-lg hover:bg-green-500/10`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <CheckCircle
                                  size={20}
                                  className={question.isSolved ? 'text-green-400 fill-current' : 'text-gray-400'}
                                />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
