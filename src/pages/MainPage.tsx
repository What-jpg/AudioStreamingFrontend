import { NavigateFunction, useNavigate } from "react-router-dom";
import { mapUppercaseObjectPropsToLowercase, useAuth } from "../contexts/AuthContext";
import PlayForSong from "../svgElements/PlayForSong";
import { useEffect, useRef, useState } from "react";
import ErrorMessage from "../jsxElements/ErrorMessage";
import { DbFileStr } from "../slices/userSlice";
import { hours, milliseconds, minutes, seconds } from "../functions/timeSpan";
import { createUrlForDbFileAvatar, createUrlForDbFileCover } from "../jsxElements/SettingsMenuCurrentPage";
import { serverUrl } from "../constants";
import axios from "axios";
import { useAppDispatch } from "../app/hooks";
import { redirectToArtistPage, redirectToDiscPage } from "./DiscPage";
import { AppDispatch } from "../app/store";
import { setCurrentSong } from "../slices/currentSongSlice";
import ContentContainer from "../jsxElements/ContentContainer";
import NavigationArrows from "../jsxElements/NavigationArrows";
import { sendRequestWithCatch } from "../jsxElements/MainMenuLibraryArtist";

export interface Disc {
    id: number;
    name: string;
    createdAt: string;
    artistId: number;
    artist: Artist | null;
    cover: DbFileStr | null;
    songs: Array<Song> | null;
}

export interface Artist {
    id: number;
    name: string;
    avatar: DbFileStr | null;
}

export interface Song {
    id: number;
    name: string;
    totalTimeInMicroseconds: number;
    discId: number;
    disc: Disc | null;
}

export function timeStampToString(time: number) {
    let fullString = "";
    const seconds1 = seconds(time);
    const minutes1 = minutes(time);
    const hours1 = hours(time);


    if (hours1 != 0) {
        fullString += `${hours1}:`

        if (minutes1 < 10) {
            fullString += 0
        }
    }

    fullString += `${minutes1}:`;

    if (seconds1 < 10) {
        fullString += 0
    }

    fullString += seconds1;

    return fullString;
}

export function timeStampNumberToTimeStampString(time: number) {
    let fullString = "";
    const seconds1 = seconds(time);
    const minutes1 = minutes(time);
    const hours1 = hours(time);
    const mlliseconds1 = milliseconds(time);

    if (hours1 >= 10) {
        fullString += `${hours1}:`
    } else {
        fullString += `0${hours1}:`
    }

    if (minutes1 >= 10) {
        fullString += `${minutes1}`
    } else {
        fullString += `0${minutes1}`
    }

    if (seconds1 >= 10) {
        fullString += `:${seconds1}`
    } else {
        fullString += `:0${seconds1}`
    }

    if (mlliseconds1 > 0) {
        fullString += `.${mlliseconds1}`
    }

    return fullString;
}

interface SongBox {
    song: Song;
    dispatch: AppDispatch;
    navigate: NavigateFunction;
}

interface DiscBox {
    disc: Disc;
    navigate: NavigateFunction;
}

interface ArtistBox {
    artist: Artist;
    navigate: NavigateFunction;
}

export function getDiscType(disc: Disc) {
    return disc.songs ? disc.songs.length > 1 ? "Album" : "Single" : "Disc";
}

export function SongBox({ song, dispatch, navigate }: SongBox) {
    const discCover = song.disc?.cover;

    const discCoverUrl = useRef(createUrlForDbFileCover(discCover));

    let fontSize = 17;

    for (let index = 0; index < song.name.length; index++) {
        fontSize = fontSize * 0.99;
    }

    return (
        <div style={{fontSize: `${fontSize}px`}} onClick={() => dispatch(setCurrentSong({songs: [song], currentSongIndex: 0, isPlaying: true}))} className="relative w-40 rounded-md bg-styleColor-200 flex flex-shrink-0 flex-grow-0 flex-col">
            <img className="rounded-t-md object-cover h-40 w-40" src={discCoverUrl.current} />
            <div className="absolute h-40 w-40 top-0 left-0 flex items-center justify-center">
                <div className="h-8 w-8">
                    <PlayForSong />
                </div>
            </div>
            <div className="flex-1 text-left mt-1 mx-1 flex flex-col justify-between">
                <p className="font-extrabold">{song.name}</p>
                <p className="flex">
                    <p className="link-text" onClick={(e) => {redirectToArtistPage(song.disc?.artistId, navigate); e.stopPropagation()}}>{song.disc?.artist?.name}</p>
                    <p className="link-text-raw mx-1">-</p>
                    <p className="link-text-raw">{timeStampToString(song.totalTimeInMicroseconds)}</p>
                </p>
            </div>
        </div>
    );
}

