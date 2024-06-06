import "../css/pages/signInUpPage.scss";

import { useNavigate } from "react-router-dom";
import ErrorMessage from "../elements/ErrorMessage";
import { useEffect, useState } from "react";
import SettingsMenu from "../elements/SettingsMenu";
import { useAuth } from "../contexts/AuthContext";

export default function SignInPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberUserFor30Days, setRememberUserFor30Days] = useState(false);

    const {signIn, isAuthorized, isLoading} = useAuth();

    useEffect(() => {
        if (isAuthorized && !isLoading) {
            navigate("/");
        }
    }, [isAuthorized, isLoading]);

    async function signInContainer() {
        const constEmail = email;
        const completed = await signIn(constEmail, password, rememberUserFor30Days);

        if (completed) {   
            navigate(`/auth/recievecode/${constEmail}`);
        }
    }

    return <>
        <div className="screen-container">
            <div className="main-box signInBoxHeight">
                <h1>Sign in</h1>
                <hr className="border-styleColor-200" />
                <div className="mt-3 h-3/4">
                    <div className="form-item-top" role="group"> 
                        <p>Email</p>
                        <input placeholder="example@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div className="form-item-bottom" role="group">
                        <p>Password</p>
                        <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    <div className="form-item-width-xposition mt-2">
                        <div className="rounded-md border border-styleColor-200 h-6 w-6 flex items-center justify-center ml-2">
                            <input type="checkbox" className="form-checkbox accent-styleColor-500 w-full h-full text-styleColor-500 border-1 inline-block border-0 rounded-md focus:ring-0" onChange={(e) => setRememberUserFor30Days(e.target.checked)} />
                        </div>
                        <p className="ml-2 inline-block">Remember me for 30 days</p>
                    </div>
                    <div className="send-button-box">
                        <div>
                            Don't have an account?<a className="redirection-link" onClick={() => navigate("/auth/signup")}>Sign up</a>
                        </div>
                        <button onClick={signInContainer}>Sign in</button>
                    </div>
                </div>
            </div>
        </div>
        <SettingsMenu />
        <ErrorMessage moveStyles={"top-24"}/>
    </>
}