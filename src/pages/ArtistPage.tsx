import { useEffect, useRef, useState } from "react";
import SongListItem from "../jsxElements/SongListItem";
import PauseButton from "../svgElements/PauseButton";
import PlayButton from "../svgElements/PlayButton";
import HeartButtonFilled from "../svgElements/HeartButtonFilled";
import HeartButton from "../svgElements/HeartButton";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectCurrentSong, setCurrentSong, startCurrentSong, stopCurrentSong } from "../slices/currentSongSlice";
import ContentContainer from "../jsxElements/ContentContainer";
import { useNavigate, useParams } from "react-router-dom";
import { mapUppercaseObjectPropsToLowercase, useAuth } from "../contexts/AuthContext";
import ErrorMessage from "../jsxElements/ErrorMessage";
import { Artist, Disc, Song, getDiscType } from "./MainPage";
import { createUrlForDbFileAvatar, createUrlForDbFileCover } from "../jsxElements/SettingsMenuCurrentPage";
import axios from "axios";
import { serverUrl } from "../constants";
import { redirectToDiscPage } from "./DiscPage";
import NavigationArrows from "../jsxElements/NavigationArrows";
import { getArtistsForUserLibrary } from "../jsxElements/GlobalWapper";
import { sendRequestWithCatch } from "../jsxElements/MainMenuLibraryArtist";

