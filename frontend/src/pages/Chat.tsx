import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material'
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { apiService } from '../services/api'
import { useAuthStore } from '../store/authStore'

interface Message {
  id: number
  content: string
  role: 'user' | 'assistant'
  created_at: string
}

interface ChatSession {
  id: number
  title: string
  created_at: string
  updated_at?: string
}

interface ChatResponse {
  response: string
  session_id: number
  suggestions: string[]
}

const Chat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    if (currentSession) {
      loadMessages(currentSession)
    }
  }, [currentSession])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadSessions = async () => {
    try {
      const data = await apiService.getChatSessions()
      setSessions(data)
      if (data.length > 0 && !currentSession) {
        setCurrentSession(data[0].id)
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error)
    }
  }

  const loadMessages = async (sessionId: number) => {
    try {
      const data = await apiService.getChatMessages(sessionId)
      setMessages(data)
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage = newMessage
    setNewMessage('')
    setLoading(true)

    // Adicionar mensagem do usuário imediatamente
    const tempUserMessage: Message = {
      id: Date.now(),
      content: userMessage,
      role: 'user',
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUserMessage])

    try {
      const response: ChatResponse = await apiService.sendChatMessage(userMessage, currentSession || undefined)
      
      // Se é uma nova sessão, atualizar o ID da sessão atual
      if (!currentSession) {
        setCurrentSession(response.session_id)
        await loadSessions() // Recarregar lista de sessões
      }

      // Adicionar resposta da IA
      const aiMessage: Message = {
        id: Date.now() + 1,
        content: response.response,
        role: 'assistant',
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev.slice(0, -1), tempUserMessage, aiMessage])
      setSuggestions(response.suggestions)

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      // Remover mensagem do usuário em caso de erro
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setNewMessage(suggestion)
  }

  const createNewSession = () => {
    setCurrentSession(null)
    setMessages([])
    setSuggestions([])
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
      {/* Sidebar com sessões */}
      <Paper sx={{ width: 300, mr: 2, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Conversas</Typography>
          <IconButton onClick={createNewSession} color="primary">
            <AddIcon />
          </IconButton>
        </Box>
        <List>
          {sessions.map((session) => (
            <ListItem
              key={session.id}
              button
              selected={currentSession === session.id}
              onClick={() => setCurrentSession(session.id)}
              sx={{
                borderRadius: 1,
                mb: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              }}
            >
              <ListItemText
                primary={session.title}
                secondary={format(new Date(session.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                secondaryTypographyProps={{
                  color: currentSession === session.id ? 'inherit' : 'text.secondary'
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Área principal do chat */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">
              Chat com IA - Assistente de Automação
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Converse com a IA para configurar automações, pagamentos e muito mais
            </Typography>
          </Box>

          {/* Mensagens */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            {messages.length === 0 && !loading && (
              <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <BotIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    Olá! Como posso ajudá-lo hoje?
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Sou seu assistente de automação administrativa. Posso ajudá-lo a:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    {[
                      'Configurar automações',
                      'Gerenciar pagamentos',
                      'Criar templates de mensagem',
                      'Analisar relatórios',
                      'Configurar integrações'
                    ].map((item) => (
                      <Chip
                        key={item}
                        label={item}
                        variant="outlined"
                        onClick={() => setNewMessage(`Me ajude a ${item.toLowerCase()}`)}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  mb: 2,
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    maxWidth: '70%',
                    flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                      mx: 1,
                    }}
                  >
                    {message.role === 'user' ? <PersonIcon /> : <BotIcon />}
                  </Avatar>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: message.role === 'user' ? 'primary.main' : 'grey.100',
                      color: message.role === 'user' ? 'white' : 'text.primary',
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 1,
                        opacity: 0.7,
                      }}
                    >
                      {format(new Date(message.created_at), 'HH:mm', { locale: ptBR })}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            ))}

            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 1 }}>
                  <BotIcon />
                </Avatar>
                <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography variant="body2">IA está pensando...</Typography>
                  </Box>
                </Paper>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Sugestões */}
          {suggestions.length > 0 && (
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Sugestões:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {suggestions.map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={suggestion}
                    variant="outlined"
                    size="small"
                    onClick={() => handleSuggestionClick(suggestion)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Input de mensagem */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || loading}
                sx={{ alignSelf: 'flex-end' }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

export default Chat