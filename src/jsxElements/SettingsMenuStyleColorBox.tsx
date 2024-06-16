import { useDispatch } from "react-redux";
import { setStyleColor, selectStyleColor } from "../slices/styleColorSlice";
import "../css/elements/styleColorBoxes.scss";
import { useAppSelector } from "../app/hooks";

interface SettingsMenuStyleColorBox {
    color: string;
}

export default function SettingsMenuStyleColorBox({color}: SettingsMenuStyleColorBox) {
    const dispatch = useDispatch();
    const styleColor = useAppSelector(selectStyleColor);

    let styleIfCurent = "";
    if (styleColor == color) {
        styleIfCurent = "-current"
    }

    return (
        <div className={`bg-${color}-500 style-color-box${styleIfCurent}`} onClick={() => dispatch(setStyleColor(color))}></div>
    );
}