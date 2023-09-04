import axios from "axios";
import { StudentInfo } from "../components/visualComponents/StudentList";
import { stringToBool } from "../utils";
import { useQuery } from "@tanstack/react-query";
import { createStudentTab, updateStudentTab } from "./generateStudentTab";

export function studentPageName(student: StudentInfo): string {
  return student.id.padStart(2, "0");
}
export function studentSpreadSheetName(student: StudentInfo): string {
  return `${student.firstname}_${student.name}`;
}

type Permission = {
  role: string;
  type: string;
  emailAddress: string;
  deleted: boolean;
};
type StudentPageInfo = {
  name: string;
  id: string;
  permissions: Permission[];
};

type FilesResponse = {
  files: StudentPageInfo[];
};
async function getStudentPage(
  accessToken: string,
  student: StudentInfo,
  folderId: string
): Promise<StudentPageInfo[]> {
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
        fields: "files(id, name, permissions)",
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
): Promise<StudentPageInfo> {
  const studentPageInfoList: StudentPageInfo[] = await getStudentPage(
    accessToken,
    student,
    folderId
  );
  if (studentPageInfoList.length > 0) {
    console.log(`Page already exists for student ${student}`);
    return studentPageInfoList[0];
  }

  console.log(`Creating page for student ${student}`);
  const res = await axios.post<StudentPageInfo>(
    `https://www.googleapis.com/drive/v3/files`,
    {
      name: studentSpreadSheetName(student),
      mimeType: "application/vnd.google-apps.spreadsheet",
      parents: [folderId],
      fields: "files(id, name, permissions)",
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
  return res.data;
}

async function createStudentPermissions(
  accessToken: string,
  student: StudentInfo,
  studentPageInfo: StudentPageInfo
): Promise<void> {
  const fileId: string = studentPageInfo.id;
  const permission = studentPageInfo.permissions.filter(
    (permission) =>
      !permission.deleted && permission.emailAddress == student.email
  );
  if (permission.length > 0) {
    console.log(`Page permissions already exists for student ${student}`);
    return;
  }
  console.log(`Creating permissions for page ${fileId} for student ${student}`);

  await axios.post(
    `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
    {
      type: "user",
      role: "reader",
      emailAddress: student.email,
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
  const studentPageInfo = await createStudentFile(
    accessToken,
    student,
    folderId
  );
  await createStudentPermissions(accessToken, student, studentPageInfo);
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
  field: string,
  sheetList: SheetProperties[],
  templateData: string[][],
  rosterSheetName: string
): Promise<void> {
  await createStudentTab(
    accessToken,
    spreadsheetId,
    templateId,
    students,
    sheetList
  );
  await updateStudentTab(
    accessToken,
    spreadsheetId,
    students,
    templateData,
    rosterSheetName
  );
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
  const range = `${rosterId}`;
  const studentFromValue = ({ values }: SheetValues) =>
    values
      .map((student: string[], index: number) => {
        const studentObj = {
          period: student[0],
          name: student[1],
          firstname: student[2],
          id: student[3],
          email: student[5],
          row: index + 1,
        };
        return studentObj;
      })
      .filter((student) => !Number.isNaN(parseInt(student.id)));
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
