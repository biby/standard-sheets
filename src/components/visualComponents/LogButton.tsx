import {
  googleLogout,
  useGoogleLogin,
  TokenResponse,
} from "@react-oauth/google";

import { Button } from "@chakra-ui/react";
import { SCOPES } from "../../settings";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type LogButtonProps = {
  user?: TokenResponse;
  setUser: React.Dispatch<React.SetStateAction<TokenResponse | undefined>>;
};

function useUserInfo(accessToken?: string) {
  const profile = useQuery({
    enabled: accessToken != undefined,
    queryFn: () =>
      axios.get(`https://www.googleapis.com/oauth2/v1/userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    queryKey: ["userInfo", accessToken],
  });
  if (!profile.data) {
    return;
  }
  return profile.data.data;
}

export function LogButton({ user, setUser }: LogButtonProps) {
  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setUser(codeResponse);
      console.log(codeResponse);
    },
    onError: (error) => console.log("Login Failed:", error),
    scope: SCOPES.join(" "),
  });
  const logOut = () => {
    googleLogout();
    setUser(undefined);
  };
  const userInfo = useUserInfo(user?.access_token);
  console.log(user);
  return user ? (
    <Button onClick={logOut}>{userInfo?.email} Log out</Button>
  ) : (
    <Button onClick={() => login()}>Log In</Button>
  );
}
