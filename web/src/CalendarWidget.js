import React from "react";
import {Segment, Button, Header, Input} from "semantic-ui-react";
import { API_ENDPOINT_BASE } from "./shared";

export default class CalendarWidget extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            code: "",
            showAuthFlow: false,
            loading: false,
            authURL: ""
        };
    }
    
    sendAuthCode = () => {
        if(this.state.code.length == 0) return;
        this.setState({loading: true});
        const data = {
            "code": this.state.code
        };
        fetch(API_ENDPOINT_BASE + "set_google_auth_code", {
            headers: {
                "Authorization": "Bearer " + this.props.authToken,
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(data)
        }).then((data) => {
            console.log(data.status);
            data.text().then(console.log);
            if(!data.ok){
                if(data.status == 401){
                    window.location = "/auth";
                    return;
                }
                alert("Received an error response from server.");
                this.setState({loading: false});
            }else{
                this.setState({loading: false, code: "", showAuthFlow: false});
            }
        });
    }

    printAgenda = () => {
        this.setState({loading: true});
        fetch(API_ENDPOINT_BASE + "print_calendar", {
            headers: {
                "Authorization": "Bearer " + this.props.authToken
            },
            method: "POST"
        }).then((data) => {
            console.log(data.status);
            if(!data.ok){
                if(data.status == 401){
                    window.location = "/auth";
                    return;
                }
                if(data.body != null){
                    data.json().then(json => {
                        console.log(json);
                        if("status" in json && json.status === "not_authorized"){
                            this.setState({loading: false, showAuthFlow: true, authURL: json.authorizationUrl});
                            return;
                        }
                        alert("Received an error response from server.");
                    }, e => {
                        console.error(e);
                        alert("Received an error response from server.");
                    });
                }else{
                    alert("Received an error response from server.");
                }
            }
            this.setState({loading: false, textVal: ""});
        });
    }

    render(){
        return (
            <Segment>
                <Header size="medium">Google Calendar</Header>
                {
                    this.state.showAuthFlow ? (
                        <>
                            <p>
                                <a href={this.state.authURL} target="_blank">Click here</a> to authorize Google Calendar, then paste the code below:
                            </p>
                            <Input placeholder="Paste code here" value={this.state.code} onChange={(e, data) => {
                                this.setState({code: data.value});
                            }} action={
                                <Button onClick={this.sendAuthCode} positive icon="check" />
                            } />
                        </>
                    ) : (
                        <>
                            <Button primary size="large" icon="calendar alternate" labelPosition="left" content="Print agenda" onClick={this.printAgenda} />
                        </>
                    )
                }
            </Segment>
        );
    }
}