"use client";

import { useState, useEffect, useRef } from "react";
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

  // Store latest filters in a ref for fetchUsers
  const filtersRef = useRef({ q, city, occupation, email });

  // Update ref whenever filters change
  useEffect(() => {
    filtersRef.current = { q, city, occupation, email };
  }, [q, city, occupation, email]);

  // Function to fetch users with given page and filters
  const fetchUsers = async (pageNumber = 1) => {
    setLoading(true); // show loading spinner
    try {
      const { q, city, occupation, email } = filtersRef.current;
      const params = new URLSearchParams({
        q,
        city,
        occupation,
        email,
        page: pageNumber.toString(),
      });
      const res = await fetch(`/api/users?${params.toString()}`);
      const data = await res.json();
      setUsers(data.items); // update users after data arrives
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); // hide loading spinner
    }
  };

  // Debounced search/filter effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // reset page
      fetchUsers(1); // fetch first page
    }, 300);

    return () => clearTimeout(timer);
  }, [q, city, occupation, email]);

  // Fetch when page changes
  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const handlePrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (page * perPage < total) setPage((p) => p + 1);
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

      {loading && <p>Loading...</p>}

      <div className={styles.userList}>
        {users.map((user) => (
          <div key={user.id} className={styles.userItem}>
            <strong>{user.name}</strong> — {user.email} — {user.city} —{" "}
            {user.occupation}
          </div>
        ))}
      </div>
    </div>
  );
}
