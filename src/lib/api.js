const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://algosyncbackend-production.up.railway.app/api';
// const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to set auth token
const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  // Register user
  register: async (userData) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    setAuthToken(data.token);
    return data;
  },

  // Login user
  login: async (credentials) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setAuthToken(data.token);
    return data;
  },

  // Get user profile
  getProfile: async () => {
    return await apiRequest('/auth/profile');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const data = await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    setAuthToken(data.token);
    return data;
  },

  // Logout
  logout: () => {
    setAuthToken(null);
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  },
};

// Questions API
export const questionsAPI = {
  // Get all questions
  getQuestions: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/questions${queryParams ? `?${queryParams}` : ''}`;
    return await apiRequest(endpoint);
  },

  // Get question by ID
  getQuestion: async (id) => {
    return await apiRequest(`/questions/${id}`);
  },

  // Create new question
  createQuestion: async (questionData) => {
    return await apiRequest('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  },

  // Update question
  updateQuestion: async (id, questionData) => {
    return await apiRequest(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
  },

  // Delete question
  deleteQuestion: async (id) => {
    return await apiRequest(`/questions/${id}`, {
      method: 'DELETE',
    });
  },

  // Toggle question importance
  toggleImportant: async (id) => {
    return await apiRequest(`/questions/${id}/toggle-important`, {
      method: 'PATCH',
    });
  },

  // Toggle question solved status
  toggleSolved: async (id) => {
    return await apiRequest(`/questions/${id}/toggle-solved`, {
      method: 'PATCH',
    });
  },

  // Get question statistics
  getStats: async () => {
    return await apiRequest('/questions/stats/overview');
  },

  // Save code for a question
  saveCode: async (id, code) => {
    return await apiRequest(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ savedCode: code }),
    });
  },
};

// Notes API
export const notesAPI = {
  // Get all notes
  getNotes: async () => {
    return await apiRequest('/notes');
  },

  // Get note by ID
  getNote: async (id) => {
    return await apiRequest(`/notes/${id}`);
  },

  // Create new note
  createNote: async (noteData) => {
    return await apiRequest('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  },

  // Update note
  updateNote: async (id, noteData) => {
    return await apiRequest(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  },

  // Delete note
  deleteNote: async (id) => {
    return await apiRequest(`/notes/${id}`, {
      method: 'DELETE',
    });
  },

  // Toggle pin status
  togglePin: async (id) => {
    return await apiRequest(`/notes/${id}/toggle-pin`, {
      method: 'PATCH',
    });
  },

  // Search notes
  searchNotes: async (query) => {
    return await apiRequest(`/notes/search?q=${encodeURIComponent(query)}`);
  },
};

export async function aiChat({ messages, question, language }) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify({ messages, question, language })
  });
  if (!res.ok) throw new Error('AI chat failed');
  return res.json();
}

export async function parseQuestionContent(content) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/ai/parse-question`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify({ content })
  });
  if (!res.ok) throw new Error('Question parsing failed');
  return res.json();
}

export default {
  auth: authAPI,
  questions: questionsAPI,
  notes: notesAPI,
}; 