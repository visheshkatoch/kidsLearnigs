import React, { useState } from 'react'
import {
  Box, Typography, Button, Card, CardContent,
  TextField, Grid, IconButton, Snackbar, Alert,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const AVATARS = ['🦁', '🐯', '🐼', '🦊', '🐸', '🦋', '🐬', '🦄', '🐲', '⭐']

function totalStars(kid) {
  return Object.values(kid.progress).reduce((s, p) => s + p.stars, 0)
}

export default function KidSelector({ profiles, onSelect, onBack }) {
  const noProfiles = profiles.kids.length === 0
  const [adding, setAdding] = useState(noProfiles)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🦁')
  const [deleteSnack, setDeleteSnack] = useState(false)

  const handleAdd = () => {
    if (!name.trim()) return
    profiles.addKid(name.trim(), avatar)
    setAdding(false)
    setName('')
    onSelect()
  }

  const handlePick = (kid) => {
    profiles.setActiveKid(kid.id)
    onSelect()
  }

  const handleDelete = (e, id) => {
    e.stopPropagation()
    profiles.removeKid(id)
    setDeleteSnack(true)
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      px={2}
      py={4}
      sx={{ background: 'linear-gradient(135deg, #7C4DFF 0%, #E040FB 100%)' }}
    >
      {/* Back to main menu */}
      <Box alignSelf="flex-start" mb={1}>
        <IconButton onClick={onBack} sx={{ color: 'rgba(255,255,255,0.8)' }} size="small">
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Typography variant="h4" color="white" mb={0.5} textAlign="center">
        🎵 Sound Trail
      </Typography>
      <Typography color="rgba(255,255,255,0.85)" mb={3} textAlign="center" fontSize="1rem">
        Who's learning today?
      </Typography>

      {/* Existing profiles list */}
      {!adding && profiles.kids.length > 0 && (
        <Box width="100%" maxWidth={420}>
          <Grid container spacing={2} mb={2.5}>
            {profiles.kids.map(kid => (
              <Grid item xs={6} key={kid.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'transform 0.18s, box-shadow 0.18s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 28px rgba(0,0,0,0.2)' },
                  }}
                  onClick={() => handlePick(kid)}
                >
                  <CardContent sx={{ pb: '12px !important', pt: 2 }}>
                    <Typography fontSize="3rem" lineHeight={1}>{kid.avatar}</Typography>
                    <Typography variant="h6" mt={0.8} noWrap>{kid.name}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      {totalStars(kid)} ⭐ · {Object.keys(kid.progress).length}/10 months
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<PlayArrowIcon />}
                        sx={{ flex: 1, mr: 0.5, fontSize: '0.75rem', py: 0.6 }}
                        onClick={() => handlePick(kid)}
                      >
                        Play
                      </Button>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={e => handleDelete(e, kid.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            fullWidth
            onClick={() => setAdding(true)}
            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.6)', py: 1.4, fontSize: '1rem' }}
          >
            Add Another Kid
          </Button>
        </Box>
      )}

      {/* Add new kid form */}
      {adding && (
        <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" textAlign="center" mb={2.5}>
              {noProfiles ? '👋 Welcome! Who are you?' : 'Add a new learner'}
            </Typography>

            <TextField
              fullWidth
              label="Kid's name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              autoFocus
              inputProps={{ maxLength: 20 }}
              sx={{ mb: 2.5 }}
            />

            <Typography fontWeight={700} mb={1.5}>
              Pick your avatar:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
              {AVATARS.map(a => (
                <Box
                  key={a}
                  onClick={() => setAvatar(a)}
                  sx={{
                    fontSize: '2rem',
                    width: 52,
                    height: 52,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: avatar === a ? '3px solid #7C4DFF' : '3px solid #E0E0E0',
                    background: avatar === a ? '#EDE7F6' : 'transparent',
                    transition: 'all 0.15s',
                    '&:hover': { background: '#EDE7F6' },
                  }}
                >
                  {a}
                </Box>
              ))}
            </Box>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={!name.trim()}
              onClick={handleAdd}
              sx={{ py: 1.6, fontSize: '1.1rem' }}
            >
              Let's Go! 🚀
            </Button>

            {!noProfiles && (
              <Button fullWidth sx={{ mt: 1 }} onClick={() => setAdding(false)}>
                Back
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={deleteSnack}
        autoHideDuration={3000}
        onClose={() => setDeleteSnack(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" onClose={() => setDeleteSnack(false)}>
          Profile removed
        </Alert>
      </Snackbar>
    </Box>
  )
}
