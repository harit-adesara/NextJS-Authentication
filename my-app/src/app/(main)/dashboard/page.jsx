"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/axios";
import { useAuth } from "@/app/context/AuthContext.jsx";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [status, setStatus] = useState({ text: "", type: "" });
  const [searching, setSearching] = useState(false);
  const [friendLoading, setFriendLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("notifications");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    fetchFriends();
    fetchNotifications();
  }, [user]);

  function showStatus(text, type = "info") {
    setStatus({ text, type });
    setTimeout(() => setStatus({ text: "", type: "" }), 3000);
  }

  async function fetchFriends() {
    setFriendLoading(true);
    try {
      const res = await axios.get("/api/friend/get", { withCredentials: true });
      setFriends(res.data?.friends || []);
    } catch (err) {
      console.error(err);
      showStatus("Unable to load friend list.", "error");
    } finally {
      setFriendLoading(false);
    }
  }

  async function fetchNotifications() {
    setNotificationLoading(true);
    try {
      const res = await axios.get("/api/notification/get", {
        withCredentials: true,
      });
      setNotifications(res.data?.notification || []);
    } catch (err) {
      console.error(err);
      showStatus("Unable to load notifications.", "error");
    } finally {
      setNotificationLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    const query = searchTerm.trim();
    if (!query) {
      showStatus("Enter a username to search.", "warn");
      return;
    }
    setSearching(true);
    setStatus({ text: "", type: "" });
    try {
      const res = await axios.post(
        "/api/user",
        { username: query },
        { withCredentials: true },
      );
      const list = (res.data?.user || []).filter((r) => r._id !== user?._id);
      setSearchResults(list);
      if (!list.length)
        showStatus("No users found with that username.", "warn");
    } catch (err) {
      console.error(err);
      showStatus("Search failed. Try again.", "error");
    } finally {
      setSearching(false);
    }
  }

  async function handleAddFriend(userId) {
    try {
      await axios.post(
        "/api/notification/send",
        { userId },
        { withCredentials: true },
      );
      showStatus("Friend request sent!", "success");
      fetchNotifications();
    } catch (err) {
      console.error(err);
      showStatus("Could not send friend request.", "error");
    }
  }

  async function handleAccept(notificationId) {
    try {
      await axios.post(
        "/api/friend/accept",
        { notificationId },
        { withCredentials: true },
      );
      showStatus("Friend request accepted!", "success");
      fetchFriends();
      fetchNotifications();
    } catch (err) {
      console.error(err);
      showStatus("Unable to accept request.", "error");
    }
  }

  async function handleReject(notificationId) {
    try {
      await axios.post(
        "/api/friend/reject",
        { notificationId },
        { withCredentials: true },
      );
      showStatus("Friend request rejected.", "info");
      fetchNotifications();
    } catch (err) {
      console.error(err);
      showStatus("Unable to reject request.", "error");
    }
  }

  function goToChat(chatId) {
    if (!chatId) {
      showStatus("Chat not available for this friend.", "warn");
      return;
    }
    router.push(`/chat/${chatId}`);
  }

  const pendingCount = notifications.filter((n) => !n.isProcessed).length;

  if (loading) {
    return (
      <div style={styles.fullCenter}>
        <style>{globalStyles}</style>
        <div style={styles.loadingCard}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Initializing session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.fullCenter}>
        <style>{globalStyles}</style>
        <div style={styles.loadingCard}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Redirecting…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{globalStyles}</style>

      {/* Background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header} className="fade-in-up">
          <div style={styles.headerLeft}>
            <div style={styles.avatarWrap}>
              <div style={styles.avatar}>
                {(user.username || user.email || "U")[0].toUpperCase()}
              </div>
              <div style={styles.onlineDot} />
            </div>
            <div>
              <p style={styles.welcomeLabel}>Welcome back</p>
              <h1 style={styles.username}>
                {user.username || user.email || "User"}
              </h1>
            </div>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.statBadge}>
              <span style={styles.statNum}>{friends.length}</span>
              <span style={styles.statLabel}>Friends</span>
            </div>
            <div
              style={{
                ...styles.statBadge,
                borderColor:
                  pendingCount > 0 ? "#22d3ee" : "rgba(255,255,255,0.08)",
              }}
            >
              <span
                style={{
                  ...styles.statNum,
                  color: pendingCount > 0 ? "#22d3ee" : "#94a3b8",
                }}
              >
                {pendingCount}
              </span>
              <span style={styles.statLabel}>Pending</span>
            </div>
          </div>
        </header>

        {/* Status toast */}
        {status.text && (
          <div
            style={{ ...styles.toast, ...styles[`toast_${status.type}`] }}
            className="fade-in-up"
          >
            <span style={styles.toastDot(status.type)} />
            {status.text}
          </div>
        )}

        <div style={styles.grid}>
          {/* LEFT — Search */}
          <div style={styles.card} className="fade-in-up anim-delay-1">
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>⌕</div>
              <div>
                <h2 style={styles.cardTitle}>Find People</h2>
                <p style={styles.cardSub}>Search by username to connect</p>
              </div>
            </div>

            <form onSubmit={handleSearch} style={styles.searchForm}>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>@</span>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter username…"
                  style={styles.input}
                  className="dash-input"
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                style={styles.searchBtn}
                className="dash-btn"
              >
                {searching ? (
                  <>
                    <span style={styles.btnSpinner} /> Searching
                  </>
                ) : (
                  "Search"
                )}
              </button>
            </form>

            <div style={styles.resultsList}>
              {searchResults.length > 0 ? (
                searchResults.map((result, i) => (
                  <div
                    key={result._id}
                    style={styles.resultCard}
                    className="fade-in-up result-card"
                  >
                    <div style={styles.resultAvatar}>
                      {(result.username ||
                        result.email ||
                        "?")[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={styles.resultName}>
                        {result.username || result.email || "Unknown"}
                      </p>
                      <p style={styles.resultId}>ID: {result._id.slice(-8)}…</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddFriend(result._id)}
                      style={styles.addBtn}
                      className="dash-btn-outline"
                    >
                      + Add
                    </button>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <p style={styles.emptyIcon}>🔍</p>
                  <p style={styles.emptyText}>
                    Search for users to add friends
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Tabs */}
          <div style={styles.rightCol}>
            {/* Tab bar */}
            <div style={styles.tabBar} className="fade-in-up anim-delay-2">
              <button
                onClick={() => setActiveTab("notifications")}
                style={{
                  ...styles.tab,
                  ...(activeTab === "notifications" ? styles.tabActive : {}),
                }}
                className="dash-tab"
              >
                Notifications
                {pendingCount > 0 && (
                  <span style={styles.badge}>{pendingCount}</span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("friends")}
                style={{
                  ...styles.tab,
                  ...(activeTab === "friends" ? styles.tabActive : {}),
                }}
                className="dash-tab"
              >
                Friends
                {friends.length > 0 && (
                  <span
                    style={{
                      ...styles.badge,
                      background: "rgba(148,163,184,0.15)",
                      color: "#94a3b8",
                    }}
                  >
                    {friends.length}
                  </span>
                )}
              </button>
            </div>

            {/* Notifications panel */}
            {activeTab === "notifications" && (
              <div style={styles.card} className="fade-in-up anim-delay-2">
                <div style={styles.cardHeader}>
                  <div style={{ ...styles.cardIcon, fontSize: 18 }}>🔔</div>
                  <div>
                    <h2 style={styles.cardTitle}>Notifications</h2>
                    <p style={styles.cardSub}>Incoming friend requests</p>
                  </div>
                </div>

                <div style={styles.listWrap}>
                  {notificationLoading ? (
                    <div style={styles.loadingRow}>
                      <span style={styles.miniSpinner} />
                      <span style={styles.loadingRowText}>
                        Loading notifications…
                      </span>
                    </div>
                  ) : notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        style={{
                          ...styles.notifCard,
                          opacity: n.isProcessed ? 0.5 : 1,
                        }}
                      >
                        <div style={styles.notifAvatar}>
                          {String(n.senderId.username).slice(-2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={styles.notifFrom}>
                            From{" "}
                            <span style={styles.notifId}>
                              {n.senderId.username}
                            </span>
                          </p>
                          <p
                            style={{
                              ...styles.notifStatus,
                              color: n.isProcessed ? "#64748b" : "#22d3ee",
                            }}
                          >
                            {n.isProcessed ? "✓ Processed" : "● Pending"}
                          </p>
                        </div>
                        {!n.isProcessed && (
                          <div style={styles.notifActions}>
                            <button
                              onClick={() => handleAccept(n._id)}
                              style={styles.acceptBtn}
                              className="dash-btn-sm"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleReject(n._id)}
                              style={styles.rejectBtn}
                              className="dash-btn-sm"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={styles.emptyState}>
                      <p style={styles.emptyIcon}>📭</p>
                      <p style={styles.emptyText}>No notifications yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Friends panel */}
            {activeTab === "friends" && (
              <div style={styles.card} className="fade-in-up anim-delay-2">
                <div style={styles.cardHeader}>
                  <div style={{ ...styles.cardIcon, fontSize: 18 }}>👥</div>
                  <div>
                    <h2 style={styles.cardTitle}>Friends</h2>
                    <p style={styles.cardSub}>Your connections</p>
                  </div>
                </div>

                <div style={styles.listWrap}>
                  {friendLoading ? (
                    <div style={styles.loadingRow}>
                      <span style={styles.miniSpinner} />
                      <span style={styles.loadingRowText}>
                        Loading friends…
                      </span>
                    </div>
                  ) : friends.length > 0 ? (
                    friends.map((friend) => {
                      const isRequester =
                        String(friend.requesterId._id) === String(user._id);
                      const friendUser = isRequester
                        ? friend.recipientId
                        : friend.requesterId;

                      return (
                        <div key={friend._id} style={styles.friendCard}>
                          <div style={styles.friendAvatar}>
                            {(friendUser.username || "?")[0].toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={styles.friendId}>
                              {friendUser.username || "Unknown"}
                            </p>
                          </div>
                          <button
                            onClick={() => goToChat(friend.chatId)}
                            disabled={!friend.chatId}
                            style={{
                              ...styles.chatBtn,
                              ...(friend.chatId ? {} : styles.chatBtnDisabled),
                            }}
                            className="dash-btn"
                          >
                            Chat →
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div style={styles.emptyState}>
                      <p style={styles.emptyIcon}>👋</p>
                      <p style={styles.emptyText}>
                        No friends yet — search and connect!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080c14",
    fontFamily: "'DM Sans', 'Outfit', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  orb1: {
    position: "fixed",
    top: "-120px",
    left: "-120px",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  orb2: {
    position: "fixed",
    bottom: "-150px",
    right: "-100px",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  container: {
    position: "relative",
    zIndex: 1,
    maxWidth: 1100,
    margin: "0 auto",
    padding: "32px 24px",
  },
  fullCenter: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#080c14",
  },
  loadingCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: "48px 64px",
    backdropFilter: "blur(12px)",
  },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid rgba(34,211,238,0.15)",
    borderTop: "3px solid #22d3ee",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    color: "#64748b",
    fontSize: 14,
    margin: 0,
    letterSpacing: "0.02em",
  },

  // Header
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 24,
    padding: "24px 32px",
    backdropFilter: "blur(16px)",
    marginBottom: 20,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 16 },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    background: "linear-gradient(135deg, #22d3ee22, #6366f122)",
    border: "1px solid rgba(34,211,238,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: 700,
    color: "#22d3ee",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#22c55e",
    border: "2px solid #080c14",
  },
  welcomeLabel: {
    color: "#475569",
    fontSize: 12,
    margin: 0,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  username: {
    color: "#f1f5f9",
    fontSize: 22,
    fontWeight: 700,
    margin: 0,
    letterSpacing: "-0.02em",
  },
  headerRight: { display: "flex", gap: 12 },
  statBadge: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "12px 20px",
    borderRadius: 16,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    minWidth: 72,
  },
  statNum: { fontSize: 22, fontWeight: 700, color: "#94a3b8", lineHeight: 1 },
  statLabel: {
    fontSize: 11,
    color: "#475569",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  // Toast
  toast: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 20px",
    borderRadius: 14,
    marginBottom: 16,
    fontSize: 14,
    fontWeight: 500,
    border: "1px solid",
    backdropFilter: "blur(12px)",
  },
  toast_success: {
    background: "rgba(34,197,94,0.1)",
    borderColor: "rgba(34,197,94,0.25)",
    color: "#86efac",
  },
  toast_error: {
    background: "rgba(239,68,68,0.1)",
    borderColor: "rgba(239,68,68,0.25)",
    color: "#fca5a5",
  },
  toast_warn: {
    background: "rgba(234,179,8,0.1)",
    borderColor: "rgba(234,179,8,0.25)",
    color: "#fde047",
  },
  toast_info: {
    background: "rgba(34,211,238,0.08)",
    borderColor: "rgba(34,211,238,0.2)",
    color: "#67e8f9",
  },
  toastDot: (type) => ({
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
    background:
      type === "success"
        ? "#22c55e"
        : type === "error"
          ? "#ef4444"
          : type === "warn"
            ? "#eab308"
            : "#22d3ee",
  }),

  // Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    gap: 20,
  },

  // Card
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 24,
    padding: 28,
    backdropFilter: "blur(16px)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: "rgba(34,211,238,0.08)",
    border: "1px solid rgba(34,211,238,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    color: "#22d3ee",
  },
  cardTitle: { color: "#f1f5f9", fontSize: 17, fontWeight: 700, margin: 0 },
  cardSub: { color: "#475569", fontSize: 13, margin: "2px 0 0" },

  // Search
  searchForm: { display: "flex", gap: 10, marginBottom: 20 },
  inputWrap: { flex: 1, position: "relative" },
  inputIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#475569",
    fontSize: 16,
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 14,
    padding: "12px 14px 12px 36px",
    color: "#f1f5f9",
    fontSize: 14,
    outline: "none",
    transition: "border 0.2s",
    fontFamily: "inherit",
  },
  searchBtn: {
    background: "linear-gradient(135deg, #22d3ee, #6366f1)",
    border: "none",
    borderRadius: 14,
    padding: "12px 22px",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  btnSpinner: {
    display: "inline-block",
    width: 12,
    height: 12,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  resultsList: { display: "flex", flexDirection: "column", gap: 10 },
  resultCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: "14px 16px",
    transition: "border-color 0.2s",
  },
  resultAvatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "rgba(99,102,241,0.15)",
    border: "1px solid rgba(99,102,241,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    color: "#818cf8",
    flexShrink: 0,
  },
  resultName: { color: "#e2e8f0", fontSize: 15, fontWeight: 600, margin: 0 },
  resultId: {
    color: "#475569",
    fontSize: 12,
    margin: "2px 0 0",
    fontFamily: "monospace",
  },
  addBtn: {
    background: "transparent",
    border: "1px solid rgba(34,211,238,0.3)",
    borderRadius: 10,
    padding: "7px 14px",
    color: "#22d3ee",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    flexShrink: 0,
    transition: "all 0.2s",
  },

  // Right col
  rightCol: { display: "flex", flexDirection: "column", gap: 12 },
  tabBar: {
    display: "flex",
    gap: 6,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 18,
    padding: 6,
  },
  tab: {
    flex: 1,
    padding: "10px 16px",
    background: "transparent",
    border: "none",
    borderRadius: 12,
    color: "#64748b",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "all 0.2s",
  },
  tabActive: {
    background: "rgba(34,211,238,0.1)",
    color: "#22d3ee",
    boxShadow: "inset 0 0 0 1px rgba(34,211,238,0.2)",
  },
  badge: {
    background: "rgba(34,211,238,0.2)",
    color: "#22d3ee",
    fontSize: 11,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 20,
    minWidth: 18,
    textAlign: "center",
  },

  // List
  listWrap: { display: "flex", flexDirection: "column", gap: 10 },
  loadingRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 0",
  },
  miniSpinner: {
    display: "inline-block",
    width: 14,
    height: 14,
    border: "2px solid rgba(34,211,238,0.15)",
    borderTop: "2px solid #22d3ee",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  loadingRowText: { color: "#475569", fontSize: 14 },

  // Notification card
  notifCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: "14px 16px",
    transition: "opacity 0.2s",
  },
  notifAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    flexShrink: 0,
    background: "rgba(34,211,238,0.08)",
    border: "1px solid rgba(34,211,238,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "#22d3ee",
    fontFamily: "monospace",
  },
  notifFrom: { color: "#cbd5e1", fontSize: 13, fontWeight: 500, margin: 0 },
  notifId: { color: "#22d3ee", fontFamily: "monospace", fontSize: 12 },
  notifStatus: { fontSize: 11, margin: "3px 0 0", fontWeight: 500 },
  notifActions: { display: "flex", gap: 6, flexShrink: 0 },
  acceptBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    border: "1px solid rgba(34,197,94,0.35)",
    background: "rgba(34,197,94,0.1)",
    color: "#4ade80",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  rejectBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    border: "1px solid rgba(239,68,68,0.35)",
    background: "rgba(239,68,68,0.1)",
    color: "#f87171",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
  },

  // Friend card
  friendCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: "14px 16px",
  },
  friendAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    flexShrink: 0,
    background: "rgba(99,102,241,0.1)",
    border: "1px solid rgba(99,102,241,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "#818cf8",
    fontFamily: "monospace",
  },
  friendId: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: 600,
    margin: 0,
    fontFamily: "monospace",
  },
  friendChat: {
    color: "#475569",
    fontSize: 12,
    margin: "3px 0 0",
    fontFamily: "monospace",
  },
  chatBtn: {
    background: "linear-gradient(135deg, #22d3ee22, #6366f122)",
    border: "1px solid rgba(34,211,238,0.25)",
    borderRadius: 10,
    padding: "8px 14px",
    color: "#22d3ee",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    flexShrink: 0,
    transition: "all 0.2s",
  },
  chatBtnDisabled: {
    background: "rgba(255,255,255,0.03)",
    borderColor: "rgba(255,255,255,0.06)",
    color: "#334155",
    cursor: "not-allowed",
  },

  // Empty
  emptyState: { textAlign: "center", padding: "32px 16px" },
  emptyIcon: { fontSize: 32, margin: "0 0 10px", display: "block" },
  emptyText: { color: "#475569", fontSize: 14, margin: 0 },
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .fade-in-up { animation: fadeInUp 0.5s ease both; }
  .anim-delay-1 { animation-delay: 0.08s; }
  .anim-delay-2 { animation-delay: 0.16s; }

  .dash-input:focus {
    border-color: rgba(34,211,238,0.4) !important;
    box-shadow: 0 0 0 3px rgba(34,211,238,0.08);
  }
  .dash-input::placeholder { color: #334155; }

  .dash-btn:hover:not(:disabled) {
    opacity: 0.88;
    transform: translateY(-1px);
  }
  .dash-btn-outline:hover {
    background: rgba(34,211,238,0.08) !important;
    border-color: rgba(34,211,238,0.5) !important;
  }
  .dash-btn-sm:hover {
    transform: scale(1.08);
  }
  .dash-tab:hover {
    color: #94a3b8 !important;
    background: rgba(255,255,255,0.04) !important;
  }
  .result-card:hover {
    border-color: rgba(255,255,255,0.12) !important;
  }

  @media (max-width: 768px) {
    .dash-grid { grid-template-columns: 1fr !important; }
  }
`;
