import { Flex } from "@chakra-ui/react";
import { LeftPannel } from "./LeftPannel";
import { useState } from "react";
import { PickerCallback } from "react-google-drive-picker/dist/typeDefs";
import { SheetProperties, listSheets } from "./SheetSelect";
import { useContext } from "react";
import { UserAccesToken } from "../../google/login.tsx";
import {
  listStudent,
  studentPageName,
} from "../../google/sheetManipulations.tsx";
import { StudentList } from "./StudentList.tsx";

export function MainContent() {
  const context = useContext(UserAccesToken);
  const [file, setFile] = useState<PickerCallback | undefined>();
  const [folder, setFolder] = useState<PickerCallback | undefined>();
  const [templateId, setTemplateId] = useState<SheetProperties | undefined>();
  const [rosterId, setRosterId] = useState<SheetProperties | undefined>();
  const [field, setField] = useState<string | undefined>();

  const sheets = listSheets(
    context?.access_token,
    file?.docs ? file.docs[0].id : undefined
  );

  const students = listStudent(
    context?.access_token,
    file?.docs ? file.docs[0].id : undefined,
    rosterId?.title
  ).filter((student) => student.id);
  const existingStudentPages = students
    .filter((student) =>
      sheets.map((sheet) => sheet.label).includes(studentPageName(student))
    )
    .map((student) => student.id);
  console.log({ sheets, existingStudentPages });

  return (
    <Flex>
      <LeftPannel
        file={file}
        setFile={setFile}
        folder={folder}
        setFolder={setFolder}
        templateId={templateId}
        setTemplateId={setTemplateId}
        rosterId={rosterId}
        setRosterId={setRosterId}
        field={field}
        setField={setField}
      />
      <StudentList
        students={students}
        existingStudentPages={existingStudentPages}
        spreadSheetId={file?.docs ? file.docs[0].id : undefined}
        templateId={templateId?.sheetId}
        folderId={folder?.docs ? folder.docs[0].id : undefined}
        field={field}
      />
    </Flex>
  );
}
