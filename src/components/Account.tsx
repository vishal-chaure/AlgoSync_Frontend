import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { User, Mail, Lock, Camera, Download, Upload, FileText, Share2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { questionsAPI } from '../lib/api';

const Account = () => {
  const { login, register, logout, updateProfile, user, isLoggedIn } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStats, setImportStats] = useState({
    total: 0,
    imported: 0,
    skipped: 0,
    errors: 0
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    avatar: ''
  });

  // Update profile state when user data changes
  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  // Export questions to JSON file
  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const questions = await questionsAPI.getQuestions();
      
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        exportedBy: user?.username || user?.email,
        questions: questions,
        metadata: {
          totalQuestions: questions.length,
          solvedCount: questions.filter((q: any) => q.isSolved).length,
          importantCount: questions.filter((q: any) => q.isImportant).length
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `algo-sync-questions-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${questions.length} questions successfully!`);
    } catch (error: any) {
      toast.error('Failed to export data: ' + (error.message || 'Unknown error'));
    } finally {
      setExportLoading(false);
    }
  };

  // Import questions from JSON file
  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setImportProgress(0);
    setImportStats({ total: 0, imported: 0, skipped: 0, errors: 0 });

    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      console.log('Import data structure:', importData);
      
      if (!importData.questions || !Array.isArray(importData.questions)) {
        throw new Error('Invalid file format. Please select a valid AlgoSync export file.');
      }

      const questions = importData.questions;
      console.log('Questions to import:', questions.length);
      console.log('Sample question:', questions[0]);
      
      setImportStats(prev => ({ ...prev, total: questions.length }));

      let imported = 0;
      let skipped = 0;
      let errors = 0;

      // Get existing questions to check for duplicates
      const existingQuestions = await questionsAPI.getQuestions();
      const existingTitles = new Set(existingQuestions.map((q: any) => q.title.toLowerCase()));

      for (let i = 0; i < questions.length; i++) {
        try {
          const question = questions[i];
          
          // Skip if question with same title already exists
          if (existingTitles.has(question.title.toLowerCase())) {
            skipped++;
            continue;
          }

          // Prepare question data for import with all required fields
          const questionData = {
            title: question.title || question.name || 'Untitled Question',
            description: question.description || question.content || '',
            difficulty: question.difficulty || 'Medium',
            topic: question.topic || question.category || 'Arrays',
            topicTags: question.topicTags || question.tags || question.categories || [],
            platformTag: question.platformTag || question.platform || 'LeetCode',
            platformLink: question.platformLink || question.link || question.url || '',
            youtubeLink: question.youtubeLink || question.videoLink || '',
            language: question.language || 'JavaScript',
            examples: question.examples || question.example || [],
            constraints: question.constraints || question.constraint || [],
            savedCode: question.savedCode || question.code || question.solution || '',
            isSolved: question.isSolved || question.solved || false,
            isImportant: question.isImportant || question.important || question.starred || false,
            notes: question.notes || question.note || ''
          };

          console.log('Importing question:', questionData);

          await questionsAPI.createQuestion(questionData);
          imported++;
          
          // Update progress
          setImportProgress(((i + 1) / questions.length) * 100);
          setImportStats({ total: questions.length, imported, skipped, errors });
          
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 50));
          
        } catch (error: any) {
          errors++;
          console.error('Error importing question:', error);
          console.error('Question data:', questions[i]);
          
          // Log specific validation errors
          if (error.message) {
            console.error('Error message:', error.message);
          }
        }
      }

      const message = `Import completed! ${imported} imported, ${skipped} skipped (duplicates), ${errors} errors`;
      if (imported > 0) {
        toast.success(message);
      } else if (skipped > 0) {
        toast.info(message);
      } else {
        toast.error(message);
      }

    } catch (error: any) {
      toast.error('Import failed: ' + (error.message || 'Invalid file format'));
    } finally {
      setImportLoading(false);
      setImportProgress(0);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        if (!formData.email || !formData.password) {
          toast.error('Please fill in all required fields');
          return;
        }

        await login(formData.email, formData.password);
        toast.success('Login successful!');
      } else {
        // Register
        if (!formData.firstName || !formData.lastName || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
          toast.error('Please fill in all required fields');
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }

        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters long');
          return;
        }

        await register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        toast.success('Registration successful!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!profile.firstName || !profile.lastName || !profile.username || !profile.email) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profile.email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      await updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        username: profile.username,
        email: profile.email,
        avatar: profile.avatar
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const handleCancelEdit = () => {
    // Reset profile data to original user data
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        avatar: user.avatar || ''
      });
    }
    setIsEditing(false);
  };

  if (!isLoggedIn) {
    return (
      <motion.div
        className="max-w-md mx-auto mt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="glass-strong rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          
          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="glass-light border-gray-600 text-white placeholder:text-gray-400 pl-10"
                        placeholder="First name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="glass-light border-gray-600 text-white placeholder:text-gray-400 pl-10"
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="glass-light border-gray-600 text-white placeholder:text-gray-400 pl-10"
                    placeholder="Your username"
                  />
                </div>
              </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="glass-light border-gray-600 text-white placeholder:text-gray-400 pl-10"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="glass-light border-gray-600 text-white placeholder:text-gray-400 pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="glass-light border-gray-600 text-white placeholder:text-gray-400 pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              disabled={loading}
            >
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>
          
          <div className="text-center mt-6">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:text-blue-300 text-sm"
              disabled={loading}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-2xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Profile Overview */}
      <div className="glass-strong rounded-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-blue-400">Profile Overview</h2>
          <div className="flex space-x-2">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              className="glass-light border-gray-600 text-gray-300 hover:bg-white/5"
              disabled={loading}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="glass-light border-red-500/30 text-red-400 hover:bg-red-500/20"
              disabled={loading}
            >
              Sign Out
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full glass-light flex items-center justify-center">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User size={28} className="text-gray-400" />
              )}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{profile.firstName} {profile.lastName}</h3>
            <p className="text-gray-400">@{profile.username}</p>
            <p className="text-gray-400">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Edit Account Details - Only show when editing */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-strong rounded-xl p-8"
          >
        <h3 className="text-xl font-bold mb-6 text-blue-400">Edit Account Details</h3>
        
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full glass-light flex items-center justify-center">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User size={32} className="text-gray-400" />
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 glass rounded-full p-2 hover:bg-white/10"
              >
                <Camera size={16} className="text-blue-400" />
              </button>
            </div>
          </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">First Name</label>
                  <div className="glass-light rounded-lg">
                    <Input
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      className="bg-transparent border-0 text-white placeholder:text-gray-400 focus:ring-0"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Last Name</label>
                  <div className="glass-light rounded-lg">
                    <Input
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      className="bg-transparent border-0 text-white placeholder:text-gray-400 focus:ring-0"
                    />
                  </div>
                </div>
              </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Username</label>
            <div className="glass-light rounded-lg">
              <Input
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className="bg-transparent border-0 text-white placeholder:text-gray-400 focus:ring-0"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
            <div className="glass-light rounded-lg">
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="bg-transparent border-0 text-white placeholder:text-gray-400 focus:ring-0"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">New Password</label>
            <div className="glass-light rounded-lg">
              <Input
                type="password"
                className="bg-transparent border-0 text-white placeholder:text-gray-400 focus:ring-0"
                placeholder="Leave blank to keep current password"
              />
            </div>
          </div>
          
              <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
                  onClick={handleCancelEdit}
              variant="outline"
                  className="glass-light border-gray-600 text-gray-300 hover:bg-white/5"
                  disabled={loading}
            >
                  Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Management Section */}
      <motion.div
        className="glass-strong rounded-xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center space-x-3 mb-6">
          <Share2 className="text-blue-400" size={24} />
          <h3 className="text-xl font-bold text-blue-400">Data Management</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Export Section */}
          <div className="glass-light rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Download className="text-green-400" size={20} />
              <h4 className="text-lg font-semibold text-white">Export Questions</h4>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Export all your questions to a JSON file that you can share with friends or use as backup.
            </p>
            <Button
              onClick={handleExportData}
              disabled={exportLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              {exportLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Exporting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Download size={16} />
                  <span>Export Questions</span>
                </div>
              )}
            </Button>
          </div>

          {/* Import Section */}
          <div className="glass-light rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Upload className="text-blue-400" size={20} />
              <h4 className="text-lg font-semibold text-white">Import Questions</h4>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Import questions from a friend's export file. Duplicate questions will be skipped automatically.
            </p>
            
            {/* Hidden file input */}
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
              id="import-file"
              disabled={importLoading}
            />
            
            <label htmlFor="import-file">
              <Button
                disabled={importLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                asChild
              >
                <div>
                  {importLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Importing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Upload size={16} />
                      <span>Choose File to Import</span>
                    </div>
                  )}
                </div>
              </Button>
            </label>

            {/* Import Progress */}
            {importLoading && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-blue-400">{Math.round(importProgress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  ></div>
                </div>
                
                {/* Import Stats */}
                {importStats.total > 0 && (
                  <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                    <div className="text-center">
                      <div className="text-green-400 font-semibold">{importStats.imported}</div>
                      <div className="text-gray-400">Imported</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-400 font-semibold">{importStats.skipped}</div>
                      <div className="text-gray-400">Skipped</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-400 font-semibold">{importStats.errors}</div>
                      <div className="text-gray-400">Errors</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 glass-light rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-yellow-400 mt-1 flex-shrink-0" size={18} />
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white mb-1">How to share with friends:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-400">
                <li>Export your questions using the export button above</li>
                <li>Share the downloaded JSON file with your friend</li>
                <li>Your friend can import the file using the import button</li>
                <li>Duplicate questions will be automatically skipped</li>
              </ol>
            </div>
          </div>
      </div>
      </motion.div>
    </motion.div>
  );
};

export default Account;
