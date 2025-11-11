import { useState, useEffect } from "react";
import "./Admin.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export default function AdminServices({ token }) {
  const [services, setServices] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingPrice, setEditingPrice] = useState("");
  const [editingImageUrl, setEditingImageUrl] = useState("");

  // Fetch all services
  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_URL}/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch services");
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error("AdminServices: Error fetching services:", err);
    }
  };

  useEffect(() => {
    if (token) fetchServices();
  }, [token]);

  // Create new service
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle || !newDescription || !newPrice)
      return alert("All fields are required");

    try {
      const res = await fetch(`${API_URL}/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          price: parseFloat(newPrice),
          image_url: newImageUrl,
        }),
      });

      if (res.ok) {
        setNewTitle("");
        setNewDescription("");
        setNewPrice("");
        setNewImageUrl("");
        fetchServices();
      } else {
        const error = await res.json();
        alert(error.error || "Error creating service");
      }
    } catch (err) {
      console.error("AdminServices: Error creating service:", err);
    }
  };

  // Delete a service
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      const res = await fetch(`${API_URL}/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchServices();
      else alert("Error deleting service");
    } catch (err) {
      console.error("AdminServices: Error deleting service:", err);
    }
  };

  // Start editing
  const handleEdit = (service) => {
    setEditingServiceId(service.id);
    setEditingTitle(service.title);
    setEditingDescription(service.description);
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
        setEditingImageUrl("");
        fetchServices();
      } else {
        const error = await res.json();
        alert(error.error || "Error updating service");
      }
    } catch (err) {
      console.error("AdminServices: Error updating service:", err);
    }
  };

  return (
    <div className="admin-services">
      <h2>Manage Services</h2>

      {/* Add Service Form */}
      <form onSubmit={handleCreate} className="admin-form">
        <h3>Add New Service</h3>
        <input
          type="text"
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="admin-input"
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="admin-input"
          required
        />
        <input
          type="number"
          placeholder="Price (Kshs)"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          className="admin-input"
          required
        />
        <input
          type="text"
          placeholder="Image URL (optional)"
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          className="admin-input"
        />
        <button type="submit" className="admin-button">Add Service</button>
      </form>

      {/* Service Table */}
      <div className="admin-table-container">
        <h3>Existing Services</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Description</th>
              <th>Price (Kshs)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                {editingServiceId === service.id ? (
                  <>
                    <td>
                      <input
                        type="text"
                        value={editingImageUrl}
                        onChange={(e) => setEditingImageUrl(e.target.value)}
                        className="admin-input"
                        placeholder="Image URL"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="admin-input"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editingDescription}
                        onChange={(e) =>
                          setEditingDescription(e.target.value)
                        }
                        className="admin-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editingPrice}
                        onChange={(e) => setEditingPrice(e.target.value)}
                        className="admin-input"
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => handleUpdate(service.id)}
                        className="admin-button"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingServiceId(null)}
                        className="admin-button"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      {service.image_url ? (
                        <img
                          src={service.image_url}
                          alt={service.title}
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "6px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{service.title}</td>
                    <td>{service.description}</td>
                    <td>{service.price}</td>
                    <td>
                      <button
                        onClick={() => handleEdit(service)}
                        className="admin-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="admin-button delete"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
