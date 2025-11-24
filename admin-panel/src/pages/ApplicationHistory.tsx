import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
  Divider,
  Button,
} from '@mui/material';
import {
  Search,
  Business,
  Person,
  Phone,
  LocationOn,
  CalendarToday,
  CheckCircle,
  Cancel,
  Schedule,
  History,
  Description,
  ArrowBack,
} from '@mui/icons-material';
import { collection, query, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';

interface BusinessApplication {
  id: string;
  businessName: string;
  businessOwner: string;
  selectedType: string;
  contactNumber: string;
  businessAddress: string;
  permitNumber: string;
  registrationDate: string | any;
  status: 'pending' | 'approved' | 'rejected';
  userEmail: string;
  approvedDate?: string | any;
  rejectedDate?: string | any;
  rejectionReason?: string;
}

const ApplicationHistory: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [applications, setApplications] = useState<BusinessApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      // Try to fetch with orderBy, but fallback to regular query if index is missing
      let q;
      try {
        q = query(collection(db, 'businesses'), orderBy('registrationDate', 'desc'));
      } catch (error) {
        // If orderBy fails, use simple query and sort in memory
        q = query(collection(db, 'businesses'));
      }
      
      const querySnapshot = await getDocs(q);
      const applicationData: BusinessApplication[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        applicationData.push({ 
          id: doc.id, 
          ...data,
        } as BusinessApplication);
      });
      
      // Sort by registration date (newest first) if orderBy wasn't used
      applicationData.sort((a, b) => {
        const dateA = a.registrationDate?.toDate ? a.registrationDate.toDate().getTime() : 
                     (a.registrationDate ? new Date(a.registrationDate).getTime() : 0);
        const dateB = b.registrationDate?.toDate ? b.registrationDate.toDate().getTime() : 
                     (b.registrationDate ? new Date(b.registrationDate).getTime() : 0);
        return dateB - dateA;
      });
      
      setApplications(applicationData);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle />;
      case 'rejected':
        return <Cancel />;
      case 'pending':
        return <Schedule />;
      default:
        return <Business />;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      if (date.toDate) {
        return date.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = 
      (app.businessName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (app.businessOwner?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (app.permitNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (app.userEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Box 
        sx={{ 
          mb: { xs: 2, sm: 4 },
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea15 0%, #667eea05 100%)',
          border: '1px solid #667eea30',
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/business/pending')}
            sx={{
              bgcolor: '#667eea',
              color: '#fff',
              textTransform: 'none',
              minWidth: { xs: 'auto', sm: 120 },
              '&:hover': {
                bgcolor: '#5568d3',
              },
            }}
          >
            {isMobile ? '' : 'Go Back'}
          </Button>
          
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" flex={1}>
            <Box sx={{ color: '#667eea' }}>
              <History sx={{ fontSize: { xs: 24, sm: 32 } }} />
            </Box>
            <Box>
              <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
                Application History
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                View complete history of all business applications
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Filters and Search */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField
          placeholder="Search by business name, owner, permit number, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          fullWidth={isMobile}
          sx={{
            flex: { xs: 'none', sm: 1 },
            minWidth: { xs: '100%', sm: 300 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: '#fff',
            },
          }}
        />
        <FormControl sx={{ minWidth: { xs: '100%', sm: 150 }, width: { xs: '100%', sm: 'auto' } }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value as any)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Applications Table - Desktop */}
      {!isMobile && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer component={Paper} sx={{ borderRadius: 3, overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Business Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Owner</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Permit Number</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Applied Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Approved/Rejected Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          {searchTerm || statusFilter !== 'all' 
                            ? 'No applications found matching your criteria' 
                            : 'No applications found'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplications.map((app) => (
                      <TableRow 
                        key={app.id}
                        sx={{ 
                          transition: 'all 0.2s ease',
                          '&:hover': { 
                            bgcolor: '#667eea08',
                          }
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Business sx={{ color: '#667eea', fontSize: 20 }} />
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#1a1a2e' }}>
                              {app.businessName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">{app.businessOwner}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{app.selectedType}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">{app.contactNumber}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{app.permitNumber}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(app.status)}
                            label={app.status}
                            color={getStatusColor(app.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {formatDate(app.registrationDate)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {app.status === 'approved' && app.approvedDate ? (
                            <Box display="flex" alignItems="center" gap={1}>
                              <CheckCircle sx={{ fontSize: 16, color: '#4CAF50' }} />
                              <Typography variant="body2" color="success.main">
                                {formatDate(app.approvedDate)}
                              </Typography>
                            </Box>
                          ) : app.status === 'rejected' && app.rejectedDate ? (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Cancel sx={{ fontSize: 16, color: '#F44336' }} />
                              <Typography variant="body2" color="error.main">
                                {formatDate(app.rejectedDate)}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Applications Cards - Mobile */}
      {isMobile && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredApplications.length === 0 ? (
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No applications found matching your criteria' 
                  : 'No applications found'}
              </Typography>
            </Card>
          ) : (
            filteredApplications.map((app) => (
              <Card 
                key={app.id}
                sx={{ 
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
                  }
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Business sx={{ color: '#667eea', fontSize: 24 }} />
                    <Typography variant="h6" fontWeight={600} sx={{ color: '#1a1a2e', flex: 1 }}>
                      {app.businessName}
                    </Typography>
                    <Chip
                      icon={getStatusIcon(app.status)}
                      label={app.status}
                      color={getStatusColor(app.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Person sx={{ fontSize: 18, color: 'text.secondary', minWidth: 20 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Owner</Typography>
                        <Typography variant="body2" fontWeight={500}>{app.businessOwner}</Typography>
                      </Box>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1}>
                      <Description sx={{ fontSize: 18, color: 'text.secondary', minWidth: 20 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Type</Typography>
                        <Typography variant="body2" fontWeight={500}>{app.selectedType}</Typography>
                      </Box>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1}>
                      <Phone sx={{ fontSize: 18, color: 'text.secondary', minWidth: 20 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Contact</Typography>
                        <Typography variant="body2" fontWeight={500}>{app.contactNumber}</Typography>
                      </Box>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1}>
                      <Description sx={{ fontSize: 18, color: 'text.secondary', minWidth: 20 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Permit Number</Typography>
                        <Typography variant="body2" fontWeight={500}>{app.permitNumber}</Typography>
                      </Box>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarToday sx={{ fontSize: 18, color: 'text.secondary', minWidth: 20 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Applied Date</Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {formatDate(app.registrationDate)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {(app.status === 'approved' && app.approvedDate) || (app.status === 'rejected' && app.rejectedDate) ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        {app.status === 'approved' ? (
                          <CheckCircle sx={{ fontSize: 18, color: '#4CAF50', minWidth: 20 }} />
                        ) : (
                          <Cancel sx={{ fontSize: 18, color: '#F44336', minWidth: 20 }} />
                        )}
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {app.status === 'approved' ? 'Approved Date' : 'Rejected Date'}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            fontWeight={500}
                            color={app.status === 'approved' ? 'success.main' : 'error.main'}
                          >
                            {formatDate(app.status === 'approved' ? app.approvedDate : app.rejectedDate)}
                          </Typography>
                        </Box>
                      </Box>
                    ) : null}
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {/* Summary Stats */}
      <Box sx={{ 
        mt: { xs: 2, sm: 3 }, 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
        gap: { xs: 1.5, sm: 2 } 
      }}>
        <Card sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Total Applications
          </Typography>
          <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700} color="#667eea">
            {applications.length}
          </Typography>
        </Card>
        <Card sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Pending
          </Typography>
          <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700} color="#FF9800">
            {applications.filter(a => a.status === 'pending').length}
          </Typography>
        </Card>
        <Card sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Approved
          </Typography>
          <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700} color="#4CAF50">
            {applications.filter(a => a.status === 'approved').length}
          </Typography>
        </Card>
        <Card sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Rejected
          </Typography>
          <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700} color="#F44336">
            {applications.filter(a => a.status === 'rejected').length}
          </Typography>
        </Card>
      </Box>
    </Box>
  );
};

export default ApplicationHistory;

