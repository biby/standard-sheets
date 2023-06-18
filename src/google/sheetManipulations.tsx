import axios from "axios";
import { StudentInfo } from "../components/visualComponents/StudentList";
import { stringToBool } from "../utils";
import { useQuery } from "@tanstack/react-query";

export function studentPageName(student: StudentInfo): string {
  return student.id.padStart(2, "0");
}
export function studentSpreadSheetName(student: StudentInfo): string {
  return `${studentPageName(student)}_${student.firstname}_${student.name}`;
}

async function createStudentTab(
  accessToken: string,
  spreadsheetId: string,
  templateId: number,
  students: StudentInfo[]
): Promise<void> {
  await axios.post(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      requests: students.map<any>((student) => {
        return {
          duplicateSheet: {
            sourceSheetId: templateId,
            newSheetName: studentPageName(student),
          },
        };
      }),
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

async function updateStudentTab(
  accessToken: string,
  spreadsheetId: string,
  students: StudentInfo[]
): Promise<void> {
  await axios.post(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      valueInputOption: "USER_ENTERED",
      includeValuesInResponse: false,
      responseValueRenderOption: "FORMATTED_VALUE",
      responseDateTimeRenderOption: "SERIAL_NUMBER",
      data: students.map<any>((student) => {
        return {
          range: `${studentPageName(student)}!A2`,
          values: [[`=Roster!E${student.row}`]],
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

type FileResponse = {
  id: string;
  name: string;
};

type FilesResponse = {
  files: FileResponse[];
};
async function getStudentPage(
  accessToken: string,
  student: StudentInfo,
  folderId: string
): Promise<FileResponse[]> {
  const resp = await axios.get<FilesResponse>(
    `https://www.googleapis.com/drive/v3/files`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: `(name = '${studentSpreadSheetName(
          student
        )}') and (parents = '${folderId}') and (trashed = false)`,
        fields: "files(id, name)",
        spaces: "drive",
      },
    }
  );
  return resp.data.files;
}

async function createStudentFile(
  accessToken: string,
  student: StudentInfo,
  folderId: string
): Promise<void> {
  if ((await getStudentPage(accessToken, student, folderId)).length > 0) {
    console.log(`Page already exists for student ${student}`);
    return;
  }
  await axios.post(
    `https://www.googleapis.com/drive/v3/files`,
    {
      name: studentSpreadSheetName(student),
      mimeType: "application/vnd.google-apps.spreadsheet",
      parents: [folderId],
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      params: {
        supportsAllDrives: true,
      },
    }
  );
}
type SheetProperties = {
  sheetId: number;
  title: string;
};
async function createLookUpSheet(
  accessToken: string,
  spreadsheetId: string,
  templateId: number,
  student: StudentInfo,
  folderId: string,
  field: string
) {
  const studentPages = await getStudentPage(accessToken, student, folderId);
  if (studentPages.length != 1) {
    throw Error(
      `Student ${student} has an un expected number of pages: ${studentPages.length}`
    );
  }
  const newSheet = await axios.post<SheetProperties>(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/sheets/${templateId}:copyTo`,
    {
      destinationSpreadsheetId: studentPages[0].id,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const student_formula = `=IMPORTRANGE("https://docs.google.com/spreadsheets/d/${spreadsheetId}";"${studentPageName(
    student
  )}!A:Z")`;

  await axios.post(
    `https://sheets.googleapis.com/v4/spreadsheets/${studentPages[0].id}:batchUpdate`,
    {
      requests: [
        {
          updateSheetProperties: {
            properties: { sheetId: newSheet.data.sheetId, title: field },
            fields: "title",
          },
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
  await axios.post(
    `https://sheets.googleapis.com/v4/spreadsheets/${studentPages[0].id}/values/${field}:clear`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  await axios.put(
    `https://sheets.googleapis.com/v4/spreadsheets/${studentPages[0].id}/values/${field}!A1:A1`,
    { values: [[student_formula]] },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      params: {
        valueInputOption: "USER_ENTERED",
      },
    }
  );

  await axios.post(
    `https://docs.google.com/spreadsheets/d/${studentPages[0].id}/externaldata/addimportrangepermissions`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      params: {
        donorDocId: spreadsheetId,
      },
    }
  );
}

async function handleStudent(
  accessToken: string,
  spreadsheetId: string,
  templateId: number,
  student: StudentInfo,
  folderId: string,
  field: string
) {
  await createStudentFile(accessToken, student, folderId);
  await createLookUpSheet(
    accessToken,
    spreadsheetId,
    templateId,
    student,
    folderId,
    field
  );
}
async function createStudentsFile(
  accessToken: string,
  spreadsheetId: string,
  templateId: number,
  students: StudentInfo[],
  folderId: string,
  field: string
): Promise<void> {
  const studentPages = students.map((student) =>
    handleStudent(
      accessToken,
      spreadsheetId,
      templateId,
      student,
      folderId,
      field
    )
  );
  await Promise.all(studentPages);
}

export async function createStudentSheet(
  accessToken: string,
  spreadsheetId: string,
  templateId: number,
  students: StudentInfo[],
  folderId: string,
  field: string
): Promise<void> {
  await createStudentTab(accessToken, spreadsheetId, templateId, students);
  await updateStudentTab(accessToken, spreadsheetId, students);
  await createStudentsFile(
    accessToken,
    spreadsheetId,
    templateId,
    students,
    folderId,
    field
  );
}

type SheetValues = {
  range: string;
  values: string[][];
};

export function listStudent(
  accessToken: string | undefined,
  spreadsheetId: string | undefined,
  rosterId: string | undefined
): StudentInfo[] {
  const range = `${rosterId}!A1:E45`;
  const studentFromValue = ({ values }: SheetValues) =>
    values.map((student: string[], index: number) => {
      const studentObj = {
        period: student[0],
        name: student[1],
        firstname: student[2],
        id: student[3],
        row: index + 1,
      };
      return studentObj;
    });
  const resp = useQuery({
    enabled:
      stringToBool(accessToken) &&
      stringToBool(spreadsheetId) &&
      stringToBool(rosterId),
    queryFn: () =>
      axios
        .get<SheetValues>(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .then((sheetData) => studentFromValue(sheetData?.data)),
    queryKey: ["studentData", accessToken, spreadsheetId, rosterId],
  });
  return resp.data || [];
}
