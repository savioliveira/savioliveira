import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Paper,
  Grid,
} from '@mui/material'
import { Add as AddIcon, QrCode as QrCodeIcon } from '@mui/icons-material'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { apiService } from '../services/api'

const Payments = () => {
  const [payments, setPayments] = useState([])
  const [stats, setStats] = useState({ total_payments: 0, total_amount: 0 })
  const [open, setOpen] = useState(false)
  const [pixData, setPixData] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    loadPayments()
    loadStats()
  }, [])

  const loadPayments = async () => {
    try {
      const data = await apiService.getPayments()
      setPayments(data)
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error)
    }
  }

  const loadStats = async () => {
    try {
      const data = await apiService.getPaymentStats()
      setStats(data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleCreatePix = async (data: any) => {
    try {
      const response = await apiService.createPixPayment(data.amount, data.description)
      setPixData(response)
      toast.success('PIX criado com sucesso!')
      setOpen(false)
      reset()
      loadPayments()
    } catch (error) {
      console.error('Erro ao criar PIX:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'pending': return 'warning'
      case 'failed': return 'error'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído'
      case 'pending': return 'Pendente'
      case 'failed': return 'Falhou'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Pagamentos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Novo PIX
        </Button>
      </Box>

      {/* Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Total de Pagamentos
              </Typography>
              <Typography variant="h3">
                {stats.total_payments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                Valor Total
              </Typography>
              <Typography variant="h3" color="success.main">
                R$ {stats.total_amount.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de pagamentos */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Histórico de Pagamentos
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Método</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Data</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment: any) => (
                  <TableRow key={payment.id}>
                    <TableCell>#{payment.id}</TableCell>
                    <TableCell>R$ {payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{payment.payment_method}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(payment.status)}
                        color={getStatusColor(payment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog para criar PIX */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Criar Pagamento PIX</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Valor (R$)"
              type="number"
              margin="normal"
              inputProps={{ step: "0.01", min: "0" }}
              {...register('amount', { required: true, valueAsNumber: true })}
            />
            <TextField
              fullWidth
              label="Descrição (opcional)"
              margin="normal"
              multiline
              rows={3}
              {...register('description')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit(handleCreatePix)} variant="contained">
            Gerar PIX
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para mostrar QR Code PIX */}
      <Dialog open={!!pixData} onClose={() => setPixData(null)} maxWidth="sm" fullWidth>
        <DialogTitle>PIX Gerado</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <QrCodeIcon sx={{ fontSize: 100, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Chave PIX: {pixData?.pix_key}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Valor: R$ {pixData?.amount.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              QR Code: {pixData?.qr_code}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPixData(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Payments