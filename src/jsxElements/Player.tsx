import { MouseEvent, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchNewSongsForQueueAsync, selectCurrentSong, setCurrentSong, startOrStopCurrentSong } from "../slices/currentSongSlice";
import HeartButton from "../svgElements/HeartButton";
import HeartButtonFilled from "../svgElements/HeartButtonFilled";
import { ChildrenProp } from "./MainBox";
import PreviousSong from "../svgElements/PreviousSong";
import PauseButton from "../svgElements/PauseButton";
import PlayButton from "../svgElements/PlayButton";
import NextSong from "../svgElements/NextSong";
import Sound from "../svgElements/Sound";
import "../css/svgElements/playButton.scss";
import { timeStampNumberToTimeStampString, timeStampToString } from "../pages/MainPage";
import { createFormDataFromObject, mapUppercaseObjectPropsToLowercase, useAuth, useDidUpdateEffect } from "../contexts/AuthContext";
import axios from "axios";
import { serverUrl } from "../constants";
import { setError } from "../slices/errorSlice";
import { createBufferForDbFile, createUrlForDbFileCover } from "./SettingsMenuCurrentPage";
import { DbFileStr } from "../slices/userSlice";
import { redirectToArtistPage, redirectToDiscPage } from "../pages/DiscPage";
import { useNavigate } from "react-router-dom";
import { getSongsForUserLibrary } from "./GlobalWapper";
import { sendRequestWithCatch } from "./MainMenuLibraryArtist";

export interface SongPartWithContent {
    songContentPart: string;
    thisPartDuration: number;
    whenToUpdate: number | null;
}

