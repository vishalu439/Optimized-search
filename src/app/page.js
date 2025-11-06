"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";

const perPage = 50;

export default function Home() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [occupation, setOccupation] = useState("");
  const [email, setEmail] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q,
        city,
        occupation,
        email,
        page: page.toString(),
      });
      const res = await fetch(`/api/users?${params.toString()}`);
      const data = await res.json();
      setUsers(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [q, city, occupation, email, page]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // reset page on new search/filter
      fetchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [q, city, occupation, email, page, fetchUsers]);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page * perPage < total) setPage(page + 1);
  };

  return (
    <div className={styles.container}>
      <h1>Optimized User Search</h1>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by name/email/city"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by occupation"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className={styles.pagination}>
        <button onClick={handlePrev} disabled={page === 1}>
          Prev
        </button>
        <span>
          Page {page} of {Math.ceil(total / perPage)}
        </span>
        <button onClick={handleNext} disabled={page * perPage >= total}>
          Next
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className={styles.userList}>
          {users.map((user) => (
            <div key={user.id} className={styles.userItem}>
              <strong>{user.name}</strong> — {user.email} — {user.city} —{" "}
              {user.occupation}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
