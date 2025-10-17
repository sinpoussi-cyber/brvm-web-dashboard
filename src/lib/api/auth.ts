import api from "./client";

export const loginUser = async (email: string, password: string) => {
  try {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("access_token", res.data.access_token);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const registerUser = async (email: string, password: string) => {
  await api.post("/auth/register", { email, password });
};
