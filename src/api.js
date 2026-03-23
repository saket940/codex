const jsonHeaders = { 'Content-Type': 'application/json' };

async function request(path, options = {}) {
  const response = await fetch(path, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export const api = {
  getInternships: () => request('/api/internships'),
  register: (payload) => request('/api/register', { method: 'POST', headers: jsonHeaders, body: JSON.stringify(payload) }),
  login: (payload) => request('/api/login', { method: 'POST', headers: jsonHeaders, body: JSON.stringify(payload) }),
  getDashboard: (userId) => request(`/api/users/${userId}/dashboard`),
  submitTask: (userId, day, payload) => request(`/api/users/${userId}/tasks/${day}/submit`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  }),
  getAdminSummary: () => request('/api/admin/summary'),
  createInternship: (payload) => request('/api/admin/internships', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  })
};
