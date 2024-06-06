import { JsxElement } from "typescript";

export interface ChildrenProp {
    children: JsxElement | React.ReactElement;
}

export default function MainBox({ children }: ChildrenProp) {
    return (
        <div className="w-3/4 absolute top-0 right-0 h-full flex">
            <div className="bg-styleColor-50 m-2 ml-1 rounded-md border border-styleColor-200 flex-1 overflow-hidden">
                <>
                    {children}
                </>
            </div>
        </div>
    );
}