import { useEffect, useMemo, useState } from "react";
import { onValue, ref, update, remove } from "firebase/database";
import {
  Search,
  Phone,
  MessageCircle,
  Mail,
  Share2,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { db } from "../firebase/config";
import Modal from "../components/Modal";

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [shareEnquiry, setShareEnquiry] = useState(null);
  const [selectedProperties, setSelectedProperties] = useState([]);

  useEffect(() => {
    const unsubEnquiries = onValue(
      ref(db, "enquiries"),
      (snapshot) => {
        const data = snapshot.val() || {};
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setEnquiries(list);
        setLoading(false);
      },
      () => setLoading(false)
    );

    const unsubProperties = onValue(
      ref(db, "properties"),
      (snapshot) => {
        const data = snapshot.val() || {};
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        setProperties(list);
      }
    );

    return () => {
      unsubEnquiries();
      unsubProperties();
    };
  }, []);

  const filteredEnquiries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return enquiries;

    return enquiries.filter((item) => {
      const text = [
        item.name,
        item.phone,
        item.email,
        item.preferredLocation || item.location,
        item.propertyType || item.type,
        item.bhk,
        item.budget,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return text.includes(q);
    });
  }, [enquiries, search]);

  const changeStatus = async (id, status) => {
    try {
      await update(ref(db, `enquiries/${id}`), {
        status,
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const deleteEnquiry = async () => {
    if (!deleteId) return;
    try {
      await remove(ref(db, `enquiries/${deleteId}`));
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (value) => {
    if (!value) return "—";
    const num = Number(String(value).replace(/[^0-9.]/g, ""));
    return num ? `₹${num.toLocaleString("en-IN")}` : String(value);
  };

  const availableProperties = useMemo(() => {
    return properties.filter((p) => !p.status || p.status === "available");
  }, [properties]);

  const togglePropertySelect = (id) => {
    setSelectedProperties((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const sendPropertiesWhatsApp = () => {
    if (!shareEnquiry) return;
    if (selectedProperties.length === 0) {
      alert("Please select at least one property to share.");
      return;
    }

    const selected = availableProperties.filter((p) =>
      selectedProperties.includes(p.id)
    );

    const cleanPhone = String(shareEnquiry.phone || "").replace(/\D/g, "");
    if (!cleanPhone) {
      alert("No phone number found for this lead.");
      return;
    }

    const recipient = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    let message = `Hello ${shareEnquiry.name || "there"},\n\nHere are properties matching your requirement from Swastik Properties:\n\n`;

    selected.forEach((p, idx) => {
      message += `${idx + 1}. ${p.title || "Property"}\n`;
      if (p.location) message += `Location: ${p.location}\n`;
      if (p.bhk || p.type) message += `Type: ${[p.bhk, p.type].filter(Boolean).join(" ")}\n`;
      if (p.price) message += `Price: ${p.price}\n`;
      message += `\n`;
    });

    message += `Please let us know if you would like to arrange a site visit.\n\nBest regards,\nSwastik Properties`;

    window.open(
      `https://wa.me/${recipient}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );

    setShareEnquiry(null);
    setSelectedProperties([]);
  };

  return (
    <div className="page-container">
      <div className="page-top">
        <div>
          <h1>Enquiries</h1>
          <p className="page-desc">Inquiries received from your website.</p>
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="search-input-group">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search by name, phone, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="results-badge">
            {filteredEnquiries.length} {filteredEnquiries.length === 1 ? "lead" : "leads"}
          </span>
        </div>

        {loading ? (
          <div className="empty-box">Loading enquiries...</div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="table-responsive hide-mobile">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Requirement</th>
                    <th>Location</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnquiries.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="cell-title">{item.name || "—"}</div>
                        <div className="cell-sub">
                          {item.phone || item.email || "No contact"}
                          {item.createdAt && ` · ${formatDate(item.createdAt)}`}
                        </div>
                      </td>

                      <td>
                        <div className="cell-title">
                          {item.propertyType || item.type || "General"}
                        </div>
                        <div className="cell-sub">
                          {[item.enquiryType, item.bhk].filter(Boolean).join(" · ")}
                        </div>
                      </td>

                      <td>{item.preferredLocation || item.location || "—"}</td>

                      <td>{formatPrice(item.budget)}</td>

                      <td>
                        <select
                          value={item.status || "new"}
                          onChange={(e) => changeStatus(item.id, e.target.value)}
                          className="select-status"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="interested">Interested</option>
                          <option value="site-visit">Site Visit</option>
                          <option value="negotiation">Negotiation</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>

                      <td>
                        <div className="row-actions">
                          {item.phone && (
                            <a
                              href={`tel:${item.phone}`}
                              className="btn-action-icon action-call"
                              title={`Call ${item.name || item.phone}`}
                            >
                              <Phone size={14} />
                            </a>
                          )}
                          {item.phone && (
                            <a
                              href={`https://wa.me/91${String(item.phone).replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-action-icon action-whatsapp"
                              title={`WhatsApp ${item.name || item.phone}`}
                            >
                              <MessageCircle size={14} />
                            </a>
                          )}
                          {item.email && (
                            <a
                              href={`mailto:${item.email}`}
                              className="btn-action-icon action-email"
                              title={`Email ${item.email}`}
                            >
                              <Mail size={14} />
                            </a>
                          )}
                          <button
                            type="button"
                            className="btn-action-icon action-share"
                            onClick={() => {
                              setShareEnquiry(item);
                              setSelectedProperties([]);
                            }}
                            title="Share properties on WhatsApp"
                          >
                            <Share2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn-action-icon action-delete"
                            onClick={() => setDeleteId(item.id)}
                            title="Delete enquiry"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE LIST */}
            <div className="mobile-lead-list hide-desktop">
              {filteredEnquiries.map((item) => (
                <div className="mobile-lead-card" key={item.id}>
                  <div className="lead-card-header">
                    <div>
                      <div className="lead-name">{item.name || "Anonymous Lead"}</div>
                      {item.createdAt && (
                        <div className="lead-date">{formatDate(item.createdAt)}</div>
                      )}
                    </div>
                    <select
                      value={item.status || "new"}
                      onChange={(e) => changeStatus(item.id, e.target.value)}
                      className="select-status select-status-sm"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="interested">Interested</option>
                      <option value="site-visit">Site Visit</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div className="lead-details">
                    <div>
                      <span className="lead-label">Requirement:</span>{" "}
                      {[item.propertyType || item.type, item.bhk, item.enquiryType]
                        .filter(Boolean)
                        .join(" · ") || "General"}
                    </div>
                    {(item.preferredLocation || item.location) && (
                      <div>
                        <span className="lead-label">Location:</span>{" "}
                        {item.preferredLocation || item.location}
                      </div>
                    )}
                    {item.budget && (
                      <div>
                        <span className="lead-label">Budget:</span>{" "}
                        {formatPrice(item.budget)}
                      </div>
                    )}
                    {item.phone && (
                      <div>
                        <span className="lead-label">Phone:</span> {item.phone}
                      </div>
                    )}
                    {item.email && (
                      <div>
                        <span className="lead-label">Email:</span> {item.email}
                      </div>
                    )}
                  </div>

                  <div className="lead-actions">
                    <div className="lead-actions-left">
                      {item.phone && (
                        <a
                          href={`tel:${item.phone}`}
                          className="btn btn-secondary btn-sm action-btn-call"
                          title="Call"
                        >
                          <Phone size={13} /> Call
                        </a>
                      )}
                      {item.phone && (
                        <a
                          href={`https://wa.me/91${String(item.phone).replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm action-btn-whatsapp"
                          title="WhatsApp"
                        >
                          <MessageCircle size={13} /> WhatsApp
                        </a>
                      )}
                      {item.email && (
                        <a
                          href={`mailto:${item.email}`}
                          className="btn btn-secondary btn-sm action-btn-email"
                          title="Email"
                        >
                          <Mail size={13} /> Email
                        </a>
                      )}
                    </div>

                    <div className="lead-actions-right">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm action-btn-share"
                        onClick={() => {
                          setShareEnquiry(item);
                          setSelectedProperties([]);
                        }}
                        title="Share Properties"
                      >
                        <Share2 size={13} /> Share
                      </button>
                      <button
                        type="button"
                        className="btn-icon-danger"
                        onClick={() => setDeleteId(item.id)}
                        title="Delete enquiry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredEnquiries.length === 0 && (
              <div className="empty-box">
                {search ? "No matching enquiries found." : "No enquiries yet."}
              </div>
            )}
          </>
        )}
      </div>

      {/* SHARE PROPERTIES MODAL */}
      {shareEnquiry && (
        <Modal
          title={`Share Properties with ${shareEnquiry.name || "Client"}`}
          onClose={() => setShareEnquiry(null)}
        >
          <p className="modal-desc">
            Select properties to send in a formatted WhatsApp message.
          </p>

          <div className="property-select-list">
            {availableProperties.map((p) => {
              const isSelected = selectedProperties.includes(p.id);
              return (
                <div
                  key={p.id}
                  className={`property-select-item ${isSelected ? "selected" : ""}`}
                  onClick={() => togglePropertySelect(p.id)}
                >
                  <div className="select-check">
                    {isSelected ? <CheckCircle size={17} /> : <div className="uncheck-circle" />}
                  </div>
                  <div className="select-info">
                    <strong>{p.title || "Untitled"}</strong>
                    <span>
                      {[p.bhk, p.type, p.location, p.price].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                </div>
              );
            })}

            {availableProperties.length === 0 && (
              <div className="empty-box">No available properties to share.</div>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShareEnquiry(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={selectedProperties.length === 0}
              onClick={sendPropertiesWhatsApp}
            >
              <MessageCircle size={15} />
              <span>Send on WhatsApp ({selectedProperties.length})</span>
            </button>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <Modal title="Delete Enquiry" onClose={() => setDeleteId(null)}>
          <p className="modal-desc">
            Are you sure you want to delete this enquiry? This action cannot be undone.
          </p>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={deleteEnquiry}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
