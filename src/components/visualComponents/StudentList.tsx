import {
  TableContainer,
  Table,
  Tr,
  TableCaption,
  Tbody,
  Thead,
  Th,
  Td,
  Button,
  Flex,
} from "@chakra-ui/react";
import { useContext, useState } from "react";
import { createStudentSheet } from "../../google/sheetManipulations";
import { UserAccesToken } from "../../google/login";

export type StudentInfo = {
  id: string;
  name: string;
  firstname: string;
  row: number;
  period: string;
};

type StudentListProps = {
  students: StudentInfo[];
  existingStudentPages: string[];
  accessToken?: string;
  spreadSheetId?: string;
  templateId?: number;
  folderId?: string;
  field?: string;
};

type StudentProps = {
  student: StudentInfo;
  useSelectedStudents: any;
  selected: boolean;
};
export function Student({
  student,
  useSelectedStudents,
  selected,
}: StudentProps) {
  const add_student = () => {
    useSelectedStudents((selectedStudents: StudentInfo[]) => {
      const index = selectedStudents.indexOf(student);
      if (index > -1) {
        return selectedStudents
          .slice(0, index)
          .concat(selectedStudents.slice(index + 1));
      } else {
        return [...selectedStudents, student];
      }
    });
  };
  return (
    <Tr
      onClick={() => add_student()}
      key={student.id}
      bg={selected ? "blue.100" : "white"}
    >
      <Td key="id">{student.id}</Td>
      <Td key="firstname">{student.firstname}</Td>
      <Td key="name">{student.name}</Td>
      <Td key="period">{student.period}</Td>
    </Tr>
  );
}

export function StudentList({
  students,
  existingStudentPages,
  spreadSheetId,
  templateId,
  folderId,
  field,
}: StudentListProps) {
  const [selectedStudents, useSelectedStudents] = useState<StudentInfo[]>([]);
  const context = useContext(UserAccesToken);
  const createSheets = () => {
    console.log(templateId, spreadSheetId);
    templateId != undefined &&
      context != undefined &&
      folderId != undefined &&
      field != undefined &&
      spreadSheetId &&
      createStudentSheet(
        context?.access_token,
        spreadSheetId,
        templateId,
        selectedStudents,
        folderId,
        field
      );
  };
  console.log({ selectedStudents, existingStudentPages });
  console.log({ context, spreadSheetId, templateId, folderId, field });
  return (
    <Flex flexDirection="column">
      <Button
        isDisabled={
          context == undefined ||
          spreadSheetId == undefined ||
          templateId == undefined ||
          folderId == undefined ||
          field == undefined
        }
        onClick={() => {
          createSheets();
        }}
      >
        Create Pages
      </Button>
      <TableContainer>
        <Table>
          <TableCaption>List of students</TableCaption>
          <Thead>
            <Tr>
              <Th key="id"> Id </Th>
              <Th key="firstname"> Firstname</Th>
              <Th key="name">Name</Th>
              <Th key="period">Period</Th>
            </Tr>
          </Thead>
          <Tbody>
            {students.map((student) => (
              <Student
                student={student}
                selected={selectedStudents.includes(student)}
                useSelectedStudents={useSelectedStudents}
              />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Flex>
  );
}
