import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { SearchBox } from "./SearchArtistsPage";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { changeCurrentSearchAtIndex, changeCurrentSearchString, changeCurrentWhatToSearch, selectCurrentSearch } from "../slices/currentSearchSlice";
import { searchBoxAlbumKey } from "../constants";

export default function SearchDiscsPage() {
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
            dispatch(changeCurrentWhatToSearch(searchBoxAlbumKey));
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
            <SearchBox searchKey={searchBoxAlbumKey} /> 
            :
            null}
        </>
    );
}