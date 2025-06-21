import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, Trash2 } from 'lucide-react';
import { questionsAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const AddQuestion = () => {
  const { isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: '',
    platformTag: '',
    platformLink: '',
    youtubeLink: '',
    language: 'Java',
    code: '',
    questionNumber: ''
  });

  const [examples, setExamples] = useState<string[]>([]);
  const [constraints, setConstraints] = useState<string[]>([]);
  const [pastedContent, setPastedContent] = useState('');
  const [extractedTags, setExtractedTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  const commonTags = [
    'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math', 'Greedy',
    'Sorting', 'Depth-First Search', 'Breadth-First Search', 'Tree', 'Graph',
    'Binary Search', 'Two Pointers', 'Sliding Window', 'Backtracking',
    'Divide and Conquer', 'Heap', 'Stack', 'Queue', 'Linked List',
    'Trie', 'Union Find', 'Bit Manipulation', 'Recursion', 'Simulation'
  ];

  const languages = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'TypeScript',
    'PHP', 'Ruby', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB'
  ];

  const platforms = [
    { value: 'LeetCode', label: 'LeetCode' },
    { value: 'GFG', label: 'GeeksforGeeks' },
    { value: 'Codeforces', label: 'Codeforces' },
    { value: 'Other', label: 'Other' }
  ];

  // Topic categories for organizing questions
  const topicCategories = [
    'Arrays & Strings',
    'Linked Lists',
    'Trees & Graphs',
    'Dynamic Programming',
    'Greedy Algorithms',
    'Backtracking',
    'Binary Search',
    'Two Pointers',
    'Sliding Window',
    'Stack & Queue',
    'Heap & Priority Queue',
    'Hash Table',
    'Trie',
    'Union Find',
    'Bit Manipulation',
    'Math',
    'Sorting',
    'Recursion',
    'Design',
    'Other'
  ];

  // Extract question number from platform link
  const extractQuestionNumber = (link: string, platform: string) => {
    if (!link) return '';
    
    if (platform === 'LeetCode') {
      // Extract from LeetCode URL: https://leetcode.com/problems/two-sum/
      const match = link.match(/leetcode\.com\/problems\/[^\/]+\/?$/);
      if (match) {
        // Try to extract from the problem slug or look for number in the URL
        const slugMatch = link.match(/problems\/([^\/]+)/);
        if (slugMatch) {
          // Check if the slug starts with a number
          const slug = slugMatch[1];
          const numberMatch = slug.match(/^(\d+)/);
          if (numberMatch) {
            return numberMatch[1];
          }
        }
      }
    } else if (platform === 'GFG') {
      // Extract from GFG URL
      const match = link.match(/geeksforgeeks\.org\/problems\/[^\/]+\/(\d+)/);
      if (match) {
        return match[1];
      }
    } else if (platform === 'Codeforces') {
      // Extract from Codeforces URL
      const match = link.match(/codeforces\.com\/problemset\/problem\/(\d+)/);
      if (match) {
        return match[1];
      }
    }
    
    return '';
  };

  // Update title with question number
  const updateTitleWithNumber = (title: string, number: string) => {
    if (!number) return title;
    
    // Check if title already starts with a number
    const numberMatch = title.match(/^(\d+)[\.\s]/);
    if (numberMatch) {
      // Replace existing number
      return title.replace(/^\d+[\.\s]/, `${number}. `);
    } else {
      // Add number at the beginning
      return `${number}. ${title}`;
    }
  };

  // Handle platform link change
  const handlePlatformLinkChange = (link: string) => {
    const questionNumber = extractQuestionNumber(link, formData.platformTag);
    setFormData(prev => ({ 
      ...prev, 
      platformLink: link,
      questionNumber: questionNumber
    }));
    
    // Update title with question number if we have both
    if (questionNumber && formData.title) {
      const updatedTitle = updateTitleWithNumber(formData.title, questionNumber);
      setFormData(prev => ({ ...prev, title: updatedTitle }));
    }
  };

  // Handle question number manual input
  const handleQuestionNumberChange = (number: string) => {
    setFormData(prev => ({ ...prev, questionNumber: number }));
    
    // Update title with question number if we have both
    if (number && formData.title) {
      const updatedTitle = updateTitleWithNumber(formData.title, number);
      setFormData(prev => ({ ...prev, title: updatedTitle }));
    }
  };

  // Handle title change
  const handleTitleChange = (title: string) => {
    const updatedTitle = formData.questionNumber ? 
      updateTitleWithNumber(title, formData.questionNumber) : title;
    setFormData(prev => ({ ...prev, title: updatedTitle }));
  };

  const parseContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());

    if (lines.length > 0) {
      // Extract question number first
      let extractedNumber = '';
      for (const line of lines) {
        // Look for patterns like "1.", "Problem 1:", "Q1:", etc.
        const numberMatch = line.match(/^(?:Problem\s*)?(?:Q\s*)?(\d+)[\.\s:]/i);
        if (numberMatch) {
          extractedNumber = numberMatch[1];
          break;
        }
        // Also check for numbers in brackets or parentheses
        const bracketMatch = line.match(/[\[\(](\d+)[\]\)]/);
        if (bracketMatch) {
          extractedNumber = bracketMatch[1];
          break;
        }
      }

      // Extract title - look for the actual question title
      const titleLine = lines.find(line =>
        line.match(/^\d+\.\s+/) ||
        (line.toLowerCase().includes('jump') || 
         line.toLowerCase().includes('sum') ||
         line.toLowerCase().includes('array') ||
         line.toLowerCase().includes('string') ||
         line.toLowerCase().includes('tree') ||
         line.toLowerCase().includes('graph') ||
         line.toLowerCase().includes('linked') ||
         line.toLowerCase().includes('stack') ||
         line.toLowerCase().includes('queue') ||
         line.toLowerCase().includes('heap') ||
         line.toLowerCase().includes('binary') ||
         line.toLowerCase().includes('sort') ||
         line.toLowerCase().includes('search') ||
         line.toLowerCase().includes('dynamic') ||
         line.toLowerCase().includes('greedy') ||
         line.toLowerCase().includes('backtrack') ||
         line.toLowerCase().includes('recursion') ||
         line.toLowerCase().includes('math') ||
         line.toLowerCase().includes('bit') ||
         line.toLowerCase().includes('trie') ||
         line.toLowerCase().includes('union') ||
         line.toLowerCase().includes('sliding') ||
         line.toLowerCase().includes('two pointer')) &&
        !line.toLowerCase().includes('example') && 
        !line.toLowerCase().includes('input') && 
        !line.toLowerCase().includes('output') &&
        !line.toLowerCase().includes('constraint') &&
        !line.toLowerCase().includes('note') &&
        !line.toLowerCase().includes('solved') &&
        !line.toLowerCase().includes('medium') &&
        !line.toLowerCase().includes('easy') &&
        !line.toLowerCase().includes('hard') &&
        !line.toLowerCase().includes('topics') &&
        !line.toLowerCase().includes('companies') &&
        !line.toLowerCase().includes('premium') &&
        !line.toLowerCase().includes('lock') &&
        !line.toLowerCase().includes('icon') &&
        !line.toLowerCase().includes('seen') &&
        !line.toLowerCase().includes('interview') &&
        !line.toLowerCase().includes('accepted') &&
        !line.toLowerCase().includes('acceptance') &&
        !line.toLowerCase().includes('rate') &&
        line.length > 5
      );

      if (titleLine) {
        const cleanTitle = titleLine
          .replace(/^\d+\.\s*/, '')
          .replace(/^Problem\s*:?\s*/i, '')
          .replace(/^Q\d*\s*:?\s*/i, '')
          .trim();
        
        // Update title with question number if available
        const finalTitle = extractedNumber ? 
          updateTitleWithNumber(cleanTitle, extractedNumber) : cleanTitle;
        setFormData(prev => ({ 
          ...prev, 
          title: finalTitle,
          questionNumber: extractedNumber || prev.questionNumber
        }));
      }

      // Extract difficulty - look for difficulty indicators
      const contentLower = content.toLowerCase();
      let extractedDifficulty = '';
      if (contentLower.includes('easy')) {
        extractedDifficulty = 'Easy';
      } else if (contentLower.includes('medium')) {
        extractedDifficulty = 'Medium';
      } else if (contentLower.includes('hard')) {
        extractedDifficulty = 'Hard';
      }

      if (extractedDifficulty) {
        setFormData(prev => ({ ...prev, difficulty: extractedDifficulty }));
      }

      // Extract description - filter out UI elements and metadata
      let descriptionLines = [];
      let foundExamples = false;
      let foundConstraints = false;
      let foundTopics = false;
      let titleFound = false;

      for (const line of lines) {
        const lineLower = line.toLowerCase();
        
        // Skip UI elements and metadata
        if (lineLower.includes('solved') ||
            lineLower.includes('companies') ||
            lineLower.includes('premium') ||
            lineLower.includes('lock') ||
            lineLower.includes('icon') ||
            lineLower.includes('seen') ||
            lineLower.includes('interview') ||
            lineLower.includes('accepted') ||
            lineLower.includes('acceptance') ||
            lineLower.includes('rate') ||
            lineLower.includes('yes') ||
            lineLower.includes('no') ||
            lineLower.includes('1/5') ||
            lineLower.includes('1,746,908') ||
            lineLower.includes('4.2m') ||
            lineLower.includes('41.5%')) {
          continue;
        }

        // Mark when we find the title
        if (titleLine && line.includes(titleLine.replace(/^\d+\.\s*/, '').replace(/^Problem\s*:?\s*/i, '').replace(/^Q\d*\s*:?\s*/i, ''))) {
          titleFound = true;
          continue;
        }

        // Stop when we hit examples, constraints, or topics
        if (lineLower.includes('example') ||
          lineLower.includes('constraint') ||
          lineLower.includes('input:') ||
          lineLower.includes('output:') ||
          lineLower.includes('note:') ||
          lineLower.includes('follow-up') ||
          lineLower.includes('topics:')) {
          foundExamples = true;
          break;
        }
        
        // Only add lines after title is found and before examples/constraints
        if (titleFound && 
            line.trim().length > 0 &&
            !line.match(/^\d+\.\s+/) && 
            !lineLower.includes('problem:') &&
            !lineLower.includes('easy') &&
            !lineLower.includes('medium') &&
            !lineLower.includes('hard') &&
            !lineLower.includes('difficulty') &&
            !lineLower.includes('tags:') &&
            !lineLower.includes('categories:')) {
          descriptionLines.push(line);
        }
      }

      if (descriptionLines.length > 0) {
        const description = descriptionLines.join('\n').trim();
        setFormData(prev => ({ ...prev, description }));
      } else {
        // Fallback: if no description found, use content between title and examples
        const titleIndex = lines.findIndex(line => 
          line.includes(titleLine?.replace(/^\d+\.\s*/, '').replace(/^Problem\s*:?\s*/i, '').replace(/^Q\d*\s*:?\s*/i, '') || '')
        );
        
        if (titleIndex !== -1) {
          const exampleIndex = lines.findIndex((line, index) => 
            index > titleIndex && 
            (line.toLowerCase().includes('example') || line.toLowerCase().includes('constraint'))
          );
          
          const endIndex = exampleIndex !== -1 ? exampleIndex : lines.length;
          const fallbackDescription = lines
            .slice(titleIndex + 1, endIndex)
            .filter(line => 
              line.trim().length > 0 &&
              !line.toLowerCase().includes('easy') &&
              !line.toLowerCase().includes('medium') &&
              !line.toLowerCase().includes('hard') &&
              !line.toLowerCase().includes('difficulty') &&
              !line.toLowerCase().includes('tags:') &&
              !line.toLowerCase().includes('categories:')
            )
            .join('\n')
            .trim();
          
          if (fallbackDescription) {
            setFormData(prev => ({ ...prev, description: fallbackDescription }));
          }
        }
      }

      // Extract examples
      const extractedExamples = [];
      let currentExample = '';
      let inExample = false;

      for (const line of lines) {
        if (line.toLowerCase().includes('example')) {
          if (currentExample.trim() && inExample) {
            extractedExamples.push(currentExample.trim());
          }
          currentExample = line + '\n';
          inExample = true;
        } else if (line.toLowerCase().includes('constraint') ||
          line.toLowerCase().includes('note:') ||
          line.toLowerCase().includes('follow-up')) {
          if (currentExample.trim() && inExample) {
            extractedExamples.push(currentExample.trim());
          }
          inExample = false;
          break;
        } else if (inExample) {
          currentExample += line + '\n';
        }
      }

      if (currentExample.trim() && inExample) {
        extractedExamples.push(currentExample.trim());
      }

      setExamples(extractedExamples);

      // Extract constraints
      const extractedConstraints = [];
      let inConstraints = false;

      for (const line of lines) {
        if (line.toLowerCase().includes('constraint')) {
          inConstraints = true;
          continue;
        }
        if (inConstraints) {
          if (line.toLowerCase().includes('note:') ||
            line.toLowerCase().includes('follow-up') ||
            line.toLowerCase().includes('example')) {
            break;
          }
          if (line.trim() && (line.includes('≤') || line.includes('<=') || line.includes('>=') || line.match(/\d+/))) {
            extractedConstraints.push(line.trim());
          }
        }
      }

      setConstraints(extractedConstraints);

      // Enhanced tag detection - specifically look for Topics section
      const detectedTags = [];

      // Look for Topics section specifically
      let inTopicsSection = false;
      for (const line of lines) {
        const lineLower = line.toLowerCase();
        
        if (lineLower.includes('topics')) {
          inTopicsSection = true;
          continue;
        }
        
        if (inTopicsSection) {
          // Stop when we hit another section
          if (lineLower.includes('companies') || 
              lineLower.includes('seen') || 
              lineLower.includes('interview') ||
              lineLower.includes('accepted') ||
              lineLower.includes('acceptance')) {
            break;
          }
          
          // Extract tags from the topics section
          const tagMatch = line.match(/^([A-Za-z\s]+)$/);
          if (tagMatch && tagMatch[1].trim()) {
            const tag = tagMatch[1].trim();
            const matchingTag = commonTags.find(commonTag => 
              commonTag.toLowerCase() === tag.toLowerCase()
            );
            if (matchingTag) {
              detectedTags.push(matchingTag);
            }
          }
        }
      }

      // Also check for explicit tags in the content
      const explicitTags = contentLower.match(/(?:tags?|categories?|topics?):\s*([^\n]+)/i);
      if (explicitTags) {
        const tagList = explicitTags[1].split(/[,;]/).map(tag => tag.trim());
        tagList.forEach(tag => {
          const matchingTag = commonTags.find(commonTag => 
            commonTag.toLowerCase() === tag.toLowerCase()
          );
          if (matchingTag && !detectedTags.includes(matchingTag)) {
            detectedTags.push(matchingTag);
          }
        });
      }

      // Algorithm-based detection as fallback
      commonTags.forEach(tag => {
        const tagLower = tag.toLowerCase();
        if (contentLower.includes(tagLower) ||
          contentLower.includes(tagLower.replace(' ', '')) ||
          contentLower.includes(tagLower.replace(' ', '-'))) {
          if (!detectedTags.includes(tag)) {
            detectedTags.push(tag);
          }
        }
      });

      // Pattern-based detection
      if (contentLower.includes('two pointer') || (contentLower.includes('left') && contentLower.includes('right'))) {
        if (!detectedTags.includes('Two Pointers')) {
          detectedTags.push('Two Pointers');
        }
      }
      if (contentLower.includes('sliding window') || (contentLower.includes('subarray') && contentLower.includes('window'))) {
        if (!detectedTags.includes('Sliding Window')) {
          detectedTags.push('Sliding Window');
        }
      }
      if (contentLower.includes('binary search') || contentLower.includes('sorted array')) {
        if (!detectedTags.includes('Binary Search')) {
          detectedTags.push('Binary Search');
        }
      }
      if (contentLower.includes('dp') || contentLower.includes('dynamic programming') || contentLower.includes('memoization')) {
        if (!detectedTags.includes('Dynamic Programming')) {
          detectedTags.push('Dynamic Programming');
        }
      }
      if (contentLower.includes('graph') || (contentLower.includes('node') && contentLower.includes('edge'))) {
        if (!detectedTags.includes('Graph')) {
          detectedTags.push('Graph');
        }
      }
      if (contentLower.includes('tree') || contentLower.includes('binary tree') || contentLower.includes('root')) {
        if (!detectedTags.includes('Tree')) {
          detectedTags.push('Tree');
        }
      }
      if (contentLower.includes('backtrack') || contentLower.includes('recursion')) {
        if (!detectedTags.includes('Backtracking')) {
          detectedTags.push('Backtracking');
        }
      }
      if (contentLower.includes('greedy') || contentLower.includes('optimal')) {
        if (!detectedTags.includes('Greedy')) {
          detectedTags.push('Greedy');
        }
      }
      if (contentLower.includes('sort') || contentLower.includes('sorted')) {
        if (!detectedTags.includes('Sorting')) {
          detectedTags.push('Sorting');
        }
      }
      if (contentLower.includes('hash') || contentLower.includes('map') || contentLower.includes('dictionary')) {
        if (!detectedTags.includes('Hash Table')) {
          detectedTags.push('Hash Table');
        }
      }
      if (contentLower.includes('stack') || contentLower.includes('queue')) {
        if (!detectedTags.includes('Stack')) {
          detectedTags.push('Stack');
        }
        if (!detectedTags.includes('Queue')) {
          detectedTags.push('Queue');
        }
      }
      if (contentLower.includes('linked list') || contentLower.includes('node.next')) {
        if (!detectedTags.includes('Linked List')) {
          detectedTags.push('Linked List');
        }
      }
      if (contentLower.includes('heap') || contentLower.includes('priority queue')) {
        if (!detectedTags.includes('Heap')) {
          detectedTags.push('Heap');
        }
      }
      if (contentLower.includes('trie') || contentLower.includes('prefix tree')) {
        if (!detectedTags.includes('Trie')) {
          detectedTags.push('Trie');
        }
      }
      if (contentLower.includes('union find') || contentLower.includes('disjoint set')) {
        if (!detectedTags.includes('Union Find')) {
          detectedTags.push('Union Find');
        }
      }
      // More specific Bit Manipulation detection to avoid false positives
      if (contentLower.includes('bit manipulation') || 
          contentLower.includes('bitwise') || 
          contentLower.includes('xor') || 
          contentLower.includes('bitwise and') || 
          contentLower.includes('bitwise or') || 
          contentLower.includes('bitwise xor') ||
          contentLower.includes('left shift') ||
          contentLower.includes('right shift') ||
          contentLower.includes('bit mask') ||
          contentLower.includes('bit mask') ||
          (contentLower.includes('bit') && (
            contentLower.includes('operation') ||
            contentLower.includes('manipulation') ||
            contentLower.includes('xor') ||
            contentLower.includes('and') ||
            contentLower.includes('or') ||
            contentLower.includes('shift')
          ))) {
        if (!detectedTags.includes('Bit Manipulation')) {
          detectedTags.push('Bit Manipulation');
        }
      }
      if (contentLower.includes('math') || contentLower.includes('arithmetic') || contentLower.includes('modulo')) {
        if (!detectedTags.includes('Math')) {
          detectedTags.push('Math');
        }
      }

      const uniqueTags = [...new Set(detectedTags)];
      setExtractedTags(uniqueTags);
      setSelectedTags([]);
    }
  };

  const handlePasteAnalysis = () => {
    if (pastedContent.trim()) {
      parseContent(pastedContent);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const addExample = () => {
    setExamples([...examples, '']);
  };

  const updateExample = (index: number, value: string) => {
    const newExamples = [...examples];
    newExamples[index] = value;
    setExamples(newExamples);
  };

  const removeExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  const addConstraint = () => {
    setConstraints([...constraints, '']);
  };

  const updateConstraint = (index: number, value: string) => {
    const newConstraints = [...constraints];
    newConstraints[index] = value;
    setConstraints(newConstraints);
  };

  const removeConstraint = (index: number) => {
    setConstraints(constraints.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.error('Please log in to add questions');
      return;
    }

    // Validate required fields
    if (!formData.title || !formData.description || !formData.difficulty || !formData.platformTag || !formData.platformLink || !selectedTopic) {
      toast.error('Please fill in all required fields including topic category');
      return;
    }

    setLoading(true);

    try {
      // Auto-determine topic from first selected tag
      let autoTopic = 'Arrays'; // default
      if (selectedTags.length > 0) {
        const firstTag = selectedTags[0];
        const tagToTopicMap: { [key: string]: string } = {
          'Array': 'Arrays',
          'String': 'Strings',
          'Linked List': 'Linked Lists',
          'Stack': 'Stacks & Queues',
          'Queue': 'Stacks & Queues',
          'Tree': 'Trees',
          'Graph': 'Graphs',
          'Dynamic Programming': 'Dynamic Programming',
          'Greedy': 'Greedy',
          'Backtracking': 'Backtracking',
          'Sorting': 'Sorting',
          'Binary Search': 'Searching',
          'Math': 'Math',
          'Bit Manipulation': 'Bit Manipulation'
        };
        autoTopic = tagToTopicMap[firstTag] || 'Arrays';
      }

      const questionData = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        platformTag: formData.platformTag,
        platformLink: formData.platformLink,
        youtubeLink: formData.youtubeLink || '',
        language: formData.language,
        topicTags: selectedTags.length > 0 ? selectedTags : [],
        topic: selectedTopic,
        examples: examples || [],
        constraints: constraints || [],
        savedCode: formData.code || '',
        isImportant: false,
        isSolved: false
      };

      console.log('Sending question data:', questionData);

      await questionsAPI.createQuestion(questionData);
      toast.success('Question added successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        difficulty: '',
        platformTag: '',
        platformLink: '',
        youtubeLink: '',
        language: 'JavaScript',
        code: '',
        questionNumber: ''
      });
      setExamples([]);
      setConstraints([]);
      setPastedContent('');
      setExtractedTags([]);
      setSelectedTags([]);
      setSelectedTopic('');
      
    } catch (error: any) {
      console.error('Error creating question:', error);
      
      if (error.message) {
        if (error.message.includes('Validation error')) {
          toast.error('Please check all required fields are filled correctly');
        } else if (error.message.includes('already exists')) {
          toast.error('A question with this title already exists');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Failed to add question. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="glass-strong rounded-xl p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-blue-400">Add New Question</h2>

        {/* Paste Content Section */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Paste Question Content
          </label>
          <Textarea
            value={pastedContent}
            onChange={(e) => setPastedContent(e.target.value)}
            placeholder="Paste the entire question content from LeetCode, GeeksforGeeks, or other platforms here..."
            className="glass-light border-gray-600 text-white placeholder:text-gray-400 min-h-32"
          />
          <Button
            type="button"
            onClick={handlePasteAnalysis}
            className="mt-2 glass-light border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
          >
            Extract Question Details
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Question Number</label>
              <Input
                value={formData.questionNumber}
                onChange={(e) => handleQuestionNumberChange(e.target.value)}
                className="glass-light border-gray-600 text-white placeholder:text-gray-400"
                placeholder="e.g., 1, 2, 3..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="glass-light border-gray-600 text-white placeholder:text-gray-400"
                placeholder="Question title"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Difficulty</label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                <SelectTrigger className="glass-light border-gray-600 text-white">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent className="glass-strong border-gray-600">
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Topic Category */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Topic Category</label>
              <Select value={selectedTopic} onValueChange={(value) => setSelectedTopic(value)}>
                <SelectTrigger className="glass-light border-gray-600 text-white">
                  <SelectValue placeholder="Select topic category" />
                </SelectTrigger>
                <SelectContent className="glass-strong border-gray-600">
                  {topicCategories.map(topic => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Platform Tag</label>
              <Select value={formData.platformTag} onValueChange={(value) => setFormData({ ...formData, platformTag: value })}>
                <SelectTrigger className="glass-light border-gray-600 text-white">
                  <SelectValue placeholder="Select platform tag" />
                </SelectTrigger>
                <SelectContent className="glass-strong border-gray-600">
                  {platforms.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>{platform.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Language</label>
              <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                <SelectTrigger className="glass-light border-gray-600 text-white">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="glass-strong border-gray-600">
                  {languages.map((language) => (
                    <SelectItem key={language} value={language}>{language}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Platform Link</label>
              <Input
                value={formData.platformLink}
                onChange={(e) => handlePlatformLinkChange(e.target.value)}
                className="glass-light border-gray-600 text-white placeholder:text-gray-400"
                placeholder="https://leetcode.com/problems/..."
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-300">YouTube Link (Optional)</label>
              <Input
                value={formData.youtubeLink}
                onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
                className="glass-light border-gray-600 text-white placeholder:text-gray-400"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="glass-light border-gray-600 text-white placeholder:text-gray-400 min-h-32"
              placeholder="Question description..."
            />
          </div>

          {/* Extracted Tags Section */}
          {extractedTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Select Tags (Extracted from content)
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Select the relevant tags for this question:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {extractedTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => toggleTag(tag)}
                      className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <label
                      htmlFor={tag}
                      className="text-sm text-gray-300 cursor-pointer hover:text-white transition-colors"
                    >
                      {tag}
                    </label>
                  </div>
                ))}
              </div>

              {selectedTags.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Selected tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} className="bg-blue-500/30 text-blue-300 border-blue-500/50">
                        {tag}
                        <X
                          size={14}
                          className="ml-1 cursor-pointer hover:text-blue-200"
                          onClick={() => toggleTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Examples Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-300">Examples</label>
              <Button
                type="button"
                onClick={addExample}
                className="glass-light border-green-500/30 text-green-400 hover:bg-green-500/20 text-xs px-3 py-1 h-auto"
              >
                <Plus size={12} className="mr-1" />
                Add Example
              </Button>
            </div>
            <div className="space-y-3">
              {examples.map((example, index) => (
                <div key={index} className="glass-light p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-400">Example {index + 1}</span>
                    <Button
                      type="button"
                      onClick={() => removeExample(index)}
                      className="text-red-400 hover:text-red-300 p-1 h-auto"
                      variant="ghost"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <Textarea
                    value={example}
                    onChange={(e) => updateExample(index, e.target.value)}
                    className="code-viewer text-sm min-h-20 font-mono"
                    placeholder="Input: [1,2,3]&#10;Output: 6&#10;Explanation: ..."
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Constraints Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-300">Constraints</label>
              <Button
                type="button"
                onClick={addConstraint}
                className="glass-light border-green-500/30 text-green-400 hover:bg-green-500/20 text-xs px-3 py-1 h-auto"
              >
                <Plus size={12} className="mr-1" />
                Add Constraint
              </Button>
            </div>
            <div className="space-y-3">
              {constraints.map((constraint, index) => (
                <div key={index} className="glass-light p-3 rounded-lg flex items-center space-x-3">
                  <Input
                    value={constraint}
                    onChange={(e) => updateConstraint(index, e.target.value)}
                    className="glass-light border-gray-600 text-white placeholder:text-gray-400 text-sm"
                    placeholder="1 <= n <= 1000"
                  />
                  <Button
                    type="button"
                    onClick={() => removeConstraint(index)}
                    className="text-red-400 hover:text-red-300 p-2 h-auto flex-shrink-0"
                    variant="ghost"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Your Code (Optional)</label>
            <Textarea
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="code-viewer text-sm min-h-32 font-mono"
              placeholder="// Your solution code here"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
            <Button
              type="button"
              variant="outline"
              className="glass-light border-gray-600 text-gray-300 hover:bg-white/5 w-full sm:w-auto"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Question'}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddQuestion;
