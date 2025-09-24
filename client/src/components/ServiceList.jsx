import { useState, useEffect } from "react";

export default function ServiceList({ token }) {
  const [services, setServices] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingPrice, setEditingPrice] = useState("");

  // Fetch all services
  const fetchServices = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchServices();
  }, [token]);

  // Create new service
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle || !newDescription || !newPrice) return alert("All fields are required");

    try {
      const res = await fetch("http://127.0.0.1:5000/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          title: newTitle, 
          description: newDescription, 
          price: Number(newPrice) 
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
      const res = await fetch(`http://127.0.0.1:5000/services/${id}`, {
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
  };

  // Update service
  const handleUpdate = async (id) => {
    if (!editingTitle || !editingDescription || !editingPrice) return alert("All fields are required");

    try {
      const res = await fetch(`http://127.0.0.1:5000/services/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          title: editingTitle, 
          description: editingDescription, 
          price: parseFloat(editingPrice) 
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
    <div>
      <h2>Services</h2>

      {/* Create form */}
      <form onSubmit={handleCreate}>
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
        <button type="submit">Add Service</button>
      </form>

      {/* Service list */}
      <ul>
        {services.map((service) => (
          <li key={service.id}>
            {editingServiceId === service.id ? (
              <>
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
                <button onClick={() => handleUpdate(service.id)}>Save</button>
                <button onClick={() => setEditingServiceId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <strong>{service.title}</strong> - {service.description} - Kshs: {service.price}
                <button onClick={() => handleEdit(service)}>Edit</button>
                <button onClick={() => handleDelete(service.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
