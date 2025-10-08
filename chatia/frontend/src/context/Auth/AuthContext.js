import React, { createContext } from "react";

import useAuth from "../../hooks/useAuth.js/index.js";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
	const {
		loading,
		user,
		isAuth,
		handleLogin,
		handleLogout,
		socket,
		timezone,
		timezoneLoading,
		loadTimezone,
		reloadTimezone
	} = useAuth();

	return (
		<AuthContext.Provider
			value={{
				loading,
				user,
				isAuth,
				handleLogin,
				handleLogout,
				socket,
				timezone,
				timezoneLoading,
				loadTimezone,
				reloadTimezone
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export { AuthContext, AuthProvider };