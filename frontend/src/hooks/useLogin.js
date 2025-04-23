import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

const useLogin = () => {
	const [loading, setLoading] = useState(false);
	const { setAuthUser } = useAuthContext();

	const login = async (username, password) => {
		const success = handleInputErrors(username, password);
		if (!success) return;
		
		setLoading(true);
		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
				credentials: "include" // Important for cookies
			});

			const data = await res.json();
			if (data.error) {
				throw new Error(data.error);
			}

			if (!res.ok) {
				throw new Error(data.message || "Login failed");
			}

			localStorage.setItem("current-user", JSON.stringify(data));
			setAuthUser(data);
			toast.success("Logged in successfully");
		} catch (error) {
			toast.error(error.message || "Failed to login");
		} finally {
			setLoading(false);
		}
	};

	return { loading, login };
};
export default useLogin;

function handleInputErrors(username, password) {
	if (!username || !password) {
		toast.error("Please fill in all fields");
		return false;
	}
	return true;
}