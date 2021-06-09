import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import { UserProvider } from "./hooks/useUser";

import Register from "./components/user/Register";
import Login from "./components/user/Login";
import ForgotPassword from "./components/user/ForgotPassword";
import PasswordReset from "./components/user/PasswordReset";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import MyGrants from "./components/MyGrants";
import Posts from "./pages/Posts";
import Users from "./components/user/Users";
import Grants from "./components/grant/Grants";

import { Container } from "reactstrap";

function App() {
	return (
		<UserProvider>
			<BrowserRouter>
				<Switch>
					<div id="App" className="d-flex flex-column justify-content-between">
						<Header />
						<Container className="my-5">
							<Route exact path="/">
								<Home />
							</Route>
							<Route path="/mygrants">
								<MyGrants />
							</Route>
							<Route path="/posts">
								<Posts />
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
							<Route path="/grants">
								<Grants />
							</Route>
							<Route path="/users">
								<Users />
							</Route>
						</Container>
						<Footer />
					</div>
				</Switch>
			</BrowserRouter>
		</UserProvider>
	);
}

export default App;
