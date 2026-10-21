// src/utils/cookbookStore.js
import { useState, useEffect } from "react";

const STORAGE_EVENT = "storageupdate";

/**
 * Safely read a JSON-serialized key from localStorage
 */
export function getStorage(key, defaultValue = []) {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

/**
 * Safely write a value to localStorage and notify all listeners in this and other tabs
 */
export function setStorage(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    dispatchStorageUpdate(key, value);
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

export const setStorageItem = setStorage;
export const getStorageItem = getStorage;

/**
 * Toggle an item ID inside an array stored in localStorage
 */
export function toggleInArray(key, id) {
  const current = getStorage(key, []);
  const next = current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id];
  setStorage(key, next);
  return next;
}

/**
 * Check if an item exists inside an array in localStorage
 */
export function isInStorage(key, id) {
  const current = getStorage(key, []);
  return current.includes(id);
}

/**
 * Broadcast storage update to same-tab listeners
 */
export function dispatchStorageUpdate(key, value) {
  if (typeof window === "undefined") return;
  const event = new CustomEvent(STORAGE_EVENT, { detail: { key, value } });
  window.dispatchEvent(event);
}

/**
 * React hook to bind state seamlessly with localStorage, syncing across tabs and components
 */
export function useCookbookStorage(key, defaultValue) {
  const [data, setData] = useState(() => getStorage(key, defaultValue));

  useEffect(() => {
    setData(getStorage(key, defaultValue));

    const handleUpdate = (e) => {
      if (!e.detail || e.detail.key === key) {
        setData(getStorage(key, defaultValue));
      }
    };

    const handleNativeStorage = (e) => {
      if (e.key === key) {
        setData(e.newValue ? JSON.parse(e.newValue) : defaultValue);
      }
    };

    window.addEventListener(STORAGE_EVENT, handleUpdate);
    window.addEventListener("storage", handleNativeStorage);

    return () => {
      window.removeEventListener(STORAGE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleNativeStorage);
    };
  }, [key]);

  const updateData = (newValue) => {
    const resolvedValue = typeof newValue === "function" ? newValue(data) : newValue;
    setStorage(key, resolvedValue);
    setData(resolvedValue);
  };

  return [data, updateData];
}
