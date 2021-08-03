import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

<<<<<<< HEAD
import { UserProvider } from "./hooks/useUser";

import Register from "./components/user/Register";
import Login from "./components/user/Login";
import ForgotPassword from "./components/user/ForgotPassword";
import PasswordReset from "./components/user/PasswordReset";
=======
import { AuthRoute } from "./util/AuthRoute";
import { AuthProvider } from "./context/auth";

>>>>>>> dev
import Header from "./components/Header";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import PasswordReset from "./pages/auth/PasswordReset";
import Footer from "./components/Footer";

import { Container } from "reactstrap";

function App() {
<<<<<<< HEAD
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
=======
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
>>>>>>> dev
}

export default App;
