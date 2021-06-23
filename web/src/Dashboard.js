import React from "react";
import { Button, Divider, Grid, Header, Icon, Segment, TextArea, Input } from "semantic-ui-react";
import { API_ENDPOINT_BASE, loadAuthFromCookies } from "./shared";
import CalendarWidget from "./CalendarWidget";

class Dashboard extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            loading: false,
            textVal: "",
            imageUrlVal: "",
            dropHovering: false
        };
        this.uploadInput = React.createRef();
        this.authToken = loadAuthFromCookies(true);
    }

    onDrop = (e) => {
        e.preventDefault();
        this.setState({dropHovering: false});
        if(e.dataTransfer.length == 0) return;
        const file = e.dataTransfer.files[0];
        this.uploadFile(file);
    }

    onInputChange = (e) => {
        const filelist = e.target.files;
        if(filelist.length == 0) return;
        const file = filelist[0];
        this.uploadFile(file);
    }

    uploadFile = (file) => {
        this.setState({loading: true});
        const type = file["type"];
        const formData = new FormData();
        formData.append("file", file);

        fetch(API_ENDPOINT_BASE + "send_file", {
            headers: {
                "Authorization": "Bearer " + this.authToken
                // Content type should automatically be set to multipart/form-data
            },
            method: "POST",
            body: formData
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
            this.setState({loading: false});
        });
    }

    onDragLeave = (e) => {
        this.setState({dropHovering: false});
    }

    onDragOver = (e) => {
        e.preventDefault();
        this.setState({dropHovering: true});
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

    onFileUrlSubmit = () => {
        if(this.state.imageUrlVal.length == 0) return;
        this.setState({loading: true});
        const data = {
            "url": this.state.imageUrlVal
        };
        fetch(API_ENDPOINT_BASE + "print_file_from_url", {
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
            this.setState({loading: false, imageUrlVal: ""});
        });
    }

    cancelJobs = () => {
        this.setState({loading: true});
        fetch(API_ENDPOINT_BASE + "cancel_all_jobs", {
            headers: {
                "Authorization": "Bearer " + this.authToken
            },
            method: "POST"
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
                            <Segment placeholder inverted={this.state.dropHovering} onDrop={this.onDrop} onDragLeave={this.onDragLeave} onDragOver={this.onDragOver}>
                                <input type="file" accept="*" style={{
                                    display: "none"
                                }} ref={this.uploadInput} onChange={this.onInputChange} />
                                <Header size="large" icon>
                                    <Icon name="file outline" />
                                    Drop a file here...
                                </Header>
                                <Divider hidden />
                                <Button content="Select file" icon="folder" labelPosition="left" onClick={() => {
                                    this.uploadInput.current.click();
                                }}  />
                                <Divider hidden />
                                <Input placeholder="File URL" value={this.state.imageUrlVal} onChange={(event, data) => {
                                    this.setState({imageUrlVal: data.value});
                                }} action={
                                    <Button disabled={this.state.imageUrlVal.length == 0} icon="paper plane" onClick={this.onFileUrlSubmit} />
                                } />
                            </Segment>
                            <CalendarWidget authToken={this.authToken} />
                            <Segment>
                                <Header size="medium">Utility</Header>
                                <Button negative size="large" icon="trash" labelPosition="left" content="Cancel all jobs" onClick={this.cancelJobs} />
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