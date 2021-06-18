import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import { AuthRoute, AdminRoute } from "./util/AuthRoute";
import { AuthProvider } from "./context/auth";

import Header from "./components/Header";
import Home from "./components/Home";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./components/user/ForgotPassword";
import PasswordReset from "./components/user/PasswordReset";
import Footer from "./components/Footer";

import MyGrants from "./components/MyGrants";
import Posts from "./pages/Posts";
import Users from "./components/user/Users";
import Grants from "./components/grant/Grants";

import { Container } from "reactstrap";

function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<div id="App" className="d-flex flex-column justify-content-between">
					<Header />
					<Container className="my-5">
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
							<AuthRoute path="/dashboard">
								<Dashboard />
							</AuthRoute>
							<AuthRoute path="/mygrants">
								<MyGrants />
							</AuthRoute>
							<AuthRoute path="/posts">
								<Posts />
							</AuthRoute>
							<Route path="/forgotPassword">
								<ForgotPassword />
							</Route>
							<Route path="/resetPassword/:token">
								<PasswordReset />
							</Route>
							<AdminRoute path="/grants">
								<Grants />
							</AdminRoute>
							<AdminRoute path="/users">
								<Users />
							</AdminRoute>
						</Switch>
					</Container>
					<Footer />
				</div>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
