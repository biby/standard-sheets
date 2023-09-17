import axiosInstance from "../../axiosInstance";
import Select, { SingleValue } from "react-select";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { UserAccesToken } from "../../google/login";

function stringToBool(str: string | null | undefined) {
  return str != null && str != undefined;
}
interface FileOption {
  label: string;
  value: SheetProperties;
}

export type SheetProperties = {
  sheetId: number;
  title: string;
};
type SheetResponse = {
  properties: SheetProperties;
};
type SheetsResponse = {
  sheets: SheetResponse[];
};

export function listSheets(
  accessToken: string | null | undefined,
  spreadsheetId: string | null | undefined
): FileOption[] {
  const resp = useQuery({
    enabled: stringToBool(accessToken) && stringToBool(spreadsheetId),
    queryFn: () =>
      axiosInstance.get<SheetsResponse>(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            fields: "sheets",
          },
        }
      ),
    queryKey: ["sheetData", spreadsheetId],
  });
  if (!resp.data?.data) {
    return [];
  }

  const sheets: SheetResponse[] = resp.data.data.sheets;
  const options: FileOption[] = sheets.map((f) => {
    return {
      value: f.properties,
      label: f.properties.title,
    };
  });

  return options;
}

type SheetSelectProps = {
  spreadsheetId: string | null | undefined;
  sheetType: string;
  onChange: (option: SingleValue<FileOption | null | undefined>) => void;
};

export function SheetSelect({
  spreadsheetId,
  sheetType,
  onChange,
}: SheetSelectProps) {
  const context = useContext(UserAccesToken);

  const options = listSheets(context?.access_token, spreadsheetId);
  return (
    <Select
      className="basic-single"
      classNamePrefix="select"
      name="Sheet"
      options={options}
      placeholder={`Choose ${sheetType} Sheet`}
      onChange={onChange}
    />
  );
}
