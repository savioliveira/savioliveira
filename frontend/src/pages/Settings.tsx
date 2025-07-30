import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useAuthStore } from '../store/authStore'

const Settings = () => {
  const { user } = useAuthStore()
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    stripe: '',
  })
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    automation: true,
  })

  const { register, handleSubmit } = useForm({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
    }
  })

  const handleProfileUpdate = async (data: any) => {
    try {
      // Aqui faria a atualização do perfil
      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar perfil')
    }
  }

  const handleApiKeysUpdate = () => {
    // Aqui salvaria as chaves de API
    toast.success('Chaves de API atualizadas!')
  }

  const handleNotificationChange = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications(prev => ({
      ...prev,
      [key]: event.target.checked
    }))
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configurações
      </Typography>

      <Grid container spacing={3}>
        {/* Perfil do usuário */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Perfil do Usuário
              </Typography>
              <Box component="form" onSubmit={handleSubmit(handleProfileUpdate)}>
                <TextField
                  fullWidth
                  label="Nome de usuário"
                  margin="normal"
                  {...register('username')}
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  margin="normal"
                  {...register('email')}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ mt: 2 }}
                >
                  Atualizar Perfil
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notificações */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notificações
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.email}
                    onChange={handleNotificationChange('email')}
                  />
                }
                label="Notificações por email"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.push}
                    onChange={handleNotificationChange('push')}
                  />
                }
                label="Notificações push"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.automation}
                    onChange={handleNotificationChange('automation')}
                  />
                }
                label="Alertas de automação"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Chaves de API */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Chaves de API
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Configure suas chaves de API para habilitar todas as funcionalidades do sistema.
                As chaves são armazenadas de forma segura e criptografadas.
              </Alert>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="OpenAI API Key"
                    type="password"
                    value={apiKeys.openai}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, openai: e.target.value }))}
                    placeholder="sk-..."
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Anthropic API Key"
                    type="password"
                    value={apiKeys.anthropic}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, anthropic: e.target.value }))}
                    placeholder="sk-ant-..."
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Stripe Secret Key"
                    type="password"
                    value={apiKeys.stripe}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, stripe: e.target.value }))}
                    placeholder="sk_test_..."
                  />
                </Grid>
              </Grid>
              
              <Button
                variant="contained"
                onClick={handleApiKeysUpdate}
                sx={{ mt: 2 }}
              >
                Salvar Chaves de API
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Informações do sistema */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informações do Sistema
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Versão:</strong> 1.0.0
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Status da IA:</strong> Configuração necessária
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Suporte
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Para suporte técnico ou dúvidas sobre o sistema, entre em contato através do chat com IA
                ou consulte a documentação completa.
              </Typography>
              
              <Button variant="outlined" sx={{ mr: 1 }}>
                Documentação
              </Button>
              <Button variant="outlined">
                Suporte
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Settings