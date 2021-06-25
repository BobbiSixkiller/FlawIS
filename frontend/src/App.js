import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import { AuthRoute } from "./util/AuthRoute";
import { AuthProvider } from "./context/auth";

import Header from "./components/Header";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./components/user/ForgotPassword";
import PasswordReset from "./components/user/PasswordReset";
import Footer from "./components/Footer";

import { Container } from "reactstrap";

function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<div id="App" className="d-flex flex-column justify-content-between">
					<Header />
					<Container>
						<Switch>
							<Route exact path="/">
								<Home />
							</Route>
							<Route path="/register">
								<Register />
							</Route>
							<Route path="/login">
								<Login />
							</Route>
							<Route path="/forgotPassword">
								<ForgotPassword />
							</Route>
							<Route path="/resetPassword/:token">
								<PasswordReset />
							</Route>
							<AuthRoute path="/dashboard">
								<Dashboard />
							</AuthRoute>
						</Switch>
					</Container>
					<Footer />
				</div>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
