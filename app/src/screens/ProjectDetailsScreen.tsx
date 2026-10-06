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
  
  // Task form
  const [showForm, setShowForm] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks?projectId=${projectId}&search=${search}`);
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
  }, [search]); // re-fetch when search changes

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, [search]);

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
  
  const changePriority = async (task: Task) => {
    const priorities = ['LOW', 'MEDIUM', 'HIGH'];
    const currentIndex = priorities.indexOf(task.priority);
    const newPriority = priorities[(currentIndex + 1) % priorities.length];
    try {
      await api.put(`/tasks/${task.id}`, { priority: newPriority });
      setTasks(tasks.map(t => t.id === task.id ? { ...t, priority: newPriority } : t));
    } catch (err) {
      Alert.alert('Error', 'Failed to update priority');
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

  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, item.status === 'COMPLETED' && styles.completedText]}>
          {item.name}
        </Text>
        <TouchableOpacity style={[styles.badge, (styles as any)[`priority${item.priority}`]]} onPress={() => changePriority(item)}>
          <Text style={styles.badgeText}>{item.priority}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.cardDescription}>{item.description}</Text>
      
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, item.status === 'COMPLETED' ? styles.btnPending : styles.btnComplete]} onPress={() => toggleStatus(item)}>
          <Text style={styles.btnText}>{item.status === 'COMPLETED' ? 'Mark Pending' : 'Complete'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnDelete]} onPress={() => deleteTask(item.id)}>
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
          <Text style={styles.addBtnText}>{showForm ? 'Cancel' : 'Add'}</Text>
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
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
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
  container: {
    flex: 1,
    backgroundColor: '#f4f7f6',
  },
  searchBar: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  addBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  addBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  createForm: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#95a5a6',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityLOW: { backgroundColor: '#3498db' },
  priorityMEDIUM: { backgroundColor: '#f39c12' },
  priorityHIGH: { backgroundColor: '#e74c3c' },
  badgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  cardDescription: {
    color: '#7f8c8d',
    fontSize: 14,
    marginBottom: 15,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
  },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 10,
  },
  btnComplete: { backgroundColor: '#2ecc71' },
  btnPending: { backgroundColor: '#f1c40f' },
  btnDelete: { backgroundColor: '#e74c3c' },
  btnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    padding: 20,
    textAlign: 'center',
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
    fontSize: 16,
  }
});
