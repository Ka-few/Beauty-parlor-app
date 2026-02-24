import { useEffect, useState } from 'react';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://beauty-parlor-app-5.onrender.com';

export default function ServiceList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/admin/services`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch services.');
        }

        const data = await response.json();
        setServices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) return <div>Loading services...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="admin-page-header">Service Management</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Image URL</th>
          </tr>
    setEditingPrice(service.price);
    setEditingImageUrl(service.image_url);
  };

  // Update service
  const handleUpdate = async (id) => {
    if (!editingTitle || !editingDescription || !editingPrice)
      return alert("All fields are required");

    try {
      const res = await fetch(`${API_URL}/services/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingTitle,
          description: editingDescription,
          price: parseFloat(editingPrice),
          image_url: editingImageUrl,
        }),
      });

      if (res.ok) {
        setEditingServiceId(null);
        setEditingTitle("");
        setEditingDescription("");
        setEditingPrice("");
        fetchServices();
      } else {
        const error = await res.json();
        alert(error.error || "Error updating service");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="servicelist-container">
      <h2>Services</h2>

      {/* Create form */}
      <form onSubmit={handleCreate} className="service-form">
        <input
          type="text"
          placeholder="Title"
        </thead>
        <tbody>
          {services.map(service => (
            <tr key={service.id}>
              <td>{service.id}</td>
              <td>{service.title}</td>
              <td>{service.description}</td>
              <td>Kshs {service.price.toFixed(2)}</td>
              <td>{service.image_url || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