export default function Player({ children }: ChildrenProp) {
    const currentSong = useAppSelector(selectCurrentSong);
    const dispatch = useAppDispatch();

    const navigate = useNavigate();

    const [liked, setLiked] = useState(false);
    const [currentSongTimeInMicroSeconds, setCurrentSongTimeInMicroSeconds] = useState(0);
    const [timeUpdateIntervalId, setTimeUpdateIntervalId] = useState<undefined | NodeJS.Timer>();
    const [songParts, setSongParts] = useState<null | Array<AudioBufferSourceNode>>(null);
    const [songContentType, setSongContentType] = useState<null | string>(null);
    const [currentSongStartAt, setCurrentSongStartAt] = useState(0);
    const [nextSongStartAt, setNextSongStartAt] = useState(0);
    const [nextSongStartAtHighDetail, setNextSongStartAtHighDetail] = useState(0);
    const [updateAt, setUpdateAt] = useState<number | null>(0);
    const [updateInvoked, setUpdateInvoked] = useState(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [startFrom, setStartFrom] = useState(0);
    const [excessiveAudioCtxTimePlayed, setExcessiveAudioCtxTimePlayed] = useState(0);
    const [needToRestart, setNeedToRestart] = useState(false);
    const [needToUpdateAudioToCurrentTime, setNeedToUpdateAudioToCurrentTime] = useState(false);
    const [isVolumeSettingActive, setIsVolumeSettingActive] = useState(false);
    const [volume, setVolume] = useState(1);
    const [discCoverUrl, setDiscCoverUrl] = useState("");

    const audioCtx = useRef(new AudioContext());
    const gainNode = useRef<GainNode>(createGain(audioCtx.current));

    const audioLineRef = useRef<HTMLDivElement | null>(null);
    const volumeSettingLineRef = useRef<HTMLDivElement | null>(null);

    const currentSongSong = currentSong?.songs[currentSong.currentSongIndex];
    const currentSongIsPlaying = currentSong?.isPlaying;
    const currentSongCover = currentSong ? currentSong.songs[currentSong.currentSongIndex].disc?.cover : null;

    const {isAuthorized, token} = useAuth();

    useEffect(() => {
        setDiscCoverUrl(createUrlForDbFileCover(currentSongCover));
    }, [currentSongCover])

    useEffect(() => {
        gainNode.current.gain.value = volume - 1;
    }, [gainNode.current, volume]);

    function createGain(audioContext: AudioContext) {
        const gain = audioContext.createGain();

        gain.connect(audioContext.destination);

        gain.gain.value = 0;
        
        return gain;
    }
    useEffect(() => {
        if (songParts) {
            songParts.forEach(element => {
                element.connect(gainNode.current);
            });
        }
    }, [songParts]);

    useDidUpdateEffect(() => {
        if (!currentSongIsPlaying) {
            audioCtx.current.suspend();
        } else {
            if (songParts) {
                audioCtx.current.resume();
            }
        }
    }, [currentSongIsPlaying]);

    async function loadFirstSongPart() {
        let contentType = "";

        await axios.get(`${serverUrl}/api/follow/song/${currentSong?.songs[currentSong.currentSongIndex].id}`, {
            headers: {
                Authorization: `Bearer ${token.token}`
            }
        }).then(resp => setLiked(resp.data));

        if (!await sendRequestWithCatch(axios.get(`${serverUrl}/api/song/getsongcontenttype/${currentSong?.songs[currentSong.currentSongIndex].id}`)
        .then(resp => {setSongContentType(resp.data); contentType = resp.data}), dispatch)) {
            return false;
        }

        await getSongPartStart(contentType);

        return true;
    }

    async function getSongPartContinue(continueAt: number) {
        return await sendRequestWithCatch(axios.get(`${serverUrl}/api/song/continuestreamingsong`, {
            headers: {
            "Authorization": `Bearer ${token.token}`
            },
            params: {
                continueAt: timeStampNumberToTimeStampString(continueAt)
            }
        }).then(resp => updateSongParts(mapUppercaseObjectPropsToLowercase(resp.data), null)), dispatch);
    }

    const stopStreamingSong = async () => {
        await axios.post(`${serverUrl}/api/song/stopstreamingsong`, {
            headers: {
            "Authorization": `Bearer ${token.token}`
            }
        });
    }

    const stopStreamingSongForWindowClosing = () => {
        if (songParts) {
            navigator.sendBeacon(
                `${serverUrl}/api/song/stopstreamingsongtokenbody`, 
                createFormDataFromObject({token: `Bearer ${token.token}`})
            );
        }
    }

    const stopStreamingSongWithCheck = async () => {
        if (songParts) {
            stopStreamingSong()
        }
    }

    useEffect(() => {
        return () => {
            stopStreamingSongWithCheck()
        }
    }, []);

    useEffect(() => {
        window.onbeforeunload = stopStreamingSongForWindowClosing;

        return () => window.removeEventListener("onbeforeunload", stopStreamingSongForWindowClosing);
    }, [token, songParts])

    function addIndexWithNewSongsLoad(plusIndex: number) {
        if (currentSong && currentSong.currentSongIndex + plusIndex >= 0) {
            if (currentSong.songs.length > currentSong.currentSongIndex + plusIndex) {
                dispatch(setCurrentSong({songs: currentSong.songs, currentSongIndex: currentSong.currentSongIndex + plusIndex, isPlaying: true}));
            } else {
                dispatch(fetchNewSongsForQueueAsync());
            }
        }
    }

    useEffect(() => {
        if (songParts && songParts.length == 1) {
            setNextSongStartAtHighDetail((songParts[0].buffer ? songParts[0].buffer?.duration : 0) + nextSongStartAtHighDetail);
            startInterval(0);

            if (!updateAt) {
                songParts[0].onended = () => {
                    clearEverythingUp();

                    stopStreamingSong()
                    
                    const thisIntervalId = setInterval(() => {
                        if (audioCtx.current.state == "running") {
                            addIndexWithNewSongsLoad(1);
                            clearInterval(thisIntervalId);
                        }
                    }, 1);
                }
            }

            if (!isAudioPlaying) {

                setExcessiveAudioCtxTimePlayed(audioCtx.current.currentTime);
                
                songParts[0].start(0);

                setIsAudioPlaying(true);
            }
        } else if (songParts && songParts.length == 2) {
            const abort = new AbortController();

            songParts[0].onended = function () {
                setIsAudioPlaying(true);
            }

            const startAt = nextSongStartAtHighDetail + excessiveAudioCtxTimePlayed;

            songParts[1].start(startAt);
            songParts[0].addEventListener("ended", () => {setUpdateInvoked(false); setSongParts([songParts[1]])}, {signal: abort.signal});

            setAbortController(abort);
        }
    }, [songParts]);

    useEffect(() => {
        if (updateInvoked) {
            getSongPartContinue(nextSongStartAt + startFrom);
            clearInterval(timeUpdateIntervalId);

            setTimeUpdateIntervalId(setInterval(() => {
                setCurrentSongTimeInMicroSeconds(audioCtx.current.currentTime * 1000000);
                
            }, 100));
        }
    }, [updateInvoked]);

    const createAudioBuffer = async (dbFile: DbFileStr) => {
        const source = audioCtx.current.createBufferSource();
        const mainBuffer: any = await createBufferForDbFile(dbFile);

        source.buffer = await audioCtx.current.decodeAudioData(mainBuffer)
        source.connect(audioCtx.current.destination);

        return source;
    }

    const timeUpdate = (currentTime: number, timePassedInPause: number) => {
        setCurrentSongTimeInMicroSeconds(currentTime * 1000000);
        clearInterval(timeUpdateIntervalId);

        if (updateAt && currentTime * 1000000 >= updateAt + currentSongStartAt + timePassedInPause) {
            setUpdateInvoked(true);
        }
    }

    async function updateSongParts(newSongPart: SongPartWithContent, contentType: string | null) {
        if (songContentType || contentType) {
            const audioPart = await createAudioBuffer({content: newSongPart.songContentPart, type: songContentType ? songContentType : contentType ? contentType : ""});

            audioPart.connect(audioCtx.current.destination);

            const newPartStart = newSongPart.thisPartDuration + nextSongStartAt;
            setCurrentSongStartAt(nextSongStartAt);
            setNextSongStartAt(newPartStart)
            setUpdateAt(newSongPart.whenToUpdate);

            if (songParts == null || songParts.length == 0) {
                setSongParts([audioPart]);
                const mainBuffer: any = await createBufferForDbFile({content: newSongPart.songContentPart, type: songContentType ? songContentType : contentType ? contentType : ""});

                audioCtx.current.decodeAudioData((mainBuffer), function(buffer: any) {
                    setNextSongStartAtHighDetail(buffer.duration + nextSongStartAtHighDetail);
                }, function(err) {
                    dispatch(setError(new Error('Error decoding audio data: ' + err)));
                });
            } else {
                const oldAudioPart = songParts[0];
                setSongParts([oldAudioPart, audioPart]);
            }
        }
    }

    function startInterval(timePassedInPause: number) {
        setTimeUpdateIntervalId(setInterval(() => {
            timeUpdate(audioCtx.current.currentTime, timePassedInPause);
        }, 100));
    }

    async function getSongPartStart(contentType: string) {
        return await sendRequestWithCatch(axios.get(`${serverUrl}/api/song/startstreamingsong/${currentSong?.songs[currentSong.currentSongIndex].id}`, {
            headers: {
            "Authorization": `Bearer ${token.token}`
            }
        }).then(resp => updateSongParts(mapUppercaseObjectPropsToLowercase(resp.data), contentType)), dispatch);
    }

    useEffect(() => {
        if(currentSong?.songs[currentSong.currentSongIndex] && isAuthorized) {
            clearEverythingUp();
            setNeedToRestart(true)
        }
    }, [currentSongSong]);

    useEffect(() => {
        if (needToRestart) {
            loadFirstSongPart();
            setNeedToRestart(false);
        }
    }, [needToRestart]);

    useEffect(() => {
        if (currentSong == null) {
            clearEverythingUp();
        }
    }, [currentSong]);

    useDidUpdateEffect(() => {
        if (needToUpdateAudioToCurrentTime) {
            getSongPartContinue(startFrom);

            setNeedToUpdateAudioToCurrentTime(false);
        }
    }, [startFrom, needToUpdateAudioToCurrentTime]);

    function changeTime(e: MouseEvent) {
        if (audioLineRef?.current && currentSong) {
            const mousePosX = e.clientX - audioLineRef.current.getBoundingClientRect().left >= 0 ? e.clientX - audioLineRef.current.getBoundingClientRect().left : 0;
            
            clearEverythingUp();

            setStartFrom((mousePosX / audioLineRef.current.clientWidth) * currentSong.songs[currentSong.currentSongIndex].totalTimeInMicroseconds);
        }
    }

    function changeVolume(e: MouseEvent) {
        if (volumeSettingLineRef?.current) {
            const mousePosY = volumeSettingLineRef.current.getBoundingClientRect().bottom - e.clientY >= 0 ? volumeSettingLineRef.current.getBoundingClientRect().bottom - e.clientY : 0;

            setVolume(mousePosY / volumeSettingLineRef.current.clientHeight);
        }
    }

    async function clearAudioCtx(oldAudioContext: AudioContext) {
        try {
            await oldAudioContext.suspend();  
            await oldAudioContext.close();
        } catch (ex: any) {}
    }

    function clearEverythingUp() {
        songParts?.forEach(element => {

            try {
                element.stop(0);
            } catch (ex: any) {
            }
            
            element.disconnect();
        });

        setSongParts(null);

        clearAudioCtx(audioCtx.current);      

        audioCtx.current = new AudioContext();
        gainNode.current = createGain(audioCtx.current);
        
        setCurrentSongStartAt(0);
        setNextSongStartAt(0);
        setNextSongStartAtHighDetail(0);
        setUpdateAt(0);

        clearInterval(timeUpdateIntervalId);
        setIsAudioPlaying(false);

        abortController?.abort();

        setStartFrom(0);
    }

    async function toggleFollowSong() {
        if (!await sendRequestWithCatch(axios.get(`${serverUrl}/api/follow/song/toggle/${currentSong?.songs[currentSong.currentSongIndex].id}`, {
            headers: {
                Authorization: `Bearer ${token.token}`
            }
        }).then((response) => setLiked(response.data)), dispatch)) {
            return false;
        }

        return await getSongsForUserLibrary(token.token, dispatch);
    } 

    return (
        <div className="flex flex-col h-full w-full">
            <>
            {children}
            </>
            {currentSong?.songs[currentSong.currentSongIndex] ?
            <div className="h-16 border-styleColor-200 mx-2 mb-2 rounded-md border bg-styleColor-50 flex relative">
                <div className="flex items-center absolute h-full">
                    <img className="rounded-md mx-3 h-14 w-14 object-cover" onClick={() => redirectToDiscPage(currentSong.songs[currentSong.currentSongIndex].discId, navigate)} src={discCoverUrl} />
                    <div className="flex flex-col text-left my-2">
                        <h2 className="text-md">{currentSong.songs[currentSong.currentSongIndex].name}</h2>
                        <div className="flex items-center ">
                            <p className="link-text" onClick={() => redirectToArtistPage(currentSong.songs[currentSong.currentSongIndex].disc?.artistId, navigate)}>{currentSong.songs[currentSong.currentSongIndex].disc?.artist?.name}</p>
                            <p className="link-text-raw mx-1">-</p>
                            <p className="link-text" onClick={() => redirectToDiscPage(currentSong.songs[currentSong.currentSongIndex].discId, navigate)}>{currentSong.songs[currentSong.currentSongIndex].disc?.name}</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center items-center flex-1">
                    <div className="flex flex-col gap-1 items-center w-1/3 mt-1">
                        <div className="flex gap-3 flex-1">  
                            <div className={`w-8 h-8 ${currentSong.currentSongIndex == 0 ? "play-button-inactive" : ""}`} onClick={() => addIndexWithNewSongsLoad(-1)}><PreviousSong /></div>
                            <div className="w-8 h-8" onClick={() => dispatch(startOrStopCurrentSong())}>{currentSong?.isPlaying ? <PauseButton /> : <PlayButton />}</div>
                            <div className="w-8 h-8" onClick={() => addIndexWithNewSongsLoad(1)}><NextSong /></div>
                        </div>
                        <div className="flex w-full items-center gap-2">
                            <p className="link-text-raw">{timeStampToString(currentSongTimeInMicroSeconds + startFrom - excessiveAudioCtxTimePlayed * 1000000)}</p>
                            <div className="h-1 flex-1 rounded w-full bg-styleColor-200" ref={audioLineRef} onClick={(e) => changeTime(e)}>
                                <div style={{width: `${(currentSongTimeInMicroSeconds + startFrom - excessiveAudioCtxTimePlayed * 1000000) / currentSong.songs[currentSong.currentSongIndex].totalTimeInMicroseconds * 100}%`}} className="h-full rounded bg-styleColor-500">

                                </div>
                            </div>
                            <p className="link-text-raw">{timeStampToString(currentSong.songs[currentSong.currentSongIndex].totalTimeInMicroseconds)}</p>
                        </div>
                    </div>
                </div>
                <div className="absolute right-3 h-full items-center flex">
                    <div className="w-8 h-8 mr-2 relative p-1 bg-styleColor-100 border-styleColor-200 border rounded-full">
                        <div className="play-button" onClick={() => setIsVolumeSettingActive(!isVolumeSettingActive)}>
                            <Sound />
                        </div>
                        { isVolumeSettingActive ?
                        <div className="absolute top--21 flex flex-col w-full justify-center items-center">
                            <div className="mr-2 relative p-1 bg-styleColor-100 border-styleColor-200 border rounded-full flex justify-center h-20">
                                <div ref={volumeSettingLineRef} className="w-1 rounded h-full bg-styleColor-200 border-0.25 flex flex-col border-styleColor-300 justify-end" onClick={(e) => changeVolume(e)}>
                                    <div style={{height: `${volume * 100}%`}} className="w-full rounded bg-styleColor-500">

                                    </div>
                                </div>
                            </div>
                        </div>
                        :
                        null
                        }
                    </div>
                    <div onClick={toggleFollowSong}>
                        {liked ? <div className="h-6 w-6"><HeartButtonFilled /></div> : <div className="h-6 w-6"><HeartButton /></div>}
                    </div>
                </div>
            </div> :
            null
            }
        </div>
    );
}