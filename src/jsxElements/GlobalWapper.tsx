import { ChildrenProp } from "./MainBox";
import { useEffect } from 'react';
import { selectStyleColor } from '../slices/styleColorSlice';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { mapUppercaseObjectPropsToLowercase, useAuth } from '../contexts/AuthContext';
import { clearUser, setUser } from '../slices/userSlice';
import axios from 'axios';
import { serverUrl } from '../constants';
import setColors from "../functions/setColors";
import { styleColorForLocalStorage } from "../App";
import { useLocation, useNavigate } from "react-router-dom";
import { clearError, setError } from "../slices/errorSlice";
import { changeLocationIndex, changeLocationInfo, selectLocation } from "../slices/locationSlice";
import { changeArtistLibrarySection, changeDiscLibrarySection, changeSongLibrarySection } from "../slices/currentLibrarySearchSlice";
import { sendRequestWithCatch } from "./MainMenuLibraryArtist";

export async function getSongsForUserLibrary(token: string, dispatch: any) {
    return await sendRequestWithCatch(axios.get(`${serverUrl}/api/follow/songs`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then((response) => dispatch(changeSongLibrarySection(mapUppercaseObjectPropsToLowercase(response.data)))), dispatch);
}

export async function getArtistsForUserLibrary(token: string, dispatch: any) {
    return await sendRequestWithCatch(axios.get(`${serverUrl}/api/follow/artists`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then((response) => dispatch(changeArtistLibrarySection(mapUppercaseObjectPropsToLowercase(response.data)))), dispatch);
}

export async function getDiscsForUserLibrary(token: string, dispatch: any) {
    return await sendRequestWithCatch(axios.get(`${serverUrl}/api/follow/discs`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then((response) => dispatch(changeDiscLibrarySection(mapUppercaseObjectPropsToLowercase(response.data)))), dispatch);
}

export default function GlobalWrapper({children}: ChildrenProp) {
    const styleColor = useAppSelector(selectStyleColor);
    const {isAuthorized, token} = useAuth();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const locationRedux = useAppSelector(selectLocation).value;

    const currentLocationRedux = locationRedux.locationsHistoryArr[locationRedux.currentIndex];
    const currentLocationJS = location.pathname;

    useEffect(() => {
        if (location.pathname != currentLocationRedux) {
            if (currentLocationRedux.startsWith("/auth")) {
                dispatch(changeLocationInfo({locationsHistoryArr: [location.pathname], currentIndex: 0}));
            } else {
                if (locationRedux.locationsHistoryArr.length != locationRedux.currentIndex + 1 && location.pathname == locationRedux.locationsHistoryArr[locationRedux.currentIndex + 1]) {
                    dispatch(changeLocationIndex(locationRedux.currentIndex + 1));
                } else {
                    dispatch(changeLocationInfo({locationsHistoryArr: [...locationRedux.locationsHistoryArr.filter((e, i) => i <= locationRedux.currentIndex), location.pathname], currentIndex: locationRedux.currentIndex + 1}));
                }
            }
        }
    }, [currentLocationJS]);

    useEffect(() => {
        if (isAuthorized) {
            dispatch(changeLocationInfo({locationsHistoryArr: [location.pathname], currentIndex: 0}));
        }
    }, [isAuthorized]);

    useEffect(() => {
        if (isAuthorized) {
            getArtistsForUserLibrary(token.token, dispatch);
            getDiscsForUserLibrary(token.token, dispatch);
            getSongsForUserLibrary(token.token, dispatch);
        }
    }, [isAuthorized]);

    useEffect(() => {
        if (location.pathname != currentLocationRedux) {
            navigate(currentLocationRedux);
        }
    }, [currentLocationRedux]);

    useEffect(() => {
        localStorage.setItem(styleColorForLocalStorage, styleColor);
        const rootStyle = document.documentElement;

        setColors(rootStyle.style, styleColor);
    }, [styleColor]);

    useEffect(() => {
        if (isAuthorized) {
            axios.get(`${serverUrl}/api/artists/getthisuserinfo`, {
                headers: {
                "Authorization": `Bearer ${token.token}`
                }
            }).then((res) => dispatch(setUser(mapUppercaseObjectPropsToLowercase(res.data))));
        } else {
            dispatch(clearUser());
        }
    }, [isAuthorized]);

    useEffect(() => {
        dispatch(clearError())
    }, [location]);

    return (
        <>
            {children}
        </>
    )
}