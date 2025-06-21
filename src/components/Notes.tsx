import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Pin, 
  PinOff, 
  Trash2, 
  Edit3, 
  Save, 
  X,
  Calendar,
  Clock
} from 'lucide-react';
import { notesAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Note, CreateNoteData } from '../types/Note';
import { toast } from 'sonner';

const Notes = () => {
  const { isLoggedIn } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newNote, setNewNote] = useState<CreateNoteData>({
    title: '',
    content: '',
    tags: [],
    color: '#3B82F6'
  });

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  // Fetch notes on component mount
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotes();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Filter notes based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredNotes(filtered);
    } else {
      setFilteredNotes(notes);
    }
  }, [searchQuery, notes]);

  const fetchNotes = async () => {
    try {
      const fetchedNotes = await notesAPI.getNotes();
      setNotes(fetchedNotes);
      setFilteredNotes(fetchedNotes);
    } catch (error: any) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = () => {
    setIsCreating(true);
    setSelectedNote(null);
    setNewNote({
      title: '',
      content: '',
      tags: [],
      color: '#3B82F6'
    });
  };

  const handleSaveNote = async () => {
    if (!newNote.title.trim()) {
      toast.error('Note title is required');
      return;
    }

    try {
      const savedNote = await notesAPI.createNote(newNote);
      setNotes([savedNote, ...notes]);
      setIsCreating(false);
      setNewNote({ title: '', content: '', tags: [], color: '#3B82F6' });
      toast.success('Note created successfully!');
    } catch (error: any) {
      toast.error('Failed to create note');
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNote) return;

    try {
      const updatedNote = await notesAPI.updateNote(selectedNote._id, {
        title: selectedNote.title,
        content: selectedNote.content,
        tags: selectedNote.tags,
        color: selectedNote.color
      });
      
      setNotes(notes.map(note => 
        note._id === updatedNote._id ? updatedNote : note
      ));
      setIsEditing(false);
      toast.success('Note updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await notesAPI.deleteNote(noteId);
      setNotes(notes.filter(note => note._id !== noteId));
      if (selectedNote?._id === noteId) {
        setSelectedNote(null);
        setIsEditing(false);
      }
      toast.success('Note deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete note');
    }
  };

  const handleTogglePin = async (noteId: string) => {
    try {
      const updatedNote = await notesAPI.togglePin(noteId);
      setNotes(notes.map(note => 
        note._id === updatedNote._id ? updatedNote : note
      ));
      if (selectedNote?._id === noteId) {
        setSelectedNote(updatedNote);
      }
    } catch (error: any) {
      toast.error('Failed to toggle pin');
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setIsCreating(false);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">Please log in to view your notes</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-blue-400 text-lg">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full space-x-6">
      {/* Left Sidebar - Notes List */}
      <div className="w-80 flex-shrink-0">
        <div className="glass-strong rounded-xl p-6 h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-blue-400">Notes</h2>
            <Button
              onClick={handleCreateNote}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              size="sm"
            >
              <Plus size={16} className="mr-1" />
              New Note
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="glass-light border-gray-600 text-white placeholder:text-gray-400 pl-10"
            />
          </div>

          {/* Notes List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {filteredNotes.map((note) => (
                <motion.div
                  key={note._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`glass-light rounded-lg p-3 cursor-pointer transition-all hover:bg-white/10 ${
                    selectedNote?._id === note._id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleSelectNote(note)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {note.isPinned && <Pin size={12} className="text-yellow-400" />}
                        <h3 className="font-semibold text-white truncate">{note.title}</h3>
                      </div>
                      <p className="text-gray-400 text-sm truncate">{note.content}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(note.updatedAt)}
                        </span>
                        {note.tags.length > 0 && (
                          <Badge className="text-xs bg-blue-500/20 text-blue-300">
                            {note.tags[0]}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div 
                      className="w-3 h-3 rounded-full ml-2 flex-shrink-0"
                      style={{ backgroundColor: note.color }}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right Side - Note Editor */}
      <div className="flex-1">
        <div className="glass-strong rounded-xl p-6 h-full">
          {isCreating ? (
            // Create New Note
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-400">Create New Note</h3>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setIsCreating(false)}
                    variant="outline"
                    size="sm"
                    className="glass-light border-gray-600 text-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveNote}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    size="sm"
                  >
                    <Save size={16} className="mr-1" />
                    Save
                  </Button>
                </div>
              </div>

              <Input
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Note title..."
                className="glass-light border-gray-600 text-white placeholder:text-gray-400"
              />

              <Textarea
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Start writing your note..."
                className="glass-light border-gray-600 text-white placeholder:text-gray-400 min-h-64"
              />

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Color</label>
                <div className="flex space-x-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewNote({ ...newNote, color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newNote.color === color ? 'border-white' : 'border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : selectedNote ? (
            // Edit Existing Note
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-blue-400">Edit Note</h3>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <Calendar size={12} />
                    <span>Created: {formatDate(selectedNote.createdAt)}</span>
                    <Clock size={12} />
                    <span>Modified: {formatDate(selectedNote.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleTogglePin(selectedNote._id)}
                    variant="outline"
                    size="sm"
                    className={`glass-light border-gray-600 ${
                      selectedNote.isPinned ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    {selectedNote.isPinned ? <Pin size={16} /> : <PinOff size={16} />}
                  </Button>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    size="sm"
                    className="glass-light border-gray-600 text-gray-300"
                  >
                    <Edit3 size={16} />
                  </Button>
                  <Button
                    onClick={() => handleDeleteNote(selectedNote._id)}
                    variant="outline"
                    size="sm"
                    className="glass-light border-red-500/30 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              {isEditing ? (
                <>
                  <Input
                    value={selectedNote.title}
                    onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
                    className="glass-light border-gray-600 text-white"
                  />
                  <Textarea
                    value={selectedNote.content}
                    onChange={(e) => setSelectedNote({ ...selectedNote, content: e.target.value })}
                    className="glass-light border-gray-600 text-white min-h-64"
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="glass-light border-gray-600 text-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateNote}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Save size={16} className="mr-1" />
                      Save Changes
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white">{selectedNote.title}</h2>
                  <div className="glass-light p-4 rounded-lg">
                    <pre className="text-white whitespace-pre-wrap font-sans">
                      {selectedNote.content}
                    </pre>
                  </div>
                  {selectedNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedNote.tags.map((tag, index) => (
                        <Badge key={index} className="bg-blue-500/20 text-blue-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            // No Note Selected
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-400 text-lg mb-4">No note selected</div>
                <Button
                  onClick={handleCreateNote}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus size={16} className="mr-1" />
                  Create Your First Note
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
