import React, { useEffect, useMemo, useState } from "react";
import {
  onValue,
  push,
  ref,
  remove,
  update,
} from "firebase/database";

import {
  Search,
  Phone,
  MessageCircle,
  Trash2,
  Edit3,
  CalendarPlus,
  X,
  UserRound,
  MapPin,
  IndianRupee,
} from "lucide-react";

import { db } from "../firebase/config";
import "./Clients.css";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [editClient, setEditClient] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [followupClient, setFollowupClient] = useState(null);

  const [form, setForm] = useState({
    clientType: "Buyer",
    status: "Active",
    notes: "",
  });

  const [followupForm, setFollowupForm] = useState({
    date: "",
    time: "",
    type: "Call",
    notes: "",
  });

  /* =========================
     LOAD CLIENTS
  ========================= */

  useEffect(() => {
    const clientsRef = ref(db, "clients");

    const unsubscribe = onValue(
      clientsRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          setClients([]);
          setLoading(false);
          return;
        }

        const list = Object.entries(data).map(
          ([id, value]) => ({
            id,
            ...value,
          })
        );

        list.sort(
          (a, b) =>
            (b.createdAt || 0) -
            (a.createdAt || 0)
        );

        setClients(list);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /* =========================
     SEARCH
  ========================= */

  const filteredClients = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return clients;

    return clients.filter((client) => {
      return [
        client.name,
        client.phone,
        client.email,
        client.clientType,
        client.propertyType,
        client.bhk,
        client.budget,
        client.preferredLocation,
        client.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [clients, search]);

  /* =========================
     EDIT CLIENT
  ========================= */

  const openEdit = (client) => {
    setEditClient(client);

    setForm({
      clientType: client.clientType || "Buyer",
      status: client.status || "Active",
      notes: client.notes || "",
    });
  };

  const saveClient = async () => {
    if (!editClient) return;

    try {
      await update(ref(db, `clients/${editClient.id}`), {
        clientType: form.clientType,
        status: form.status,
        notes: form.notes,
        updatedAt: Date.now(),
      });

      setEditClient(null);
    } catch (error) {
      console.error(error);
      alert("Unable to update client.");
    }
  };

  /* =========================
     DELETE CLIENT
  ========================= */

  const deleteClient = async () => {
    if (!deleteTarget) return;

    try {
      await remove(
        ref(db, `clients/${deleteTarget.id}`)
      );

      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
      alert("Unable to delete client.");
    }
  };

  /* =========================
     FOLLOW UP
  ========================= */

  const openFollowup = (client) => {
    setFollowupClient(client);

    setFollowupForm({
      date: "",
      time: "",
      type: "Call",
      notes: "",
    });
  };

  const createFollowup = async () => {
    if (!followupClient) return;

    if (!followupForm.date) {
      alert("Please select a date.");
      return;
    }

    try {
      const followupsRef = ref(db, "followups");
      const newRef = push(followupsRef);

      await update(newRef, {
        clientId: followupClient.id,
        enquiryId: followupClient.enquiryId || "",

        clientName: followupClient.name || "",
        phone: followupClient.phone || "",
        email: followupClient.email || "",

        date: followupForm.date,
        time: followupForm.time,

        type: followupForm.type,
        notes: followupForm.notes,

        status: "Pending",

        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      setFollowupClient(null);

      alert("Follow-up created.");
    } catch (error) {
      console.error(error);
      alert("Unable to create follow-up.");
    }
  };

  const openWhatsApp = (phone) => {
    if (!phone) return;

    const digits = String(phone).replace(/\D/g, "");

    const number =
      digits.length === 10
        ? `91${digits}`
        : digits;

    window.open(
      `https://wa.me/${number}`,
      "_blank"
    );
  };

  return (
    <div className="clients-page">

      {/* HEADER */}

      <div className="page-header">

        <div>
          <h1>Clients</h1>
          <p>
            Manage customers created from your enquiries.
          </p>
        </div>

        <div className="client-count">
          {clients.length} Clients
        </div>

      </div>

      {/* SEARCH */}

      <div className="client-toolbar">

        <div className="search-box">
          <Search size={18} />

          <input
            placeholder="Search clients..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

      </div>

      {/* TABLE */}

      <div className="client-table-wrapper">

        {loading ? (
          <div className="empty-state">
            Loading clients...
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="empty-state">
            <UserRound size={36} />

            <h3>No clients yet</h3>

            <p>
              Add a client from the Enquiries page.
            </p>
          </div>
        ) : (
          <table className="client-table">

            <thead>
              <tr>
                <th>Client</th>
                <th>Type</th>
                <th>Requirement</th>
                <th>Location</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredClients.map((client) => (

                <tr key={client.id}>

                  <td>
                    <div className="client-cell">

                      <strong>
                        {client.name || "Unnamed"}
                      </strong>

                      <span>
                        {client.phone || "No phone"}
                      </span>

                    </div>
                  </td>

                  <td>
                    <span className="client-type">
                      {client.clientType || "Buyer"}
                    </span>
                  </td>

                  <td>
                    <div className="requirement-cell">

                      <strong>
                        {client.bhk ||
                          client.propertyType ||
                          "Property"}
                      </strong>

                      <span>
                        {client.enquiryType || ""}
                      </span>

                    </div>
                  </td>

                  <td>
                    <div className="location-cell">
                      <MapPin size={14} />

                      {client.preferredLocation ||
                        "Not specified"}
                    </div>
                  </td>

                  <td>
                    <div className="budget-cell">
                      <IndianRupee size={14} />
                      {client.budget ||
                        "Not specified"}
                    </div>
                  </td>

                  <td>
                    <span
                      className={`client-status ${
                        client.status === "Inactive"
                          ? "inactive"
                          : ""
                      }`}
                    >
                      {client.status || "Active"}
                    </span>
                  </td>

                  <td>

                    <div className="row-actions">

                      {client.phone && (
                        <>
                          <a
                            href={`tel:${client.phone}`}
                            className="icon-action"
                            title="Call"
                          >
                            <Phone size={16} />
                          </a>

                          <button
                            className="icon-action whatsapp"
                            onClick={() =>
                              openWhatsApp(
                                client.phone
                              )
                            }
                            title="WhatsApp"
                          >
                            <MessageCircle
                              size={16}
                            />
                          </button>
                        </>
                      )}

                      <button
                        className="icon-action"
                        onClick={() =>
                          openFollowup(client)
                        }
                        title="Follow Up"
                      >
                        <CalendarPlus size={16} />
                      </button>

                      <button
                        className="icon-action"
                        onClick={() =>
                          openEdit(client)
                        }
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        className="icon-action danger"
                        onClick={() =>
                          setDeleteTarget(client)
                        }
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>
        )}

      </div>

      {/* =========================
          EDIT MODAL
      ========================= */}

      {editClient && (
        <div className="modal-overlay">

          <div className="modal-card">

            <div className="modal-header">

              <div>
                <h2>Edit Client</h2>
                <p>
                  Update {editClient.name}'s details.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setEditClient(null)
                }
              >
                <X size={20} />
              </button>

            </div>

            <div className="form-group">
              <label>Client Type</label>

              <select
                value={form.clientType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    clientType: e.target.value,
                  })
                }
              >
                <option>Buyer</option>
                <option>Tenant</option>
                <option>Seller</option>
                <option>Owner</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label>Notes</label>

              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    notes: e.target.value,
                  })
                }
                placeholder="Client notes..."
              />
            </div>

            <div className="modal-footer">

              <button
                className="secondary-button"
                onClick={() =>
                  setEditClient(null)
                }
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={saveClient}
              >
                Save Changes
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =========================
          FOLLOW UP MODAL
      ========================= */}

      {followupClient && (
        <div className="modal-overlay">

          <div className="modal-card">

            <div className="modal-header">

              <div>
                <h2>New Follow Up</h2>
                <p>
                  {followupClient.name}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setFollowupClient(null)
                }
              >
                <X size={20} />
              </button>

            </div>

            <div className="form-row">

              <div className="form-group">
                <label>Date</label>

                <input
                  type="date"
                  value={followupForm.date}
                  onChange={(e) =>
                    setFollowupForm({
                      ...followupForm,
                      date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Time</label>

                <input
                  type="time"
                  value={followupForm.time}
                  onChange={(e) =>
                    setFollowupForm({
                      ...followupForm,
                      time: e.target.value,
                    })
                  }
                />
              </div>

            </div>

            <div className="form-group">
              <label>Type</label>

              <select
                value={followupForm.type}
                onChange={(e) =>
                  setFollowupForm({
                    ...followupForm,
                    type: e.target.value,
                  })
                }
              >
                <option>Call</option>
                <option>WhatsApp</option>
                <option>Meeting</option>
                <option>Site Visit</option>
                <option>Email</option>
              </select>
            </div>

            <div className="form-group">
              <label>Notes</label>

              <textarea
                placeholder="Follow-up notes..."
                value={followupForm.notes}
                onChange={(e) =>
                  setFollowupForm({
                    ...followupForm,
                    notes: e.target.value,
                  })
                }
              />
            </div>

            <div className="modal-footer">

              <button
                className="secondary-button"
                onClick={() =>
                  setFollowupClient(null)
                }
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={createFollowup}
              >
                <CalendarPlus size={16} />
                Create Follow Up
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =========================
          DELETE MODAL
      ========================= */}

      {deleteTarget && (
        <div className="modal-overlay">

          <div className="delete-modal">

            <div className="delete-icon">
              <Trash2 size={23} />
            </div>

            <h2>Delete client?</h2>

            <p>
              This will remove{" "}
              <strong>
                {deleteTarget.name}
              </strong>{" "}
              from your clients.
            </p>

            <div className="modal-footer">

              <button
                className="secondary-button"
                onClick={() =>
                  setDeleteTarget(null)
                }
              >
                Cancel
              </button>

              <button
                className="danger-button"
                onClick={deleteClient}
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Clients;