import { useEffect, useState } from "react";
import "../css/svgElements/playButton.scss";
import { Song } from "../pages/MainPage";
import { CreateSongInfo } from "../pages/NewDiscPage";
import Trash from "../svgElements/Trash";
import { EditSongInfoWithId } from "../pages/EditDiscPage";

export interface DisplaySongInfo {
    id: null | number;
    indexInCreateList: number | null;
}

interface SongListItemUpdate {
    indexinAlbumArray: number;
    currentSongsList: Song[];
    displaySongsList: DisplaySongInfo[];
    setDisplaySongsList: React.Dispatch<React.SetStateAction<DisplaySongInfo[]>>;
    createSongsList: CreateSongInfo[];
    setCreateSongsList: React.Dispatch<React.SetStateAction<CreateSongInfo[]>>;
    deleteSongsList: number[];
    setDeleteSongsList: React.Dispatch<React.SetStateAction<number[]>>;
    changeSongsList: EditSongInfoWithId[];
    setChangeSongsList: React.Dispatch<React.SetStateAction<EditSongInfoWithId[]>>;
}

export default function SongListItemUpdate({
    indexinAlbumArray, 
    currentSongsList, 
    displaySongsList, 
    setDisplaySongsList, 
    createSongsList, 
    setCreateSongsList, 
    deleteSongsList,
    setDeleteSongsList,
    changeSongsList,
    setChangeSongsList
}: SongListItemUpdate) {
    const [currentlyHovered, setCurrentlyHovered] = useState(false);
    const [sName, setSName] = useState("");
    const [blob, setBlob] = useState<null | Blob>(null);

    const currentElement = displaySongsList[indexinAlbumArray];

    function getCurrentElementName() {
        if (currentElement.id) {
            let name = changeSongsList.find((e) => e.id == currentElement.id)?.name;
            
            if (!name) {
                name = currentSongsList.find((e) => e.id == currentElement.id)?.name;
            }

            return name ? name : "";
        } else if (currentElement.indexInCreateList != null) {
            const name = createSongsList[currentElement.indexInCreateList].name;

            return name ? name : "";
        }
        return "";
    }

    function albumListItemNumber() {
        return indexinAlbumArray + 1;
    }

    useEffect(() => {
        if (currentElement.indexInCreateList != null) {
            setBlob(createSongsList[currentElement.indexInCreateList].file);
        }

        setSName(getCurrentElementName());
    }, [displaySongsList, createSongsList, changeSongsList]);

    function changeSongName(newName: string) {
        if (currentElement.indexInCreateList != null) {
            const arrCopy = createSongsList;

            arrCopy[currentElement.indexInCreateList].name = newName;

            setCreateSongsList(arrCopy);
        } else if (currentElement.id) {
            const arrCopy = changeSongsList;

            let index = arrCopy.findIndex((e) => e.id == currentElement.id);

            if (index == -1) {
                const elem = currentSongsList.find((e) => e.id == currentElement.id);

                if (elem) {
                    arrCopy[arrCopy.length] = {id: elem.id, name: elem.name};
                }
            } else {
                arrCopy[index].name = newName;
            }

            setChangeSongsList(arrCopy);
        }
    }

    function changeSongFile(newFile: Blob | null) {
        if (currentElement.indexInCreateList != null) {
            const arrCopy = createSongsList;

            arrCopy[currentElement.indexInCreateList].file = newFile;

            console.log(arrCopy);
            console.log(newFile);

            setCreateSongsList(arrCopy);
        }
    }

    function moveToTrash() {
        const displaySongsListCopy = displaySongsList;
        
        if (currentElement.id) {
            setChangeSongsList(changeSongsList.filter((e, i) => e.id != currentElement.id));
            setDeleteSongsList([...deleteSongsList, currentElement.id]);
        } else if (currentElement.indexInCreateList != null) {
            for (let index = 0; index < displaySongsListCopy.length; index++) {
                const element = displaySongsListCopy[index];
                
                if (element.indexInCreateList && element.indexInCreateList > currentElement.indexInCreateList) {
                    element.indexInCreateList -= 1;
                }
            }

            setCreateSongsList(createSongsList.filter((e, i) => i != currentElement.indexInCreateList));
        }

        setDisplaySongsList(displaySongsList.filter((e, i) => i != indexinAlbumArray));
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
            {currentElement.id ? null :
            <div>
                <label className={`${blob ? "bg-styleColor-300" : "bg-styleColor-400"} flex-1 flex flex-row items-center p-1 rounded-md ml-4`}>
                    <input type="file" className="hidden" onChange={(e) => {changeSongFile(e.target.files ? e.target.files.item(0) : null); setBlob(e.target.files ? e.target.files.item(0) : null ); e.target.value = ""}}/>
                    <text className={`${blob ? "text-styleColor-500" : "text-white"}`}>Choose the file</text>
                </label>
            </div>
            }
            <div className="flex-1 flex justify-end mr-8">
                <div className="h-6" onClick={moveToTrash}>
                    <Trash />
                </div>
            </div>
        </div>
    )
}