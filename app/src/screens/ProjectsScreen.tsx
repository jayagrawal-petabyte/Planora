import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, Alert, ActivityIndicator } from 'react-native';
import api from '../services/api';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
}

export const ProjectsScreen = ({ navigation }: any) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const fetchProjects = async () => {
    try {
      let url = '/projects?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (statusFilter) url += `status=${encodeURIComponent(statusFilter)}&`;

      const res = await api.get(url);
      if (res.data.success) {
        setProjects(res.data.data.projects);
        setError('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjects();
  }, [search, statusFilter]);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Project name is required');
      return;
    }
    setCreating(true);
    try {
      const res = await api.post('/projects', { name, description });
      if (res.data.success) {
        setProjects([res.data.data.project, ...projects]);
        setName('');
        setDescription('');
        setShowCreate(false);
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setEditName(project.name);
    setEditDescription(project.description || '');
  };

  const handleEditSubmit = async (id: string) => {
    try {
      const res = await api.put(`/projects/${id}`, { name: editName, description: editDescription });
      if (res.data.success) {
        setProjects(projects.map(p => p.id === id ? res.data.data.project : p));
        setEditingId(null);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update project');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Project', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/projects/${id}`);
            setProjects(projects.filter(p => p.id !== id));
          } catch (err) {
            Alert.alert('Error', 'Failed to delete project');
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: Project }) => {
    if (editingId === item.id) {
      return (
        <View style={styles.card}>
          <TextInput style={styles.input} value={editName} onChangeText={setEditName} />
          <TextInput style={styles.input} value={editDescription} onChangeText={setEditDescription} />
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
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('ProjectDetails', { id: item.id, name: item.name })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.status.replace('_', ' ')}</Text>
          </View>
        </View>
        <Text style={styles.cardDescription}>{item.description}</Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginTop: 10, gap: 10 }}>
          <TouchableOpacity style={styles.btnAction} onPress={() => startEdit(item)}>
            <Text style={styles.btnActionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnAction, styles.btnDelete]} onPress={() => handleDelete(item.id)}>
            <Text style={styles.btnActionTextDelete}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(!showCreate)}>
          <Text style={styles.addBtnText}>{showCreate ? 'Cancel' : 'New'}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', padding: 10, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#eee' }}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 10 }]}
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
        />
        <View style={{ flexDirection: 'row', gap: 5 }}>
          <TouchableOpacity onPress={() => setStatusFilter('')} style={[styles.filterBadge, statusFilter === '' && styles.filterBadgeActive]}>
            <Text style={styles.filterBadgeText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStatusFilter('IN_PROGRESS')} style={[styles.filterBadge, statusFilter === 'IN_PROGRESS' && styles.filterBadgeActive]}>
            <Text style={styles.filterBadgeText}>Active</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showCreate && (
        <View style={styles.createForm}>
          <TextInput
            style={styles.input}
            placeholder="Project Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
          />
          <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={creating}>
            {creating ? <ActivityIndicator color="white" /> : <Text style={styles.submitBtnText}>Create Project</Text>}
          </TouchableOpacity>
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator size="large" color="#0b4cad" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>No projects found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#03175b',
  },
  addBtn: {
    backgroundColor: '#0b4cad',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  addBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterBadge: {
    padding: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    justifyContent: 'center'
  },
  filterBadgeActive: {
    backgroundColor: '#0b4cad',
  },
  filterBadgeText: {
    fontSize: 12,
  },
  createForm: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
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
    fontSize: 14,
  },
  btnPrimary: {
    backgroundColor: '#0b4cad', padding: 10, borderRadius: 4, flex: 1, marginRight: 5, alignItems: 'center'
  },
  btnSecondary: {
    backgroundColor: '#eee', padding: 10, borderRadius: 4, flex: 1, marginLeft: 5, alignItems: 'center'
  },
  btnText: { color: 'white', fontWeight: 'bold' },
  btnTextSecondary: { color: '#03175b', fontWeight: 'bold' },
  btnAction: {
    backgroundColor: '#eee',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  btnDelete: {
    backgroundColor: '#ffebee',
  },
  btnActionText: {
    fontSize: 12,
    color: '#03175b',
  },
  btnActionTextDelete: {
    fontSize: 12,
    color: '#e74c3c',
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
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  badge: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    color: '#03175b',
  },
  cardDescription: {
    color: '#7f8c8d',
    fontSize: 12,
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
    fontSize: 14,
  }
});
