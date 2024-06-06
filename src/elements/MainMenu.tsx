import { useEffect, useState } from "react";
import "../css/elements/mainMenu.scss";
import Home from "../svgElements/Home";
import Search from "../svgElements/Search";
import RightArrowButton from "../svgElements/RightArrowButton";
import MainMenuLibraryAlbumOrSongElement from "./MainMenuLibraryAlbumOrSongElement";
import MainMenuLibraryArtistElement from "./MainMenuLibraryArtist";
import { changeCurrentSearchAtIndex, changeCurrentSearchString, searchInAppKey, searchInLibraryKey, selectCurrentSearch, toggleSearchTabActive } from "../slices/currentSearchSlice";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useNavigate } from "react-router-dom";
import { searchBoxAlbumKey, searchBoxArtistKey, searchBoxSongKey } from "../constants";
import DiscIcon from "../svgElements/DiscIcon";
import { changeArtistLibrarySection, changeCurrentLibrarySection, changeDiscLibrarySection, changeSongLibrarySection, selectCurrentLibrarySearch } from "../slices/currentLibrarySearchSlice";
import { Artist, Disc, Song } from "../pages/MainPage";

export default function MainMenu() {
    const currentSearch = useAppSelector(selectCurrentSearch);
    const currentSearchLibrary = useAppSelector(selectCurrentLibrarySearch);
    const dispatch = useAppDispatch();
    
    const searchString = currentSearch.searchString;

    const [temporarySearchText, setTemporarySearchText] = useState("");

    const currentLibrarySection = currentSearchLibrary.currentLibrarySection;

    const navigate = useNavigate();

    function changeSearchIn(e: React.MouseEvent<any, MouseEvent>, searchIn: string) {
        dispatch(changeCurrentSearchAtIndex(searchIn))
        e.stopPropagation();
    }

    interface MenuSearchTab {
        searchKey: string;
        currentSearchKey: string;
    }

    interface SearchInItem {
        searchKey: string;
    }

    function SearchInItem({searchKey}: SearchInItem) {
        let typeInTitle = "";

        switch (searchKey) {
            case searchInLibraryKey:
                typeInTitle = "Library";
                break;
            case searchInAppKey:
                typeInTitle = "App";
                break;
            default:
                typeInTitle = "Default";
                break;
        }

        return (
            <div className={`search-option flex items-center ${currentSearch.searchAtIndex == searchKey ? "search-option-active" : ""}`} onClick={(e) => changeSearchIn(e, searchKey)}>
                <p className="text-center w-full text-sm h-fit">
                    {typeInTitle}
                </p>
            </div>
        );
    }
    

    function MenuSearchTab({ searchKey, currentSearchKey }: MenuSearchTab) {
        let  newStylesStr = "";
        let typeInTitle = "";
    
        if (searchKey == currentSearchKey) {
            newStylesStr = "search-option-library-active";
        }
    
        switch (searchKey) {
            case searchBoxArtistKey:
                typeInTitle = "Artists";
                break;
            case searchBoxAlbumKey:
                typeInTitle = "Albums";
                break;
            case searchBoxSongKey:
                typeInTitle = "Songs";
                break;
            default:
                typeInTitle = "Default";
                break;
        }
    
        return (
            <div className={`search-option-library ${newStylesStr}`} onClick={() => dispatch(changeCurrentLibrarySection(searchKey))}>
                <p className="text-center my-2">
                    {typeInTitle}
                </p>
            </div>
        )
    }

    function redirectToSearchPage() {
        dispatch(changeCurrentSearchString(temporarySearchText));

        let searchType = ""

        switch (currentSearch.whatToSearch) {
            case searchBoxAlbumKey:
                searchType = "discs"
                break;

            case searchBoxArtistKey:
                searchType = "artists"
                break;

            case searchBoxSongKey:
                searchType = "songs"
                break;
        
            default:
                break;
        }

        navigate(`/search/${searchType}?in=${currentSearch.searchAtIndex}&string=${temporarySearchText}`)
    }

    useEffect(() => {
        setTemporarySearchText(searchString);
    }, [searchString]);
 
    function renderMenuLibrary() {
        switch (currentLibrarySection) {
            case searchBoxArtistKey:
                try {
                    return currentSearchLibrary.artistLibrarySection.map((e, i) => <MainMenuLibraryArtistElement index={i} arr={currentSearchLibrary.artistLibrarySection} setArr={(arr: Artist[]) => dispatch(changeArtistLibrarySection(arr))} />);
                } catch(ex: any) {
                    return null;
                }
            case searchBoxAlbumKey:
                try {
                    return currentSearchLibrary.discLibrarySection.map((e, i) => <MainMenuLibraryAlbumOrSongElement index={i} arr={currentSearchLibrary.discLibrarySection} setArr={(arr: Disc[]) => dispatch(changeDiscLibrarySection(arr))} albumOrSong="album" />);
                } catch(ex: any) {
                    return null;
                }
            case searchBoxSongKey:
                try {
                    //console.log("try to load");
                    return currentSearchLibrary.songLibrarySection.map((e, i) => <MainMenuLibraryAlbumOrSongElement index={i} arr={currentSearchLibrary.songLibrarySection} setArr={(arr: Song[]) => dispatch(changeSongLibrarySection(arr))} albumOrSong="song" />);
                } catch(ex: any) {
                    return null;
                }
            default:
                return null;
        }

        
    }
    
    return (
        <div className="absolute top-0 left-0 w-1/4 h-full flex flex-col">
            <div className={`main-menu-box-top`}>
                <div onClick={() => navigate("/")} className={`main-menu-link-item ${window.location.pathname == "/" ? "bg-styleColor-200" : ""}`}>
                    <Home />
                    <div className="main-menu-link-text-box">
                        <p className="main-menu-link-text">
                            Home
                        </p>
                    </div>
                </div>
                <hr />
                { currentSearch.searchTabActive ?
                <div className="main-menu-search-active" onClick={() => dispatch(toggleSearchTabActive())}>
                    <div className="search-menu-element-top">
                        <Search />
                        <div className="main-menu-link-text-box">
                            <p className="main-menu-link-text">
                                Search
                            </p>
                        </div>
                    </div>
                    <hr className="search-hr" />
                    <div className="search-menu-element-bottom">
                        <div className="w-1/4 h-full flex items-center ml-2">
                            <div className="w-full h-2/3 flex rounded-md overflow-hidden border-styleColor-400 border gap-0.25 bg-styleColor-400" role="group">
                                <SearchInItem searchKey={searchInAppKey} />
                                <SearchInItem searchKey={searchInLibraryKey} />
                            </div>
                        </div>
                        <div className="w-3/4 h-full ml-2 rounded-md flex items-center">
                            <input className="flex-1 h-5/6 mr-2 rounded-full border-styleColor-300" value={temporarySearchText} onClick={(e) => e.stopPropagation()} onChange={(e) => setTemporarySearchText(e.target.value)} placeholder="search for something..." />
                            <div className="rounded-full mr-2 h-8" onClick={(e) => {e.stopPropagation(); redirectToSearchPage()}}><RightArrowButton /></div>
                        </div>
                    </div>
                </div> :
                <div className={`main-menu-link-item ${window.location.pathname.startsWith("/search") ? "bg-styleColor-200" : ""}`} onClick={() => dispatch(toggleSearchTabActive())}>
                    <Search />
                    <div className="main-menu-link-text-box">
                        <p className="main-menu-link-text">
                            Search
                        </p>
                    </div>
                </div>
                }
                <hr />
                <div onClick={() => navigate("/thisuserdiscography")} className={`main-menu-link-item ${window.location.pathname == "/thisuserdiscography" ? "bg-styleColor-200" : ""}`}>
                    <DiscIcon />
                    <div className="main-menu-link-text-box">
                        <p className="main-menu-link-text">
                            User's discography
                        </p>
                    </div>
                </div>
            </div>
            <div className="main-menu-box-bottom flex flex-col">
                <p className="w-full text-center text-xl font-extrabold my-2">
                    Your library
                </p>
                <div className="w-full flex border-y border-styleColor-300 overflow-hidden bg-styleColor-300 gap-0.25">
                    <MenuSearchTab searchKey={searchBoxArtistKey} currentSearchKey={currentLibrarySection} />
                    <MenuSearchTab searchKey={searchBoxAlbumKey} currentSearchKey={currentLibrarySection} />
                    <MenuSearchTab searchKey={searchBoxSongKey} currentSearchKey={currentLibrarySection} />
                </div>
                <div className="flex-1 flex flex-col gap-1 rounded-b-md overflow-y-auto bg-styleColor-100 py-1">
                    {renderMenuLibrary()}
                </div>
            </div>
        </div>
    )
}