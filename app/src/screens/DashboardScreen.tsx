import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface DashboardStats {
  totalProjects: number;
  projectsInProgress: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

export const DashboardScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setStats(res.data.data.stats);
        setError('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, []);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.fullName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      {!stats ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Total Projects</Text>
            <Text style={styles.statValue}>{stats.totalProjects}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>In Progress</Text>
            <Text style={styles.statValue}>{stats.projectsInProgress}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Total Tasks</Text>
            <Text style={styles.statValue}>{stats.totalTasks}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Completed</Text>
            <Text style={styles.statValue}>{stats.completedTasks}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Pending</Text>
            <Text style={styles.statValue}>{stats.pendingTasks}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity 
        style={styles.projectsBtn} 
        onPress={() => navigation.navigate('Projects')}
      >
        <Text style={styles.projectsBtnText}>View All Projects</Text>
      </TouchableOpacity>
    </ScrollView>
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
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: '#ff4757',
    borderRadius: 5,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statsGrid: {
    padding: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    width: '48%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statTitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  error: {
    color: 'red',
    padding: 20,
    textAlign: 'center',
  },
  loading: {
    padding: 20,
    textAlign: 'center',
    color: '#666',
  },
  projectsBtn: {
    backgroundColor: '#3498db',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  projectsBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
