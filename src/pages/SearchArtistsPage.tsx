import { useNavigate, useSearchParams } from "react-router-dom";
import ContentContainer from "../elements/ContentContainer";
import { mapUppercaseObjectPropsToLowercase, useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import ErrorMessage from "../elements/ErrorMessage";
import { Artist, ArtistBox, Disc, DiscBox, Song, SongBox } from "./MainPage";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { changeCurrentSearchAtIndex, changeCurrentSearchString, changeCurrentWhatToSearch, searchInAppKey, selectCurrentSearch } from "../slices/currentSearchSlice";
import axios from "axios";
import { searchBoxAlbumKey, searchBoxArtistKey, searchBoxSongKey, serverUrl } from "../constants";
import NavigationArrows from "../elements/NavigationArrows";

interface SearchBox {
    searchKey: string;
}

interface SearchTab {
    searchKey: string;
    currentSearchKey: string;
}

export function SearchTab({ searchKey, currentSearchKey }: SearchTab) {
    const currentSearch = useAppSelector(selectCurrentSearch);
    const navigate = useNavigate();

    let bgColorStylesStr = "bg-styleColor-200";
    let typeInTitle = "";
    let navigateSection = "";

    if (searchKey == currentSearchKey) {
        bgColorStylesStr = "bg-styleColor-300";
    }

    switch (searchKey) {
        case searchBoxArtistKey:
            typeInTitle = "Artists";
            navigateSection = "artists";
            break;
        case searchBoxAlbumKey:
            typeInTitle = "Albums";
            navigateSection = "discs";
            break;
        case searchBoxSongKey:
            typeInTitle = "Songs";
            navigateSection = "songs";
            break;
        default:
            typeInTitle = "default";
            break;
    }

    return (
        <div className={`${bgColorStylesStr} border-styleColor-300`} onClick={() => {navigate(`/search/${navigateSection}?in=${currentSearch.searchAtIndex}&string=${currentSearch.searchString}`);}}>
            <p className="text-center mx-3">
                {typeInTitle}
            </p>
        </div>
    )
}

export function SearchBox({ searchKey }: SearchBox) {
    const {token} = useAuth();

    const dispatch = useAppDispatch();
    const currentSearch = useAppSelector(selectCurrentSearch);

    const navigate = useNavigate();

    const [searchElems, setSearchElems] = useState<Array<any>>([]);

    let typeInTitle: string;
    let contentToShow: any = null;

    useEffect(() => {
        if (token) {
            switch (searchKey) {
                case searchBoxArtistKey:
                    if (currentSearch.searchAtIndex == searchInAppKey) {
                        searchArtists();
                    } else {
                        searchArtistsForLibrary();
                    }
                    break;
                case searchBoxAlbumKey:
                    if (currentSearch.searchAtIndex == searchInAppKey) {
                        searchDiscs();
                    } else {
                        searchDiscsForLibrary();
                    }
                    break;
                case searchBoxSongKey:
                    if (currentSearch.searchAtIndex == searchInAppKey) {
                        searchSongs();
                    } else {
                        searchSongsForLibrary();
                    }
                    break;
                default:
                    break;
            }
        }
    }, [currentSearch, token])

    switch (searchKey) {
        case searchBoxArtistKey:
            typeInTitle = "artists";
            contentToShow = searchElems.map((e) => <ArtistBox artist={e} navigate={navigate} />);
            break;
        case searchBoxAlbumKey:
            typeInTitle = "albums";
            contentToShow = searchElems.map((e) => <DiscBox disc={e} navigate={navigate} />);
            break;
        case searchBoxSongKey:
            typeInTitle = "songs";
            contentToShow = searchElems.map((e) => <SongBox song={e} dispatch={dispatch} navigate={navigate} />);
            break;
        default:
            typeInTitle = "default";
            contentToShow = null;
            break;
    }

    async function searchSongs() {
        let response: Song[] = [];
        console.log(currentSearch.searchString);
        await axios.get(`${serverUrl}/api/search/songs`, {
            params: {
                searchString: currentSearch.searchString
            }
        }).then((res) => response = mapUppercaseObjectPropsToLowercase(res.data));
        
        console.log(response)

        setSearchElems(response);
    }
    
    async function searchArtists() {
        let response: Artist[] = [];

        await axios.get(`${serverUrl}/api/search/artists`, {
            params: {
                searchString: currentSearch.searchString
            }
        }).then((res) => response = mapUppercaseObjectPropsToLowercase(res.data));
    
        setSearchElems(response);
    }
    
    async function searchDiscs() {
        let response: Disc[] = [];

        await axios.get(`${serverUrl}/api/search/discs`, {
            params: {
                searchString: currentSearch.searchString
            }
        }).then((res) => response = mapUppercaseObjectPropsToLowercase(res.data));
    
        setSearchElems(response);
    }

    async function searchSongsForLibrary() {
        let response: Song[] = [];

        await axios.get(`${serverUrl}/api/search/songslibrary`, {
            headers: {
                Authorization: `Bearer ${token.token}`
            },
            params: {
                searchString: currentSearch.searchString
            }
        }).then((res) => response = mapUppercaseObjectPropsToLowercase(res.data));

        setSearchElems(response);
    }
    
    async function searchArtistsForLibrary() {
        let response: Artist[] = [];
        await axios.get(`${serverUrl}/api/search/artistslibrary`, {
            headers: {
                Authorization: `Bearer ${token.token}`
            },
            params: {
                searchString: currentSearch.searchString
            }
         }).then((res) => response = mapUppercaseObjectPropsToLowercase(res.data));
    
        setSearchElems(response);
    }
    
    async function searchDiscsForLibrary() {
        let response: Disc[] = [];
         await axios.get(`${serverUrl}/api/search/discslibrary`, {
            headers: {
                Authorization: `Bearer ${token.token}`
            },
            params: {
                searchString: currentSearch.searchString
            }
         }).then((res) => response = mapUppercaseObjectPropsToLowercase(res.data));
    
        setSearchElems(response);
    }

    return (
        <ContentContainer>
            <div className="flex flex-col h-full">
                <div className="redirect-buttons-container relative">
                    <NavigationArrows />
                    <div className="flex w-full h-full items-center justify-center">
                        <div className="border-md flex justify-between overflow-hidden border-styleColor-300 border rounded-md gap-0.5 bg-styleColor-300 font-extrabold">
                            <SearchTab searchKey={searchBoxAlbumKey} currentSearchKey={searchKey} />
                            <SearchTab searchKey={searchBoxArtistKey} currentSearchKey={searchKey} />
                            <SearchTab searchKey={searchBoxSongKey} currentSearchKey={searchKey} />
                        </div>
                    </div>
                </div>
                <hr className="border-styleColor-200" />
                <div className="flex flex-1 flex-col overflow-y-auto p-8">
                    <p className="text-xl font-bold text-left mb-4">Search results for {typeInTitle}</p>
                    <div className="flex justify-center">
                        <div className="w-auto grid grid-cols-7 auto-cols-auto auto-rows-auto gap-1">
                            {contentToShow}
                        </div>
                    </div>
                </div>
                <ErrorMessage moveStyles={null} />
            </div>
        </ContentContainer>
    )
}

export default function SearchArtistsPage() {
    const dispatch = useAppDispatch();
    const currentSearch = useAppSelector(selectCurrentSearch);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams()

    const {isAuthorized, isLoading} = useAuth();

    useEffect(() => {
        const searchText = searchParams.get("string");
        const searchIn = searchParams.get("in");

        if (searchText && searchIn) {
            dispatch(changeCurrentSearchString(searchText));
            dispatch(changeCurrentSearchAtIndex(searchIn));
            dispatch(changeCurrentWhatToSearch(searchBoxArtistKey));
        }
    }, []);

    useEffect(() => {
        if (!isAuthorized && !isLoading) {
            navigate("/auth/signin");
        }
    }, [isAuthorized, isLoading]);

    return (
        <>
            {currentSearch.searchString ?
            <SearchBox searchKey={searchBoxArtistKey} />
            :
            null}
        </>

    );
}