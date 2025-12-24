// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL;

export async function fetchTransactions() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function addTransaction(data) {
  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function deleteTransaction(id) {
  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: 'delete',
      id: id
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function updateTransaction(id, transaction) {
  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: 'update',
      id: id,
      ...transaction
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}