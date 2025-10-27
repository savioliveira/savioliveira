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
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { apiService } from '../services/api'

const Automations = () => {
  const [automations, setAutomations] = useState([])
  const [open, setOpen] = useState(false)
  const [types, setTypes] = useState({})
  const { register, handleSubmit, reset, watch } = useForm()

  useEffect(() => {
    loadAutomations()
    loadTypes()
  }, [])

  const loadAutomations = async () => {
    try {
      const data = await apiService.getAutomations()
      setAutomations(data)
    } catch (error) {
      console.error('Erro ao carregar automações:', error)
    }
  }

  const loadTypes = async () => {
    try {
      const data = await apiService.getAutomationTypes()
      setTypes(data)
    } catch (error) {
      console.error('Erro ao carregar tipos:', error)
    }
  }

  const handleCreate = async (data: any) => {
    try {
      await apiService.createAutomation({
        name: data.name,
        description: data.description,
        type: data.type,
        config: {},
      })
      toast.success('Automação criada com sucesso!')
      setOpen(false)
      reset()
      loadAutomations()
    } catch (error) {
      console.error('Erro ao criar automação:', error)
    }
  }

  const handleExecute = async (id: number) => {
    try {
      await apiService.executeAutomation(id)
      toast.success('Automação executada com sucesso!')
    } catch (error) {
      console.error('Erro ao executar automação:', error)
    }
  }

  const selectedType = watch('type')

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Automações</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Nova Automação
        </Button>
      </Box>

      <Grid container spacing={3}>
        {automations.map((automation: any) => (
          <Grid item xs={12} md={6} lg={4} key={automation.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2">
                    {automation.name}
                  </Typography>
                  <Chip
                    label={automation.is_active ? 'Ativa' : 'Inativa'}
                    color={automation.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {automation.description}
                </Typography>
                
                <Chip label={automation.type} variant="outlined" size="small" sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleExecute(automation.id)}
                    disabled={!automation.is_active}
                  >
                    <PlayIcon />
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

      {/* Dialog para criar automação */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nova Automação</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nome"
              margin="normal"
              {...register('name', { required: true })}
            />
            <TextField
              fullWidth
              label="Descrição"
              margin="normal"
              multiline
              rows={3}
              {...register('description')}
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
            
            {selectedType && types[selectedType as keyof typeof types] && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {(types[selectedType as keyof typeof types] as any).description}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit(handleCreate)} variant="contained">
            Criar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Automations