// api.js
const API_BASE_URL = "https://server-mapbox.onrender.com/api/addresses";

const fetchAddresses = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/getall`);

    if (!res.ok) {
      throw new Error("Failed to fetch addresses");
    }

    return await res.json();
  } catch (error) {
    console.error("An error occurred while fetching the transactions:", error);
    throw error; // Re-throw the error so it can be handled by the calling code
  }
};

const createAddress = async (payload) => {
  try {
    const res = await fetch(`${API_BASE_URL}/create`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Something went wrong");
    }

    return await res.json();
  } catch (error) {
    console.error(error);
    throw error; // Re-throw the error so it can be handled by the calling code
  }
};
const deleteAddress = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete address");
    }

    return await res.json();
  } catch (error) {
    console.error(error);
    throw error; // Re-throw the error so it can be handled by the calling code
  }
};

export { fetchAddresses, createAddress, deleteAddress };
