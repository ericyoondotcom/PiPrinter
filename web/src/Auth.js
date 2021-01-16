import React from "react";
import {Input, Header, Segment} from "semantic-ui-react";
import Cookies from "js-cookie";

class Auth extends React.Component {
    constructor(props){
        super(props);
        this.state = {inputVal: ""};
    }
    
    onSubmit = () => {
        if(this.state.inputVal.length == 0) return;
        Cookies.set("auth_token", this.state.inputVal, {
            expires: 365
        });
        window.location = "/";
    }

    render(){
        return (
            <div>
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh"
                }}>
                    <Segment basic compact textAlign="center">
                        <Header size="large">Welcome!</Header>
                        <Input
                            placeholder="Access token"
                            value={this.state.inputVal}
                            icon="lock"
                            iconPosition="left"
                            onChange={(e, data) => {
                                this.setState({inputVal: data.value});
                            }}
                            action={{
                                positive: true,
                                icon: "right arrow",
                                onClick: this.onSubmit,
                                disabled: this.state.inputVal.length == 0
                            }}
                        />
                    </Segment>
                </div>
            </div>
        );
    }
}

Auth.propTypes = {
    
};

export default Auth;