import { API_BASE } from "../utils/constants";
import { baseHeaders } from "../utils/request";

const System = {
  ping: async function () {
    return await fetch(`${API_BASE}/ping`)
      .then((res) => res.ok)
      .catch(() => false);
  },
  totalIndexes: async function () {
    return await fetch(`${API_BASE}/system/system-vectors`, {
      headers: baseHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not find indexes.");
        return res.json();
      })
      .then((res) => res.vectorCount)
      .catch(() => 0);
  },
  keys: async function () {
    return await fetch(`${API_BASE}/setup-complete`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not find setup information.");
        return res.json();
      })
      .then((res) => res.results)
      .catch(() => null);
  },
  localFiles: async function () {
    return await fetch(`${API_BASE}/system/local-files`, {
      headers: baseHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not find setup information.");
        return res.json();
      })
      .then((res) => res.localFiles)
      .catch(() => null);
  },
  checkAuth: async function (currentToken = null) {
    return await fetch(`${API_BASE}/system/check-token`, {
      headers: baseHeaders(currentToken),
    })
      .then((res) => res.ok)
      .catch(() => false);
  },
  requestToken: async function (body) {
    return await fetch(`${API_BASE}/request-token`, {
      method: "POST",
      body: JSON.stringify({ ...body }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not validate login.");
        return res.json();
      })
      .then((res) => res)
      .catch((e) => {
        return { valid: false, message: e.message };
      });
  },
  checkDocumentProcessorOnline: async () => {
    return await fetch(`${API_BASE}/system/document-processing-status`, {
      headers: baseHeaders(),
    })
      .then((res) => res.ok)
      .catch(() => false);
  },
  acceptedDocumentTypes: async () => {
    return await fetch(`${API_BASE}/system/accepted-document-types`, {
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .then((res) => res?.types)
      .catch(() => null);
  },
  updateSystem: async (data) => {
    return await fetch(`${API_BASE}/system/update-env`, {
      method: "POST",
      headers: baseHeaders(),
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .catch((e) => {
        console.error(e);
        return { newValues: null, error: e.message };
      });
  },
  updateSystemPassword: async (data) => {
    return await fetch(`${API_BASE}/system/update-password`, {
      method: "POST",
      headers: baseHeaders(),
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .catch((e) => {
        console.error(e);
        return { success: false, error: e.message };
      });
  },
  setupMultiUser: async (data) => {
    return await fetch(`${API_BASE}/system/enable-multi-user`, {
      method: "POST",
      headers: baseHeaders(),
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .catch((e) => {
        console.error(e);
        return { success: false, error: e.message };
      });
  },
  deleteDocument: async (name, meta) => {
    return await fetch(`${API_BASE}/system/remove-document`, {
      method: "DELETE",
      headers: baseHeaders(),
      body: JSON.stringify({ name, meta }),
    })
      .then((res) => res.ok)
      .catch((e) => {
        console.error(e);
        return false;
      });
  },
  dataExport: async () => {
    return await fetch(`${API_BASE}/system/data-export`, {
      method: "GET",
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .then((res) => res)
      .catch((e) => {
        console.error(e);
        return { filename: null, error: e.message };
      });
  },
  importData: async (formData) => {
    return await fetch(`${API_BASE}/system/data-import`, {
      method: "POST",
      body: formData,
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .then((res) => res)
      .catch((e) => {
        console.error(e);
        return { success: false, error: e.message };
      });
  },
  uploadLogo: async function (file) {
    const formData = new FormData();
    formData.append("logo", file);

    try {
      const response = await fetch(`${API_BASE}/system/upload-logo`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.status === 200) {
        return { success: true };
      } else {
        throw new Error(result.message || "Error uploading logo.");
      }
    } catch (err) {
      console.error("Failed to upload logo:", err);
      throw err;
    }
  },
  fetchLogo: async function (light = false) {
    try {
        const lightParam = light ? "/light" : "";
        console.log(`${API_BASE}/system/logo${lightParam}`);
        const response = await fetch(`${API_BASE}/system/logo${lightParam}`);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (err) {
        console.error("Failed to fetch logo:", err);
        throw err;
    }
},

  removeCustomLogo: async function () {
    try {
      const response = await fetch(`${API_BASE}/system/remove-logo`);

      const result = await response.json();

      if (response.status === 200) {
        return { success: true };
      } else {
        throw new Error(result.message || "Error removing logo.");
      }
    } catch (err) {
      console.error("Failed to remove logo:", err);
      throw err;
    }
  },
};

export default System;
