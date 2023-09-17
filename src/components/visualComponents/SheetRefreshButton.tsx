import axiosInstance from "../../axiosInstance.tsx";
import { sheetData } from "../students/templateSheet";
import { SheetProperties } from "../visualComponents/SheetSelect";
import { useContext } from "react";
import { UserAccesToken } from "../../google/login.tsx";
import { Button } from "@chakra-ui/react";
import { R1C1toA1 } from "../../utils.tsx";

async function refreshSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetId: SheetProperties,
  data: any[][]
): Promise<void> {
  const range = `A1:${R1C1toA1(
    data.length,
    Math.max(...data.map((row) => row.length))
  )}`;
  await axiosInstance.post(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      valueInputOption: "USER_ENTERED",
      includeValuesInResponse: false,
      responseValueRenderOption: "FORMATTED_VALUE",
      responseDateTimeRenderOption: "SERIAL_NUMBER",
      data: [
        {
          range: `${sheetId?.title}!${range}`,
          values: data,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
}

type SheetRefreshButtonProps = {
  spreadSheetId: string | undefined;
  sheetId: SheetProperties | undefined;
};

export function SheetRefreshButton({
  spreadSheetId,
  sheetId,
}: SheetRefreshButtonProps) {
  console.log("test");
  const context = useContext(UserAccesToken);
  console.log({ context });
  console.log("refreshSheet");
  const data = sheetData(context?.access_token, spreadSheetId, sheetId?.title);
  const values = data?.values;
  console.log({ values });

  return (
    <Button
      isDisabled={
        context == undefined ||
        spreadSheetId == undefined ||
        sheetId == undefined ||
        values == undefined
      }
      mb={2}
      onClick={() =>
        refreshSheet(context?.access_token, spreadSheetId, sheetId, values)
      }
    >
      {`Refresh ${sheetId?.title || ""} page`}
    </Button>
  );
}
