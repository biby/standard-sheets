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
  Checkbox,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import {
  createStudentSheet,
  studentPageName,
} from "../../google/sheetManipulations";
import { UserAccesToken } from "../../google/login";
import { SheetProperties } from "./SheetSelect";
import { templateData } from "../students/templateSheet";

export type StudentInfo = {
  id: string;
  name: string;
  firstname: string;
  row: number;
  period: string;
  email: string;
};

type StudentListProps = {
  students: StudentInfo[];
  existingStudentPages: SheetProperties[];
  accessToken?: string;
  spreadSheetId?: string;
  templateSheet?: SheetProperties;
  folderId?: string;
  field?: string;
  rosterSheet?: SheetProperties;
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
      <Td key="Email">{student.email}</Td>
    </Tr>
  );
}

function allSelected(
  selectedStudents: StudentInfo[],
  students: StudentInfo[]
): boolean {
  return students.every((student) =>
    selectedStudents.map((st) => st.id).includes(student.id)
  );
}

export function StudentList({
  students,
  existingStudentPages,
  spreadSheetId,
  templateSheet,
  folderId,
  field,
  rosterSheet,
}: StudentListProps) {
  const [selectedStudents, useSelectedStudents] = useState<StudentInfo[]>([]);
  const [isChecked, useIsChecked] = useState<boolean>(true);
  const selectAll = () => {
    useSelectedStudents(
      students.filter(
        (student) =>
          !existingStudentPages
            .map((page) => page.title)
            .includes(studentPageName(student))
      )
    );
  };
  const unselectAll = () => {
    useSelectedStudents([]);
  };
  useEffect(selectAll, [students]);
  useEffect(() => {
    useSelectedStudents((selectedStudents) =>
      selectedStudents.filter(
        (student) =>
          !existingStudentPages
            .map((page) => page.title)
            .includes(studentPageName(student))
      )
    );
  }, [existingStudentPages]);
  const context = useContext(UserAccesToken);
  const templateDataValue = templateData(
    context?.access_token,
    spreadSheetId,
    templateSheet?.title
  );

  useEffect(() => {
    if (
      allSelected(
        selectedStudents,
        students.filter(
          (student) =>
            !existingStudentPages
              .map((page) => page.title)
              .includes(studentPageName(student))
        )
      )
    ) {
      console.log("select");
      useIsChecked(true);
    } else {
      console.log("unselect");
      useIsChecked(false);
    }
  }, [selectedStudents]);

  const createSheets = () => {
    console.log(templateSheet, spreadSheetId);
    templateSheet != undefined &&
      context != undefined &&
      folderId != undefined &&
      field != undefined &&
      spreadSheetId != undefined &&
      rosterSheet != undefined &&
      rosterSheet != undefined &&
      templateDataValue != undefined &&
      createStudentSheet(
        context?.access_token,
        spreadSheetId,
        templateSheet.sheetId,
        selectedStudents,
        folderId,
        field,
        existingStudentPages,
        templateDataValue.values,
        rosterSheet.title
      );
  };

  // console.log({ selectedStudents, existingStudentPages });
  // console.log({ context, spreadSheetId, templateSheet, folderId, field });
  const selectCheckChange = ({}) => {
    console.log("click");
    if (isChecked) {
      unselectAll();
      useIsChecked(false);
    } else {
      selectAll();
      useIsChecked(true);
    }
  };
  return (
    <Flex flexDirection="column">
      <Flex flexDirection="row">
        <Button
          isDisabled={
            context == undefined ||
            spreadSheetId == undefined ||
            templateSheet == undefined ||
            folderId == undefined ||
            field == undefined
          }
          onClick={() => {
            createSheets();
          }}
        >
          Create Pages
        </Button>
        <Checkbox
          isChecked={isChecked}
          onChange={(e) => {
            selectCheckChange(e);
          }}
        >
          Select all
        </Checkbox>
      </Flex>
      <TableContainer>
        <Table>
          <TableCaption>List of students</TableCaption>
          <Thead>
            <Tr>
              <Th key="id"> Id </Th>
              <Th key="firstname"> Firstname</Th>
              <Th key="name">Name</Th>
              <Th key="period">Period</Th>
              <Th key="email">Email</Th>
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
