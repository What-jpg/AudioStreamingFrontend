import { useEffect, useState } from "react";
import Play from "../svgElements/Play";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import Pause from "../svgElements/Pause";
import HeartButtonFilled from "../svgElements/HeartButtonFilled";
import HeartButton from "../svgElements/HeartButton";
import { selectCurrentSong, setCurrentSong, stopCurrentSong, startCurrentSong } from "../slices/currentSongSlice";
import "../css/svgElements/playButton.scss";
import AudioWave from "../svgElements/AudioWave";
import { Song, timeStampToString } from "../pages/MainPage";
import { createUrlForDbFileCover } from "./SettingsMenuCurrentPage";
import { useNavigate } from "react-router-dom";
import { redirectToArtistPage } from "../pages/DiscPage";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { serverUrl } from "../constants";
import { setError } from "../slices/errorSlice";
import { getSongsForUserLibrary } from "./GlobalWapper";
import { sendRequestWithCatch } from "./MainMenuLibraryArtist";

interface SongListItem {
    indexinAlbumArray: number;
    needToShowCover: boolean;
    needToShowArtist: boolean;
    queue: Song[];
}

export default function SongListItem({indexinAlbumArray, needToShowCover, needToShowArtist, queue}: SongListItem) {
    const [currentlyHovered, setCurrentlyHovered] = useState(false);
    const [liked, setLiked] = useState(false)

    const { token, isAuthorized } = useAuth();

    const currentSong = useAppSelector(selectCurrentSong);
    const dispatch = useAppDispatch();

    const navigate = useNavigate();

    function stopTheSong(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        dispatch(stopCurrentSong());
        e.stopPropagation();
    }

    function startTheSong(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        dispatch(startCurrentSong());
        e.stopPropagation();
    }

    function albumListItemNumber() {
        if (currentlyHovered) {
            if (currentSong?.songs[currentSong.currentSongIndex].id == queue[indexinAlbumArray].id) {
                if (currentSong?.isPlaying) {
                    return <div className="h-4 w-4 play-button" onClick={(e) => stopTheSong(e)}><Pause /></div>;
                } else {
                    return <div className="h-4 w-4 play-button" onClick={(e) => startTheSong(e)}><Play /></div>
                }
            } else {
                return <div className="h-4 w-4"><Play /></div>;
            }
        } else {
            if (currentSong?.songs[currentSong.currentSongIndex].id == queue[indexinAlbumArray].id) {
                if (currentSong?.isPlaying) {
                    return <div className="w-3/4"><AudioWave /></div>;
                } else {
                    return <div className="text-styleColor-500">{indexinAlbumArray + 1}</div>;
                }
            } else {
                return indexinAlbumArray + 1;
            }
        }
    }

    useEffect(() => {
        if (isAuthorized) {
            axios.get(`${serverUrl}/api/follow/song/${queue[indexinAlbumArray].id}`, {
                headers: {
                    Authorization: `Bearer ${token.token}`
                }
            }).then(resp => setLiked(resp.data));
        }
    }, [isAuthorized]);

    async function toggleFollowSong(e: Event | any) {
        e.stopPropagation();

        if (!await sendRequestWithCatch(axios.get(`${serverUrl}/api/follow/song/toggle/${queue[indexinAlbumArray].id}`, {
            headers: {
                Authorization: `Bearer ${token.token}`
            }
        }).then((response) => setLiked(response.data)), dispatch)) {
            return false;
        }

        getSongsForUserLibrary(token.token, dispatch);

        return true;
    } 
    
    return (
        <div className={`album-list-item ${currentlyHovered ? "album-list-item-active" : ""}`} onClick={() => dispatch(setCurrentSong({currentSongIndex: indexinAlbumArray, isPlaying: true, songs: queue}))} onMouseOver={() => setCurrentlyHovered(true)} onMouseOut={() => setCurrentlyHovered(false)}>
            <div className="album-list-item-number-box">
                <p className="album-list-item-number">
                    {albumListItemNumber()}
                </p>
            </div>
            { needToShowCover ?
                <div className="album-list-item-cover-box py-1">
                    <img src={createUrlForDbFileCover(queue[indexinAlbumArray].disc?.cover)} className="album-list-item-cover" alt="" />
                </div> :
                null
                }
            <div>
                <p className={`album-list-item-name ${currentSong?.songs[currentSong.currentSongIndex].id == queue[indexinAlbumArray].id ? "text-styleColor-500" : ""}`}>
                    {queue[indexinAlbumArray].name}
                </p>
                <div className="flex items-start">
                    {needToShowArtist ? 
                        <>
                        <p className="link-text" onClick={() => redirectToArtistPage(queue[indexinAlbumArray].disc?.artistId, navigate)}>{queue[indexinAlbumArray].disc?.artist?.name}</p>
                        <p className="link-text-raw mx-1">-</p>
                        </> :
                        null
                    }
                    <p className="link-text-raw">{timeStampToString(queue[indexinAlbumArray].totalTimeInMicroseconds)}</p>
                </div>
            </div>
            <div className="flex-1 flex justify-end mr-8" onClick={(e) => toggleFollowSong(e)}>
                {currentlyHovered ?
                    liked ? <div className="h-5 w-5"><HeartButtonFilled /></div> : <div className="h-5 w-5"><HeartButton /></div> :
                    null}
            </div>
        </div>
    )
}