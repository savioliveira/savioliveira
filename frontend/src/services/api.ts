import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Interceptor para adicionar token
    this.api.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Interceptor para tratar respostas
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().logout()
          window.location.href = '/login'
        }
        
        const message = error.response?.data?.detail || 'Erro na requisição'
        toast.error(message)
        
        return Promise.reject(error)
      }
    )
  }

  // Auth
  async login(username: string, password: string) {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    
    const response = await this.api.post('/auth/token', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }

  async register(username: string, email: string, password: string) {
    const response = await this.api.post('/auth/register', {
      username,
      email,
      password,
    })
    return response.data
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/me')
    return response.data
  }

  // Chat
  async getChatSessions() {
    const response = await this.api.get('/chat/sessions')
    return response.data
  }

  async getChatMessages(sessionId: number) {
    const response = await this.api.get(`/chat/sessions/${sessionId}/messages`)
    return response.data
  }

  async sendChatMessage(message: string, sessionId?: number) {
    const response = await this.api.post('/chat/chat', {
      message,
      session_id: sessionId,
    })
    return response.data
  }

  async deleteChatSession(sessionId: number) {
    await this.api.delete(`/chat/sessions/${sessionId}`)
  }

  async updateSessionTitle(sessionId: number, title: string) {
    await this.api.put(`/chat/sessions/${sessionId}/title`, { title })
  }

  // Automations
  async getAutomations(typeFilter?: string, activeOnly?: boolean) {
    const params = new URLSearchParams()
    if (typeFilter) params.append('type_filter', typeFilter)
    if (activeOnly) params.append('active_only', 'true')
    
    const response = await this.api.get(`/automation/?${params}`)
    return response.data
  }

  async createAutomation(automation: any) {
    const response = await this.api.post('/automation/', automation)
    return response.data
  }

  async updateAutomation(id: number, automation: any) {
    const response = await this.api.put(`/automation/${id}`, automation)
    return response.data
  }

  async deleteAutomation(id: number) {
    await this.api.delete(`/automation/${id}`)
  }

  async executeAutomation(id: number) {
    const response = await this.api.post(`/automation/${id}/execute`)
    return response.data
  }

  async getAutomationTypes() {
    const response = await this.api.get('/automation/types/available')
    return response.data
  }

  async suggestAutomation(description: string) {
    const response = await this.api.post('/automation/suggest', { description })
    return response.data
  }

  // Payments
  async getPayments(status?: string, limit?: number) {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (limit) params.append('limit', limit.toString())
    
    const response = await this.api.get(`/payments/?${params}`)
    return response.data
  }

  async createPayment(payment: any) {
    const response = await this.api.post('/payments/', payment)
    return response.data
  }

  async createPixPayment(amount: number, description?: string) {
    const response = await this.api.post('/payments/pix/create', {
      amount,
      description,
    })
    return response.data
  }

  async confirmPayment(id: number) {
    const response = await this.api.post(`/payments/${id}/confirm`)
    return response.data
  }

  async getPaymentStats() {
    const response = await this.api.get('/payments/stats/summary')
    return response.data
  }

  // Messages
  async getMessageTemplates(typeFilter?: string, activeOnly?: boolean) {
    const params = new URLSearchParams()
    if (typeFilter) params.append('type_filter', typeFilter)
    if (activeOnly) params.append('active_only', 'true')
    
    const response = await this.api.get(`/messages/templates?${params}`)
    return response.data
  }

  async createMessageTemplate(template: any) {
    const response = await this.api.post('/messages/templates', template)
    return response.data
  }

  async updateMessageTemplate(id: number, template: any) {
    const response = await this.api.put(`/messages/templates/${id}`, template)
    return response.data
  }

  async deleteMessageTemplate(id: number) {
    await this.api.delete(`/messages/templates/${id}`)
  }

  async sendMessage(templateId: number, recipients: string[], variables: Record<string, string>) {
    const response = await this.api.post('/messages/send', {
      template_id: templateId,
      recipients,
      variables,
    })
    return response.data
  }

  async previewMessageTemplate(id: number, variables: Record<string, string>) {
    const response = await this.api.post(`/messages/templates/${id}/preview`, variables)
    return response.data
  }

  async getMessageTypes() {
    const response = await this.api.get('/messages/types/available')
    return response.data
  }

  async getMessageStats() {
    const response = await this.api.get('/messages/stats/summary')
    return response.data
  }
}

export const apiService = new ApiService()