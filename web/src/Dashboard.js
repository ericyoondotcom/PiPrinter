import React from "react";
import { Button, Divider, Grid, Header, Icon, Segment, TextArea } from "semantic-ui-react";
import { API_ENDPOINT_BASE, loadAuthFromCookies } from "./shared";

class Dashboard extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            loading: false,
            textVal: ""
        };
        this.authToken = loadAuthFromCookies(true);
    }
    
    onTextSubmit = () => {
        if(this.state.textVal.length == 0) return;
        this.setState({loading: true});
        const data = {
            "text": this.state.textVal
        };
        fetch(API_ENDPOINT_BASE + "print_text", {
            headers: {
                "Authorization": "Bearer " + this.authToken,
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
            }
            this.setState({loading: false, textVal: ""});
        });
    }

    render(){
        return (
            <div style={{
                padding: "50px",
                textAlign: "center"
            }}>
                <Header size="huge">Pi Printer</Header>
                <Grid columns={2} divided style={{
                    height: "80vh"
                }}>
                    <Grid.Row>
                        <Grid.Column>
                            <TextArea placeholder="Send a message..." value={this.state.textVal} onChange={(event, data) => {
                                this.setState({textVal: data.value});
                            }} style={{
                                width: "100%",
                                height: "90%"
                            }} />
                            <Button floated="right" positive content="Send!" labelPosition="right" icon="paper plane" disabled={this.state.textVal.length == 0} loading={this.state.loading} onClick={this.onTextSubmit} />
                        </Grid.Column>
                        <Grid.Column>
                            <Segment placeholder>
                                <Header size="large" icon>
                                    <Icon name="image outline" />
                                    Drop an image here...
                                </Header>
                                <Divider hidden />
                                <Button content="Select file" icon="folder" labelPosition="left" />
                            </Segment>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}

Dashboard.propTypes = {
    
};

export default Dashboard;