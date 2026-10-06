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

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
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
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjects();
  }, []);

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

  const renderItem = ({ item }: { item: Project }) => (
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
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(!showCreate)}>
          <Text style={styles.addBtnText}>{showCreate ? 'Cancel' : 'New Project'}</Text>
        </TouchableOpacity>
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
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>No projects found. Create one!</Text>}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
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
    fontSize: 16,
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
    fontSize: 16,
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
    fontSize: 18,
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
    fontSize: 12,
    color: '#333',
  },
  cardDescription: {
    color: '#7f8c8d',
    fontSize: 14,
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
