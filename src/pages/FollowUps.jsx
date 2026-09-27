// src/pages/FollowUps.jsx

import { useEffect, useState } from "react";
import {
  onValue,
  push,
  ref,
  set,
  update,
} from "firebase/database";

import { Plus } from "lucide-react";

import { db } from "../firebase/config";
import Modal from "../components/Modal";

export default function FollowUps() {
  const [followUps, setFollowUps] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    date: "",
    mode: "Call",
    notes: "",
    status: "pending",
  });

  useEffect(() => {
    return onValue(ref(db, "followups"), (snapshot) => {
      const data = snapshot.val() || {};

      const list = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));

      list.sort((a, b) =>
        String(a.date || "").localeCompare(
          String(b.date || "")
        )
      );

      setFollowUps(list);
    });
  }, []);

  const addFollowUp = async (e) => {
    e.preventDefault();

    const newRef = push(ref(db, "followups"));

    await set(newRef, {
      ...form,
      createdAt: Date.now(),
    });

    setForm({
      title: "",
      date: "",
      mode: "Call",
      notes: "",
      status: "pending",
    });

    setShowModal(false);
  };

  const markComplete = async (item) => {
    await update(
      ref(db, `followups/${item.id}`),
      {
        status:
          item.status === "completed"
            ? "pending"
            : "completed",
      }
    );
  };

  return (
    <div>

      <div className="page-header">

        <div>
          <p className="eyebrow">TASKS</p>
          <h1>Follow-ups</h1>
          <p className="page-subtitle">
            Track calls, WhatsApp messages and site visits.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowModal(true)}
        >
          <Plus size={17} />
          Add Follow-up
        </button>

      </div>

      <div className="content-card">

        <div className="followup-list">

          {followUps.map((item) => (
            <div
              className={`followup-item ${
                item.status === "completed"
                  ? "completed"
                  : ""
              }`}
              key={item.id}
            >

              <div>
                <strong>
                  {item.title || "Follow-up"}
                </strong>

                <span>
                  {item.date || "No date"} •{" "}
                  {item.mode || "Call"}
                </span>

                {item.notes && (
                  <small>{item.notes}</small>
                )}
              </div>

              <button
                className="secondary-button"
                onClick={() =>
                  markComplete(item)
                }
              >
                {item.status === "completed"
                  ? "Completed"
                  : "Mark Done"}
              </button>

            </div>
          ))}

          {followUps.length === 0 && (
            <div className="empty-state">
              No follow-ups added yet.
            </div>
          )}

        </div>

      </div>

      {showModal && (
        <Modal
          title="Add Follow-up"
          onClose={() => setShowModal(false)}
        >

          <form
            className="form-stack"
            onSubmit={addFollowUp}
          >

            <label>
              Task

              <input
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                placeholder="Call Rahul about 2 BHK"
                required
              />

            </label>

            <div className="two-column">

              <label>
                Date

                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      date: e.target.value,
                    })
                  }
                  required
                />

              </label>

              <label>
                Contact Method

                <select
                  value={form.mode}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mode: e.target.value,
                    })
                  }
                >
                  <option>Call</option>
                  <option>WhatsApp</option>
                  <option>Site Visit</option>
                  <option>Email</option>
                </select>

              </label>

            </div>

            <label>
              Notes

              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    notes: e.target.value,
                  })
                }
                placeholder="Add notes..."
              />

            </label>

            <button
              className="primary-button full-width"
              type="submit"
            >
              Save Follow-up
            </button>

          </form>

        </Modal>
      )}

    </div>
  );
}