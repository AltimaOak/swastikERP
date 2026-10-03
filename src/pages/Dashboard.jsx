import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { Link } from "react-router-dom";
import { Inbox, Building, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { db } from "../firebase/config";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [enquiries, setEnquiries] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

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
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setProperties(list);
      }
    );

    return () => {
      unsubEnquiries();
      unsubProperties();
    };
  }, []);

  const newEnquiriesCount = enquiries.filter(
    (e) => !e.status || e.status === "new"
  ).length;

  const availablePropertiesCount = properties.filter(
    (p) => !p.status || p.status === "available"
  ).length;

  const soldPropertiesCount = properties.filter(
    (p) => p.status === "sold"
  ).length;

  return (
    <div className="page-container">
      <div className="page-top">
        <div>
          <h1>Dashboard</h1>
          <p className="page-desc">Overview of your properties and website enquiries.</p>
        </div>
      </div>

      <div className="metrics-grid">
        <StatCard title="New Enquiries" value={newEnquiriesCount} icon={Clock} />
        <StatCard title="Total Enquiries" value={enquiries.length} icon={Inbox} />
        <StatCard title="Available Properties" value={availablePropertiesCount} icon={Building} />
        <StatCard title="Sold Properties" value={soldPropertiesCount} icon={CheckCircle} />
      </div>

      <div className="grid-two-col">
        {/* RECENT ENQUIRIES */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Enquiries</h3>
            <Link to="/enquiries" className="link-inline">
              View all <ArrowRight size={13} />
            </Link>
          </div>

          <div className="card-body-flush">
            {enquiries.slice(0, 5).map((item) => (
              <div className="list-row" key={item.id}>
                <div className="list-row-main">
                  <div className="list-title">{item.name || "Anonymous"}</div>
                  <div className="list-meta">
                    {[item.propertyType || item.type, item.bhk, item.preferredLocation || item.location]
                      .filter(Boolean)
                      .join(" · ") || "General Enquiry"}
                  </div>
                </div>
                <span className={`badge badge-${item.status || "new"}`}>
                  {item.status || "new"}
                </span>
              </div>
            ))}

            {!loading && enquiries.length === 0 && (
              <div className="empty-box">No enquiries found.</div>
            )}
          </div>
        </div>

        {/* RECENT PROPERTIES */}
        <div className="card">
          <div className="card-header">
            <h3>Property Listings</h3>
            <Link to="/properties" className="link-inline">
              Manage <ArrowRight size={13} />
            </Link>
          </div>

          <div className="card-body-flush">
            {properties.slice(0, 5).map((prop) => (
              <div className="list-row" key={prop.id}>
                <div className="list-row-main">
                  <div className="list-title">{prop.title || "Untitled Property"}</div>
                  <div className="list-meta">
                    {[prop.location, prop.bhk, prop.price].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <span className={`badge badge-${prop.status === "sold" ? "sold" : "available"}`}>
                  {prop.status === "sold" ? "Sold" : "Available"}
                </span>
              </div>
            ))}

            {properties.length === 0 && (
              <div className="empty-box">No properties added yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}