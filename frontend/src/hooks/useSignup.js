import { useState } from "react";
import toast from "react-hot-toast";

const useSignup = () => {
	const [loading, setLoading] = useState(false);

	const signup = async ({ username, email, password, confirmPassword, gender }) => {
		const success = handleInputErrors({ username, email, password, confirmPassword, gender });
		if (!success) return false;

		setLoading(true);
		try {
			const res = await fetch("/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, email, password, confirmPassword, gender }),
			});

			const data = await res.json();
			console.log(data);
			if (data.error) {
				throw new Error(data.error);
			}
			
			// Show success message
			toast.success("Account created successfully!");
			return true;
		} catch (error) {
			toast.error(error.message);
			return false;
		} finally {
			setLoading(false);
		}
	};

	return { loading, signup };
};

export default useSignup;

function handleInputErrors({ username, email, password, confirmPassword, gender }) {
	if (!username || !email || !password || !confirmPassword || !gender) {
		toast.error("Please fill in all fields");
		return false;
	}

	if (password !== confirmPassword) {
		toast.error("Passwords do not match");
		return false;
	}

	if (password.length < 3) {
		toast.error("Password must be at least 3 characters");
		return false;
	}

	// Basic email validation
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		toast.error("Please enter a valid email address");
		return false;
	}

	return true;
}
