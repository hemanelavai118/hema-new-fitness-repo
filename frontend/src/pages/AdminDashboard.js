import React, { useState, useEffect } from 'react';
import { bookingAPI, classAPI, trainerAPI } from '../services/api';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [editClassId, setEditClassId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [classSearchTerm, setClassSearchTerm] = useState('');

  const totalBookings = bookings.length;
  const paidBookings = bookings.filter(b => b.paymentStatus === 'paid').length;
  const pendingBookings = bookings.filter(b => b.paymentStatus === 'pending').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const totalRevenue = bookings.reduce((sum, b) => sum + ((b.paymentStatus === 'paid' ? b.class?.price || 0 : 0)), 0);
  const totalClasses = classes.length;
  const totalTrainers = trainers.length;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, classesRes, trainersRes] = await Promise.all([
        bookingAPI.getAllBookings(),
        classAPI.getClasses(),
        trainerAPI.getAllTrainers()
      ]);
      setBookings(bookingsRes.data);
      setClasses(classesRes.data);
      setTrainers(trainersRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingAPI.cancelBooking(bookingId);
      alert('Booking cancelled successfully');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleEditClass = (classData) => {
    setEditClassId(classData._id);
    setFormData({
      title: classData.title || '',
      type: classData.type || '',
      trainerId: classData.trainer?._id || '',
      scheduleDate: classData.scheduleDate ? new Date(classData.scheduleDate).toISOString().slice(0, 10) : '',
      startTime: classData.startTime || '',
      price: classData.price || 0,
      duration: classData.duration || 0,
      capacity: classData.capacity || 0,
      endTime: classData.endTime || '',
      description: classData.description || '',
    });
    setShowCreateModal(true);
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Delete this class permanently?')) return;
    try {
      await classAPI.deleteClass(classId);
      alert('Class deleted successfully');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete class');
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      if (editClassId) {
        await classAPI.updateClass(editClassId, formData);
        alert('Class updated successfully!');
      } else {
        await classAPI.createClass(formData);
        alert('Event scheduled successfully!');
      }
      setShowCreateModal(false);
      setEditClassId(null);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || (editClassId ? 'Failed to update class' : 'Failed to create event'));
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditClassId(null);
    setFormData({});
  };

  // Filter bookings based on search and filters
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = searchTerm === '' || 
      booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.class?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.trainer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || booking.paymentStatus === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Filter classes based on search
  const filteredClasses = classes.filter(classItem => {
    return classSearchTerm === '' ||
      classItem.title?.toLowerCase().includes(classSearchTerm.toLowerCase()) ||
      classItem.trainer?.name?.toLowerCase().includes(classSearchTerm.toLowerCase()) ||
      classItem.type?.toLowerCase().includes(classSearchTerm.toLowerCase());
  });

  if (loading) return <div style={styles.loading}>Loading Dashboard...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🛡️ Admin Control Panel</h1>
          <button onClick={() => setShowCreateModal(true)} style={styles.scheduleBtn}>➕ Schedule New Event</button>
        </div>

        <div style={styles.adminStats}>
          <div style={styles.statCardAdmin}>
            <div style={styles.statLabel}>Total Bookings</div>
            <div style={styles.statValue}>{totalBookings}</div>
          </div>
          <div style={styles.statCardAdmin}>
            <div style={styles.statLabel}>Paid Bookings</div>
            <div style={styles.statValue}>{paidBookings}</div>
          </div>
          <div style={styles.statCardAdmin}>
            <div style={styles.statLabel}>Total Revenue</div>
            <div style={styles.statValue}>${totalRevenue.toFixed(2)}</div>
          </div>
          <div style={styles.statCardAdmin}>
            <div style={styles.statLabel}>Active Classes</div>
            <div style={styles.statValue}>{totalClasses}</div>
          </div>
          <div style={styles.statCardAdmin}>
            <div style={styles.statLabel}>Trainers</div>
            <div style={styles.statValue}>{totalTrainers}</div>
          </div>
          <div style={styles.statCardAdmin}>
            <div style={styles.statLabel}>Pending Payments</div>
            <div style={styles.statValue}>{pendingBookings}</div>
          </div>
          <div style={styles.statCardAdmin}>
            <div style={styles.statLabel}>Completed Bookings</div>
            <div style={styles.statValue}>{completedBookings}</div>
          </div>
        </div>

        <div style={styles.tabs}>
          <button 
            onClick={() => setActiveTab('bookings')} 
            style={activeTab === 'bookings' ? styles.activeTab : styles.tab}
          >
            All Bookings ({filteredBookings.length})
          </button>
          <button 
            onClick={() => setActiveTab('classes')} 
            style={activeTab === 'classes' ? styles.activeTab : styles.tab}
          >
            Manage Classes ({filteredClasses.length})
          </button>
        </div>

        {activeTab === 'bookings' ? (
          <div style={styles.section}>
            {/* Search and Filter Controls */}
            <div style={styles.filters}>
              <div style={styles.searchBox}>
                <input
                  type="text"
                  placeholder="Search by user, class, or trainer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
                <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); setPaymentFilter('all'); }} style={{...styles.searchBtn, background: '#64748b'}}>Clear Filters</button>
              </div>
              <div style={styles.filterSelects}>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.filterSelect}>
                  <option value="all">All Statuses</option>
                  <option value="reserved">Reserved</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} style={styles.filterSelect}>
                  <option value="all">All Payments</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Class</th>
                  <th>Trainer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => (
                  <tr key={b._id}>
                    <td>{b.user?.name}<br/><small style={{color: '#64748b'}}>{b.user?.email}</small></td>
                    <td><span style={{fontWeight: '600'}}>{b.class?.title}</span></td>
                    <td>{b.trainer?.name}</td>
                    <td>{new Date(b.class?.scheduleDate).toLocaleDateString()}</td>
                    <td><span style={getStatusBadge(b.status)}>{b.status}</span></td>
                    <td><span style={getPaymentBadge(b.paymentStatus)}>{b.paymentStatus}</span></td>
                    <td>
                      {b.status !== 'cancelled' && b.status !== 'completed' ? (
                        <button onClick={() => handleCancelBooking(b._id)} style={styles.smallCancelBtn}>
                          Cancel
                        </button>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>No action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={styles.section}>
            {/* Class Search */}
            <div style={styles.filters}>
              <div style={styles.searchBox}>
                <input
                  type="text"
                  placeholder="Search classes by title, trainer, or type..."
                  value={classSearchTerm}
                  onChange={(e) => setClassSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
                <button onClick={() => setClassSearchTerm('')} style={{...styles.searchBtn, background: '#64748b'}}>Clear</button>
              </div>
            </div>

            <div style={styles.grid}>
              {filteredClasses.map(c => (
                <div key={c._id} style={styles.card}>
                  <div style={{...styles.colorBar, background: '#3b82f6'}}></div>
                  <h3 style={{marginTop: '0'}}>{c.title}</h3>
                  <p><strong>Trainer:</strong> {c.trainer?.name}</p>
                  <p><strong>Date:</strong> {new Date(c.scheduleDate).toLocaleDateString()}</p>
                  <p><strong>Price:</strong> <span style={{color: '#059669', fontWeight: 'bold'}}>${c.price}</span></p>
                  <div style={styles.cardActions}>
                    <button onClick={() => handleEditClass(c)} style={styles.editBtn}>Edit</button>
                    <button onClick={() => handleDeleteClass(c._id)} style={styles.deleteBtn}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2>{editClassId ? 'Edit Class' : 'Schedule New Class'}</h2>
              <button onClick={handleCloseModal} style={styles.closeBtn}>×</button>
            </div>
            <form onSubmit={handleCreateClass} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.field}>
                  <label>Title</label>
                  <input name="title" value={formData.title || ''} required style={styles.input} onChange={handleFormChange} />
                </div>
                <div style={styles.field}>
                  <label>Type</label>
                  <input name="type" value={formData.type || ''} placeholder="e.g. Yoga, HIIT" required style={styles.input} onChange={handleFormChange} />
                </div>
                <div style={styles.field}>
                  <label>Trainer</label>
                  <select name="trainerId" value={formData.trainerId || ''} required style={styles.input} onChange={handleFormChange}>
                    <option value="">Select Trainer</option>
                    {trainers.map(t => <option key={t._id} value={t._id}>{t.name} ({t.email})</option>)}
                  </select>
                </div>
                <div style={styles.field}>
                  <label>Date</label>
                  <input type="date" name="scheduleDate" value={formData.scheduleDate || ''} required style={styles.input} onChange={handleFormChange} />
                </div>
                <div style={styles.field}>
                  <label>Start Time</label>
                  <input type="time" name="startTime" value={formData.startTime || ''} required style={styles.input} onChange={handleFormChange} />
                </div>
                <div style={styles.field}>
                  <label>End Time</label>
                  <input type="time" name="endTime" value={formData.endTime || ''} required style={styles.input} onChange={handleFormChange} />
                </div>
                <div style={styles.field}>
                  <label>Duration (minutes)</label>
                  <input type="number" name="duration" value={formData.duration || ''} required style={styles.input} onChange={handleFormChange} />
                </div>
                <div style={styles.field}>
                  <label>Capacity</label>
                  <input type="number" name="capacity" value={formData.capacity || ''} required style={styles.input} onChange={handleFormChange} />
                </div>
                <div style={styles.field}>
                  <label>Price ($)</label>
                  <input type="number" name="price" value={formData.price || ''} required style={styles.input} onChange={handleFormChange} />
                </div>
                <div style={{ gridColumn: '1 / -1', ...styles.field }}>
                  <label>Description</label>
                  <textarea name="description" value={formData.description || ''} required style={{ ...styles.input, minHeight: '90px' }} onChange={handleFormChange} />
                </div>
              </div>
              <button type="submit" style={styles.submitBtn}>{editClassId ? 'Update Class' : 'Create Event'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const getStatusBadge = (status) => ({
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  backgroundColor: status === 'reserved' ? '#fef3c7' : status === 'completed' ? '#d1fae5' : '#fee2e2',
  color: status === 'reserved' ? '#92400e' : status === 'completed' ? '#065f46' : '#991b1b',
});

const getPaymentBadge = (status) => ({
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  backgroundColor: status === 'paid' ? '#d1fae5' : '#fef3c7',
  color: status === 'paid' ? '#065f46' : '#92400e',
});

const styles = {
  page: { background: '#f8fafc', minHeight: '100vh', padding: '2rem' },
  container: { maxWidth: '1200px', margin: '0 auto' },
  title: { fontSize: '2.5rem', marginBottom: '2rem', color: '#1e293b' },
  tabs: { display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0' },
  tab: { padding: '1rem 2rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#64748b' },
  activeTab: { padding: '1rem 2rem', border: 'none', borderBottom: '2px solid #3b82f6', background: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#3b82f6', fontWeight: 'bold' },
  section: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
  filters: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' },
  searchBox: { display: 'flex', gap: '0.5rem', flex: 1, maxWidth: '400px' },
  searchInput: { flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem' },
  searchBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' },
  filterSelects: { display: 'flex', gap: '0.5rem' },
  filterSelect: { padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem', background: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' },
  card: { padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px' },
  cardActions: { display: 'flex', gap: '0.5rem', marginTop: '1rem' },
  editBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' },
  deleteBtn: { background: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' },
  smallCancelBtn: { background: '#fdba74', color: '#1f2937', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' },
  loading: { textAlign: 'center', padding: '4rem', fontSize: '1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  scheduleBtn: { background: '#059669', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  colorBar: { height: '4px', margin: '-1.5rem -1.5rem 1rem -1.5rem', borderRadius: '8px 8px 0 0' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  closeBtn: { background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#64748b' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  input: { padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '1rem' },
  submitBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '1rem' },
  adminStats: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  statCardAdmin: { background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 14px rgba(15,23,42,0.08)', border: '1px solid #e2e8f0' },
  statLabel: { color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' },
  statValue: { fontSize: '2rem', fontWeight: '800', color: '#1f2937' }
};

export default AdminDashboard;
