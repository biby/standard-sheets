import { useState } from "react";
import { UserAccesToken } from "./google/login";
import { Box } from "@chakra-ui/react";
import { TokenResponse } from "@react-oauth/google";
import { NavBar } from "./components/visualComponents/NavBar";
import { MainContent } from "./components/visualComponents/MainPannel";

function App() {
  const [user, setUser] = useState<TokenResponse | undefined>(undefined);
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
