import { useState, useEffect } from "react";
import "./StylistList.css"; // ✅ import styles

export default function StylistList({ token }) {
  const [stylists, setStylists] = useState([]);
  const [services, setServices] = useState([]);

  // New stylist fields
  const [newName, setNewName] = useState("");
  const [newBio, setNewBio] = useState("");
  const [newServiceIds, setNewServiceIds] = useState([]);

  // Editing fields
  const [editingStylistId, setEditingStylistId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingBio, setEditingBio] = useState("");
  const [editingServiceIds, setEditingServiceIds] = useState([]);

  // Fetch stylists
  const fetchStylists = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/stylists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStylists(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch services
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
    if (token) {
      fetchStylists();
      fetchServices();
    }
  }, [token]);

  // Create stylist
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName) return alert("Name is required");

    try {
      const res = await fetch("http://127.0.0.1:5000/stylists", {
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

  // Delete stylist
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stylist?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/stylists/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchStylists();
      else alert("Error deleting stylist");
    } catch (err) {
      console.error(err);
    }
  };

  // Edit stylist
  const handleEdit = (stylist) => {
    setEditingStylistId(stylist.id);
    setEditingName(stylist.name);
    setEditingBio(stylist.bio);
    setEditingServiceIds(stylist.services?.map((s) => s.id) || []);
  };

  // Update stylist
  const handleUpdate = async (id) => {
    if (!editingName) return alert("Name is required");

    try {
      const res = await fetch(`http://127.0.0.1:5000/stylists/${id}`, {
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

  // Toggle checkbox
  const toggleService = (serviceId, selectedList, setSelectedList) => {
    if (selectedList.includes(serviceId)) {
      setSelectedList(selectedList.filter((id) => id !== serviceId));
    } else {
      setSelectedList([...selectedList, serviceId]);
    }
  };

  return (
    <div className="stylist-list">
      <h2>Stylists</h2>

      {/* Create Form */}
      <form onSubmit={handleCreate} className="stylist-form">
        <input
          type="text"
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Bio"
          value={newBio}
          onChange={(e) => setNewBio(e.target.value)}
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

        <button type="submit">Add Stylist</button>
      </form>

      {/* Stylist Cards */}
      <ul className="stylist-cards">
        {stylists.map((stylist) => (
          <li key={stylist.id} className="stylist-card">
            {editingStylistId === stylist.id ? (
              <>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  placeholder="Name"
                />
                <input
                  type="text"
                  value={editingBio}
                  onChange={(e) => setEditingBio(e.target.value)}
                  placeholder="Bio"
                />

                <div className="service-checkboxes">
                  <label>Assign Services:</label>
                  {services.map((service) => (
                    <div key={service.id} className="service-row">
                      <span>{service.title}</span>
                      <input
                        type="checkbox"
                        checked={editingServiceIds.includes(service.id)}
                        onChange={() =>
                          toggleService(service.id, editingServiceIds, setEditingServiceIds)
                        }
                      />
                    </div>
                  ))}
                </div>

                <button onClick={() => handleUpdate(stylist.id)}>Save</button>
                <button onClick={() => setEditingStylistId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <strong>{stylist.name}</strong> - {stylist.bio}
                <br />
                <em>
                  Services:{" "}
                  {stylist.services?.map((s) => s.title).join(", ") || "No services"}
                </em>
                <br />
                <button onClick={() => handleEdit(stylist)}>Edit</button>
                <button onClick={() => handleDelete(stylist.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
