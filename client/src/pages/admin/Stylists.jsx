import { useState, useEffect } from "react";
import "./Admin.css";


const API_URL = import.meta.env.VITE_API_URL || 'https://beauty-parlor-app-5.onrender.com';

export default function AdminStylists({ token }) {
  const [stylists, setStylists] = useState([]);
  const [services, setServices] = useState([]);
  const [newName, setNewName] = useState("");
  const [newBio, setNewBio] = useState("");
  const [newServiceIds, setNewServiceIds] = useState([]);
  const [editingStylistId, setEditingStylistId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingBio, setEditingBio] = useState("");
  const [editingServiceIds, setEditingServiceIds] = useState([]);

  const fetchStylists = async () => {
    try {
      const res = await fetch(`${API_URL}/stylists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error("AdminStylists: Failed to fetch stylists:", errorData);
        throw new Error("Failed to fetch stylists");
      }
      const data = await res.json();
      setStylists(data);
    } catch (err) {
      console.error("AdminStylists: Error fetching stylists:", err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_URL}/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error("AdminStylists: Failed to fetch services:", errorData);
        throw new Error("Failed to fetch services");
      }
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error("AdminStylists: Error fetching services:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStylists();
      fetchServices();
    }
  }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName) return alert("Name is required");

    try {
      const res = await fetch(`${API_URL}/stylists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
          bio: newBio,
          service_ids: newServiceIds,
        }),
      });

      if (res.ok) {
        setNewName("");
        setNewBio("");
        setNewServiceIds([]);
        fetchStylists();
      } else {
        const error = await res.json();
        alert(error.error || "Error creating stylist");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stylist?")) return;
    try {
      const res = await fetch(`${API_URL}/stylists/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchStylists();
      else alert("Error deleting stylist");
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (stylist) => {
    setEditingStylistId(stylist.id);
    setEditingName(stylist.name);
    setEditingBio(stylist.bio);
    setEditingServiceIds(stylist.services?.map((s) => s.id) || []);
  };

  const handleUpdate = async (id) => {
    if (!editingName) return alert("Name is required");

    try {
      const res = await fetch(`${API_URL}/stylists/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingName,
          bio: editingBio,
          service_ids: editingServiceIds,
        }),
      });

      if (res.ok) {
        setEditingStylistId(null);
        setEditingName("");
        setEditingBio("");
        setEditingServiceIds([]);
        fetchStylists();
      } else {
        const error = await res.json();
        alert(error.error || "Error updating stylist");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleService = (serviceId, selectedList, setSelectedList) => {
    if (selectedList.includes(serviceId)) {
      setSelectedList(selectedList.filter((id) => id !== serviceId));
    } else {
      setSelectedList([...selectedList, serviceId]);
    }
  };

  return (
    <div className="admin-stylists">
      <h2>Manage Stylists</h2>

      <form onSubmit={handleCreate} className="admin-form">
        <h3>Add New Stylist</h3>
        <input
          type="text"
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
          className="admin-input"
        />
        <input
          type="text"
          placeholder="Bio"
          value={newBio}
          onChange={(e) => setNewBio(e.target.value)}
          className="admin-input"
        />
        <div className="service-options">
          <label>Assign Services:</label>
          {services.map((service) => (
            <label key={service.id}>
              <input
                type="checkbox"
                checked={newServiceIds.includes(service.id)}
                onChange={() =>
                  toggleService(service.id, newServiceIds, setNewServiceIds)
                }
              />
              {service.title}
            </label>
          ))}
        </div>
        <button type="submit" className="admin-button">Add Stylist</button>
      </form>

      <div className="stylist-list">
        <h3>Existing Stylists</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Bio</th>
              <th>Services</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stylists.map((stylist) => (
              <tr key={stylist.id}>
                {editingStylistId === stylist.id ? (
                  <>
                    <td>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="admin-input"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editingBio}
                        onChange={(e) => setEditingBio(e.target.value)}
                        className="admin-input"
                      />
                    </td>
                    <td>
                      {services.map((service) => (
                        <label key={service.id}>
                          <input
                            type="checkbox"
                            checked={editingServiceIds.includes(service.id)}
                            onChange={() =>
                              toggleService(
                                service.id,
                                editingServiceIds,
                                setEditingServiceIds
                              )
                            }
                          />
                          {service.title}
                        </label>
                      ))}
                    </td>
                    <td>
                      <button onClick={() => handleUpdate(stylist.id)} className="admin-button">Save</button>
                      <button onClick={() => setEditingStylistId(null)} className="admin-button">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{stylist.name}</td>
                    <td>{stylist.bio}</td>
                    <td>{stylist.services?.map((s) => s.title).join(", ") || "No services"}</td>
                    <td>
                      <button onClick={() => handleEdit(stylist)} className="admin-button">Edit</button>
                      <button onClick={() => handleDelete(stylist.id)} className="admin-button">Delete</button>
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
