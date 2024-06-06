import { useState, useContext, useEffect, createContext, useRef} from "react";
import axios, { AxiosError } from "axios";
import { serverUrl } from "../constants";
import { useAppDispatch } from "../app/hooks";
import { setError } from "../slices/errorSlice";
import { deactivateSettingsMenu } from "../slices/settingsMenuSlice";
import { sendRequestWithCatch } from "../elements/MainMenuLibraryArtist";

export interface Token {
    token: string;
    expiresAt: Date;
}

export interface TokenWithIsLongTerm {
    token: string;
    expiresAt: Date;
    isLongTerm: boolean;
}

export const AuthContext = createContext<any>(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const mapUppercaseObjectPropsToLowercase = (object: any) => {
    const objectCopy: any = object
    let newObject: any = {};
    
    if (!Array.isArray(object)) {
        for (let key in objectCopy) {
            let value = objectCopy[key];
            key = key[0].toLowerCase() + key.slice(1);

            if (typeof(value) == "object" && value != null) {
                value = mapUppercaseObjectPropsToLowercase(value);
            }

            newObject[key] = value;
        }
    } else {
        newObject= [];

        object.forEach((element: any) => {
            newObject[newObject.length] = mapUppercaseObjectPropsToLowercase(element);
        });
    }

    return newObject;
}

export const mapUppercaseObjectPropsToLowercaseArray = (arr: any) => {
    const newArr: any[] = [];

    console.log(arr);

    arr.forEach((element: any) => {
        newArr[newArr.length] = mapUppercaseObjectPropsToLowercase(element);
    });

    return newArr;
}

export function useDidUpdateEffect(fn: Function, inputs: any) {
    const isMountingRef = useRef(false);
  
    useEffect(() => {
      isMountingRef.current = true;
    }, []);
  
    useEffect(() => {
      if (!isMountingRef.current) {
        return fn();
      } else {
        isMountingRef.current = false;
      }
    }, inputs);
}

export const axiosErrorToErrorForMessage = (error: AxiosError) => {
    const newErrorMessage: any = error.response?.data ? error.response?.data : error.response?.statusText ? error.response?.statusText : error.message;

    return new AxiosError(
        newErrorMessage,
        error.code, 
        error.config,
        error.request,
        error.response
    );
}

export const createFormDataFromObject = (object: Object) => {
    const formData = new FormData();

    const objectCopy: any = object

    for (const property in objectCopy) {
        if(Array.isArray(objectCopy[property])) {
            const arr = objectCopy[property];

            arr.forEach((element: any) => {
                formData.append(`${property}`, element);
                
            });
        } else if (objectCopy[property]) {
            formData.append(property, objectCopy[property]);
        }
    }

    return formData;
}

export function useProvideAuth() {
    const [token, setToken] = useState<null | Token>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useAppDispatch();

    const shortTermTokenName = "shortToken";
    const longTermTokenName = "longToken";

    function getNewToken(oldToken: Token) {
        return axios.get(`${serverUrl}/api/auth/getnewtoken`, {"headers": {
                "Authorization": `Bearer ${oldToken.token}`
            }});
    }

    async function tryToAuthorizeOnBegin() {
        const shortTokenFromStorageStr = localStorage.getItem(shortTermTokenName);
        const longTokenFromStorageStr = localStorage.getItem(longTermTokenName);

        let shortTermAuthorized = false;
        let longTermAuthorized = false;

        if (shortTokenFromStorageStr) {
            const shortTokenFromStorage = JSON.parse(shortTokenFromStorageStr);

            if (shortTokenFromStorage.expiresAt >= Date.now) {
                localStorage.removeItem(shortTermTokenName);
                setIsLoading(false);
            } else {
                await getNewToken(shortTokenFromStorage).then((response) => { setToken(response.data); shortTermAuthorized = true }).catch(() => localStorage.removeItem(shortTermTokenName));
            }
        }

        if (longTokenFromStorageStr && !shortTermAuthorized) {
            const longTokenFromStorage = JSON.parse(longTokenFromStorageStr);

            if (longTokenFromStorage.expiresAt >= Date.now) {
                localStorage.removeItem(longTermTokenName);
                setIsLoading(false);
            } else {
                await getNewToken(longTokenFromStorage).then((response) => { setToken(response.data); longTermAuthorized = true }).catch(() => localStorage.removeItem(longTermTokenName));
            }
        }

        if (!longTermAuthorized && !shortTermAuthorized) {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        tryToAuthorizeOnBegin()
    }, []);

    useDidUpdateEffect(() => {
        if (token) {
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
        }

        setIsLoading(false);
    }, [token]);

    useDidUpdateEffect(() => {
        if (token) {
            localStorage.setItem(shortTermTokenName, JSON.stringify(token));
        } else {
            localStorage.removeItem(shortTermTokenName);
        }
    }, [token]);



    useEffect(() => {
        if (token) {
            setTimeout(() => {
                getNewToken(token).then((response) => { setToken(response.data) }).catch(() => { setToken(null) });
            }, 600000);
        }
    }, [token]);

    function saveDataIfCan(data: Array<any> | null) {
        if (data) {
            data.forEach(element => {
                const newElement: TokenWithIsLongTerm = mapUppercaseObjectPropsToLowercase(element);

                if(!newElement.isLongTerm) {
                    setToken({token: newElement.token, expiresAt: newElement.expiresAt});
                } else {
                    localStorage.setItem(longTermTokenName, JSON.stringify({token: newElement.token, expiresAt: newElement.expiresAt}));
                }
            });
        }
    }

    async function examineAuthCode(authCode: string, email: string) {
        if (authCode.length != 6 && email == "") {
            dispatch(setError(new Error("You must fill all of the fields")));
            return false;
        }

        setIsLoading(true);

        if (!await sendRequestWithCatch(axios.post(`${serverUrl}/api/auth/useauthcode/${authCode}`, createFormDataFromObject({email})).then((response) => saveDataIfCan(response.data)), dispatch)) {
            setIsLoading(false);
            return false;
        }

        return true;
    }

    async function resendAuthCode(email: string) {
        if (!email) {
            dispatch(setError(new Error("You must fill all of the fields")));
            return false;
        }

        return await sendRequestWithCatch(axios.post(`${serverUrl}/api/auth/resendauthcode`, createFormDataFromObject({email})), dispatch);
    }

    async function signUp(name: string, password: string, email: string, avatar: File | null, needToRemember30Days: boolean = false) {
        if (!name || !password || !email) {
            dispatch(setError(new Error("You must fill all of the fields except avatar")));
            return false;
        }

        setIsLoading(true);

        if (!await sendRequestWithCatch(axios.post(`${serverUrl}/api/auth/signup`, createFormDataFromObject({userName: name, password, email, needToRemember30Days: needToRemember30Days.toString(), avatar})), dispatch)) {
            setIsLoading(false);
            return false;
        }

        return true;
    }

    async function signIn(email: string, password: string, needToRemember30Days: boolean = false) {
        if (!password || !email) {
            dispatch(setError(new Error("You must fill all of the fields")));
            return false;
        }

        setIsLoading(true);

        if (!await sendRequestWithCatch(axios.post(`${serverUrl}/api/auth/signin`, createFormDataFromObject({password, email, needToRemember30Days: needToRemember30Days.toString()})).then((response) => saveDataIfCan(response.data)), dispatch)) {
            setIsLoading(false);
            return false;
        }

        return true;
    }

    function logout() {
        setToken(null);
        localStorage.removeItem(shortTermTokenName);
        localStorage.removeItem(longTermTokenName);

        dispatch(deactivateSettingsMenu());

        setIsLoading(false);

        return true;
    }

    return {
        token, isAuthorized, isLoading, signIn, signUp, examineAuthCode, resendAuthCode, logout
    }
}