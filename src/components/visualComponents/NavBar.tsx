import { Flex, IconButton, Text, Spacer } from "@chakra-ui/react";
import { TokenResponse } from "@react-oauth/google";
import { LogButton } from "./LogButton";

type NavBarProps = {
  user?: TokenResponse;
  setUser: (tokenResponse?: TokenResponse) => void;
};

export function NavBar({ user, setUser }: NavBarProps) {
  return (
    <Flex align="center" mb={4}>
      <IconButton aria-label="Menu" mr={2} />
      <Text fontSize="lg">Standards Sheet Creator</Text>
      <Spacer />
      <LogButton user={user} setUser={setUser} />
    </Flex>
  );
}
