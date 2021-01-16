import React from "react";
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import "./App.css";
import "semantic-ui-css/semantic.min.css";
import Dashboard from "./Dashboard";
import Auth from "./Auth";
export default class App extends React.Component {
	render(){
		return (
			<Router>
				<Switch>
					<Route exact path="/" component={Dashboard} />
					<Route exact path="/auth" component={Auth} />
				</Switch>
			</Router>
		);
	}
}