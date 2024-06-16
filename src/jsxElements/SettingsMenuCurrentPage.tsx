import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { createFormDataFromObject, mapUppercaseObjectPropsToLowercase, useAuth, useDidUpdateEffect } from "../contexts/AuthContext";
import { deactivateSettingsMenu, setSettingsMenuPage } from "../slices/settingsMenuSlice";
import { DbFileStr, selectUser, setUser } from "../slices/userSlice";
import LeftArrow from "../svgElements/LeftArrow";
import RightArrow from "../svgElements/RightArrow";
import SettingsMenuStyleColorBox from "./SettingsMenuStyleColorBox";
import { Buffer } from "buffer";
import { setError } from "../slices/errorSlice";
import axios from "axios";
import { serverUrl } from "../constants";
import { useNavigate } from "react-router-dom";

interface SettingsMenuCurrentPage {
    pageIndex: number;
}

export function convertDbFileToBlob(file: DbFileStr | null | undefined) {
    if (file) {
        return new Blob([Buffer.from(file.content, "base64")], {type: file.type});
    } else {
        return null;
    }
}

export function createUrlForAvatar(file: Blob | null) {
    return file ? URL.createObjectURL(file) : "data:image/png;base64,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";
}

export function createUrlForDbFileAvatar(dbFile: DbFileStr | null | undefined) {
    const file = convertDbFileToBlob(dbFile);
    return createUrlForAvatar(file);
}

export function createUrlForCover(file: Blob | null) {
    return file ? URL.createObjectURL(file) : "https://files.readme.io/f2e91bb-portalDocs-sonosApp-defaultArtAlone.png";
}

export function createUrlForDbFileCover(dbFile: DbFileStr | null | undefined) {
    const file = convertDbFileToBlob(dbFile);
    return createUrlForCover(file);
}

export function createUrlForBlob(file: Blob) {
    return URL.createObjectURL(file);
}

export function createUrlForDbFile(dbFile: DbFileStr) {
    const file = convertDbFileToBlob(dbFile);
    return file ? createUrlForBlob(file) : "";
}

export async function createBufferForDbFile(dbFile: DbFileStr) {
    return await convertDbFileToBlob(dbFile)?.arrayBuffer();
}

export const areNullableBlobsEqual = async (blob1: Blob | null, blob2: Blob | null) => {
    if (blob1 && blob2) {
        return !Buffer.from(await blob1.arrayBuffer()).compare(
            Buffer.from(await blob2.arrayBuffer())
        );
    } else if (blob1 == blob2) {
        return true;
    } else {
        return false;
    }
  };

