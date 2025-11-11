import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import './Admin.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/admin/analytics/summary`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytics data.');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stats) return <div>No data available.</div>;

  const serviceChartData = {
    labels: stats.bookings_per_service.map(s => s.service_name),
    datasets: [
      {
        label: 'Bookings per Service',
        data: stats.bookings_per_service.map(s => s.count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const stylistChartData = {
    labels: stats.bookings_per_stylist.map(s => s.stylist_name),
    datasets: [
      {
        label: 'Bookings per Stylist',
        data: stats.bookings_per_stylist.map(s => s.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
      },
    ],
  };

  return (
    <div>
      <h1 className="admin-page-header">Admin Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats.summary.total_users}</p>
        </div>
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p>{stats.summary.total_bookings}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>Kshs {stats.summary.total_revenue}</p>
        </div>
        <div className="stat-card">
          <h3>Total Stylists</h3>
          <p>{stats.summary.total_stylists}</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
            <h3>Bookings per Service</h3>
            <Bar data={serviceChartData} options={{ responsive: true }} />
        </div>
        <div className="chart-container">
            <h3>Bookings per Stylist</h3>
            <Pie data={stylistChartData} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
}
