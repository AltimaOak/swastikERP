// src/pages/Dashboard.jsx

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import {
  ClipboardList,
  Building2,
  Users,
  CalendarCheck,
} from "lucide-react";

import { db } from "../firebase/config";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [enquiries, setEnquiries] = useState([]);
  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  const [followUps, setFollowUps] = useState([]);

  useEffect(() => {
    const unsubscribeEnquiries = onValue(
      ref(db, "enquiries"),
      (snapshot) => {
        const data = snapshot.val() || {};

        const list = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));

        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        setEnquiries(list);
      }
    );

    const unsubscribeProperties = onValue(
      ref(db, "properties"),
      (snapshot) => {
        const data = snapshot.val() || {};

        const list = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));

        setProperties(list);
      }
    );

    const unsubscribeClients = onValue(
      ref(db, "clients"),
      (snapshot) => {
        const data = snapshot.val() || {};

        const list = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));

        setClients(list);
      }
    );

    const unsubscribeFollowUps = onValue(
      ref(db, "followups"),
      (snapshot) => {
        const data = snapshot.val() || {};

        const list = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));

        setFollowUps(list);
      }
    );

    return () => {
      unsubscribeEnquiries();
      unsubscribeProperties();
      unsubscribeClients();
      unsubscribeFollowUps();
    };
  }, []);

  const newEnquiries = enquiries.filter(
    (item) => !item.status || item.status === "new"
  ).length;

  const availableProperties = properties.filter(
    (item) => !item.status || item.status === "available"
  ).length;

  const today = new Date().toISOString().split("T")[0];

  const todayFollowUps = followUps.filter(
    (item) =>
      item.date === today &&
      item.status !== "completed"
  ).length;

  return (
    <div>

      <div className="page-header">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Dashboard</h1>
          <p className="page-subtitle">
            Manage your property business from one place.
          </p>
        </div>
      </div>

      <div className="stats-grid">

        <StatCard
          title="New Enquiries"
          value={newEnquiries}
          icon={ClipboardList}
          description="From website"
        />

        <StatCard
          title="Available Properties"
          value={availableProperties}
          icon={Building2}
          description="Currently listed"
        />

        <StatCard
          title="Clients"
          value={clients.length}
          icon={Users}
          description="Total clients"
        />

        <StatCard
          title="Follow-ups Today"
          value={todayFollowUps}
          icon={CalendarCheck}
          description="Needs attention"
        />

      </div>

      <div className="dashboard-grid">

        <div className="content-card">

          <div className="card-header">
            <div>
              <h3>Recent Enquiries</h3>
              <span>Latest website enquiries</span>
            </div>
          </div>

          <div className="simple-list">

            {enquiries.slice(0, 5).map((item) => (
              <div className="simple-list-item" key={item.id}>

                <div>
                  <strong>{item.name || "Unknown Client"}</strong>

                  <span>
                    {item.type || item.enquiryType || "General"}{" "}
                    {item.location ? `• ${item.location}` : ""}
                  </span>
                </div>

                <span
                  className={`status status-${item.status || "new"}`}
                >
                  {item.status || "new"}
                </span>

              </div>
            ))}

            {enquiries.length === 0 && (
              <div className="empty-state">
                No enquiries yet.
              </div>
            )}

          </div>

        </div>

        <div className="content-card">

          <div className="card-header">
            <div>
              <h3>Upcoming Follow-ups</h3>
              <span>Keep track of your calls</span>
            </div>
          </div>

          <div className="simple-list">

            {followUps
              .filter((item) => item.status !== "completed")
              .slice(0, 5)
              .map((item) => (
                <div className="simple-list-item" key={item.id}>

                  <div>
                    <strong>{item.title || "Follow-up"}</strong>

                    <span>
                      {item.date || "No date"}{" "}
                      {item.mode ? `• ${item.mode}` : ""}
                    </span>
                  </div>

                </div>
              ))}

            {followUps.length === 0 && (
              <div className="empty-state">
                No follow-ups yet.
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}