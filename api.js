/**
 * ExamCraft AI — Frontend REST API Client
 * Manages JWT tokens, authenticated fetch requests, and server synchronization
 */

const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('examcraft_token') || null;
    this.user = null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('examcraft_token', token);
    } else {
      localStorage.removeItem('examcraft_token');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('examcraft_token');
  }

  async request(endpoint, options = {}) {
    const headers = options.headers || {};
    const token = this.getToken();

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      // Handle 401 Unauthorized
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        console.warn('Authentication token expired or invalid.');
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || `Server HTTP Error ${response.status}`);
      }
      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err.message);
      throw err;
    }
  }

  // --- Authentication ---
  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.token) {
      this.setToken(res.token);
      this.user = res.user;
    }
    return res;
  }

  async register(userData) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (res.token) {
      this.setToken(res.token);
      this.user = res.user;
    }
    return res;
  }

  async getCurrentUser() {
    try {
      const res = await this.request('/auth/me');
      this.user = res.user;
      return res.user;
    } catch (e) {
      return null;
    }
  }

  logout() {
    this.setToken(null);
    this.user = null;
  }

  // --- Dashboard ---
  async getDashboardMetrics() {
    return await this.request('/dashboard/metrics');
  }

  // --- Documents & Syllabus ---
  async uploadDocument(file) {
    const formData = new FormData();
    formData.append('document', file);
    return await this.request('/documents/upload', {
      method: 'POST',
      body: formData
    });
  }

  async listDocuments() {
    return await this.request('/documents');
  }

  async getDocument(id) {
    return await this.request(`/documents/${id}`);
  }

  async getDocumentStructure(id) {
    return await this.request(`/documents/${id}/structure`);
  }

  async deleteDocument(id) {
    return await this.request(`/documents/${id}`, { method: 'DELETE' });
  }

  // --- Blueprints ---
  async saveBlueprint(blueprint) {
    return await this.request('/blueprints', {
      method: 'POST',
      body: JSON.stringify(blueprint)
    });
  }

  async validateBlueprint(blueprint) {
    return await this.request('/blueprints/validate', {
      method: 'POST',
      body: JSON.stringify(blueprint)
    });
  }

  // --- Assessment Plan & Question Papers ---
  async getAssessmentPlan(blueprint, documentId = null) {
    return await this.request('/papers/plan', {
      method: 'POST',
      body: JSON.stringify({ blueprint, documentId })
    });
  }

  async generatePaper(blueprint, documentId = null, customPlan = null) {
    return await this.request('/papers/generate', {
      method: 'POST',
      body: JSON.stringify({ blueprint, documentId, customPlan })
    });
  }

  async listPapers(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return await this.request(`/papers?${params}`);
  }

  async getPaper(id) {
    return await this.request(`/papers/${id}`);
  }

  async updatePaper(id, data) {
    return await this.request(`/papers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async approvePaper(id) {
    return await this.request(`/papers/${id}/approve`, { method: 'POST' });
  }

  async duplicatePaper(id) {
    return await this.request(`/papers/${id}/duplicate`, { method: 'POST' });
  }

  async deletePaper(id) {
    return await this.request(`/papers/${id}`, { method: 'DELETE' });
  }

  // --- Question Bank ---
  async getQuestionBank(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return await this.request(`/questions/bank?${params}`);
  }

  async addToQuestionBank(question) {
    return await this.request('/questions/bank', {
      method: 'POST',
      body: JSON.stringify(question)
    });
  }

  async deleteFromQuestionBank(id) {
    return await this.request(`/questions/bank/${id}`, { method: 'DELETE' });
  }

  // --- Settings ---
  async getSettings() {
    return await this.request('/settings');
  }

  async saveSettings(settings) {
    return await this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // --- Analytics ---
  async getAnalytics() {
    return await this.request('/analytics');
  }

  // --- PDF Exports (Returns Direct Server URLs) ---
  getStudentPdfUrl(paperId) {
    const token = this.getToken();
    return `/api/exports/${paperId}/student-pdf?token=${token || ''}`;
  }

  getFacultyPdfUrl(paperId) {
    const token = this.getToken();
    return `/api/exports/${paperId}/faculty-pdf?token=${token || ''}`;
  }

  getAuditPdfUrl(paperId) {
    const token = this.getToken();
    return `/api/exports/${paperId}/audit-pdf?token=${token || ''}`;
  }
}

// Export singleton
window.ExamCraftApi = new ApiClient();
