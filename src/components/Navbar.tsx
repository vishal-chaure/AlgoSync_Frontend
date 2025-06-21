import { motion } from 'framer-motion';
import { Plus, Home, BookOpen, Notebook, User, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoggedIn: boolean;
}

const Navbar = ({ activeTab, setActiveTab, isLoggedIn }: NavbarProps) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'problems', label: 'Problems', icon: List },
    { id: 'add-question', label: 'Add Question', icon: Plus },
    { id: 'notes', label: 'Notes', icon: Notebook },
  ];

  return (
    <motion.nav 
      className="sticky top-0 z-50 glass-strong rounded-xl mx-6 mt-6 p-4 backdrop-blur-xl border border-white/10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <motion.div
            className="text-xl font-bold text-blue-400"
            whileHover={{ scale: 1.05 }}
          >
            DSA Manager
          </motion.div>
          
          <div className="flex items-center space-x-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* <Button
            onClick={() => setActiveTab('add-question')}
            className="glass-light border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
            size="sm"
          >
            <Plus size={16} className="mr-2" />
            Add Question
          </Button> */}
          
          <motion.button
            onClick={() => setActiveTab('account')}
            className={`p-2 rounded-full ${
              isLoggedIn ? 'glass-light' : 'bg-gray-600'
            } hover:bg-white/10 transition-all duration-200`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <User size={20} className={isLoggedIn ? 'text-blue-400' : 'text-gray-400'} />
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
