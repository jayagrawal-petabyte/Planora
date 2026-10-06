import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, Alert, ActivityIndicator } from 'react-native';
import api from '../services/api';

interface Task {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
}

export const ProjectDetailsScreen = ({ route }: any) => {
  const { id: projectId, name: projectName } = route.params;
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  
  // Task form
  const [showForm, setShowForm] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit Task
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');

  const fetchTasks = async () => {
    try {
      let url = `/tasks?projectId=${projectId}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;
      if (priorityFilter) url += `&priority=${encodeURIComponent(priorityFilter)}`;

      const res = await api.get(url);
      if (res.data.success) {
        setTasks(res.data.data.tasks);
        setError('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, priorityFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, [search, statusFilter, priorityFilter]);

  const handleCreateTask = async () => {
    if (!taskName.trim()) {
      Alert.alert('Error', 'Task name is required');
      return;
    }
    setCreating(true);
    try {
      const res = await api.post('/tasks', { name: taskName, description: taskDesc, projectId });
      if (res.data.success) {
        setTasks([res.data.data.task, ...tasks]);
        setTaskName('');
        setTaskDesc('');
        setShowForm(false);
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error?.message || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    } catch (err) {
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditName(task.name);
    setEditDesc(task.description || '');
    setEditStatus(task.status);
    setEditPriority(task.priority);
  };

  const handleEditSubmit = async (id: string) => {
    try {
      const res = await api.put(`/tasks/${id}`, {
        name: editName,
        description: editDesc,
        status: editStatus,
        priority: editPriority
      });
      if (res.data.success) {
        setTasks(tasks.map(t => t.id === id ? res.data.data.task : t));
        setEditingId(null);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(tasks.filter(t => t.id !== taskId));
          } catch (err) {
            Alert.alert('Error', 'Failed to delete task');
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: Task }) => {
    if (editingId === item.id) {
      return (
        <View style={styles.card}>
          <TextInput style={styles.input} value={editName} onChangeText={setEditName} />
          <TextInput style={styles.input} value={editDesc} onChangeText={setEditDesc} />
          
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <TouchableOpacity onPress={() => setEditStatus(editStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED')} style={[styles.filterBadge, editStatus === 'COMPLETED' && styles.filterBadgeActive]}>
               <Text style={styles.filterBadgeText}>{editStatus}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              const p = ['LOW', 'MEDIUM', 'HIGH'];
              setEditPriority(p[(p.indexOf(editPriority) + 1) % p.length]);
            }} style={[styles.filterBadge, styles.filterBadgeActive]}>
               <Text style={styles.filterBadgeText}>{editPriority}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => handleEditSubmit(item.id)}>
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => setEditingId(null)}>
              <Text style={styles.btnTextSecondary}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, item.status === 'COMPLETED' && styles.completedText]}>
            {item.name}
          </Text>
          <View style={[styles.badge, (styles as any)[`priority${item.priority}`]]}>
            <Text style={styles.badgeText}>{item.priority}</Text>
          </View>
        </View>
        <Text style={styles.cardDescription}>{item.description}</Text>
        
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, item.status === 'COMPLETED' ? styles.btnPending : styles.btnComplete]} onPress={() => toggleStatus(item)}>
            <Text style={styles.btnActionText}>{item.status === 'COMPLETED' ? 'Mark Pending' : 'Complete'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, {backgroundColor: '#eee'}]} onPress={() => startEdit(item)}>
            <Text style={[styles.btnActionText, {color: '#1a3626'}]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnDelete]} onPress={() => deleteTask(item.id)}>
            <Text style={styles.btnActionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
          <Text style={styles.addBtnText}>{showForm ? 'Cancel' : 'Add'}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', padding: 10, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#eee', gap: 5 }}>
        <TouchableOpacity onPress={() => setStatusFilter('')} style={[styles.filterBadge, statusFilter === '' && styles.filterBadgeActive]}>
          <Text style={styles.filterBadgeText}>All Status</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStatusFilter('PENDING')} style={[styles.filterBadge, statusFilter === 'PENDING' && styles.filterBadgeActive]}>
          <Text style={styles.filterBadgeText}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPriorityFilter(priorityFilter ? '' : 'HIGH')} style={[styles.filterBadge, priorityFilter === 'HIGH' && styles.filterBadgeActive]}>
          <Text style={styles.filterBadgeText}>{priorityFilter === 'HIGH' ? 'High Only' : 'Priority'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.createForm}>
          <TextInput
            style={styles.input}
            placeholder="Task Name"
            value={taskName}
            onChangeText={setTaskName}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={taskDesc}
            onChangeText={setTaskDesc}
          />
          <TouchableOpacity style={styles.submitBtn} onPress={handleCreateTask} disabled={creating}>
            {creating ? <ActivityIndicator color="white" /> : <Text style={styles.submitBtnText}>Save Task</Text>}
          </TouchableOpacity>
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      {loading ? (
        <ActivityIndicator size="large" color="#1a3626" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>No tasks found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f4ec' },
  searchBar: { flexDirection: 'row', padding: 10, backgroundColor: 'white', alignItems: 'center' },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginRight: 10 },
  addBtn: { backgroundColor: '#1a3626', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 5 },
  addBtnText: { color: 'white', fontWeight: 'bold' },
  filterBadge: { padding: 6, backgroundColor: '#eee', borderRadius: 4, justifyContent: 'center' },
  filterBadgeActive: { backgroundColor: '#1a3626' },
  filterBadgeText: { fontSize: 12, color: '#1a3626' },
  createForm: { backgroundColor: 'white', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 },
  submitBtn: { backgroundColor: '#28a745', padding: 12, borderRadius: 5, alignItems: 'center' },
  submitBtnText: { color: 'white', fontWeight: 'bold' },
  list: { padding: 15 },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', flex: 1 },
  completedText: { textDecorationLine: 'line-through', color: '#95a5a6' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  priorityLOW: { backgroundColor: '#2a5a3f' },
  priorityMEDIUM: { backgroundColor: '#f39c12' },
  priorityHIGH: { backgroundColor: '#e74c3c' },
  badgeText: { fontSize: 10, color: 'white', fontWeight: 'bold' },
  cardDescription: { color: '#7f8c8d', fontSize: 12, marginBottom: 15 },
  actions: { flexDirection: 'row', justifyContent: 'flex-start', gap: 5 },
  btn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 4 },
  btnComplete: { backgroundColor: '#2ecc71' },
  btnPending: { backgroundColor: '#f1c40f' },
  btnDelete: { backgroundColor: '#e74c3c' },
  btnActionText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  btnPrimary: { backgroundColor: '#1a3626', padding: 10, borderRadius: 4, flex: 1, marginRight: 5, alignItems: 'center' },
  btnSecondary: { backgroundColor: '#eee', padding: 10, borderRadius: 4, flex: 1, marginLeft: 5, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold' },
  btnTextSecondary: { color: '#1a3626', fontWeight: 'bold' },
  error: { color: 'red', padding: 20, textAlign: 'center' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 14 }
});
