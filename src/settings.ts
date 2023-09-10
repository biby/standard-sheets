import { useQuery } from "@tanstack/react-query";

export function getWebToken(): string {
   const resp = useQuery({
    enabled: true,
    queryFn: async ():Promise<string> =>
        {
          const res = await fetch('webToken.json')
          return (await res.json()).web.client_id
        },
    queryKey: ["getWebToken"],
  });
  return resp.data || "1"
}
export const developerKey: string  = "";
export const SCOPES = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
  ];
  