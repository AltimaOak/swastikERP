import { useEffect, useState } from "react";
import { onValue, push, ref, remove, set, update } from "firebase/database";
import { Plus, Trash2, MapPin, Building2 } from "lucide-react";
import { db } from "../firebase/config";
import Modal from "../components/Modal";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    location: "",
    type: "Flat",
    bhk: "2 BHK",
    price: "",
    status: "available",
  });

  useEffect(() => {
    return onValue(ref(db, "properties"), (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setProperties(list);
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addProperty = async (e) => {
    e.preventDefault();
    const propertyRef = push(ref(db, "properties"));
    await set(propertyRef, {
      ...form,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    setForm({
      title: "",
      location: "",
      type: "Flat",
      bhk: "2 BHK",
      price: "",
      status: "available",
    });
    setShowModal(false);
  };

  const toggleStatus = async (property) => {
    const newStatus = property.status === "available" ? "sold" : "available";
    await update(ref(db, `properties/${property.id}`), {
      status: newStatus,
      updatedAt: Date.now(),
    });
  };

  const deleteProperty = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    await remove(ref(db, `properties/${id}`));
  };

  return (
    <div className="page-container">
      <div className="page-top">
        <div>
          <h1>Properties</h1>
          <p className="page-desc">Manage real estate listings and availability.</p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          <span>Add Property</span>
        </button>
      </div>

      <div className="property-cards-grid">
        {properties.map((prop) => (
          <div className="property-item" key={prop.id}>
            <div className="property-item-header">
              <span className={`badge badge-${prop.status === "sold" ? "sold" : "available"}`}>
                {prop.status === "sold" ? "Sold" : "Available"}
              </span>
              <span className="property-type-tag">{prop.type || "Property"}</span>
            </div>

            <div className="property-item-content">
              <h3 className="property-title">{prop.title || "Untitled Property"}</h3>
              <div className="property-location">
                <MapPin size={13} />
                <span>{prop.location || "Location not specified"}</span>
              </div>

              <div className="property-specs">
                <span>{prop.bhk || "—"}</span>
                <span>{prop.type || "—"}</span>
              </div>

              <div className="property-price-tag">
                {prop.price || "Price on request"}
              </div>
            </div>

            <div className="property-item-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => toggleStatus(prop)}
              >
                Mark as {prop.status === "available" ? "Sold" : "Available"}
              </button>
              <button
                className="btn-icon-danger"
                onClick={() => deleteProperty(prop.id)}
                title="Delete listing"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {properties.length === 0 && (
        <div className="empty-box card">
          <Building2 size={32} />
          <p>No properties added yet.</p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            Add Your First Property
          </button>
        </div>
      )}

      {showModal && (
        <Modal title="Add New Property" onClose={() => setShowModal(false)}>
          <form onSubmit={addProperty} className="form-stack">
            <div className="form-group">
              <label>Property Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. 2 BHK Apartment in Thane West"
                required
              />
            </div>

            <div className="form-group">
              <label>Location / Area</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Kasarvadavali, Thane West"
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Property Type</label>
                <select name="type" value={form.type} onChange={handleChange}>
                  <option>Flat</option>
                  <option>Shop</option>
                  <option>Office</option>
                  <option>House</option>
                  <option>Plot</option>
                </select>
              </div>

              <div className="form-group">
                <label>Configuration</label>
                <select name="bhk" value={form.bhk} onChange={handleChange}>
                  <option>1 BHK</option>
                  <option>2 BHK</option>
                  <option>3 BHK</option>
                  <option>4+ BHK</option>
                  <option>NA</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Price</label>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. ₹75 Lakh"
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Property
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}