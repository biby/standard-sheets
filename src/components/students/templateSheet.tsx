import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export type SpreadSheetValues = {
  range: string;
  values: string[][];
};

export function templateData(
  accessToken?: string,
  spreadsheetId?: string,
  templateSheetName?: string
): SpreadSheetValues | undefined {
  const resp = useQuery({
    enabled:
      templateSheetName != undefined &&
      accessToken != undefined &&
      spreadsheetId != undefined,
    queryFn: () =>
      axios.get<SpreadSheetValues>(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${templateSheetName}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ),
    queryKey: ["templateData", spreadsheetId, templateSheetName],
  });
  return resp.data?.data;
}