export default function ArtistPage() {
    const [likeIsActive, setLikeIsActive] = useState(false);

    const [theMostPopularSongs, setTheMostPopularSongs] = useState<Array<Song>>([]);
    const [theMostPopularDiscography, setTheMostPopularDiscography] = useState<Array<Disc>>([]);
    const [albums, setAlbums] = useState<Array<Disc>>([]);
    const [singles, setSingles] = useState<Array<Disc>>([]);
    const [artist, setArtist] = useState<Artist | null>(null);
    const [mouthlyListeners, setMouthlyListeners] = useState(0);
    const [artistAvatarUrl, setArtistAvatarUrl] = useState("");

    const navigate = useNavigate();

    const {isAuthorized, isLoading, token} = useAuth();

    const { artistId } = useParams();

    const artistAvatar = artist?.avatar;

    useEffect(() => {
        setArtistAvatarUrl(createUrlForDbFileAvatar(artistAvatar))
    }, [artistAvatar]);

    useEffect(() => {
        if (!isAuthorized && !isLoading) {
            navigate("/auth/signin");
        }
    }, [isAuthorized, isLoading]);

    const currentSong = useAppSelector(selectCurrentSong);
    const dispatch = useAppDispatch();

    const getArtist = async () => {
        return await sendRequestWithCatch(axios.get(`${serverUrl}/api/artists/getartist/${artistId}`).then(resp => setArtist(mapUppercaseObjectPropsToLowercase(resp.data))), dispatch);
    }

    const getArtistTheMostPopularSongs = async () => {
        return await sendRequestWithCatch(axios.get(`${serverUrl}/api/songs/getartistmostpopularsongs/${artistId}`).then(resp => setTheMostPopularSongs(mapUppercaseObjectPropsToLowercase(resp.data))), dispatch);
    }

    const getArtistTheMostPopularDiscography = async () => {
        return await sendRequestWithCatch(axios.get(`${serverUrl}/api/discs/getallartistmostpopulardiscography/${artistId}`).then(resp => setTheMostPopularDiscography(mapUppercaseObjectPropsToLowercase(resp.data))), dispatch);
    }
    const getArtistSingles = async () => {
        return await sendRequestWithCatch(axios.get(`${serverUrl}/api/discs/getallartistsingles/${artistId}`).then(resp => setSingles(mapUppercaseObjectPropsToLowercase(resp.data))), dispatch);
    }
    const getArtistAlbums = async () => {
        return await sendRequestWithCatch(axios.get(`${serverUrl}/api/discs/getallartistalbums/${artistId}`).then(resp => setAlbums(mapUppercaseObjectPropsToLowercase(resp.data))), dispatch);
    }
    
    useEffect(() => {
        getArtist();
        getArtistTheMostPopularSongs();
        getArtistTheMostPopularDiscography();
        getArtistAlbums();
        getArtistSingles();
    }, []);

    function playArtistOrStop() {
        if (currentSong?.songs[currentSong.currentSongIndex]?.disc?.artistId == artistId) {
            if (currentSong?.isPlaying) {
                dispatch(stopCurrentSong());
            } else {
                dispatch(startCurrentSong());
            }
        } else {
            dispatch(setCurrentSong({songs: theMostPopularSongs, currentSongIndex: 0, isPlaying: true}));
        }
    }

    interface DiscBoxArtist {
        disc: Disc;
    }

    function DiscBoxArtist({ disc }: DiscBoxArtist) {
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
                        <p className="link-text-raw">{new Date(disc.createdAt).getFullYear()}</p>
                        <p className="link-text-raw mx-1">-</p>
                        <p className="link-text-raw">{getDiscType(disc)}</p>
                    </p>
                </div>
            </div>
        );
    }

    interface DiscCategoryBoxArtist {
        discs: Array<Disc>;
        title: string;
    }

    function DiscCategoryBoxArtist({ discs, title }: DiscCategoryBoxArtist) {
        return (
            <div>
                <p className="text-xl text-left font-extrabold ml-1 mt-16 mb-1">{title}</p>
                <div className="rounded-md border border-styleColor-200 bg-styleColor-100 p-4 flex gap-1 overflow-x-auto min-h-60">
                    {discs ? discs.map((el, i) => <DiscBoxArtist disc={el} />): null}
                </div>
            </div>
        );
    }

    async function toggleFollowArtist() {
        if (!await sendRequestWithCatch(axios.get(`${serverUrl}/api/follow/artist/toggle/${artistId}`, {
            headers: {
                Authorization: `Bearer ${token.token}`
            }
        }).then((response) => setLikeIsActive(response.data)), dispatch)) {
            return false;
        }

        getArtistsForUserLibrary(token.token, dispatch);

        return true;
    } 

    useEffect(() => {
        if (isAuthorized) {
            axios.get(`${serverUrl}/api/follow/artist/${artistId}`, {
                headers: {
                    Authorization: `Bearer ${token.token}`
                }
            }).then(resp => setLikeIsActive(resp.data));

            axios.get(`${serverUrl}/api/artists/getartistlisteners/${artistId}`).then(resp => setMouthlyListeners(resp.data));
        }
    }, [isAuthorized]);

    const popularSongsJsx = theMostPopularSongs.map((val, i) => <SongListItem queue={theMostPopularSongs} indexinAlbumArray={i} needToShowCover={true} needToShowArtist={false} />)

    return (
        <ContentContainer>
            <div className="h-full w-full flex flex-col">
                <NavigationArrows />
                <hr className="border-styleColor-200" />
                <div className="flex-1 overflow-y-auto flex p-8 flex-col">
                    <div className="mb-4 h-64 w-full flex items-center">
                        <img className="w-60 h-60 rounded-full object-cover" src={artistAvatarUrl} />
                        <div className="flex items-end h-60">
                            <div className="flex flex-col mx-8 items-start">
                                <p>Artist</p>
                                <h1 className="text-3xl font-extrabold mb-4">{artist?.name}</h1>
                                <div className="flex items-center">
                                    <p className="link-text-raw">{mouthlyListeners} mouthly listeners</p>
                                </div>
                                <div className="mt-2 flex items-center">
                                    <div className="h-14" onClick={playArtistOrStop}>
                                        {currentSong?.songs[currentSong.currentSongIndex].disc?.artistId == artistId && currentSong?.isPlaying ? <PauseButton /> : <PlayButton />}
                                    </div>
                                    <div className="ml-4 h-8" onClick={toggleFollowArtist}>
                                        {likeIsActive ? <HeartButtonFilled /> : <HeartButton />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xl text-left font-extrabold mb-1">Popular</p>
                    <div className="flex w-full h-64 items-center">
                        <div className="mt-2 h-full flex-1 border rounded-md border-styleColor-200 bg-styleColor-100 flex flex-col overflow-y-auto">
                            {popularSongsJsx}
                        </div>
                    </div>
                    <div>
                        <DiscCategoryBoxArtist title="Popular" discs={theMostPopularDiscography} />
                        <DiscCategoryBoxArtist title="Albums" discs={albums} />
                        <DiscCategoryBoxArtist title="Singles" discs={singles} />
                    </div>
                </div>
                <ErrorMessage moveStyles={null} />
            </div>
        </ContentContainer>
    )
}