export default function SettingsMenuCurrentPage({pageIndex} : SettingsMenuCurrentPage) {
    const dispatch = useAppDispatch();
    const {logout} = useAuth();
    const user = useAppSelector(selectUser);
    const [isChangingUser, setIsChangingUser] = useState(false);

    const avatarBlob = convertDbFileToBlob(user?.avatar);

    const navigate = useNavigate();

    const [changingName, setChangingName] = useState(user?.name);
    const [changingEmail, setChangingEmail] = useState(user?.email);
    const [changingFirstPassword, setChangingFirstPassword] = useState("");
    const [changingSecondPassword, setChangingSecondPassword] = useState("");
    const [changingCurrentPassword, setChangingCurrentPassword] = useState("");
    const [changingAvatar, setChangingAvatar] = useState<Blob | null>(avatarBlob);
    const [changingIsTwoFactorAuthActive, setChangingIsTwoFactorAuthActive] = useState(user?.isTwoFactorAuthActive);

    const {token} = useAuth();

    const avatarUrl = useRef(createUrlForAvatar(avatarBlob));
    const changingAvatarUrl = useRef(createUrlForAvatar(changingAvatar));

    let elementToRender = null;

    async function updateUserInfo() {
        axios.get(`${serverUrl}/api/artists/getthisuserinfo`, {
            headers: {
            "Authorization": `Bearer ${token.token}`
            }
        }).then((res) => dispatch(setUser(mapUppercaseObjectPropsToLowercase(res.data))));
    }

    function cancelChangingUser() {
        setIsChangingUser(false);
    }

    useEffect(() => {
        setChangingName(user?.name);
        setChangingEmail(user?.email);
        setChangingFirstPassword("");
        setChangingSecondPassword("");
        setChangingCurrentPassword("");
        setChangingAvatar(avatarBlob);
        setChangingIsTwoFactorAuthActive(user?.isTwoFactorAuthActive);
    }, [isChangingUser]);

    useDidUpdateEffect(() => {
        avatarUrl.current = createUrlForAvatar(avatarBlob);
    }, [avatarBlob]);

    useDidUpdateEffect(() => {
        changingAvatarUrl.current = createUrlForAvatar(changingAvatar);
    }, [changingAvatar]);

    async function changeUserInfo() {
        try {
            if (changingFirstPassword != changingSecondPassword) {
                throw new Error("New passwords aren't the same");
            }

            const newName = changingName != user?.name ? changingName : null;
            const newEmail = changingEmail != user?.email ? changingEmail : null;
            const newPassword = changingFirstPassword ? changingFirstPassword : null;
            const newAvatar = !(await areNullableBlobsEqual(changingAvatar, avatarBlob)) ? changingAvatar : null;
            const newIsTwoFactorAuthActive = changingIsTwoFactorAuthActive != user?.isTwoFactorAuthActive ? "" + changingIsTwoFactorAuthActive : null;
            const needToSetAvatarToDefault = !changingAvatar;

            const currentPassword = changingCurrentPassword;

            let error: any = null;

            await axios.put(`${serverUrl}/api/update/updateuserinfo`, createFormDataFromObject({newName, newEmail, newPassword, newAvatar, currentPassword, newIsTwoFactorAuthActive, needToSetAvatarToDefault}), {
                headers: {
                "Authorization": `Bearer ${token.token}`
                }}).then(() => { updateUserInfo(); cancelChangingUser()}).catch((ex) => error = ex);

            if (error) {
                throw error;
            }

            if (newEmail) {
                dispatch(deactivateSettingsMenu());
                navigate(`/update/recievecode/${newEmail}`);
            }
        } catch (ex: any) {
            dispatch(setError(ex));
        }
    }

    switch (pageIndex) {
        case 0:
            elementToRender = <>
                <div className="menu-option" onClick={() => dispatch(setSettingsMenuPage(1))}>
                    <div className="w-full font-semibold">
                        Interface color
                    </div>
                    <div className="absolute right-0">
                            <RightArrow />
                        </div>
                </div>
                {user ?
                    <div className="menu-option" onClick={() => dispatch(setSettingsMenuPage(2))}>
                        <div className="w-full font-semibold">
                            User
                        </div>
                        <div className="absolute right-0">
                            <RightArrow />
                        </div>
                    </div>
                    :
                    null
                }
            </>
            break;
        case 1:
            elementToRender = <>
                <div className="flex items-center w-full p-1">
                    <div onClick={() => dispatch(setSettingsMenuPage(0))}>
                        <LeftArrow />
                    </div>
                    <div className="w-full font-bold">
                        Interface color
                    </div>
                </div>
                <hr className="border-styleColor-200" />
                <div className="grid grid-cols-4 w-full p-2 grid-rows-6 gap-2">
                    <SettingsMenuStyleColorBox color="slate" />
                    <SettingsMenuStyleColorBox color="gray" />
                    <SettingsMenuStyleColorBox color="zinc" />
                    <SettingsMenuStyleColorBox color="neutral" />
                    <SettingsMenuStyleColorBox color="stone" />
                    <SettingsMenuStyleColorBox color="red" />
                    <SettingsMenuStyleColorBox color="orange" />
                    <SettingsMenuStyleColorBox color="amber" />
                    <SettingsMenuStyleColorBox color="yellow" />
                    <SettingsMenuStyleColorBox color="lime" />
                    <SettingsMenuStyleColorBox color="green" />
                    <SettingsMenuStyleColorBox color="emerald" />
                    <SettingsMenuStyleColorBox color="teal" />
                    <SettingsMenuStyleColorBox color="cyan" />
                    <SettingsMenuStyleColorBox color="sky" />
                    <SettingsMenuStyleColorBox color="blue" />
                    <SettingsMenuStyleColorBox color="indigo" />
                    <SettingsMenuStyleColorBox color="violet" />
                    <SettingsMenuStyleColorBox color="purple" />
                    <SettingsMenuStyleColorBox color="fuchsia" />
                    <SettingsMenuStyleColorBox color="pink" />
                    <SettingsMenuStyleColorBox color="rose" />
                </div>
            </>
            break;
        case 2:
            if (!isChangingUser) {
                elementToRender = <>
                    <div className="flex items-center w-full p-1">
                        <div className="absolute left-0" onClick={() => dispatch(setSettingsMenuPage(0))}>
                            <LeftArrow />
                        </div>
                        <div className="flex-1 font-bold">
                            User
                        </div>
                    </div>
                    <hr className="border-styleColor-200" />
                    <div className="flex justify-center my-2">
                        <img className="w-32 h-32 rounded-full object-cover" src={avatarUrl.current} />
                    </div>
                    <div className="w-full flex flex-col items-center pb-2">
                        <div className="w-2/3 flex flex-col gap-1">
                            <div className="flex">
                                <p className="mr-2 w-16 bg-styleColor-400 text-white p-1 rounded-md">Name</p>
                                <p className="flex-1">{user?.name}</p>
                            </div>
                            <div className="flex">
                                <p className="mr-2 w-16 bg-styleColor-400 text-white p-1 rounded-md">Email</p>
                                <p className="flex-1">{user?.email}</p>
                            </div>
                            {user?.isTwoFactorAuthActive ? <div className="bg-styleColor-400 flex-1 p-1 rounded-md text-white">
                                Two factor auth active
                            </div> : null}
                        </div>
                        <button className="bg-styleColor-500 w-3/4 text-white p-1 rounded-md mt-3" onClick={() => setIsChangingUser(true)}>
                                Change Info
                        </button>
                        <button onClick={logout} className="bg-styleColor-700 text-white p-1 rounded-md w-4/5 mt-4">Logout</button>
                    </div>
                </>
            } else {
                elementToRender = <>
                <div className="flex items-center w-full p-1">
                    <div className="absolute left-0" onClick={() => dispatch(setSettingsMenuPage(0))}>
                        <LeftArrow />
                    </div>
                    <div className="flex-1 font-bold">
                        User
                    </div>
                </div>
                <hr className="border-styleColor-200" />
                <div className="flex justify-center my-2">
                    <label className="flex-1 flex flex-col items-center">
                        <input type="file" className="hidden" onChange={(e) => {setChangingAvatar(e.target.files ? e.target.files.item(0) : null ); e.target.value = ""}}/>
                        <img className="w-32 h-32 rounded-full object-cover" src={changingAvatarUrl.current} />
                        {changingAvatar ? <button className="text-sm mt-2 p-1 bg-styleColor-400 text-white rounded" onClick={(e) => {setChangingAvatar(null); e.stopPropagation(); e.preventDefault()}}>Clear chosen</button> : null}
                    </label>
                </div>
                <div className="w-full flex flex-col items-center pb-2">
                    <div className="w-3/4 flex flex-col">
                        <div className="grid grid-cols-3 grid-rows-4 gap-1">
                            <div className="bg-styleColor-400 p-1 rounded-md text-white">
                                Name
                            </div>
                            <div className="col-span-2">
                                <input className="w-full h-full border border-styleColor-300 rounded" value={changingName} onChange={(e) => setChangingName(e.target.value)} />
                            </div>

                            <div className="bg-styleColor-400 p-1 rounded-md text-white">
                                Email
                            </div>
                            <div className="col-span-2">
                                <input className="w-full h-full border border-styleColor-300 rounded" value={changingEmail} onChange={(e) => setChangingEmail(e.target.value)} />
                            </div>

                            <div className="bg-styleColor-400 row-span-2 flex flex-col text-center justify-center p-1 rounded-md text-white">
                                <p>
                                    Password
                                </p>
                            </div>
                            <div className="col-span-2 border border-styleColor-300 rounded">
                                <input className="w-full h-full border-0 rounded" type="password" value={changingFirstPassword} onChange={(e) => setChangingFirstPassword(e.target.value)} />
                            </div>
                            <div className="col-span-2 border border-styleColor-300 rounded">
                                <input className="w-full h-full border-0 rounded" type="password" value={changingSecondPassword} onChange={(e) => setChangingSecondPassword(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex mt-1">
                            <div className="bg-styleColor-400 flex-1 p-1 rounded-md text-white">
                                Is two factor auth active
                            </div>
                            <div className="ml-1 h-8 w-8">
                                <input className="w-full h-full border border-styleColor-300 rounded accent-styleColor-500" type="checkbox" checked={changingIsTwoFactorAuthActive} onChange={(e) => setChangingIsTwoFactorAuthActive(e.target.checked)} />
                            </div>
                        </div>
                        <div className="bg-styleColor-200 w-full rounded flex mt-1 p-1 border border-styleColor-300">
                            <div className="rounded p-1 bg-styleColor-400 mr-1 text-white">
                                Current password
                            </div>
                            <div className="border border-styleColor-300 rounded">
                                <input className="w-full h-full border-0 rounded" type="password" value={changingCurrentPassword} onChange={(e) => setChangingCurrentPassword(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex mt-2 gap-1">
                            <button className="bg-styleColor-500 text-white p-1 rounded-md w-1/2" onClick={changeUserInfo}>
                                Change Info
                            </button>
                            <button className="bg-styleColor-600 text-white p-1 rounded-md w-1/2" onClick={cancelChangingUser}>
                                Cancel Changes
                            </button>
                        </div>
                    </div>
                    <button onClick={logout} className="bg-styleColor-700 text-white p-1 rounded-md w-4/5 mt-4">Logout</button>
                </div>
            </>
            } 
            break;
        default:
            break;
    }

    return (
        <>
            {elementToRender}
        </>
    );
}