import PlayButton from "../svgElements/PlayButton";
import HeartButton from "../svgElements/HeartButton";
import { useEffect, useState } from "react";
import PauseButton from "../svgElements/PauseButton";
import HeartButtonFilled from "../svgElements/HeartButtonFilled";
import "../css/elements/mainBox.scss"
import "../css/elements/mainMenuLibaryElement.scss";
import "../css/pages/albumPage.scss";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { clearCurrentSong, selectCurrentSong, setCurrentSong, startCurrentSong, stopCurrentSong } from "../slices/currentSongSlice";
import ContentContainer from "../elements/ContentContainer";
import { mapUppercaseObjectPropsToLowercase, useAuth } from "../contexts/AuthContext";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import ErrorMessage from "../elements/ErrorMessage";
import axios from "axios";
import { serverUrl } from "../constants";
import { Disc, Song, timeStampToString } from "./MainPage";
import { setError } from "../slices/errorSlice";
import { createUrlForDbFileCover } from "../elements/SettingsMenuCurrentPage";
import SongListItem from "../elements/SongListItem";
import EditButton from "../svgElements/EditButton";
import { selectUser } from "../slices/userSlice";
import NavigationArrows from "../elements/NavigationArrows";
import { getDiscsForUserLibrary } from "../elements/GlobalWapper";
import { sendRequestWithCatch } from "../elements/MainMenuLibraryArtist";

export function getTotalTimeFromSongs(songs: Array<Song> | null | undefined) {
    let totalTimeSpan = 0;

    if (songs) {
        songs.forEach(element => {
            totalTimeSpan += element.totalTimeInMicroseconds;
        });
    }

    return timeStampToString(totalTimeSpan);
}

export function redirectToArtistPage(artistId: number | undefined, navigate: NavigateFunction) {
    navigate(`/artist/${artistId}`)
}

export function redirectToDiscPage(discId: number | undefined, navigate: NavigateFunction) {
    navigate(`/disc/${discId}`)
}

export default function DiscPage() {
    const [likeIsActive, setLikeIsActive] = useState(false);

    const [disc, setDisc] = useState<Disc | null>(null);

    const currentSong = useAppSelector(selectCurrentSong);
    const userInfo = useAppSelector(selectUser);
    const dispatch = useAppDispatch();

    const navigate = useNavigate();

    const {isAuthorized, isLoading, token} = useAuth();

    const { discId } = useParams();

    useEffect(() => {
        if (!isAuthorized && !isLoading) {
            navigate("/auth/signin");
        }
    }, [isAuthorized, isLoading]);

    function playAlbumOrStop() {
        if (currentSong?.songs[currentSong.currentSongIndex].disc?.artistId == discId) {
            if (currentSong?.isPlaying) {
                dispatch(stopCurrentSong());
            } else {
                dispatch(startCurrentSong());
            }
        } else {
            dispatch(disc?.songs ? setCurrentSong({songs: queueSongs, isPlaying: true, currentSongIndex: 0}) : clearCurrentSong());
        }
    }

    const getDisc = async () => {
        return await sendRequestWithCatch(axios.get(`${serverUrl}/api/discs/getdisc/${discId}`).then(resp => setDisc(mapUppercaseObjectPropsToLowercase(resp.data))), dispatch);
    }

    useEffect(() => {
        if (isAuthorized) {
            axios.get(`${serverUrl}/api/follow/disc/${discId}`, {
                headers: {
                    Authorization: `Bearer ${token.token}`
                }
            }).then(resp => setLikeIsActive(resp.data));
        }
    }, [isAuthorized]);

    useEffect(() => {
        getDisc();
    }, []);

    console.log(disc);

    async function toggleFollowDisc() {
        if (!await sendRequestWithCatch(axios.get(`${serverUrl}/api/follow/disc/toggle/${discId}`, {
            headers: {
                Authorization: `Bearer ${token.token}`
            }
        }).then((response) => setLikeIsActive(response.data)), dispatch)) {
            return false;
        }

        getDiscsForUserLibrary(token.token, dispatch);

        return true;
    } 

    const queueSongs: Song[] = []
    
    disc?.songs?.forEach((element, i) => {
        queueSongs[i] = {...element, disc: {...disc, songs: null}};
    });

    const discSongsJsx = disc?.songs?.map((val, i) => <SongListItem queue={queueSongs} indexinAlbumArray={i} needToShowCover={false} needToShowArtist={true} />)

    return (
        <ContentContainer>
            <div className="flex flex-col h-full">
                <NavigationArrows />
                <hr className="border-styleColor-200" />
                <div className="my-4 h-64 w-full flex items-center">
                    <img className="mx-8 w-60 h-60 rounded-md object-cover" src={createUrlForDbFileCover(disc?.cover)} />
                    <div className="flex items-end h-60">
                        <div className="flex flex-col items-start">
                            <p>{disc?.songs && disc.songs.length > 1 ? "Album" : "Single"}</p>
                            <h1 className="text-3xl font-extrabold mb-4">{disc?.name}</h1>
                            <div className="flex items-center">
                                <p className="link-text" onClick={() => redirectToArtistPage(disc?.artistId, navigate)}>{disc?.artist?.name}</p>
                                <p className="link-text-raw mx-1">-</p>
                                <p className="link-text-raw">{disc ? new Date(disc.createdAt).getFullYear() : null}</p>
                                <p className="link-text-raw mx-1">-</p>
                                <p className="link-text-raw">{`${disc?.songs?.length} songs, ${getTotalTimeFromSongs(disc?.songs)}`}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <hr className="border-styleColor-300" />
                <div className="flex gap-8 items-center py-2 bg-styleColor-100">
                    <div className="ml-4 h-14" onClick={playAlbumOrStop}>
                        {currentSong?.songs[currentSong.currentSongIndex]?.discId == discId && currentSong?.isPlaying ? <PauseButton /> : <PlayButton />}
                    </div>
                    <div className="h-8" onClick={toggleFollowDisc}>
                        {likeIsActive ? <HeartButtonFilled /> : <HeartButton />}
                    </div>
                    {disc?.artistId == userInfo?.id ? 
                    <div className="flex-1 flex items-center justify-end mr-4">
                        <div className="h-8 w-8" onClick={() => navigate(`/update/disc/${discId}`)}>
                            <EditButton />
                        </div>
                    </div> : 
                    null
                    }
                </div>
                <hr className="border-styleColor-300" />
                <div className="bg-styleColor-100 flex-1 flex flex-col rounded-b-md overflow-auto">
                    <div className="flex-1 flex flex-col rounded-b-md scroll-auto">
                        {discSongsJsx}
                    </div>
                </div>
                <ErrorMessage moveStyles={null} />
            </div>
        </ContentContainer>
    );
}