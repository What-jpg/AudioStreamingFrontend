import axios from "axios";
import "../css/elements/mainMenuLibaryElement.scss";
import Trash from "../svgElements/Trash";
import { useAppDispatch } from "../app/hooks";
import { useAuth } from "../contexts/AuthContext";
import { serverUrl } from "../constants";
import { setError } from "../slices/errorSlice";
import { createUrlForDbFileCover } from "./SettingsMenuCurrentPage";
import { useNavigate } from "react-router-dom";
import { redirectToDiscPage } from "../pages/DiscPage";
import { setCurrentSong } from "../slices/currentSongSlice";
import { useRef } from "react";
import { sendRequestWithCatch } from "./MainMenuLibraryArtist";

interface MainMenuLibraryAlbumOrSongElement {
    index: number;
    albumOrSong: string;
    arr: any[];
    setArr: Function;
}

export default function MainMenuLibraryAlbumOrSongElement({index, albumOrSong, arr, setArr}: MainMenuLibraryAlbumOrSongElement) {
    const element = arr[index];

    const discCoverUrl = useRef(createUrlForDbFileCover(albumOrSong == "song" ? element.disc?.cover : element?.cover));

    const navigate = useNavigate();

    const name = element?.name;
    const id = element?.id;
    const artist = albumOrSong == "song" ? element.disc?.artist : element.artist;

    const dispatch = useAppDispatch();

    const { token } = useAuth();

    let fontSize = 20;

    for (let index = 0; index < name.length; index++) {
        fontSize = fontSize * 0.99;
    }
    
    async function toggleFollowElement(e: any) {
        e.preventDefault();

        return await sendRequestWithCatch(axios.get(`${serverUrl}/api/follow/${albumOrSong == "song" ? "song" : "disc"}/toggle/${id}`, {
            headers: {
                Authorization: `Bearer ${token.token}`
            }
        }).then(() => setArr(arr.filter((e) => e.id != id))), dispatch);
    } 

    return (
        <div className="main-menu-libary-element" onClick={albumOrSong == "album" ? () => redirectToDiscPage(id, navigate) : () => dispatch(setCurrentSong({songs: [element], currentSongIndex: 0, isPlaying: true}))}>
            <img className="rounded-md mx-3 h-12 w-12 object-cover" src={discCoverUrl.current} />
            <div className="flex-1 text-left">
                <h2 style={{fontSize: `${fontSize}px`}} className="text-md">{name}</h2>
                <div className="flex items-center">
                    <p onClick={albumOrSong == "album" ? () => null : (e) => {redirectToDiscPage(element?.discId, navigate); e.stopPropagation(); console.log("redirecting")}} className={albumOrSong == "album" ? `link-text-raw` : `link-text`}>{albumOrSong == "album" ? "Album" : element?.disc?.name}</p>
                    <p className="link-text-raw mx-1">-</p>
                    <p className="link-text">{artist?.name ? artist?.name : ""}</p>
                </div>
            </div>
            <div className="mx-3 h-6" onClick={(e) => toggleFollowElement(e)}><Trash /></div>
        </div>
    );
}