// src/pages/AddEditAirdropPage.jsx
import React from 'react';
import { Typography, Box, Paper, TextField, Button, MenuItem, CircularProgress, Alert, Grid } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker'; // Pastikan react-datepicker diinstal
import 'react-datepicker/dist/react-datepicker.css'; // Import CSS datepicker
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAirdropDetail, createAirdrop, updateAirdrop } from '../api/airdrops.js';
import { useTheme } from '@mui/material/styles'; // Import useTheme

const AirdropStatusChoices = [
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CLAIMED', label: 'Claimed' },
    { value: 'MISSED', label: 'Missed' },
    { value: 'RESEARCH', label: 'Researching' },
];

function AddEditAirdropPage() {
    const { id } = useParams(); // ID jika dalam mode edit
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const theme = useTheme(); // Panggil useTheme

    const isEditMode = Boolean(id);

    // Fetch data airdrop jika dalam mode edit
    const { data: airdropData, isLoading: isAirdropLoading, isError: isAirdropError, error: airdropError } = useQuery({
        queryKey: ['airdrop', id],
        queryFn: () => getAirdropDetail(id),
        enabled: isEditMode, // Hanya jalankan query jika mode edit
    });

    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: { // Default values untuk form
            name: '',
            description: '',
            link: '',
            blockchain: '',
            expectedValue: '',
            status: 'TODO',
            startDate: null,
            endDate: null,
            notes: '',
            tokenSymbol: '',
            contractAddress: '',
            claimDate: null,
            claimedAmount: '',
            screenshot: null,
        }
    });

    // Reset form saat data airdrop selesai dimuat (untuk mode edit)
    React.useEffect(() => {
        if (isEditMode && airdropData) {
            reset({
                ...airdropData,
                startDate: airdropData.startDate ? new Date(airdropData.startDate) : null,
                endDate: airdropData.endDate ? new Date(airdropData.endDate) : null,
                claimDate: airdropData.claimDate ? new Date(airdropData.claimDate) : null,
                // Screenshot tidak bisa diset langsung ke input file
                // Akan dihandle terpisah atau diabaikan jika tidak ada upload baru
                screenshot: null, // Set null agar tidak memicu error input file
            });
        }
    }, [isEditMode, airdropData, reset]);

    // Mutasi untuk create/update airdrop
    const createMutation = useMutation({
        mutationFn: createAirdrop,
        onSuccess: () => {
            queryClient.invalidateQueries(['airdrops']); // Invalidate cache daftar airdrop
            navigate('/airdrops'); // Redirect ke daftar airdrop
        },
        onError: (err) => {
            console.error("Create Airdrop Error:", err.response?.data || err.message);
            alert("Gagal menambahkan airdrop: " + (err.response?.data?.message || err.message));
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data) => updateAirdrop(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['airdrops']);
            queryClient.invalidateQueries(['airdrop', id]);
            navigate('/airdrops');
        },
        onError: (err) => {
            console.error("Update Airdrop Error:", err.response?.data || err.message);
            alert("Gagal memperbarui airdrop: " + (err.response?.data?.message || err.message));
        }
    });

    const onSubmit = (data) => {
        if (isEditMode) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    if (isEditMode && isAirdropLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2, color: 'text.primary' }}>Memuat detail airdrop...</Typography>
            </Box>
        );
    }

    if (isEditMode && isAirdropError) {
        return (
            <Box sx={{ mt: 5 }}>
                <Alert severity="error">Gagal memuat detail airdrop: {airdropError.message}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.light', fontWeight: 'bold' }}>
                {isEditMode ? 'Edit Airdrop' : 'Tambah Airdrop Baru'}
            </Typography>
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: 'Nama airdrop diperlukan' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Nama Airdrop"
                                        fullWidth
                                        margin="normal"
                                        error={!!errors.name}
                                        helperText={errors.name?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="status"
                                control={control}
                                rules={{ required: 'Status diperlukan' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="Status"
                                        fullWidth
                                        margin="normal"
                                        error={!!errors.status}
                                        helperText={errors.status?.message}
                                    >
                                        {AirdropStatusChoices.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Deskripsi"
                                        fullWidth
                                        margin="normal"
                                        multiline
                                        rows={3}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="link"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Link Garapan"
                                        fullWidth
                                        margin="normal"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="blockchain"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Blockchain"
                                        fullWidth
                                        margin="normal"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="expectedValue"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Perkiraan Nilai (USD)"
                                        fullWidth
                                        margin="normal"
                                        type="number"
                                        inputProps={{ step: "0.01" }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="tokenSymbol"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Simbol Token"
                                        fullWidth
                                        margin="normal"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="contractAddress"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Alamat Kontrak"
                                        fullWidth
                                        margin="normal"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="startDate"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        selected={field.value}
                                        onChange={(date) => field.onChange(date)}
                                        dateFormat="dd/MM/yyyy"
                                        customInput={<TextField {...field} label="Tanggal Mulai" fullWidth margin="normal" />}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="endDate"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        selected={field.value}
                                        onChange={(date) => field.onChange(date)}
                                        dateFormat="dd/MM/yyyy"
                                        customInput={<TextField {...field} label="Tanggal Berakhir" fullWidth margin="normal" />}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="claimDate"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        selected={field.value}
                                        onChange={(date) => field.onChange(date)}
                                        dateFormat="dd/MM/yyyy"
                                        customInput={<TextField {...field} label="Tanggal Klaim" fullWidth margin="normal" />}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="claimedAmount"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Jumlah Diklaim"
                                        fullWidth
                                        margin="normal"
                                        type="number"
                                        inputProps={{ step: "0.01" }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller
                                name="notes"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Catatan"
                                        fullWidth
                                        margin="normal"
                                        multiline
                                        rows={3}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller
                                name="screenshot"
                                control={control}
                                render={({ field: { onChange, ...field } }) => (
                                    <Button
                                        variant="contained"
                                        component="label"
                                        color="primary"
                                        sx={{ mt: 2 }}
                                    >
                                        {isEditMode && airdropData?.screenshot ? 'Ubah Screenshot' : 'Upload Screenshot'}
                                        <input
                                            type="file"
                                            hidden
                                            onChange={(e) => onChange(e.target.files)} // Meneruskan FileList
                                            {...field}
                                        />
                                    </Button>
                                )}
                            />
                            {airdropData?.screenshot && isEditMode && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" color="text.secondary">Screenshot saat ini:</Typography>
                                    <img src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${airdropData.screenshot}`} alt="Current Screenshot" style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }} />
                                    {/* Jika ingin ada tombol hapus screenshot */}
                                    {/* <Button size="small" color="error" onClick={() => handleClearScreenshot(airdropData._id)}>Hapus</Button> */}
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="submit" variant="contained" color="secondary" disabled={createMutation.isPending || updateMutation.isPending}>
                            {isEditMode ? 'Update Airdrop' : 'Tambah Airdrop'}
                            {(createMutation.isPending || updateMutation.isPending) && (
                                <CircularProgress size={20} sx={{ ml: 1 }} />
                            )}
                        </Button>
                        <Button variant="outlined" color="primary" onClick={() => navigate('/airdrops')} sx={{ ml: 2 }}>
                            Batal
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}

export default AddEditAirdropPage;