import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { apiService } from '../services/api'
import { useAuthStore } from '../store/authStore'

interface LoginForm {
  username: string
  password: string
}

interface RegisterForm {
  username: string
  email: string
  password: string
  confirmPassword: string
}

const Login = () => {
  const [tab, setTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const loginForm = useForm<LoginForm>()
  const registerForm = useForm<RegisterForm>()

  const handleLogin = async (data: LoginForm) => {
    setLoading(true)
    try {
      const response = await apiService.login(data.username, data.password)
      const userResponse = await apiService.getCurrentUser()
      
      login(response.access_token, userResponse)
      toast.success('Login realizado com sucesso!')
      navigate('/')
    } catch (error) {
      console.error('Erro no login:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    setLoading(true)
    try {
      await apiService.register(data.username, data.email, data.password)
      toast.success('Conta criada com sucesso! Faça login para continuar.')
      setTab(0)
      registerForm.reset()
    } catch (error) {
      console.error('Erro no registro:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card sx={{ width: '100%', mt: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                AI Automation
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sistema de Automação Administrativa com IA
              </Typography>
            </Box>

            <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} centered>
              <Tab label="Entrar" />
              <Tab label="Criar Conta" />
            </Tabs>

            {tab === 0 && (
              <Box
                component="form"
                onSubmit={loginForm.handleSubmit(handleLogin)}
                sx={{ mt: 3 }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Usuário"
                  autoComplete="username"
                  autoFocus
                  {...loginForm.register('username', { required: 'Usuário é obrigatório' })}
                  error={!!loginForm.formState.errors.username}
                  helperText={loginForm.formState.errors.username?.message}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Senha"
                  type="password"
                  autoComplete="current-password"
                  {...loginForm.register('password', { required: 'Senha é obrigatória' })}
                  error={!!loginForm.formState.errors.password}
                  helperText={loginForm.formState.errors.password?.message}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Entrar'}
                </Button>
              </Box>
            )}

            {tab === 1 && (
              <Box
                component="form"
                onSubmit={registerForm.handleSubmit(handleRegister)}
                sx={{ mt: 3 }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Usuário"
                  autoComplete="username"
                  {...registerForm.register('username', { required: 'Usuário é obrigatório' })}
                  error={!!registerForm.formState.errors.username}
                  helperText={registerForm.formState.errors.username?.message}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email"
                  type="email"
                  autoComplete="email"
                  {...registerForm.register('email', { 
                    required: 'Email é obrigatório',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                  error={!!registerForm.formState.errors.email}
                  helperText={registerForm.formState.errors.email?.message}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Senha"
                  type="password"
                  autoComplete="new-password"
                  {...registerForm.register('password', { 
                    required: 'Senha é obrigatória',
                    minLength: {
                      value: 6,
                      message: 'Senha deve ter pelo menos 6 caracteres'
                    }
                  })}
                  error={!!registerForm.formState.errors.password}
                  helperText={registerForm.formState.errors.password?.message}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Confirmar Senha"
                  type="password"
                  autoComplete="new-password"
                  {...registerForm.register('confirmPassword', { required: 'Confirme a senha' })}
                  error={!!registerForm.formState.errors.confirmPassword}
                  helperText={registerForm.formState.errors.confirmPassword?.message}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Criar Conta'}
                </Button>
              </Box>
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Demo:</strong> Use qualquer usuário/senha para testar o sistema.
                A IA funcionará em modo limitado sem as chaves de API configuradas.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

export default Login