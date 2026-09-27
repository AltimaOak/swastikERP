// src/pages/Clients.jsx

import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";

import { db } from "../firebase/config";

export default function Clients() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    return onValue(ref(db, "clients"), (snapshot) => {
      const data = snapshot.val() || {};

      const list = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));

      setClients(list);
    });
  }, []);

  return (
    <div>

      <div className="page-header">
        <div>
          <p className="eyebrow">CUSTOMERS</p>
          <h1>Clients</h1>
          <p className="page-subtitle">
            Manage your active property clients.
          </p>
        </div>
      </div>

      <div className="content-card">

        <div className="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Requirement</th>
                <th>Location</th>
              </tr>
            </thead>

            <tbody>

              {clients.map((client) => (
                <tr key={client.id}>

                  <td>
                    <div className="table-main">
                      {client.name || "—"}
                    </div>
                  </td>

                  <td>
                    {client.phone || "—"}
                  </td>

                  <td>
                    {client.email || "—"}
                  </td>

                  <td>
                    {client.requirement ||
                      client.type ||
                      "—"}
                  </td>

                  <td>
                    {client.location || "—"}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

          {clients.length === 0 && (
            <div className="empty-state">
              No clients yet.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}