import LeftArrowButton from "../svgElements/LeftArrowButton";
import RightArrowButton from "../svgElements/RightArrowButton";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { changeLocationIndex, selectLocation } from "../slices/locationSlice";

export default function NavigationArrows() {
    const dispatch = useAppDispatch();

    const locationRedux = useAppSelector(selectLocation).value;

    return (
        <div className="redirect-buttons-container">
            <div 
                className={`redirect-button${locationRedux.currentIndex == 0 ? "-deactivated" : ""}`}
                onClick={() => locationRedux.currentIndex > 0 ? dispatch(changeLocationIndex(locationRedux.currentIndex - 1)) : null}
            >
                <LeftArrowButton />
            </div>
            <div 
                className={`redirect-button${locationRedux.locationsHistoryArr.length > locationRedux.currentIndex + 1 ? "" : "-deactivated"}`} 
                onClick={() => locationRedux.locationsHistoryArr.length > locationRedux.currentIndex + 1 ? dispatch(changeLocationIndex(locationRedux.currentIndex + 1)) : null}
            >
                <RightArrowButton />
            </div>
        </div>
    );
}