export function DiscBox({ disc, navigate }: DiscBox) {
    const discCover = disc.cover;

    const discCoverUrl = useRef(createUrlForDbFileCover(discCover));

    let fontSize = 17;

    for (let index = 0; index < disc.name.length; index++) {
        fontSize = fontSize * 0.99;
    }

    return (
        <div style={{fontSize: `${fontSize}px`}} className="relative w-40 rounded-md bg-styleColor-200 flex flex-shrink-0 flex-grow-0 flex-col" onClick={() => redirectToDiscPage(disc.id, navigate)}>
            <img className="rounded-t-md object-cover h-40 w-40" src={discCoverUrl.current} />
            <div className="flex-1 text-left mt-1 mx-1 flex flex-col justify-between">
                <p className="font-extrabold">{disc.name}</p>
                <p className="flex">
                    <p className="link-text-raw">{getDiscType(disc)}</p>
                    <p className="link-text-raw mx-1">-</p>
                    <p className="link-text" onClick={(e) => {redirectToDiscPage(disc.id, navigate); e.stopPropagation()}}>{disc.artist?.name}</p>
                </p>
            </div>
        </div>
    );
}

export function ArtistBox({ artist, navigate }: ArtistBox) {
    const artistAvatar = artist.avatar;

    const artistAvatarUrl = useRef(createUrlForDbFileAvatar(artistAvatar));

    let fontSize = 17;

    for (let index = 0; index < artist.name.length; index++) {
        fontSize = fontSize * 0.99;
    }

    return (
        <div style={{fontSize: `${fontSize}px`}} className="relative w-40 rounded-t-3xl rounded-b-md flex flex-shrink-0 flex-grow-0 flex-col" onClick={() => redirectToArtistPage(artist.id, navigate)}>
            <div className="rounded-t-full bg-styleColor-200 border-t">
                <div className="h-40 w-40">
                    <img className="rounded-full object-cover h-40 w-40" src={artistAvatarUrl.current} />
                </div>
            </div>
            <div className="flex flex-1 rounded-b-md bg-styleColor-200">
                <div className="flex-1 text-left mt-1 mx-1 flex flex-col justify-between">
                    <p className="font-extrabold">{artist.name}</p>
                    <p className="flex">
                        <p className="link-text-raw">Artist</p>
                    </p>
                </div>
            </div>
        </div>
    );
}

interface SongCategoryBox {
    songs: Array<Song> | null;
    title: string;
}

interface DiscCategoryBox {
    discs: Array<Disc> | null;
    title: string;
}

interface ArtistCategoryBox {
    artists: Array<Artist> | null;
    title: string;
}

