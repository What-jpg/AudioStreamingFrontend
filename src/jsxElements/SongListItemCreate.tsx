import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectCurrentSong, stopCurrentSong, startCurrentSong } from "../slices/currentSongSlice";
import "../css/svgElements/playButton.scss";
import { CreateSongInfo } from "../pages/NewDiscPage";
import Trash from "../svgElements/Trash";

interface SongListItemCreate {
    indexinAlbumArray: number;
    songsList: CreateSongInfo[];
    setSongsList: React.Dispatch<React.SetStateAction<CreateSongInfo[]>>;
}

export default function SongListItemCreate({indexinAlbumArray, songsList, setSongsList}: SongListItemCreate) {
    const [currentlyHovered, setCurrentlyHovered] = useState(false);
    const [sName, setSName] = useState(songsList[indexinAlbumArray].name);
    const [blob, setBlob] = useState<null | Blob>(null);

    function albumListItemNumber() {
        return indexinAlbumArray + 1;
    }

    useEffect(() => {
        setBlob(songsList[indexinAlbumArray].file);
        setSName(songsList[indexinAlbumArray].name);
    }, [songsList]);

    function changeSongName(newName: string) {
        const arrCopy = songsList;

        arrCopy[indexinAlbumArray].name = newName;

        setSongsList(arrCopy);
    }

    function changeSongFile(newFile: Blob | null) {
        const arrCopy = songsList;

        arrCopy[indexinAlbumArray].file = newFile;

        setSongsList(arrCopy);
    }
    
    return (
        <div className={`album-list-item ${currentlyHovered ? "album-list-item-active" : ""}`} onMouseOver={() => setCurrentlyHovered(true)} onMouseOut={() => setCurrentlyHovered(false)}>
            <div className="album-list-item-number-box">
                <p className="album-list-item-number">
                    {albumListItemNumber()}
                </p>
            </div>
            <div>
                <input placeholder="Song name" value={sName} className="border-styleColor-300 rounded-md" onChange={(e) => {changeSongName(e.target.value); setSName(e.target.value)}} />
            </div>
            <div>
                <label className={`${blob ? "bg-styleColor-300" : "bg-styleColor-400"} flex-1 flex flex-row items-center p-1 rounded-md ml-4`}>
                    <input type="file" className="hidden" onChange={(e) => {changeSongFile(e.target.files ? e.target.files.item(0) : null); setBlob(e.target.files ? e.target.files.item(0) : null ); e.target.value = ""}}/>
                    <text className={`${blob ? "text-styleColor-500" : "text-white"}`}>Choose the file</text>
                </label>
            </div>
            <div className="flex-1 flex justify-end mr-8">
                <div className="h-6" onClick={() => setSongsList(songsList.filter((e, i) => i != indexinAlbumArray))}>
                    <Trash />
                </div>
            </div>
        </div>
    )
}