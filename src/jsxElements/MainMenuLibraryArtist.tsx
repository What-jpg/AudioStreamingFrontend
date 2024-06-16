import axios from "axios";
import { useAppDispatch } from "../app/hooks";
import { useAuth } from "../contexts/AuthContext";
import "../css/elements/mainMenuLibaryElement.scss";
import Trash from "../svgElements/Trash";
import { serverUrl } from "../constants";
import { setError } from "../slices/errorSlice";
import { createUrlForDbFileAvatar } from "./SettingsMenuCurrentPage";
import { useNavigate } from "react-router-dom";
import { redirectToArtistPage } from "../pages/DiscPage";
import { useRef, useState } from "react";

interface MainMenuLibraryArtist {
    index: number;
    arr: any[];
    setArr: Function;
}

export async function sendRequestWithCatch(reqPromise: Promise<any>, dispatch: any) {
    let error: any = null;

        await reqPromise.catch((ex: any) => error = ex);

        if (error) {
            dispatch(setError(error));

            return false;
        }

        return true;
}

export default function MainMenuLibraryArtistElement({index, arr, setArr}: MainMenuLibraryArtist) {
    const element = arr[index];

    const artistAvatarUrl = useRef(createUrlForDbFileAvatar(element.avatar));

    const navigate = useNavigate();

    const name = element.name;
    const id = element.id;

    const dispatch = useAppDispatch();

    const { token } = useAuth();
    
    let fontSize = 20;

    for (let index = 0; index < name.length; index++) {
        fontSize = fontSize * 0.99;
    }
    
    async function toggleFollowElement(e: any) {
        e.preventDefault();

        return await sendRequestWithCatch(axios.get(`${serverUrl}/api/follow/artist/toggle/${id}`, {
            headers: {
                Authorization: `Bearer ${token.token}`
            }
        }).then(() => setArr(arr.filter((e) => e.id != id))), dispatch);
    } 

    return (
        <div className="main-menu-libary-element" onClick={() => redirectToArtistPage(id, navigate)}>
            <img className="rounded-full mx-3 h-12 w-12 object-cover" src={artistAvatarUrl.current} />
            <div className="flex-1 text-left">
                <h2 style={{fontSize: `${fontSize}px`}} className="text-md">{name}</h2>
            </div>
            <div className="mx-3 h-6" onClick={(e) => toggleFollowElement(e)}><Trash /></div>
        </div>
    );
}