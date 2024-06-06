import "../css/pages/signInUpPage.scss";

import { useNavigate } from "react-router-dom";
import ErrorMessage from "../elements/ErrorMessage";
import { useEffect, useState } from "react";
import SettingsMenu from "../elements/SettingsMenu";
import { useAuth } from "../contexts/AuthContext";
import { useAppDispatch } from "../app/hooks";
import { setError } from "../slices/errorSlice";

export default function SignUpPage() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [secondPassword, setSecondPassword] = useState("");
    const [avatar, setAvatar] = useState<File | null>(null);
    const [rememberUserFor30Days, setRememberUserFor30Days] = useState(false);
    const dispatch = useAppDispatch();

    const { signUp, isAuthorized, isLoading} = useAuth();

    useEffect(() => {
        if (isAuthorized && !isLoading) {
            navigate("/");
        }
    }, [isAuthorized, isLoading]);

    async function signUpContainer() {
        if (password == secondPassword) {
            const constEmail = email;
            const completed = await signUp(name, password, constEmail, avatar, rememberUserFor30Days);
            
            if (completed) {
                navigate(`/auth/recievecode/${constEmail}`);
            }
        } else {
            dispatch(setError(new Error("The passwords aren't the same")));
        }
    }

    return <div>
        <div className="screen-container">
            <div className="main-box h-1/2">
                <h1>Sign up</h1>
                <hr className="border-styleColor-200" />
                <div className="mt-3 h-3/4">
                    <div className="form-item-top" role="group"> 
                        <p>Name</p>
                        <input placeholder="your name" value={name} onChange={(e) => setName(e.target.value)}/>
                    </div>
                    <div className="form-item" role="group"> 
                        <p>Email</p>
                        <input placeholder="example@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div className="form-item" role="group">
                        <p>Password</p>
                        <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    <div className="form-item" role="group">
                        <p>Confirm password</p>
                        <input placeholder="repeat password" type="password" value={secondPassword} onChange={(e) => setSecondPassword(e.target.value)}/>
                    </div>
                    <div className="form-item-bottom overflow-hidden" role="group">
                        <p>Avatar</p>
                        <label className="bg-white flex-1 flex flex-row items-center">
                            <input type="file" onChange={(e) => {setAvatar(e.target.files ? e.target.files.item(0) : null ); e.target.value = ""}}/>
                            <text className={`ml-2 ${avatar ? "text-styleColor-700" : "text-gray-500"}`}>choose the file</text>
                            {avatar ? <button className="text-sm ml-4 p-1 bg-styleColor-400 text-white rounded" onClick={(e) => {setAvatar(null); e.stopPropagation(); e.preventDefault()}}>Clear chosen</button> : null}
                        </label>
                    </div>
                    <div className="form-item-width-xposition mt-2">
                        <div className="rounded-md border border-styleColor-200 h-6 w-6 flex items-center justify-center ml-2">
                            <input type="checkbox" className="form-checkbox accent-styleColor-500 w-full h-full text-styleColor-500 border-1 inline-block border-0 rounded-md focus:ring-0" onChange={(e) => setRememberUserFor30Days(e.target.checked)} />
                        </div>
                        <p className="ml-2 inline-block">Remember me for 30 days</p>
                    </div>
                    <div className="send-button-box">
                        <div >
                            Already have an account?<a className="redirection-link" onClick={() => navigate("/auth/signin")}>Sign in</a>
                        </div>
                        <button onClick={signUpContainer}>Sign up</button>
                        <p className=" ml-3 inline-block text-sm">By clicking the button you are agreeing with the <a className="link">terms of use</a></p>
                    </div>
                </div>
            </div>
        </div>
        <SettingsMenu />
        <ErrorMessage moveStyles={"top-24"}/>
    </div>
}