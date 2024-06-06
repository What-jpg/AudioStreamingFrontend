import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import MainPage from './pages/MainPage';
import DiscPage from './pages/DiscPage';
import ArtistPage from './pages/ArtistPage';
import SearchArtistsPage from './pages/SearchArtistsPage';
import SearchDiscsPage from './pages/SearchDiscsPage';
import SearchSongsPage from './pages/SearchSongsPage';
import AuthCodePage from './pages/AuthCodePage';
import { AuthContext, useProvideAuth } from './contexts/AuthContext';
import GlobalWrapper from './elements/GlobalWapper';
import UpdateCodePage from './pages/UpdateCodePage';
import Player from './elements/Player';
import NewDiscPage from './pages/NewDiscPage';
import EditDiscPage from './pages/EditDiscPage';
import ThisUserDiscography from './pages/ThisUserDiscography';

export const styleColorForLocalStorage = "styleColor";

function App() {
  return (
    <AuthContext.Provider value={useProvideAuth()}>
        <div className="text-center w-full h-full">
            <Router>
              <Player>
                <GlobalWrapper>
                  <Routes>
                    <Route path="" element={<MainPage />} />
                    <Route path="auth/signin" element={<SignInPage />} />
                    <Route path="auth/signup" element={<SignUpPage />} />
                    <Route path="disc/:discId" element={<DiscPage />} />
                    <Route path="artist/:artistId" element={<ArtistPage />} />
                    <Route path="search/artists" element={<SearchArtistsPage />} />
                    <Route path="search/discs" element={<SearchDiscsPage />} />
                    <Route path="search/songs" element={<SearchSongsPage />} />
                    <Route path="auth/recievecode/:email" element={<AuthCodePage />} />
                    <Route path="update/recievecode/:email" element={<UpdateCodePage />} />
                    <Route path="create/disc" element={<NewDiscPage />} />
                    <Route path="update/disc/:discId" element={<EditDiscPage />} />
                    <Route path="thisuserdiscography" element={<ThisUserDiscography />} />
                  </Routes>
                </GlobalWrapper>
              </Player>
            </Router>
        </div>
    </AuthContext.Provider>
  );
}

export default App;
