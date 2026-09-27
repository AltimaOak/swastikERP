// src/pages/Enquiries.jsx

import { useEffect, useState } from "react";
import { onValue, ref, update } from "firebase/database";
import {
  Search,
  Phone,
  MessageCircle,
} from "lucide-react";

import { db } from "../firebase/config";

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const enquiryRef = ref(db, "enquiries");

    return onValue(enquiryRef, (snapshot) => {
      const data = snapshot.val() || {};

      const list = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));

      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      setEnquiries(list);
    });
  }, []);

  const filteredEnquiries = enquiries.filter((item) => {
    const text = `
      ${item.name || ""}
      ${item.phone || ""}
      ${item.location || ""}
      ${item.type || ""}
      ${item.enquiryType || ""}
    `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const changeStatus = async (id, status) => {
    await update(ref(db, `enquiries/${id}`), {
      status,
      updatedAt: Date.now(),
    });
  };

  return (
    <div>

      <div className="page-header">
        <div>
          <p className="eyebrow">LEADS</p>
          <h1>Enquiries</h1>
          <p className="page-subtitle">
            Website enquiries appear here automatically.
          </p>
        </div>
      </div>

      <div className="content-card">

        <div className="toolbar">

          <div className="search-box">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search enquiries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <span className="result-count">
            {filteredEnquiries.length} enquiries
          </span>

        </div>

        <div className="table-wrapper">
          <table>

            <thead>
              <tr>
                <th>Client</th>
                <th>Requirement</th>
                <th>Location</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Contact</th>
              </tr>
            </thead>

            <tbody>

              {filteredEnquiries.map((item) => (
                <tr key={item.id}>

                  <td>
                    <div className="table-main">
                      {item.name || "—"}
                    </div>

                    <div className="table-sub">
                      {item.email || item.phone || "No contact"}
                    </div>
                  </td>

                  <td>
                    {item.type ||
                      item.enquiryType ||
                      "General"}
                  </td>

                  <td>
                    {item.location || "—"}
                  </td>

                  <td>
                    {item.budget || "—"}
                  </td>

                  <td>

                    <select
                      value={item.status || "new"}
                      onChange={(e) =>
                        changeStatus(
                          item.id,
                          e.target.value
                        )
                      }
                      className="status-select"
                    >
                      <option value="new">New</option>
                      <option value="contacted">
                        Contacted
                      </option>
                      <option value="interested">
                        Interested
                      </option>
                      <option value="site-visit">
                        Site Visit
                      </option>
                      <option value="negotiation">
                        Negotiation
                      </option>
                      <option value="closed">
                        Closed
                      </option>
                    </select>

                  </td>

                  <td>

                    <div className="contact-actions">

                      {item.phone && (
                        <a
                          href={`tel:${item.phone}`}
                          className="small-action"
                          title="Call"
                        >
                          <Phone size={15} />
                        </a>
                      )}

                      {item.phone && (
                        <a
                          href={`https://wa.me/${String(
                            item.phone
                          ).replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="small-action"
                          title="WhatsApp"
                        >
                          <MessageCircle size={15} />
                        </a>
                      )}

                    </div>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

          {filteredEnquiries.length === 0 && (
            <div className="empty-state">
              No enquiries found.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}