import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material'
import {
  AutoAwesome as AutomationIcon,
  Payment as PaymentIcon,
  Message as MessageIcon,
  TrendingUp as TrendingUpIcon,
  PlayArrow as PlayIcon,
  Chat as ChatIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

import { apiService } from '../services/api'
import { useAuthStore } from '../store/authStore'

const Dashboard = () => {
  const [stats, setStats] = useState({
    automations: { total: 0, active: 0 },
    payments: { total: 0, total_amount: 0 },
    messages: { total_templates: 0, active_templates: 0 },
  })
  const [recentAutomations, setRecentAutomations] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuthStore()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [automations, paymentStats, messageStats] = await Promise.all([
        apiService.getAutomations(),
        apiService.getPaymentStats().catch(() => ({ total_payments: 0, total_amount: 0 })),
        apiService.getMessageStats().catch(() => ({ total_templates: 0, active_templates: 0 })),
      ])

      setStats({
        automations: {
          total: automations.length,
          active: automations.filter((a: any) => a.is_active).length,
        },
        payments: paymentStats,
        messages: messageStats,
      })

      setRecentAutomations(automations.slice(0, 5))
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: 'Novo Chat com IA',
      description: 'Converse com a IA para configurar automações',
      icon: <ChatIcon />,
      action: () => navigate('/chat'),
      color: 'primary',
    },
    {
      title: 'Criar Automação',
      description: 'Configure uma nova automação',
      icon: <AutomationIcon />,
      action: () => navigate('/automations'),
      color: 'secondary',
    },
    {
      title: 'Gerenciar Pagamentos',
      description: 'Visualize e gerencie pagamentos',
      icon: <PaymentIcon />,
      action: () => navigate('/payments'),
      color: 'success',
    },
    {
      title: 'Templates de Mensagem',
      description: 'Crie e edite templates',
      icon: <MessageIcon />,
      action: () => navigate('/messages'),
      color: 'info',
    },
  ]

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Carregando Dashboard...
        </Typography>
        <LinearProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bem-vindo, {user?.username}!
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Aqui está um resumo das suas atividades de automação.
      </Typography>

      {/* Cards de estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AutomationIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Automações</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {stats.automations.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.automations.active} ativas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Pagamentos</Typography>
              </Box>
              <Typography variant="h3" color="success.main">
                {stats.payments.total_payments || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                R$ {(stats.payments.total_amount || 0).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MessageIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Templates</Typography>
              </Box>
              <Typography variant="h3" color="info.main">
                {stats.messages.total_templates}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.messages.active_templates} ativos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Eficiência</Typography>
              </Box>
              <Typography variant="h3" color="warning.main">
                {stats.automations.total > 0 
                  ? Math.round((stats.automations.active / stats.automations.total) * 100)
                  : 0
                }%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Automações ativas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Ações rápidas */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ações Rápidas
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 2 }
                      }}
                      onClick={action.action}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {action.icon}
                          <Typography variant="subtitle1" sx={{ ml: 1 }}>
                            {action.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {action.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Automações recentes */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Automações Recentes
              </Typography>
              <List>
                {recentAutomations.length > 0 ? (
                  recentAutomations.map((automation: any) => (
                    <ListItem 
                      key={automation.id}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          size="small"
                          onClick={() => navigate('/automations')}
                        >
                          <PlayIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <AutomationIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={automation.name}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={automation.type}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={automation.is_active ? 'Ativa' : 'Inativa'}
                              size="small"
                              color={automation.is_active ? 'success' : 'default'}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="Nenhuma automação encontrada"
                      secondary="Clique em 'Criar Automação' para começar"
                    />
                  </ListItem>
                )}
              </List>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/automations')}
                sx={{ mt: 2 }}
              >
                Ver Todas
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard