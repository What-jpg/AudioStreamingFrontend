import { useEffect, useState } from "react";
import ContentContainer from "../elements/ContentContainer";
import ErrorMessage from "../elements/ErrorMessage";
import { Disc, DiscBox } from "./MainPage";
import axios from "axios";
import { serverUrl } from "../constants";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectUser } from "../slices/userSlice";
import { mapUppercaseObjectPropsToLowercase, useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { setError } from "../slices/errorSlice";
import NavigationArrows from "../elements/NavigationArrows";

export default function ThisUserDiscography() {
    const [discs, setDiscs] = useState<null | Disc[]>(null);

    const dispatch = useAppDispatch();

    const {isAuthorized, isLoading} = useAuth();

    const userInfo = useAppSelector(selectUser);

    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthorized && !isLoading) {
            navigate("/auth/signin");
        }
    }, [isAuthorized, isLoading]);

    useEffect(() => {
        getArtistDiscography()
    }, [userInfo])

    const getArtistDiscography = async () => {
        if (userInfo) {
            try {
                let error: any = null;
        
                await axios.get(`${serverUrl}/api/discs/getallartistdiscography/${userInfo.id}`).then(resp => setDiscs(mapUppercaseObjectPropsToLowercase(resp.data))).catch((ex) => error = ex);
        
                if (error) {
                    throw error
                }
        
                return true;
            } catch(ex: any) {
                dispatch(setError(ex));
        
                return false;
            }
        }
    }

    const contentToShow = discs ? discs.map((e) => <DiscBox disc={e} navigate={navigate} />) : null;

    return (
        <ContentContainer>
            <div className="flex flex-col h-full">
                <NavigationArrows />
                <hr className="border-styleColor-200" />
                <div className="flex flex-1 flex-col overflow-y-auto p-8">
                    <p className="text-xl font-bold text-left mb-4">User's discography</p>
                    <div className={`flex ${contentToShow ? "" : "justify-center"}`}>
                        <div className="w-auto grid grid-cols-7 auto-cols-auto auto-rows-auto gap-1">
                            {contentToShow}
                            <div onClick={() => navigate("/create/disc")} className="border border-styleColor-300 flex w-40 h-57.3375 justify-center items-center text-5xl bg-styleColor-100 rounded-md">+</div>
                        </div>
                    </div>
                </div>
                <ErrorMessage moveStyles={null} />
            </div>
        </ContentContainer>
    );
}