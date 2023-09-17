import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../axiosInstance";

export type SpreadSheetValues = {
  range: string;
  values: string[][];
};

export function sheetData(
  accessToken?: string,
  spreadsheetId?: string,
  sheetName?: string
): SpreadSheetValues | undefined {
  const resp = useQuery({
    enabled:
      sheetName != undefined &&
      accessToken != undefined &&
      spreadsheetId != undefined,
    queryFn: () =>
      axiosInstance.get<SpreadSheetValues>(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            valueRenderOption: "FORMULA",
          },
        }
      ),
    queryKey: ["templateData", spreadsheetId, sheetName],
  });
  return resp.data?.data;
}