export default function MainPage() {
    const navigate = useNavigate();

    const [mostPopularSongsForWeek, setMostPopularSongsForWeek] = useState<Array<Song>>([]);
    const [mostPopularSongs, setMostPopularSongs] = useState<Array<Song>>([]);
    const [mostPopularArtistsForWeek, setMostPopularArtistsForWeek] = useState<Array<Artist>>([]);
    const [mostPopularArtists, setMostPopularArtists] = useState<Array<Artist>>([]);
    const [mostPopularDiscsForWeek, setMostPopularDiscsForWeek] = useState<Array<Disc>>([]);
    const [mostPopularDiscs, setMostPopularDiscs] = useState<Array<Disc>>([]);
    const [recommendedSongs, setRecommendedSongs] = useState<Array<Song>>([]);
    const [listenerPopularSongs, setListenerPopularSongs] = useState<Array<Song>>([]);
    const [forgottenListenerPopularSongs, setForgottenListenerPopularSongs] = useState<Array<Song>>([]);
    const [listenerHistorySongs, setListenerHistorySongs] = useState<Array<Song>>([]);

    const {isAuthorized, isLoading, token} = useAuth();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!isAuthorized && !isLoading) {
            navigate("/auth/signin");
        }
    }, [isAuthorized, isLoading]);

    function SongCategoryBox({ songs, title }: SongCategoryBox) {
        return (
            <div>
                <p className="text-xl text-left font-bold ml-1">{title}</p>
                <div className="rounded-md border border-styleColor-200 bg-styleColor-100 p-4 flex gap-1 overflow-x-auto mt-1 min-h-60">
                    {songs ? songs.map((song, i) => <SongBox key={i} song={song} dispatch={dispatch} navigate={navigate} />) : null}
                </div>
            </div>
        );
    }
    
    function DiscCategoryBox({ discs, title }: DiscCategoryBox) {
        return (
            <div>
                <p className="text-xl text-left font-bold ml-1">{title}</p>
                <div className="rounded-md border border-styleColor-200 bg-styleColor-100 p-4 flex gap-1 overflow-x-auto mt-1 min-h-60">
                    {discs ? discs.map((disc, i) => {return <DiscBox key={i} disc={disc} navigate={navigate} />}) : null}
                </div>
            </div>
        );
    }
    
    function ArtistCategoryBox({ artists, title }: ArtistCategoryBox) {
        return (
            <div>
                <p className="text-xl text-left font-bold ml-1">{title}</p>
                <div className="rounded-md border border-styleColor-200 bg-styleColor-100 p-4 flex gap-1 overflow-x-auto mt-1 min-h-60">
                    {artists ? artists.map((artist, i) => {return <ArtistBox key={i} artist={artist} navigate={navigate} />}) : null}
                </div>
            </div>
        );
    }

    const getMostPopularSongsForWeek = async () => {
        return await sendRequestWithCatch(axios.get(`${serverUrl}/api/songs/getmostpopularsongsforweek`).then(resp => setMostPopularSongsForWeek(mapUppercaseObjectPropsToLowercase(resp.data))), dispatch);
    }
    const getMostPopularSongs = async () => {
        return await sendRequestWithCatch(axios.get(`${serverUrl}/api/songs/getmostpopularsongs`).then(resp => setMostPopularSongs(mapUppercaseObjectPropsToLowercase(resp.data))), dispatch);
    }
    const getMostPopularArtistsForWeek = async () => {
        return await sendRequestWithCatch(axios.get(`${serverUrl}/api/artists/getmostpopularartistsforweek`).then(resp => setMostPopularArtistsForWeek(mapUppercaseObjectPropsToLowercase(resp.data))), dispatch);
    }
    const getMostPopularArtists = async () => {
        return await sendRequestWithCatch(axios.get(`${serverUrl}/api/artists/getmostpopularartists`).then(resp => setMostPopularArtists(mapUppercaseObjectPropsToLowercase(resp.data))), dispatch);
    }
    const getMostPopularDiscsForWeek = async () => {
        return await sendRequestWithCatch(axios.get(`${serverUrl}/api/discs/getmostpopulardiscographyforweek`).then(resp => setMostPopularDiscsForWeek(mapUppercaseObjectPropsToLowercase(resp.data))), dispatch);
    }
    const getMostPopularDiscs = async () => {
        return await sendRequestWithCatch(axios.get(`${serverUrl}/api/discs/getmostpopulardiscography`).then(resp => setMostPopularDiscs(mapUppercaseObjectPropsToLowercase(resp.data))), dispatch);
    }
    const getRecommendedSongs = async () => {
        return await sendRequestWithCatch(axios.get(`${serverUrl}/api/songs/getrecommendedsongs`).then(resp => setRecommendedSongs(mapUppercaseObjectPropsToLowercase(resp.data))), dispatch);
    }
    const getListenerPopularSongs = async () => {
        return await sendRequestWithCatch(axios.get(`${serverUrl}/api/songs/getlistenerpopularsongs`, {
            headers: {
            "Authorization": `Bearer ${token.token}`
            }
        }).then(resp => setListenerPopularSongs(mapUppercaseObjectPropsToLowercase(resp.data))), dispatch);
    }
    const getListenerForgottenPopularSongs = async () => {
        return await sendRequestWithCatch(axios.get(`${serverUrl}/api/songs/getlistenerforgottenpopularsongs`, {
            headers: {
            "Authorization": `Bearer ${token.token}`
            }
        }).then(resp => setForgottenListenerPopularSongs(mapUppercaseObjectPropsToLowercase(resp.data))), dispatch);
    }
    const getListenerHistorySongs = async () => {
        return await sendRequestWithCatch(axios.get(`${serverUrl}/api/songs/getlistenerhistorysongs`, {
            headers: {
            "Authorization": `Bearer ${token.token}`
            }
        }).then(resp => setListenerHistorySongs(mapUppercaseObjectPropsToLowercase(resp.data))), dispatch);
    }
    
    useEffect(() => {
        getMostPopularSongsForWeek();
        getMostPopularSongs();
        getMostPopularArtistsForWeek();
        getMostPopularArtists();
        getMostPopularDiscsForWeek();
        getMostPopularDiscs();
        getRecommendedSongs();
    }, [])

    useEffect(() => {
        if (isAuthorized) {
            getListenerForgottenPopularSongs();
            getListenerPopularSongs();
            getListenerHistorySongs();
        }
    }, [isAuthorized])
    
    return (
        <ContentContainer>
            <>
                <div className="flex flex-col h-full w-full">
                    <NavigationArrows />
                    <hr className="border-styleColor-200" />
                    <div className="flex-1 pt-8 flex flex-col gap-4 overflow-y-auto pb-8 relative px-8">
                        <SongCategoryBox title='Recomended songs' songs={recommendedSongs} />
                        <SongCategoryBox title='The most popular songs for week' songs={mostPopularSongsForWeek} />
                        <DiscCategoryBox title='The most popular discography for week' discs={mostPopularDiscsForWeek} />
                        <ArtistCategoryBox title='The most popular artists for week' artists={mostPopularArtistsForWeek} />
                        <SongCategoryBox title='The most popular songs' songs={mostPopularSongs} />
                        <DiscCategoryBox title='The most popular discography' discs={mostPopularDiscs} />
                        <ArtistCategoryBox title='The most popular artists' artists={mostPopularArtists} />
                        <SongCategoryBox title='Listener popular songs' songs={listenerPopularSongs} />
                        <SongCategoryBox title='Listener forgotten popular songs' songs={forgottenListenerPopularSongs} />
                        <SongCategoryBox title='Listener songs history' songs={listenerHistorySongs} />
                    </div>
                </div>
                <ErrorMessage moveStyles={null} />
            </>
        </ContentContainer>
    );
}