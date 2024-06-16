import MainBox, { ChildrenProp } from "./MainBox";
import MainMenu from "./MainMenu";
import SettingsMenu from "./SettingsMenu";
import "../css/svgElements/playButton.scss";

export interface SongPartWithContent {
    songContentPart: string;
    thisPartDuration: number;
    whenToUpdate: number | null;
}

export default function ContentContainer({ children }: ChildrenProp) {
  return (
      <div className="flex flex-1 relative">
          <MainBox>
              {children}
          </MainBox>
          <MainMenu />
          <SettingsMenu />
      </div>
  );
}