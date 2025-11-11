import { useState, useEffect } from "react";
import "./ServiceList.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";


export default function ServiceList({ token }) {
  console.log("ServiceList component rendered.");
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
    console.log("ServiceList: Fetching services with token:", token);
    try {
      const res = await fetch(`${API_URL}/services`, {
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error("ServiceList: Failed to fetch services:", errorData);
        throw new Error("Failed to fetch services");
      }
      const data = await res.json();
      console.log("ServiceList: Services fetched:", data);
      setServices(data);
    } catch (err) {
      console.error("ServiceList: Error fetching services:", err);
    }
  };

  useEffect(() => {
    console.log("ServiceList: useEffect - token:", token);
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
          price: Number(newPrice),
          image_url: newImageUrl,
        }),
      });

      if (res.ok) {
        setNewTitle("");
        setNewDescription("");
        setNewPrice("");
        fetchServices(); // Refresh list
      } else {
        const error = await res.json();
        alert(error.error || "Error creating service");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete service
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
      console.error(err);
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
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Image URL"
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
        />
        <button type="submit">Add Service</button>
      </form>

      {/* Service list */}
      <ul className="service-list">
        {services.map((service) => (
          <li key={service.id} className="service-card">
            {editingServiceId === service.id ? (
              <div className="service-edit">
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  placeholder="Title"
                />
                <input
                  type="text"
                  value={editingDescription}
                  onChange={(e) => setEditingDescription(e.target.value)}
                  placeholder="Description"
                />
                <input
                  type="number"
                  value={editingPrice}
                  onChange={(e) => setEditingPrice(e.target.value)}
                  placeholder="Price"
                />
                <input
                  type="text"
                  value={editingImageUrl}
                  onChange={(e) => setEditingImageUrl(e.target.value)}
                  placeholder="Image URL"
                />
                <div className="service-actions">
                  <button onClick={() => handleUpdate(service.id)}>Save</button>
                  <button onClick={() => setEditingServiceId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {service.image_url && (
                  <img src={service.image_url} alt={service.title} className="service-image" />
                )}
                <div className="service-info">
                  <strong>{service.title}</strong>
                  <p>{service.description}</p>
                  <p>Kshs: {service.price}</p>
                </div>
                <div className="service-actions">
                  <button onClick={() => handleEdit(service)}>Edit</button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="delete"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
