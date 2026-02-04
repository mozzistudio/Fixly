const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`;
      }
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.fetch<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
  }) {
    return this.fetch<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.fetch<any>('/api/auth/me');
  }

  // Tickets
  async getTickets(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.fetch<{ data: any[]; total: number; page: number; pageSize: number; totalPages: number }>(
      `/api/tickets${query}`
    );
  }

  async getTicket(id: string) {
    return this.fetch<any>(`/api/tickets/${id}`);
  }

  async createTicket(data: any) {
    return this.fetch<any>('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTicket(id: string, data: any) {
    return this.fetch<any>(`/api/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateTicketStatus(id: string, status: string, notes?: string) {
    return this.fetch<any>(`/api/tickets/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, notes }),
    });
  }

  async assignTicket(id: string, assignedToId: string | null) {
    return this.fetch<any>(`/api/tickets/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assignedToId }),
    });
  }

  async addTicketNote(id: string, content: string) {
    return this.fetch<any>(`/api/tickets/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async diagnoseTicket(id: string) {
    return this.fetch<any>(`/api/tickets/${id}/ai/diagnose`, {
      method: 'POST',
    });
  }

  async estimateTicket(id: string) {
    return this.fetch<any>(`/api/tickets/${id}/ai/estimate`, {
      method: 'POST',
    });
  }

  async summarizeTicket(id: string) {
    return this.fetch<{ summary: string }>(`/api/tickets/${id}/ai/summarize`, {
      method: 'POST',
    });
  }

  // Customers
  async getCustomers(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.fetch<{ data: any[]; total: number }>(`/api/customers${query}`);
  }

  async getCustomer(id: string) {
    return this.fetch<any>(`/api/customers/${id}`);
  }

  async createCustomer(data: any) {
    return this.fetch<any>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomer(id: string, data: any) {
    return this.fetch<any>(`/api/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async addDevice(customerId: string, data: any) {
    return this.fetch<any>(`/api/customers/${customerId}/devices`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Inventory
  async getInventory(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.fetch<{ data: any[]; total: number }>(`/api/inventory${query}`);
  }

  async getInventoryItem(id: string) {
    return this.fetch<any>(`/api/inventory/${id}`);
  }

  async createInventoryItem(data: any) {
    return this.fetch<any>('/api/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInventoryItem(id: string, data: any) {
    return this.fetch<any>(`/api/inventory/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async adjustInventory(id: string, data: any) {
    return this.fetch<any>(`/api/inventory/${id}/adjust`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLowStockItems() {
    return this.fetch<any[]>('/api/inventory/low-stock');
  }

  // Invoices
  async getInvoices(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.fetch<{ data: any[]; total: number }>(`/api/invoices${query}`);
  }

  async getInvoice(id: string) {
    return this.fetch<any>(`/api/invoices/${id}`);
  }

  async createInvoice(data: any) {
    return this.fetch<any>('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async recordPayment(invoiceId: string, data: any) {
    return this.fetch<any>(`/api/invoices/${invoiceId}/payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Users
  async getUsers() {
    return this.fetch<any[]>('/api/users');
  }

  async getUser(id: string) {
    return this.fetch<any>(`/api/users/${id}`);
  }

  async createUser(data: any) {
    return this.fetch<any>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reports
  async getRevenueReport(startDate: string, endDate: string) {
    return this.fetch<any>(`/api/reports/revenue?startDate=${startDate}&endDate=${endDate}`);
  }

  async getTechnicianReport(startDate: string, endDate: string) {
    return this.fetch<any>(`/api/reports/technicians?startDate=${startDate}&endDate=${endDate}`);
  }

  async getTicketBreakdown(startDate: string, endDate: string) {
    return this.fetch<any>(`/api/reports/tickets/breakdown?startDate=${startDate}&endDate=${endDate}`);
  }

  // Organization
  async getDashboard() {
    return this.fetch<any>(`/api/organizations/current/dashboard`);
  }

  async getOrganization(id: string) {
    return this.fetch<any>(`/api/organizations/${id}`);
  }

  async updateOrganization(id: string, data: any) {
    return this.fetch<any>(`/api/organizations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getOrganizationSettings(id: string) {
    return this.fetch<any>(`/api/organizations/${id}/settings`);
  }

  async updateOrganizationSettings(id: string, data: any) {
    return this.fetch<any>(`/api/organizations/${id}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Notifications
  async getNotifications() {
    return this.fetch<any[]>(`/api/users/me/notifications`);
  }

  async markNotificationRead(id: string) {
    return this.fetch<any>(`/api/users/me/notifications/${id}/read`, {
      method: 'POST',
    });
  }

  // WhatsApp
  async getConversations() {
    return this.fetch<any[]>('/api/whatsapp/conversations');
  }

  async getConversation(ticketId: string) {
    return this.fetch<any[]>(`/api/whatsapp/conversations/${ticketId}`);
  }

  async sendWhatsAppMessage(ticketId: string, body: string) {
    return this.fetch<any>('/api/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify({ ticketId, body }),
    });
  }
}

export const api = new ApiClient(API_URL);
