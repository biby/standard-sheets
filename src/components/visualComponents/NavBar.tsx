import { Flex, IconButton, Text, Spacer } from "@chakra-ui/react";
import { TokenResponse } from "@react-oauth/google";
import { LogButton } from "./LogButton";

type NavBarProps = {
  user?: TokenResponse;
  setUser: React.Dispatch<React.SetStateAction<TokenResponse | undefined>>;
};

export function NavBar({ user, setUser }: NavBarProps) {
  return (
    <Flex align="center" mb={4}>
      <IconButton aria-label="Menu" mr={2} />
      <Text fontSize="lg">My Website</Text>
      <Spacer />
      <LogButton user={user} setUser={setUser} />
    </Flex>
  );
}
