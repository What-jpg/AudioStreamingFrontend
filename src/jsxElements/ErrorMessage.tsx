import { useEffect, useState } from "react";
import "../css/main.scss";
import Cross from "../svgElements/Cross";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { clearError, selectError } from "../slices/errorSlice";

interface ErrorMessage {
    moveStyles: string | null | undefined
}

export default function ErrorMessage({moveStyles}: ErrorMessage) {
    const [timeoutId, setTimeoutId] = useState<null | NodeJS.Timeout>(null);
    const dispatch = useAppDispatch();
    const error = useAppSelector(selectError);
    const text = error.value?.message;

    useEffect(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        if (text) {
            setTimeoutId(setTimeout(() => {
                dispatch(clearError());
            }, 10000));
        }
    }, [text]);
    
    return (
        text 
        ? 
        <div className={`flex top-12 fixed justify-between bg-styleColor-50 border-styleColor-300 rounded-md w-1/5 h-16 shadow-md mx-auto inset-x-0 items-center ${moveStyles}`}>
            <div className="flex ml-2 items-center">
                <p className="mr-2 p-1 bg-styleColor-200 text-styleColor-500 text-lg rounded shadow-md font-bold">Error</p>
                <div>{text}</div>
            </div>
            <Cross changeState={() => dispatch(clearError())} />
        </div>
        :
        null
    );
}