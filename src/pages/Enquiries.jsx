
import { useEffect, useMemo, useState } from "react";
import {
  onValue,
  ref,
  update,
  remove,
} from "firebase/database";

import {
  Search,
  Phone,
  MessageCircle,
  Trash2,
  X,
  Send,
  Building2,
  MapPin,
  IndianRupee,
  CheckCircle2,
} from "lucide-react";

import { db } from "../firebase/config";

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [properties, setProperties] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  const [firebaseError, setFirebaseError] = useState("");

  const [deleteId, setDeleteId] = useState(null);

  const [matchEnquiry, setMatchEnquiry] = useState(null);
  const [selectedProperties, setSelectedProperties] = useState([]);

  /* =========================================================
     LOAD ENQUIRIES
  ========================================================= */

  useEffect(() => {
    const enquiryRef = ref(db, "enquiries");

    const unsubscribe = onValue(
      enquiryRef,
      (snapshot) => {
        const data = snapshot.val() || {};

        const list = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));

        list.sort(
          (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
        );

        setEnquiries(list);
        setLoading(false);
        setFirebaseError("");
      },
      (error) => {
        console.error("Firebase enquiry error:", error);

        setFirebaseError(
          error.message || "Unable to load enquiries."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /* =========================================================
     LOAD ALL PROPERTIES
  ========================================================= */

  useEffect(() => {
    const propertiesRef = ref(db, "properties");

    const unsubscribe = onValue(
      propertiesRef,
      (snapshot) => {
        const data = snapshot.val() || {};

        const list = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));

        setProperties(list);
        setPropertiesLoading(false);
      },
      (error) => {
        console.error("Firebase properties error:", error);
        setPropertiesLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredEnquiries = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return enquiries;

    return enquiries.filter((item) => {
      const searchable = [
        item.name,
        item.phone,
        item.email,
        item.preferredLocation,
        item.location,
        item.propertyType,
        item.type,
        item.enquiryType,
        item.bhk,
        item.budget,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [enquiries, search]);

  /* =========================================================
     DELETE ENQUIRY
  ========================================================= */

  const deleteEnquiry = async () => {
    if (!deleteId) return;

    try {
      await remove(ref(db, `enquiries/${deleteId}`));

      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete enquiry:", error);

      setFirebaseError(
        error.message || "Failed to delete enquiry."
      );
    }
  };

  /* =========================================================
     CHANGE STATUS
  ========================================================= */

  const changeStatus = async (id, status) => {
    try {
      await update(ref(db, `enquiries/${id}`), {
        status,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Failed to update status:", error);

      setFirebaseError(
        error.message || "Failed to update status."
      );
    }
  };

  /* =========================================================
     HELPERS
  ========================================================= */

  const normalizeText = (value) =>
    String(value || "")
      .toLowerCase()
      .trim();

  const getNumber = (value) => {
    if (value === null || value === undefined) {
      return 0;
    }

    const number = Number(
      String(value).replace(/[^0-9.]/g, "")
    );

    return Number.isNaN(number) ? 0 : number;
  };

  const getLocation = (property) =>
    property.location ||
    property.preferredLocation ||
    property.area ||
    property.locality ||
    property.address ||
    "";

  const getPropertyType = (property) =>
    property.propertyType ||
    property.type ||
    "";

  const getBhk = (property) =>
    property.bhk ||
    property.bhkType ||
    property.configuration ||
    "";

  const getPrice = (property) =>
    property.price ||
    property.budget ||
    property.rent ||
    property.monthlyRent ||
    property.salePrice ||
    0;

  const getTitle = (property) =>
    property.title ||
    property.name ||
    `${getBhk(property)} ${getPropertyType(property)}`.trim() ||
    "Property";

  const getAvailability = (property) =>
    String(
      property.status ||
        property.availability ||
        property.propertyStatus ||
        "available"
    ).toLowerCase();

  const isPropertyAvailable = (property) => {
    const status = getAvailability(property);

    const unavailableStatuses = [
      "sold",
      "rented",
      "closed",
      "unavailable",
      "inactive",
      "booked",
      "occupied",
    ];

    return !unavailableStatuses.includes(status);
  };

  /* =========================================================
     MATCH SCORE
  ========================================================= */

  const getMatchScore = (enquiry, property) => {
    let score = 0;

    const enquiryLocation = normalizeText(
      enquiry.preferredLocation || enquiry.location
    );

    const propertyLocation = normalizeText(
      getLocation(property)
    );

    const enquiryType = normalizeText(
      enquiry.propertyType || enquiry.type
    );

    const propertyType = normalizeText(
      getPropertyType(property)
    );

    const enquiryBhk = normalizeText(enquiry.bhk);
    const propertyBhk = normalizeText(getBhk(property));

    /* LOCATION - 40 */
    if (enquiryLocation && propertyLocation) {
      if (
        propertyLocation.includes(enquiryLocation) ||
        enquiryLocation.includes(propertyLocation)
      ) {
        score += 40;
      }
    }

    /* PROPERTY TYPE - 25 */
    if (enquiryType && propertyType) {
      if (
        propertyType.includes(enquiryType) ||
        enquiryType.includes(propertyType)
      ) {
        score += 25;
      }
    }

    /* BHK - 20 */
    if (enquiryBhk && propertyBhk) {
      const enquiryBhkNumber = getNumber(enquiryBhk);
      const propertyBhkNumber = getNumber(propertyBhk);

      if (
        enquiryBhkNumber &&
        propertyBhkNumber &&
        enquiryBhkNumber === propertyBhkNumber
      ) {
        score += 20;
      }
    }

    /* BUDGET - 15 */
    const enquiryBudget = getNumber(enquiry.budget);
    const propertyPrice = getNumber(getPrice(property));

    if (enquiryBudget && propertyPrice) {
      if (propertyPrice <= enquiryBudget) {
        score += 15;
      } else if (propertyPrice <= enquiryBudget * 1.1) {
        score += 8;
      }
    }

    return score;
  };

  /* =========================================================
     SHOW ALL AVAILABLE PROPERTIES
  ========================================================= */

  const matchedProperties = useMemo(() => {
    if (!matchEnquiry) return [];

    return [...properties]
      .filter(isPropertyAvailable)
      .map((property) => ({
        ...property,
        matchScore: getMatchScore(matchEnquiry, property),
      }))
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [properties, matchEnquiry]);

  /* =========================================================
     OPEN MATCH MODAL
  ========================================================= */

  const openMatchModal = (enquiry) => {
    setMatchEnquiry(enquiry);
    setSelectedProperties([]);
  };

  /* =========================================================
     SELECT PROPERTY
  ========================================================= */

  const toggleProperty = (propertyId) => {
    setSelectedProperties((current) => {
      if (current.includes(propertyId)) {
        return current.filter((id) => id !== propertyId);
      }

      return [...current, propertyId];
    });
  };

  /* =========================================================
     SELECT ALL
  ========================================================= */

  const toggleSelectAll = () => {
    if (
      selectedProperties.length === matchedProperties.length &&
      matchedProperties.length > 0
    ) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(
        matchedProperties.map((property) => property.id)
      );
    }
  };

  /* =========================================================
     SEND SELECTED PROPERTIES ON WHATSAPP

     IMPORTANT:
     No Firebase write happens here.
     This avoids /sentPropertyMatches permission errors.
  ========================================================= */

  const sendMatch = () => {
    if (!matchEnquiry) return;

    if (selectedProperties.length === 0) {
      alert("Please select at least one property.");
      return;
    }

    const selected = matchedProperties.filter((property) =>
      selectedProperties.includes(property.id)
    );

    if (selected.length === 0) {
      alert("No properties selected.");
      return;
    }

    const phone = String(matchEnquiry.phone || "").replace(
      /\D/g,
      ""
    );

    if (!phone) {
      alert("This enquiry does not have a valid phone number.");
      return;
    }

    const whatsappNumber =
      phone.length === 10 ? `91${phone}` : phone;

    let message = `Hello ${
      matchEnquiry.name || "there"
    },\n\n`;

    message +=
      "We found some properties matching your requirement from Swastik Properties.\n\n";

    selected.forEach((property, index) => {
      message += `${index + 1}. ${getTitle(property)}\n`;

      message += `📍 Location: ${
        getLocation(property) || "Available on request"
      }\n`;

      message += `🏠 Type: ${
        getPropertyType(property) || "Property"
      }\n`;

      message += `🛏 BHK: ${
        getBhk(property) || "Available on request"
      }\n`;

      message += `💰 Price: ${
        getPrice(property)
          ? formatBudget(getPrice(property))
          : "On request"
      }\n`;

      message += `📊 Match: ${property.matchScore}%\n`;

      if (property.furnished) {
        message += `🪑 Furnished: ${property.furnished}\n`;
      }

      if (property.parking) {
        message += `🚗 Parking: ${property.parking}\n`;
      }

      if (property.description) {
        message += `📝 ${property.description}\n`;
      }

      message += "\n";
    });

    message +=
      "Please let us know if you would like to schedule a site visit.\n\n";

    message += "Regards,\nSwastik Properties";

    const whatsappUrl =
      `https://wa.me/${whatsappNumber}` +
      `?text=${encodeURIComponent(message)}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );

    setMatchEnquiry(null);
    setSelectedProperties([]);
  };

  /* =========================================================
     FORMAT BUDGET
  ========================================================= */

  function formatBudget(value) {
    if (!value) return "—";

    const number = getNumber(value);

    if (!number) {
      return String(value);
    }

    return `₹${number.toLocaleString("en-IN")}`;
  }

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (timestamp) => {
    if (!timestamp) return "";

    return new Date(timestamp).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div>

      {/* PAGE HEADER */}

      <div className="page-header">
        <div>
          <p className="eyebrow">LEADS</p>

          <h1>Enquiries</h1>

          <p className="page-subtitle">
            Website enquiries appear here automatically.
          </p>
        </div>
      </div>

      {/* FIREBASE ERROR */}

      {firebaseError && (
        <div
          style={{
            marginBottom: "16px",
            padding: "14px 16px",
            borderRadius: "10px",
            background: "#fff1f1",
            border: "1px solid #ffd5d5",
            color: "#b42318",
            fontSize: "14px",
          }}
        >
          <strong>Firebase error:</strong>{" "}
          {firebaseError}
        </div>
      )}

      {/* MAIN CARD */}

      <div className="content-card">

        {/* TOOLBAR */}

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
            {filteredEnquiries.length}{" "}
            {filteredEnquiries.length === 1
              ? "enquiry"
              : "enquiries"}
          </span>

        </div>

        {/* TABLE */}

        {loading ? (
          <div className="empty-state">
            Loading enquiries...
          </div>
        ) : (
          <div className="table-wrapper">

            <table>

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

                    {/* CLIENT */}

                    <td>
                      <div className="table-main">
                        {item.name || "—"}
                      </div>

                      <div className="table-sub">
                        {item.email ||
                          item.phone ||
                          "No contact"}
                      </div>

                      {item.createdAt && (
                        <div className="table-sub">
                          {formatDate(item.createdAt)}
                        </div>
                      )}
                    </td>

                    {/* REQUIREMENT */}

                    <td>
                      <div className="table-main">
                        {item.propertyType ||
                          item.type ||
                          "General"}
                      </div>

                      <div className="table-sub">
                        {item.enquiryType && (
                          <span>
                            {item.enquiryType}
                          </span>
                        )}

                        {item.bhk && (
                          <span>
                            {item.enquiryType && " • "}
                            {item.bhk}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* LOCATION */}

                    <td>
                      {item.preferredLocation ||
                        item.location ||
                        "—"}
                    </td>

                    {/* BUDGET */}

                    <td>
                      {formatBudget(item.budget)}
                    </td>

                    {/* STATUS */}

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
                        <option value="new">
                          New
                        </option>

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

                    {/* ACTIONS */}

                    <td>

                      <div
                        className="contact-actions"
                        style={{
                          display: "flex",
                          gap: "6px",
                          alignItems: "center",
                        }}
                      >

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
                            href={`https://wa.me/91${String(
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

                        <button
                          type="button"
                          className="small-action"
                          title="Find matching properties"
                          onClick={() =>
                            openMatchModal(item)
                          }
                        >
                          <Send size={15} />
                        </button>

                        <button
                          type="button"
                          className="small-action"
                          title="Delete enquiry"
                          onClick={() =>
                            setDeleteId(item.id)
                          }
                        >
                          <Trash2 size={15} />
                        </button>

                      </div>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

            {filteredEnquiries.length === 0 && (
              <div className="empty-state">
                {search
                  ? "No enquiries match your search."
                  : "No enquiries found."}
              </div>
            )}

          </div>
        )}

      </div>

      {/* =====================================================
          MATCH MODAL
      ====================================================== */}

      {matchEnquiry && (
        <div
          className="modal-overlay"
          onClick={() => setMatchEnquiry(null)}
        >

          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >

            {/* HEADER */}

            <div className="modal-header">

              <div>
                <p className="eyebrow">
                  PROPERTY MATCH
                </p>

                <h2>
                  Find properties
                </h2>

                <p className="modal-subtitle">
                  Matching properties for{" "}
                  <strong>
                    {matchEnquiry.name}
                  </strong>
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setMatchEnquiry(null)
                }
              >
                <X size={20} />
              </button>

            </div>

            {/* REQUIREMENT SUMMARY */}

            <div className="match-summary">

              <div>
                <span>Requirement</span>
                <strong>
                  {matchEnquiry.enquiryType || "—"}
                </strong>
              </div>

              <div>
                <span>Property</span>
                <strong>
                  {matchEnquiry.propertyType || "—"}
                </strong>
              </div>

              <div>
                <span>BHK</span>
                <strong>
                  {matchEnquiry.bhk || "Any"}
                </strong>
              </div>

              <div>
                <span>Budget</span>
                <strong>
                  {formatBudget(matchEnquiry.budget)}
                </strong>
              </div>

              <div>
                <span>Location</span>
                <strong>
                  {matchEnquiry.preferredLocation ||
                    matchEnquiry.location ||
                    "Any"}
                </strong>
              </div>

            </div>

            {/* SELECT ALL */}

            {!propertiesLoading &&
              matchedProperties.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    {matchedProperties.length} properties available
                  </span>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={toggleSelectAll}
                  >
                    {selectedProperties.length ===
                      matchedProperties.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
              )}

            {/* PROPERTY LIST */}

            <div className="match-list">

              {propertiesLoading ? (
                <div className="empty-state">
                  Loading properties...
                </div>
              ) : matchedProperties.length === 0 ? (

                <div className="empty-state">

                  <Building2 size={28} />

                  <p>
                    No available properties found.
                  </p>

                  <small>
                    Add properties in the Properties
                    section and try again.
                  </small>

                </div>

              ) : (

                matchedProperties.map((property) => {

                  const selected =
                    selectedProperties.includes(
                      property.id
                    );

                  return (
                    <div
                      key={property.id}
                      className={`match-property ${
                        selected ? "selected" : ""
                      }`}
                      onClick={() =>
                        toggleProperty(property.id)
                      }
                    >

                      <div className="match-check">

                        {selected ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <div className="empty-check" />
                        )}

                      </div>

                      <div className="match-property-content">

                        <div className="match-property-top">

                          <div>

                            <h3>
                              {getTitle(property)}
                            </h3>

                            <div className="match-location">

                              <MapPin size={14} />

                              {getLocation(property) ||
                                "Location not specified"}

                            </div>

                          </div>

                          <span className="match-score">
                            {property.matchScore}% match
                          </span>

                        </div>

                        <div className="match-details">

                          <span>
                            <Building2 size={14} />

                            {getPropertyType(property) ||
                              "Property"}
                          </span>

                          <span>
                            🛏{" "}
                            {getBhk(property) || "—"}
                          </span>

                          <span>
                            <IndianRupee size={14} />

                            {getPrice(property)
                              ? formatBudget(
                                  getPrice(property)
                                )
                              : "On request"}
                          </span>

                        </div>

                      </div>

                    </div>
                  );
                })
              )}

            </div>

            {/* FOOTER */}

            <div className="modal-footer">

              <span>
                {selectedProperties.length}{" "}
                {selectedProperties.length === 1
                  ? "property"
                  : "properties"}{" "}
                selected
              </span>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                }}
              >

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setMatchEnquiry(null);
                    setSelectedProperties([]);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={sendMatch}
                  disabled={
                    selectedProperties.length === 0
                  }
                >
                  <MessageCircle size={16} />
                  Send Match
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          DELETE MODAL
      ====================================================== */}

      {deleteId && (
        <div
          className="modal-overlay"
          onClick={() => setDeleteId(null)}
        >

          <div
            className="delete-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="delete-icon">
              <Trash2 size={22} />
            </div>

            <h2>
              Delete enquiry?
            </h2>

            <p>
              This enquiry will be permanently removed
              from Firebase. This action cannot be undone.
            </p>

            <div className="modal-footer">

              <button
                type="button"
                className="secondary-button"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="danger-button"
                onClick={deleteEnquiry}
              >
                <Trash2 size={16} />
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
