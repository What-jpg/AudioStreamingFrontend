import { useEffect, useRef, useState } from "react";
import SettingsMenu from "../elements/SettingsMenu";
import Reload from "../svgElements/Reload";
import { useNavigate, useParams } from "react-router-dom";
import { axiosErrorToErrorForMessage, useAuth } from "../contexts/AuthContext";
import ErrorMessage from "../elements/ErrorMessage";
import { AxiosError } from "axios";

export default function AuthCodePage() {
    const [inputValue0, setInputsValue0] = useState("");
    const [inputValue1, setInputsValue1] = useState("");
    const [inputValue2, setInputsValue2] = useState("");
    const [inputValue3, setInputsValue3] = useState("");
    const [inputValue4, setInputsValue4] = useState("");
    const [inputValue5, setInputsValue5] = useState("");

    const navigate = useNavigate()

    const { examineAuthCode, resendAuthCode, isAuthorized, isLoading} = useAuth();

    useEffect(() => {
        if (isAuthorized && !isLoading) {
            navigate("/");
        }
    }, [isAuthorized, isLoading]);

    const { email } = useParams();

    const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

    const allInputValues = [inputValue0, inputValue1, inputValue2, inputValue3, inputValue4, inputValue5];

    useEffect(() => {
        const inputsValues = inputValue0 + inputValue1 + inputValue2 + inputValue3 + inputValue4 + inputValue5;

        if (inputsValues.length == 6) {
            examineCodeContainer(inputsValues);
        }
    }, allInputValues);

    function changeInputsValue(inputIndex: number, value: string) {
        const fixedValue = value.replace(/[^0-9.]/g, '');
        
        if (fixedValue.length <= 1) {
            switch (inputIndex) {
                case 0:
                    setInputsValue0(fixedValue);
                    break;
            
                case 1:
                    setInputsValue1(fixedValue);
                    break;

                case 2:
                    setInputsValue2(fixedValue);
                    break;

                case 3:
                    setInputsValue3(fixedValue);
                    break;

                case 4:
                    setInputsValue4(fixedValue);
                    break;
            
                case 5:
                    setInputsValue5(fixedValue);
                    break;

            }

            if (fixedValue.length == 1 && inputIndex != 7) {
                const inputRef = inputRefs[inputIndex + 1].current;
                inputRef?.focus();
            }
        }
    }

    function deleteCharacter(e: React.KeyboardEvent<HTMLInputElement>, inputIndex: number, inputValue: string) {
        const pressedKey = e.key;

        if(pressedKey == "Backspace") {
            if (inputValue.length == 0 && inputIndex != 0) {
                const inputRef = inputRefs[inputIndex - 1].current;
                inputRef?.focus();
            } else if (inputValue.length == 1) {
                switch (inputIndex) {
                    case 0:
                        setInputsValue0("");
                        break;
                
                    case 1:
                        setInputsValue1("");
                        break;
    
                    case 2:
                        setInputsValue2("");
                        break;

                    case 3:
                        setInputsValue3("");
                        break;
                    
                    case 4:
                        setInputsValue4("");
                        break;
                
                    case 5:
                        setInputsValue5("");
                        break;
                }
            }
        }
    }

    function mapInputs(lastInputIndex: number) {
        let jsxElementsArray = [];

        for (let index = 0; index <= lastInputIndex; index++) {
            jsxElementsArray[index] = <input className="w-14 h-14 rounded-md border-styleColor-300 text-center text-3xl" onKeyDown={(e) => deleteCharacter(e, index, allInputValues[index])} value={allInputValues[index]} ref={inputRefs[index]} onChange={(e) => changeInputsValue(index, e.target.value)} />
        }

        return jsxElementsArray
    }

    async function resendCodeContainer() {
        await resendAuthCode(email);
    }

    async function examineCodeContainer(code: string) {
            const completed = await examineAuthCode(code, email);

            if (completed) {
                navigate("/");
            }
    }

    if (email) {
        return (
            <>
                <div className="screen-container">
                    <div className="flex flex-col items-center justify-center rounded-md border p-4 border-styleColor-300 bg-styleColor-50">
                        <div className="flex gap-2 mb-3">
                            {mapInputs(5)}
                        </div>
                        <div className="flex items-start w-full gap-1 justify-center">
                            <div className="flex flex-col items-center justify-center w-2/3">
                                <button className="border border-styleColor-300 bg-styleColor-200 rounded-md flex justify-center items-center text-styleColor-700 w-full" onClick={resendCodeContainer} ><div className="h-4 w-4 mr-1"><Reload /></div>Resend code</button>
                            </div>
                        </div>
                    </div>
                </div>
                <ErrorMessage moveStyles={null} />
                <SettingsMenu />
            </>
        )
    } else {
        return <></>
    }
}