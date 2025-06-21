import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Dashboard from '../components/Dashboard';
import AddQuestion from '../components/AddQuestion';
import Notes from '../components/Notes';
import Account from '../components/Account';
import QuestionDetailPanel from '../components/QuestionDetailPanel';
import ChatbotPanel from '../components/ChatbotPanel';
import { Question } from '../types/Question';
import { useAuth } from '../contexts/AuthContext';
import Problems from '@/components/Problems';

const Index = () => {
  const { isLoggedIn, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);

  // Handle question deletion
  const handleQuestionDeleted = (questionId: string) => {
    setSelectedQuestion(null);
    // Optionally refresh the dashboard data here if needed
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-blue-400 text-lg">Loading...</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          onQuestionSelect={setSelectedQuestion} 
          hasLeftPanel={showChatbot}
          hasRightPanel={!!selectedQuestion}
        />;
        case 'problems':
      return <Problems onQuestionSelect={setSelectedQuestion} hasLeftPanel={showChatbot} hasRightPanel={!!selectedQuestion} />;
      case 'add-question':
        return <AddQuestion />;
      case 'notes':
        return <Notes />;
      case 'account':
        return <Account />;
      default:
        return <Dashboard 
          onQuestionSelect={setSelectedQuestion} 
          hasLeftPanel={showChatbot}
          hasRightPanel={!!selectedQuestion}
        />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoggedIn={isLoggedIn}
      />
      
      <div className="flex relative">
        {/* Left Chatbot Panel */}
        <AnimatePresence>
          {showChatbot && (
            <ChatbotPanel
              question={selectedQuestion}
              onClose={() => setShowChatbot(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.main 
          className="flex-1 p-6 overflow-hidden"
          animate={{ 
            marginLeft: showChatbot ? '384px' : '0px',
            marginRight: selectedQuestion ? '0px' : '0px'
          }}
          transition={{ 
            duration: 0.4,
            ease: "easeInOut"
          }}
          style={{
            willChange: 'margin-left, margin-right'
          }}
        >
          <div className="h-full overflow-y-auto">
            {renderContent()}
          </div>
        </motion.main>

        {/* Right Question Detail Panel */}
        <AnimatePresence>
          {selectedQuestion && (
            <QuestionDetailPanel
              question={selectedQuestion}
              onClose={() => setSelectedQuestion(null)}
              onShowChatbot={() => setShowChatbot(true)}
              onQuestionDeleted={handleQuestionDeleted}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
