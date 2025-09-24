import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Services({ token }) {
  const [services, setServices] = useState([]);
  const [selectedStylists, setSelectedStylists] = useState({});
  const navigate = useNavigate();

  // Fetch all services with their associated stylists
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/services", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setServices(data);
        } else {
          console.error("Failed to fetch services:", res.status);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (token) fetchServices();
  }, [token]);

  // Handle stylist selection
  const handleStylistChange = (serviceId, stylistId) => {
    setSelectedStylists(prev => ({ ...prev, [serviceId]: stylistId }));
  };

  // Handle booking
  const handleBook = (service) => {
    const stylistId = selectedStylists[service.id];
    if (!stylistId) {
      alert("Please select a stylist for this service");
      return;
    }

    // Navigate to bookings page with service and stylist preselected
    navigate(`/bookings?serviceId=${service.id}&stylistId=${stylistId}`);
  };

  return (
    <div>
      <h2>Our Services</h2>
      {services.length === 0 ? (
        <p>Loading services...</p>
      ) : (
        <ul>
          {services.map((service) => (
            <li key={service.id} style={{ marginBottom: "2rem" }}>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <p>Price: Kshs: {service.price}</p>

              {service.stylists && service.stylists.length > 0 ? (
                <select
                  value={selectedStylists[service.id] || ""}
                  onChange={(e) => handleStylistChange(service.id, e.target.value)}
                >
                  <option value="">Select a stylist</option>
                  {service.stylists.map((stylist) => (
                    <option key={stylist.id} value={stylist.id}>
                      {stylist.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p>No stylists available</p>
              )}

              <button onClick={() => handleBook(service)} style={{ marginLeft: "1rem" }}>
                Book
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
