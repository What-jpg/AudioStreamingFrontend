import { useEffect, useState } from "react";
import "../css/elements/mainBox.scss"
import "../css/elements/mainMenuLibaryElement.scss";
import "../css/pages/albumPage.scss";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import ContentContainer from "../jsxElements/ContentContainer";
import { createFormDataFromObject, mapUppercaseObjectPropsToLowercase, useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import ErrorMessage from "../jsxElements/ErrorMessage";
import axios, { AxiosError } from "axios";
import { serverUrl } from "../constants";
import { Disc } from "./MainPage";
import { setError } from "../slices/errorSlice";
import { convertDbFileToBlob, createUrlForCover, createUrlForDbFileCover } from "../jsxElements/SettingsMenuCurrentPage";
import { selectUser } from "../slices/userSlice";
import { CreateSongInfo } from "./NewDiscPage";
import SongListItemUpdate, { DisplaySongInfo } from "../jsxElements/SongListItemUpdate";
import Trash from "../svgElements/Trash";
import { redirectToDiscPage } from "./DiscPage";
import NavigationArrows from "../jsxElements/NavigationArrows";
import { sendRequestWithCatch } from "../jsxElements/MainMenuLibraryArtist";

export interface EditSongInfoWithId {
    id: number;
    name: string; 
}

export default function EditDiscPage() {
    const [updateSongs, setUpdateSongs] = useState<EditSongInfoWithId[]>([]);
    const [deleteSongs, setDeleteSongs] = useState<number[]>([]);
    const [newSongs, setNewSongs] = useState<CreateSongInfo[]>([]);
    const [displaySongs, setDisplaySongs] = useState<DisplaySongInfo[]>([])
    const [disc, setDisc] = useState<null | Disc>(null);
    const [newDiscCover, setNewDiscCover] = useState<null | Blob>(null);
    const [displayDiscCover, setDisplayDiscCover] = useState<null | Blob>(null);
    const [urlDiscCover, setUrlDiscCover] = useState(createUrlForDbFileCover(null))
    const [newDiscName, setNewDiscName] = useState<string | null>(null);
    const [displayDiscName, setDisplayDiscName] = useState("");
    const [discCoverChanged, setDiscCoverChanged] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    
    const userInfo = useAppSelector(selectUser)
    const dispatch = useAppDispatch();

    const navigate = useNavigate();

    const { discId } = useParams();

    const {isAuthorized, isLoading, token} = useAuth();

    useEffect(() => {
        getDisc();
    }, []);

    useEffect(() => {
        if (disc) {
            setDisplayDiscName(disc.name);
            setDisplayDiscCover(convertDbFileToBlob(disc.cover));
            setUrlDiscCover(createUrlForDbFileCover(disc.cover));

            if (disc.songs) {
                setDisplaySongs(disc.songs.map((e) => {return {id: e.id, indexInCreateList: null}}));
            }
        }
    }, [disc, isAuthorized]);

    useEffect(() => {
        if (isAuthorized && disc && userInfo && disc.artistId != userInfo.id) {

            navigate("/");
        }
    }, [isAuthorized, disc, userInfo])
    
    useEffect(() => {
        if (newDiscName) {
            setDisplayDiscName(newDiscName);
        }
        
    }, [newDiscName]);

    useEffect(() => {
        setUrlDiscCover(createUrlForCover(newDiscCover));
    }, [newDiscCover]);


    useEffect(() => {
        if (!isAuthorized && !isLoading) {
            navigate("/auth/signin");
        }
    }, [isAuthorized, isLoading]);

    let discSongsJsx = null;

    if (disc && disc.songs != null) {
        const discSongs = disc.songs
        discSongsJsx = displaySongs.map((val, i) => <SongListItemUpdate 
            indexinAlbumArray={i} 
            currentSongsList={discSongs} 
            displaySongsList={displaySongs} 
            setDisplaySongsList={setDisplaySongs} 
            createSongsList={newSongs} 
            setCreateSongsList={setNewSongs} 
            changeSongsList={updateSongs}
            setChangeSongsList={setUpdateSongs}
            deleteSongsList={deleteSongs}
            setDeleteSongsList={setDeleteSongs}
        />)
    }

    const getDisc = async () => {
        return await sendRequestWithCatch(axios.get(`${serverUrl}/api/discs/getdisc/${discId}`).then(resp => setDisc(mapUppercaseObjectPropsToLowercase(resp.data))), dispatch);
    }

    async function deleteDisc() {
        if (isAuthorized) {
            try {
                let error: any = null;
        
                await axios.delete(`${serverUrl}/api/delete/disc/${discId}`, {
                    headers: {
                        Authorization: `Bearer ${token.token}`,
                    },
                    data: createFormDataFromObject({currentPassword}),
                }
                ).then(resp => navigate("/")).catch(ex => error = ex);
        
                if (error) {
                    throw error;
                }
        
                return true;
            } catch(ex: any) {
                if (ex.response) {
                    ex.response.data = `Stopped at deleting the song: ${ex.response.data}`;
                } else {
                    ex.message = `Stopped at deleting the song: ${ex.message}`;
                }

                dispatch(setError(ex));
        
                return false;
            }
        }
    }

    async function changeDisc() {
        if (isAuthorized) {
            if (newDiscName || discCoverChanged) {
                console.log("HAHA");
                try {
                    let error: any = null;

                    if (newDiscName != "") {
                        await axios.put(`${serverUrl}/api/update/updatediscinfo/${discId}`, createFormDataFromObject({currentPassword, newName: newDiscName, newCover: newDiscCover, needNewCover: discCoverChanged}), {
                            headers: {
                                Authorization: `Bearer ${token.token}`,
                            }
                        }
                        ).catch(ex => error = ex);
                    } else {
                        const axiosError = new AxiosError();

                        axiosError.message = "Disc Name musn't be empty";
                    }
            
                    if (error) {
                        throw error
                    }
            
                } catch(ex: any) {
                    if (ex.response) {
                        ex.response.data = `Stopped at changing the disc main info: ${ex.response.data}`;
                    } else {
                        ex.message = `Stopped at changing the disc main info: ${ex.message}`;
                    }

                    dispatch(setError(ex));

                    return false;
                }
            }

            for (const e of updateSongs) {
                if (e.name != "") {
                    if (!(await changeSong(e.id, e.name))) {
                        return false;
                    }
                }
            };

            for (const e of deleteSongs) {
                if (!(await deleteSong(e))) {
                    return false;
                }
            };

            for (const e of newSongs) {
                if (!(await addSong(e.name, e.file))) {
                    return false;
                }
            };

            redirectToDiscPage(disc?.id, navigate)

            return true;
        }
    }

    async function changeSong(songId: number, songName: string) {
        if (isAuthorized) {
            try {
                let error: any = null;

                if (songName != "") {
                    await axios.put(`${serverUrl}/api/update/updatesonginfo/${songId}`, createFormDataFromObject({newName: songName, currentPassword}), {
                        headers: {
                            Authorization: `Bearer ${token.token}`,
                        }
                    }
                    ).catch(ex => error = ex);
                } else {
                    const axiosError = new AxiosError();

                    axiosError.message = "Song names musn't be empty";
                }
        
                if (error) {
                    throw error;
                }
        
                return true;
            } catch(ex: any) {
                if (ex.response) {
                    ex.response.data = `Stopped at changing the song: ${ex.response.data}`;
                } else {
                    ex.message = `Stopped at changing the song: ${ex.message}`;
                }

                dispatch(setError(ex));
        
                return false;
            }
        }
    }

    async function deleteSong(songId: number) {
        if (isAuthorized) {
            try {
                let error: any = null;
        
                await axios.delete(`${serverUrl}/api/delete/song/${songId}`, {
                    headers: {
                        Authorization: `Bearer ${token.token}`,
                    },
                    data: createFormDataFromObject({currentPassword}),
                }
                ).catch(ex => error = ex);
        
                if (error) {
                    throw error;
                }
        
                return true;
            } catch(ex: any) {
                if (ex.response) {
                    ex.response.data = `Stopped at deleting the song: ${ex.response.data}`;
                } else {
                    ex.message = `Stopped at deleting the song: ${ex.message}`;
                }

                dispatch(setError(ex));
        
                return false;
            }
        }
    }

    async function addSong(songName: string, songFile: Blob | null) {
        if (isAuthorized) {
            try {
                let error: any = null;

                if (songName != "" && songFile != null) {
                    await axios.post(`${serverUrl}/api/create/song`, createFormDataFromObject({discId: discId, name: songName, song: songFile}), {
                        headers: {
                            Authorization: `Bearer ${token.token}`,
                        }
                    }
                    ).catch(ex => error = ex);
                } else {
                    const axiosError = new AxiosError();

                    axiosError.message = "All of the songs must include names and files";
                }
        
                if (error) {
                    throw error
                }
        
                return true;
            } catch(ex: any) {
                if (ex.response) {
                    ex.response.data = `Stopped at adding the song: ${ex.response.data}`;
                } else {
                    ex.message = `Stopped at adding the song: ${ex.message}`;
                }

                dispatch(setError(ex));
        
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
                            <input type="file" className="hidden" onChange={(e) => {setNewDiscCover(e.target.files ? e.target.files.item(0) : null ); setDisplayDiscCover(e.target.files ? e.target.files.item(0) : null); setDiscCoverChanged(true); e.target.value = ""}}/>
                            <img className="mx-8 w-60 h-60 rounded-md object-cover" src={urlDiscCover} />
                            {displayDiscCover ? <button className="text-sm mt-2 p-1 bg-styleColor-400 text-white rounded w-1/3" onClick={(e) => {setNewDiscCover(null); setDisplayDiscCover(null); setUrlDiscCover(createUrlForCover(null)); setDiscCoverChanged(true); e.stopPropagation(); e.preventDefault()}}>Clear chosen</button> : null}
                        </label>
                    </div>
                    <div className="flex items-end h-60 flex-1">
                        <div className="flex flex-col items-start flex-1">
                            <h1 className="text-xl mb-1 font-medium">Update Album</h1>
                            <input className="border-styleColor-300 rounded-md w-1/2" value={displayDiscName} onChange={(e) => {setNewDiscName(e.target.value)}} placeholder="Album name"/>
                        </div>
                    </div>
                </div>
                <hr className="border-styleColor-300" />
                <div className="bg-styleColor-100 flex-1 flex flex-col rounded-b-md overflow-auto">
                    <div className="flex-1 flex flex-col rounded-b-md scroll-auto">
                        {discSongsJsx}
                        <button onClick={() => {setNewSongs([...newSongs, {name: "", file: null}]); setDisplaySongs([...displaySongs, {id: null, indexInCreateList: newSongs.length}])}} className="rounded-md bg-styleColor-50 border-styleColor-300 border h-7 w-7 flex items-center justify-center text-xl ml-2 mt-1">
                            +
                        </button>
                    </div>
                </div>
                <hr className="border-styleColor-300" />
                <div className="w-full bg-styleColor-50 flex items-center justify-between p-2">
                    <div className="flex items-center">
                        <button onClick={changeDisc} className="bg-styleColor-700 text-white rounded-md py-1 px-8 h-fit mr-1">Update</button>
                        <div className="h-min rounded-md mr-1 border-styleColor-300 border">
                            <input className="h-min rounded-md border-styleColor-300 border-0" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" type="password" />
                        </div>
                        <button onClick={deleteDisc} className="w-7 h-7"><Trash /></button>
                    </div>
                    <button onClick={() => redirectToDiscPage(disc?.id ? disc.id : 1, navigate)} className="bg-styleColor-500 text-white rounded-md py-1 px-8 h-fit">Cancel</button>
                </div>
                <ErrorMessage moveStyles={null} />
            </div>
        </ContentContainer>
    );
}