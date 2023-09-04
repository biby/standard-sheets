import { useState } from "react";
import { UserAccesToken } from "./google/login";
import { Box } from "@chakra-ui/react";
import { TokenResponse } from "@react-oauth/google";
import { NavBar } from "./components/visualComponents/NavBar";
import { MainContent } from "./components/visualComponents/MainPannel";

function App() {
  const getUser = (): TokenResponse | undefined => {
    const user = localStorage.getItem("userTokenResponse");
    if (user == null) {
      return undefined;
    }
    return JSON.parse(user);
  };
  const [user, _setUser] = useState<TokenResponse | undefined>(getUser());
  const setUser = (tokenResponse?: TokenResponse) => {
    if (tokenResponse) {
      localStorage.setItem("userTokenResponse", JSON.stringify(tokenResponse));
    } else {
      localStorage.removeItem("userTokenResponse");
    }
    return _setUser(tokenResponse);
  };
  return (
    <UserAccesToken.Provider value={user}>
      <Box p={4}>
        <NavBar user={user} setUser={setUser} />

        <MainContent />
      </Box>
    </UserAccesToken.Provider>
  );
}

export default App;
