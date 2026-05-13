import { useState, useEffect, useCallback } from 'react';
import { userService } from '../../services/userService';
import { marketItemService } from '../../services/marketItemService';
import { requestService } from '../../services/requestService';

/**
 * useAdminData — Shared hook that pre-fetches lookup data (users, items, requests)
 * and provides ID→Name resolution maps for all admin entity pages.
 * 
 * This avoids N+1 fetches and ensures every page can resolve IDs to human-readable names.
 */
export function useAdminData() {
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [uRes, iRes, rRes] = await Promise.all([
          userService.getAll(),
          marketItemService.getAll(),
          requestService.getAll(),
        ]);
        if (!cancelled) {
          setUsers(uRes.data?.users || []);
          setItems(iRes.data?.items || []);
          setRequests(rRes.data?.requests || []);
        }
      } catch (e) {
        console.error('useAdminData fetch error:', e);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Lookup maps: id → object
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));
  const itemMap = Object.fromEntries(items.map(i => [i.id, i]));
  const requestMap = Object.fromEntries(requests.map(r => [r.id, r]));

  // Convenience resolvers
  const userName = useCallback((id) => {
    const u = userMap[id];
    return u ? `${u.firstName} ${u.lastName}` : `User #${id}`;
  }, [userMap]);

  const itemName = useCallback((id) => {
    const i = itemMap[id];
    return i ? i.item : `Item #${id}`;
  }, [itemMap]);

  const requestTitle = useCallback((id) => {
    const r = requestMap[id];
    return r ? r.title : `Request #${id}`;
  }, [requestMap]);

  return {
    users, items, requests, loaded,
    userMap, itemMap, requestMap,
    userName, itemName, requestTitle,
    setUsers,
  };
}

/**
 * filterByAllColumns — Reusable full-column search function.
 * 
 * Takes an array of rows, a search query, and a function that extracts
 * all searchable strings from a row. Returns filtered rows.
 * 
 * @param {Array} rows - Data rows
 * @param {string} query - Search string
 * @param {Function} extractSearchableText - (row) => string with all searchable fields joined
 * @returns {Array} filtered rows
 */
export function filterByAllColumns(rows, query, extractSearchableText) {
  if (!query || !query.trim()) return rows;
  const q = query.toLowerCase().trim();
  return rows.filter(row => extractSearchableText(row).toLowerCase().includes(q));
}
