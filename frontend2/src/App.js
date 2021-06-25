import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import { AuthProvider } from "./context/auth";
import { AuthRoute } from "./util/AuthRoute";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Navbar />
				<Switch>
					<Route exact path="/">
						<Home />
					</Route>
					<Route exact path="/login">
						<Login />
					</Route>
					<AuthRoute path="/dashboard">
						<Dashboard />
					</AuthRoute>
				</Switch>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
