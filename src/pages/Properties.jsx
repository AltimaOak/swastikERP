// src/pages/Properties.jsx

import { useEffect, useState } from "react";
import {
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";

import { Plus, Trash2 } from "lucide-react";

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

      const list = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));

      setProperties(list);
    });
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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
    const newStatus =
      property.status === "available"
        ? "sold"
        : "available";

    await update(
      ref(db, `properties/${property.id}`),
      {
        status: newStatus,
        updatedAt: Date.now(),
      }
    );
  };

  const deleteProperty = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmed) return;

    await remove(ref(db, `properties/${id}`));
  };

  return (
    <div>

      <div className="page-header">

        <div>
          <p className="eyebrow">LISTINGS</p>
          <h1>Properties</h1>
          <p className="page-subtitle">
            Manage properties shown on the Swastik website.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowModal(true)}
        >
          <Plus size={17} />
          Add Property
        </button>

      </div>

      <div className="property-grid">

        {properties.map((property) => (
          <div
            className="property-card"
            key={property.id}
          >

            <div className="property-image-placeholder">
              <span>
                {property.type || "Property"}
              </span>

              <div
                className={`property-status ${
                  property.status === "available"
                    ? "available"
                    : "sold"
                }`}
              >
                {property.status === "available"
                  ? "Available"
                  : "Sold"}
              </div>
            </div>

            <div className="property-card-body">

              <h3>
                {property.title || "Untitled Property"}
              </h3>

              <p>
                {property.location || "Location not added"}
              </p>

              <div className="property-details">

                <span>{property.bhk || "—"}</span>

                <span>
                  {property.type || "—"}
                </span>

              </div>

              <strong className="property-price">
                {property.price || "Price on request"}
              </strong>

              <div className="property-actions">

                <button
                  className="secondary-button"
                  onClick={() =>
                    toggleStatus(property)
                  }
                >
                  Mark{" "}
                  {property.status === "available"
                    ? "Sold"
                    : "Available"}
                </button>

                <button
                  className="delete-button"
                  onClick={() =>
                    deleteProperty(property.id)
                  }
                >
                  <Trash2 size={15} />
                </button>

              </div>

            </div>

          </div>
        ))}

      </div>

      {properties.length === 0 && (
        <div className="empty-state card-empty">
          No properties added yet.
        </div>
      )}

      {showModal && (
        <Modal
          title="Add Property"
          onClose={() => setShowModal(false)}
        >

          <form
            className="form-stack"
            onSubmit={addProperty}
          >

            <label>
              Property Title

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="2 BHK Flat in Kasarvadavali"
                required
              />

            </label>

            <label>
              Location

              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Thane West"
                required
              />

            </label>

            <div className="two-column">

              <label>
                Type

                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option>Flat</option>
                  <option>Shop</option>
                  <option>Office</option>
                  <option>House</option>
                  <option>Plot</option>
                </select>

              </label>

              <label>
                Configuration

                <select
                  name="bhk"
                  value={form.bhk}
                  onChange={handleChange}
                >
                  <option>1 BHK</option>
                  <option>2 BHK</option>
                  <option>3 BHK</option>
                  <option>4+ BHK</option>
                  <option>NA</option>
                </select>

              </label>

            </div>

            <label>
              Price

              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="₹78 Lakh"
              />

            </label>

            <button
              className="primary-button full-width"
              type="submit"
            >
              Save Property
            </button>

          </form>

        </Modal>
      )}

    </div>
  );
}