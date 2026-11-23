import { useEffect, useState } from "react";
import "./App.css";

// 👇 THIS IS THE ONLY LINE THAT CHANGED 👇
const API_URL = "/api";

function getInitials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatTime(dateString) {
  if (!dateString) return "Not available";

  const date = new Date(
    dateString.replace(" ", "T") + "Z"
  );

  if (isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleString();
}

function App() {
  const [members, setMembers] = useState([]);

  const [stats, setStats] = useState({
    Available: 0,
    Busy: 0,
    Away: 0,
    Total: 0
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // ADD MEMBER FORM
  const [showAddForm, setShowAddForm] =
    useState(false);

  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] =
    useState("Available");

  const [lastRefresh, setLastRefresh] =
    useState(new Date());

  // FETCH DATA
  const fetchData = async () => {
    try {
      const [
        membersResponse,
        statsResponse
      ] = await Promise.all([
        fetch(`${API_URL}/members`),
        fetch(`${API_URL}/stats`)
      ]);

      if (
        !membersResponse.ok ||
        !statsResponse.ok
      ) {
        throw new Error("Backend request failed");
      }

      const membersData =
        await membersResponse.json();

      const statsData =
        await statsResponse.json();

      setMembers(membersData);
      setStats(statsData);

      setConnected(true);
      setLastRefresh(new Date());

    } catch (error) {
      console.error(error);
      setConnected(false);

    } finally {
      setLoading(false);
    }
  };

  // LIVE REFRESH
  useEffect(() => {
    const initialRefresh = window.setTimeout(fetchData, 0);

    const interval = setInterval(() => {
      fetchData();
    }, 3000);

    return () => {
      window.clearTimeout(initialRefresh);
      clearInterval(interval);
    };
  }, []);

  // UPDATE STATUS
  const updateStatus = async (
    id,
    status
  ) => {
    try {
      setUpdatingId(id);

      const response = await fetch(
        `${API_URL}/members/${id}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            status
          })
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to update status"
        );
      }

      await fetchData();

    } catch (error) {
      console.error(error);

      alert(
        "Could not update member status."
      );

    } finally {
      setUpdatingId(null);
    }
  };

  // ADD MEMBER
  const addMember = async (e) => {
    e.preventDefault();

    if (!newName.trim()) {
      alert("Please enter a member name.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/members`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            name: newName,
            status: newStatus
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to add member"
        );
      }

      setNewName("");
      setNewStatus("Available");
      setShowAddForm(false);

      await fetchData();

    } catch (error) {
      console.error(error);

      alert(error.message);
    }
  };

  // REMOVE MEMBER
  const removeMember = async (
    id,
    name
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/members/${id}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to remove member"
        );
      }

      await fetchData();

    } catch (error) {
      console.error(error);

      alert(
        "Could not remove team member."
      );
    }
  };

  // FILTER
  const filteredMembers =
    members.filter((member) => {
      const matchesSearch =
        member.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesFilter =
        filter === "All" ||
        member.status === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });

  return (
    <div className="app">

      {/* HEADER */}

      <header className="topbar">

        <div className="brand">

          <div className="brand-icon">
            TC
          </div>

          <div>
            <h1>TeamConnect</h1>

            <p>
              Team Availability Tracker
            </p>
          </div>

        </div>

        <div className="connection">

          <span
            className={
              connected
                ? "connection-dot online"
                : "connection-dot offline"
            }
          ></span>

          {connected
            ? "LIVE"
            : "OFFLINE"}

        </div>

      </header>

      <main className="container">

        {/* ERROR */}

        {!connected &&
          !loading && (
            <div className="error-box">

              <strong>
                Unable to connect to backend.
              </strong>

              <span>
                Make sure the backend is
                running on port 5000.
              </span>

            </div>
          )}

        {/* WELCOME */}

        <section className="welcome">

          <div>

            <p className="eyebrow">
              TEAM OVERVIEW
            </p>

            <h2>
              Good to see you 👋
            </h2>

            <p>
              Monitor everyone's
              availability and keep your
              team coordinated.
            </p>

          </div>

          <div className="refresh-info">

            <span>
              Last refreshed
            </span>

            <strong>
              {lastRefresh.toLocaleTimeString()}
            </strong>

          </div>

        </section>

        {/* STATS */}

        <section className="stats-grid">

          <div className="stat-card available-card">

            <div className="stat-icon">
              ✓
            </div>

            <div>

              <span>
                Available
              </span>

              <strong>
                {stats.Available}
              </strong>

              <small>
                Ready to work
              </small>

            </div>

          </div>

          <div className="stat-card busy-card">

            <div className="stat-icon">
              !
            </div>

            <div>

              <span>
                Busy
              </span>

              <strong>
                {stats.Busy}
              </strong>

              <small>
                Currently busy
              </small>

            </div>

          </div>

          <div className="stat-card away-card">

            <div className="stat-icon">
              ◷
            </div>

            <div>

              <span>
                Away
              </span>

              <strong>
                {stats.Away}
              </strong>

              <small>
                Temporarily away
              </small>

            </div>

          </div>

          <div className="stat-card total-card">

            <div className="stat-icon">
              👥
            </div>

            <div>

              <span>
                Total Members
              </span>

              <strong>
                {stats.Total}
              </strong>

              <small>
                Team members
              </small>

            </div>

          </div>

        </section>

        {/* CONTROLS */}

        <section className="controls">

          <div className="search-box">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search team members..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <div className="filters">

            {[
              "All",
              "Available",
              "Busy",
              "Away"
            ].map((status) => (

              <button
                key={status}
                className={
                  filter === status
                    ? "filter active"
                    : "filter"
                }
                onClick={() =>
                  setFilter(status)
                }
              >
                {status}
              </button>

            ))}

            <button
              className="refresh-button"
              onClick={fetchData}
            >
              ↻ Refresh
            </button>

            <button
              className="add-button"
              onClick={() =>
                setShowAddForm(
                  !showAddForm
                )
              }
            >
              + Add Member
            </button>

          </div>

        </section>

        {/* ADD MEMBER FORM */}

        {showAddForm && (

          <form
            className="add-form"
            onSubmit={addMember}
          >

            <div>

              <label>
                Member Name
              </label>

              <input
                type="text"
                placeholder="Enter member name"
                value={newName}
                onChange={(e) =>
                  setNewName(
                    e.target.value
                  )
                }
                autoFocus
              />

            </div>

            <div>

              <label>
                Initial Status
              </label>

              <select
                value={newStatus}
                onChange={(e) =>
                  setNewStatus(
                    e.target.value
                  )
                }
              >
                <option>
                  Available
                </option>

                <option>
                  Busy
                </option>

                <option>
                  Away
                </option>

              </select>

            </div>

            <button
              type="submit"
              className="save-button"
            >
              Add Member
            </button>

            <button
              type="button"
              className="cancel-button"
              onClick={() =>
                setShowAddForm(false)
              }
            >
              Cancel
            </button>

          </form>

        )}

        {/* TEAM */}

        <section className="team-section">

          <div className="section-heading">

            <div>

              <h2>
                Team Members
              </h2>

              <p>
                Change availability or
                remove members.
              </p>

            </div>

            <span className="member-count">
              {filteredMembers.length} members
            </span>

          </div>

          {loading ? (

            <div className="loading">
              Loading team members...
            </div>

          ) : filteredMembers.length ===
            0 ? (

            <div className="empty">
              No team members found.
            </div>

          ) : (

            <div className="members-grid">

              {filteredMembers.map(
                (member) => (

                  <div
                    className="member-card"
                    key={member.id}
                  >

                    <div className="member-top">

                      <div className="avatar">
                        {getInitials(
                          member.name
                        )}
                      </div>

                      <div className="member-info">

                        <h3>
                          {member.name}
                        </h3>

                        <div
                          className={`status ${member.status.toLowerCase()}`}
                        >

                          <span className="status-dot"></span>

                          {member.status}

                        </div>

                      </div>

                      {/* DELETE */}

                      <button
                        className="delete-button"
                        title="Remove member"
                        onClick={() =>
                          removeMember(
                            member.id,
                            member.name
                          )
                        }
                      >
                        🗑
                      </button>

                    </div>

                    <div className="divider"></div>

                    <div className="update-label">
                      Update Status
                    </div>

                    <div className="status-buttons">

                      {[
                        "Available",
                        "Busy",
                        "Away"
                      ].map((status) => (

                        <button
                          key={status}
                          disabled={
                            updatingId ===
                            member.id
                          }
                          className={
                            member.status ===
                            status
                              ? `status-button selected ${status.toLowerCase()}`
                              : "status-button"
                          }
                          onClick={() =>
                            updateStatus(
                              member.id,
                              status
                            )
                          }
                        >
                          {status}
                        </button>

                      ))}

                    </div>

                    <p className="updated-time">

                      Last updated:{" "}

                      {formatTime(
                        member.last_updated
                      )}

                    </p>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* FOOTER */}

        <footer>

          <div>

            <strong>
              TeamConnect
            </strong>

            <span>
              Team Availability Tracker
            </span>

          </div>

          <div>

            <span className="live-dot"></span>

            Status automatically refreshes
            every 3 seconds

          </div>

        </footer>

      </main>

    </div>
  );
}

export default App;