import React, { useEffect, useMemo, useState } from "react";
import {
  onValue,
  ref,
  remove,
  update,
} from "firebase/database";

import {
  Search,
  Phone,
  MessageCircle,
  CalendarDays,
  Clock,
  CheckCircle2,
  Trash2,
  Edit3,
  X,
  UserRound,
} from "lucide-react";

import { db } from "../firebase/config";
import "./FollowUps.css";

const FollowUps = () => {
  const [followups, setFollowups] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [loading, setLoading] = useState(true);

  const [editFollowup, setEditFollowup] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    date: "",
    time: "",
    type: "Call",
    notes: "",
    status: "Pending",
  });

  /* =========================
     LOAD FOLLOW UPS
  ========================= */

  useEffect(() => {
    const followupsRef = ref(db, "followups");

    const unsubscribe = onValue(
      followupsRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          setFollowups([]);
          setLoading(false);
          return;
        }

        const list = Object.entries(data).map(
          ([id, value]) => ({
            id,
            ...value,
          })
        );

        list.sort((a, b) => {
          const dateA = new Date(
            `${a.date || ""} ${a.time || ""}`
          ).getTime();

          const dateB = new Date(
            `${b.date || ""} ${b.time || ""}`
          ).getTime();

          return dateA - dateB;
        });

        setFollowups(list);
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
     FILTER
  ========================= */

  const filteredFollowups = useMemo(() => {
    const query = search.toLowerCase().trim();

    return followups.filter((item) => {

      const matchesSearch =
        !query ||
        [
          item.clientName,
          item.phone,
          item.type,
          item.notes,
          item.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === "All" ||
        item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [followups, search, filter]);

  /* =========================
     EDIT
  ========================= */

  const openEdit = (followup) => {
    setEditFollowup(followup);

    setForm({
      date: followup.date || "",
      time: followup.time || "",
      type: followup.type || "Call",
      notes: followup.notes || "",
      status: followup.status || "Pending",
    });
  };

  const saveFollowup = async () => {
    if (!editFollowup) return;

    try {
      await update(
        ref(db, `followups/${editFollowup.id}`),
        {
          date: form.date,
          time: form.time,
          type: form.type,
          notes: form.notes,
          status: form.status,
          updatedAt: Date.now(),
        }
      );

      setEditFollowup(null);
    } catch (error) {
      console.error(error);
      alert("Unable to update follow-up.");
    }
  };

  /* =========================
     COMPLETE
  ========================= */

  const markCompleted = async (followup) => {
    try {
      await update(
        ref(db, `followups/${followup.id}`),
        {
          status: "Completed",
          completedAt: Date.now(),
          updatedAt: Date.now(),
        }
      );
    } catch (error) {
      console.error(error);
      alert("Unable to update follow-up.");
    }
  };

  /* =========================
     DELETE
  ========================= */

  const deleteFollowup = async () => {
    if (!deleteTarget) return;

    try {
      await remove(
        ref(db, `followups/${deleteTarget.id}`)
      );

      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
      alert("Unable to delete follow-up.");
    }
  };

  /* =========================
     WHATSAPP
  ========================= */

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

  /* =========================
     DATE FORMAT
  ========================= */

  const formatDate = (date) => {
    if (!date) return "No date";

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="followups-page">

      {/* HEADER */}

      <div className="page-header">

        <div>
          <h1>Follow Ups</h1>

          <p>
            Track your upcoming client calls,
            meetings and site visits.
          </p>
        </div>

        <div className="followup-count">
          {followups.length} Follow Ups
        </div>

      </div>

      {/* TOOLBAR */}

      <div className="followup-toolbar">

        <div className="search-box">

          <Search size={18} />

          <input
            placeholder="Search client or follow-up..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <div className="filter-buttons">

          {[
            "All",
            "Pending",
            "Completed",
            "Cancelled",
          ].map((item) => (

            <button
              key={item}
              className={
                filter === item
                  ? "filter-button active"
                  : "filter-button"
              }
              onClick={() =>
                setFilter(item)
              }
            >
              {item}
            </button>

          ))}

        </div>

      </div>

      {/* FOLLOW UP LIST */}

      {loading ? (
        <div className="empty-state">
          Loading follow-ups...
        </div>
      ) : filteredFollowups.length === 0 ? (
        <div className="empty-state">

          <CalendarDays size={38} />

          <h3>No follow-ups found</h3>

          <p>
            Create follow-ups from the Enquiries
            or Clients page.
          </p>

        </div>
      ) : (

        <div className="followup-list">

          {filteredFollowups.map((followup) => (

            <div
              className={`followup-card ${
                followup.status === "Completed"
                  ? "completed"
                  : ""
              }`}
              key={followup.id}
            >

              {/* DATE */}

              <div className="followup-date">

                <CalendarDays size={18} />

                <strong>
                  {formatDate(followup.date)}
                </strong>

                {followup.time && (
                  <span>
                    <Clock size={13} />
                    {followup.time}
                  </span>
                )}

              </div>

              {/* CLIENT */}

              <div className="followup-client">

                <div className="client-avatar">
                  <UserRound size={18} />
                </div>

                <div>
                  <strong>
                    {followup.clientName ||
                      "Unknown Client"}
                  </strong>

                  <span>
                    {followup.phone ||
                      "No phone"}
                  </span>
                </div>

              </div>

              {/* DETAILS */}

              <div className="followup-details">

                <span className="followup-type">
                  {followup.type || "Call"}
                </span>

                <p>
                  {followup.notes ||
                    "No notes added."}
                </p>

              </div>

              {/* STATUS */}

              <div>

                <span
                  className={`followup-status ${String(
                    followup.status || "Pending"
                  ).toLowerCase()}`}
                >
                  {followup.status || "Pending"}
                </span>

              </div>

              {/* ACTIONS */}

              <div className="followup-actions">

                {followup.phone && (
                  <>
                    <a
                      href={`tel:${followup.phone}`}
                      className="icon-action"
                      title="Call"
                    >
                      <Phone size={16} />
                    </a>

                    <button
                      className="icon-action whatsapp"
                      onClick={() =>
                        openWhatsApp(
                          followup.phone
                        )
                      }
                      title="WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </button>
                  </>
                )}

                {followup.status !==
                  "Completed" && (
                  <button
                    className="icon-action success"
                    onClick={() =>
                      markCompleted(followup)
                    }
                    title="Mark Completed"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                )}

                <button
                  className="icon-action"
                  onClick={() =>
                    openEdit(followup)
                  }
                  title="Edit"
                >
                  <Edit3 size={16} />
                </button>

                <button
                  className="icon-action danger"
                  onClick={() =>
                    setDeleteTarget(followup)
                  }
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

      {/* =========================
          EDIT MODAL
      ========================= */}

      {editFollowup && (
        <div className="modal-overlay">

          <div className="modal-card">

            <div className="modal-header">

              <div>
                <h2>Edit Follow Up</h2>

                <p>
                  {editFollowup.clientName}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setEditFollowup(null)
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
                  value={form.date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Time</label>

                <input
                  type="time"
                  value={form.time}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      time: e.target.value,
                    })
                  }
                />
              </div>

            </div>

            <div className="form-group">
              <label>Type</label>

              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
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
                <option>Pending</option>
                <option>Completed</option>
                <option>Cancelled</option>
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
                placeholder="Follow-up notes..."
              />
            </div>

            <div className="modal-footer">

              <button
                className="secondary-button"
                onClick={() =>
                  setEditFollowup(null)
                }
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={saveFollowup}
              >
                Save Changes
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

            <h2>Delete follow-up?</h2>

            <p>
              This follow-up will be permanently
              removed.
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
                onClick={deleteFollowup}
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

export default FollowUps;