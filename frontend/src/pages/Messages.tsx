import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
} from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { apiService } from '../services/api'

const Messages = () => {
  const [templates, setTemplates] = useState([])
  const [open, setOpen] = useState(false)
  const [types, setTypes] = useState({})
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    loadTemplates()
    loadTypes()
  }, [])

  const loadTemplates = async () => {
    try {
      const data = await apiService.getMessageTemplates()
      setTemplates(data)
    } catch (error) {
      console.error('Erro ao carregar templates:', error)
    }
  }

  const loadTypes = async () => {
    try {
      const data = await apiService.getMessageTypes()
      setTypes(data)
    } catch (error) {
      console.error('Erro ao carregar tipos:', error)
    }
  }

  const handleCreate = async (data: any) => {
    try {
      await apiService.createMessageTemplate({
        name: data.name,
        content: data.content,
        type: data.type,
        variables: [],
      })
      toast.success('Template criado com sucesso!')
      setOpen(false)
      reset()
      loadTemplates()
    } catch (error) {
      console.error('Erro ao criar template:', error)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'primary'
      case 'sms': return 'success'
      case 'whatsapp': return 'info'
      case 'notification': return 'warning'
      default: return 'default'
    }
  }

  const getTypeName = (type: string) => {
    return types[type as keyof typeof types]?.name || type
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Templates de Mensagem</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Novo Template
        </Button>
      </Box>

      <Grid container spacing={3}>
        {templates.map((template: any) => (
          <Grid item xs={12} md={6} lg={4} key={template.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2">
                    {template.name}
                  </Typography>
                  <Chip
                    label={template.is_active ? 'Ativo' : 'Inativo'}
                    color={template.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {template.content.substring(0, 100)}
                  {template.content.length > 100 && '...'}
                </Typography>
                
                <Chip 
                  label={getTypeName(template.type)} 
                  color={getTypeColor(template.type)}
                  variant="outlined" 
                  size="small" 
                  sx={{ mb: 2 }} 
                />
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small" color="primary">
                    <SendIcon />
                  </IconButton>
                  <IconButton size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog para criar template */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Novo Template de Mensagem</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nome do Template"
              margin="normal"
              {...register('name', { required: true })}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Tipo</InputLabel>
              <Select {...register('type', { required: true })}>
                {Object.entries(types).map(([key, type]: [string, any]) => (
                  <MenuItem key={key} value={key}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Conteúdo da Mensagem"
              margin="normal"
              multiline
              rows={6}
              placeholder="Digite o conteúdo da mensagem. Use {variavel} para variáveis dinâmicas."
              {...register('content', { required: true })}
            />
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Dica: Use variáveis como {'{nome}'}, {'{email}'}, {'{data}'} para personalizar as mensagens.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit(handleCreate)} variant="contained">
            Criar Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Messages