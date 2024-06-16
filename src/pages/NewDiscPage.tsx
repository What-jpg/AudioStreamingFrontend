import { useEffect, useState } from "react";
import "../css/elements/mainBox.scss"
import "../css/elements/mainMenuLibaryElement.scss";
import "../css/pages/albumPage.scss";
import { useAppDispatch } from "../app/hooks";
import ContentContainer from "../jsxElements/ContentContainer";
import { createFormDataFromObject, useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../jsxElements/ErrorMessage";
import axios, { AxiosError } from "axios";
import { serverUrl } from "../constants";
import { setError } from "../slices/errorSlice";
import { createUrlForCover } from "../jsxElements/SettingsMenuCurrentPage";
import SongListItemCreate from "../jsxElements/SongListItemCreate";
import { redirectToDiscPage } from "./DiscPage";
import NavigationArrows from "../jsxElements/NavigationArrows";
import { sendRequestWithCatch } from "../jsxElements/MainMenuLibraryArtist";

export interface CreateSongInfo {
    name: string; 
    file: Blob | null;
}

export default function NewDiscPage() {
    const [newSongs, setNewSongs] = useState<CreateSongInfo[]>([]);
    const [discCover, setDiscCover] = useState<null | Blob>(null);
    const [discName, setDiscName] = useState("");
    const dispatch = useAppDispatch();

    const navigate = useNavigate();

    const {isAuthorized, isLoading, token} = useAuth();

    useEffect(() => {
        if (!isAuthorized && !isLoading) {
            navigate("/auth/signin");
        }
    }, [isAuthorized, isLoading]);

    const discSongsJsx = newSongs.map((val, i) => <SongListItemCreate indexinAlbumArray={i} songsList={newSongs} setSongsList={setNewSongs} />);

    async function createDisc() {
        if (isAuthorized) {
            if (!newSongs.map((element) => element.file).includes(null) && !newSongs.map((element) => element.name).includes("")) {
                return await sendRequestWithCatch(axios.post(`${serverUrl}/api/create/disc`, createFormDataFromObject({name: discName, cover: discCover, songNames: newSongs.map((element) => element.name), songs: newSongs.map((element) => element.file)}), {
                    headers: {
                        Authorization: `Bearer ${token.token}`,
                    }
                }
                ).then(resp => redirectToDiscPage(resp.data, navigate)), dispatch);
            } else {
                const axiosError = new AxiosError();

                axiosError.message = "All of the songs must include names and files";

                dispatch(setError(axiosError));

                return false;
            }
        }
    }

    return (
        <ContentContainer>
            <div className="flex flex-col h-full">
                <NavigationArrows />
                <hr className="border-styleColor-200" />
                <div className="my-4 h-64 w-full flex items-center">
                    <div className="flex flex-col items-center">
                        <label className="flex-1 flex flex-col items-center">
                            <input type="file" className="hidden" onChange={(e) => {setDiscCover(e.target.files ? e.target.files.item(0) : null ); e.target.value = ""}}/>
                            <img className="mx-8 w-60 h-60 rounded-md object-cover" src={createUrlForCover(discCover)} />
                            {discCover ? <button className="text-sm mt-2 p-1 bg-styleColor-400 text-white rounded w-1/3" onClick={(e) => {setDiscCover(null); e.stopPropagation(); e.preventDefault()}}>Clear chosen</button> : null}
                        </label>
                    </div>
                    <div className="flex items-end h-60 flex-1">
                        <div className="flex flex-col items-start flex-1">
                            <h1 className="text-xl mb-1 font-medium">Create Album</h1>
                            <input className="border-styleColor-300 rounded-md w-1/2" value={discName} onChange={(e) => setDiscName(e.target.value)} placeholder="Album name"/>
                        </div>
                    </div>
                </div>
                <hr className="border-styleColor-300" />
                <div className="bg-styleColor-100 flex-1 flex flex-col rounded-b-md overflow-auto">
                    <div className="flex-1 flex flex-col rounded-b-md scroll-auto">
                        {discSongsJsx}
                        <button onClick={() => setNewSongs([...newSongs, {name: "", file: null}])} className="rounded-md bg-styleColor-50 border-styleColor-300 border h-7 w-7 flex items-center justify-center text-xl ml-2 mt-1">
                            +
                        </button>
                    </div>
                </div>
                <hr className="border-styleColor-300" />
                <div className="w-full bg-styleColor-50 flex items-center justify-between gap-6 p-2">
                    <button onClick={createDisc} className="bg-styleColor-700 text-white rounded-md py-1 px-8 h-fit">Create</button>
                    <button onClick={() => navigate("/")} className="bg-styleColor-500 text-white rounded-md py-1 px-8 h-fit">Cancel</button>
                </div>
                <ErrorMessage moveStyles={null} />
            </div>
        </ContentContainer>
    );
}