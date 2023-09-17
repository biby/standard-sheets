import axiosInstance from "../axiosInstance";
import { StudentInfo } from "../components/visualComponents/StudentList";
import { studentPageName } from "./sheetManipulations";
import { R1C1toA1 } from "../utils";
import { SheetProperties } from "../components/visualComponents/SheetSelect";

function generateStudentTabData(
  templateData: string[][],
  student: StudentInfo,
  rosterSheetName: string
): string[][] {
  const regExp = new RegExp(`=${rosterSheetName}!(?<row>[a-zA-Z]+)\\d+`, "g");
  let dataCopy = templateData.map((col) => [
    ...col.map((cell) => {
      if (typeof cell === "string") {
        return cell?.replace(
          regExp,
          `=${rosterSheetName}!$<row>${student.row}`
        );
      }
      return cell;
    }),
  ]);
  return dataCopy;
}

export async function createStudentTab(
  accessToken: string,
  spreadsheetId: string,
  templateId: number,
  students: StudentInfo[],
  sheetList: SheetProperties[],
  recreate: boolean = false
): Promise<void> {
  console.log({ recreate, sheetList, students });
  await axiosInstance.post(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      requests: [
        ...sheetList
          .filter(
            (sheet) =>
              recreate &&
              students
                .map((student) => studentPageName(student))
                .includes(sheet.title)
          )
          .map<any>((sheet) => {
            return {
              deleteSheet: {
                sheetId: sheet.sheetId,
              },
            };
          }),

        ...students
          .filter(
            (student) =>
              recreate ||
              !sheetList
                .map((sheet) => sheet.title)
                .includes(studentPageName(student))
          )
          .map<any>((student) => {
            return {
              duplicateSheet: {
                sourceSheetId: templateId,
                newSheetName: studentPageName(student),
                insertSheetIndex: student.row + 2,
              },
            };
          }),
      ],
      includeSpreadsheetInResponse: false,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
}

export async function updateStudentTab(
  accessToken: string,
  spreadsheetId: string,
  students: StudentInfo[],
  templateData: string[][],
  rosterSheetName: string
): Promise<void> {
  const range = `A1:${R1C1toA1(
    templateData.length,
    Math.max(...templateData.map((row) => row.length))
  )}`;
  await axiosInstance.post(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      valueInputOption: "USER_ENTERED",
      includeValuesInResponse: false,
      responseValueRenderOption: "FORMATTED_VALUE",
      responseDateTimeRenderOption: "SERIAL_NUMBER",
      data: students.map<any>((student) => {
        return {
          range: `${studentPageName(student)}!${range}`,
          values: generateStudentTabData(
            templateData,
            student,
            rosterSheetName
          ),
        };
      }),
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
}
