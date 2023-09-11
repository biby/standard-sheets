import { Button, Input, Flex, Text, Divider } from "@chakra-ui/react";
import { FilePicker } from "./FilePicker";
import { PickerCallback } from "react-google-drive-picker/dist/typeDefs";
import { SheetSelect, SheetProperties } from "./SheetSelect";
import { useState } from "react";
import { SheetRefreshButton } from "./SheetRefreshButton";

type LeftPannelProps = {
  file?: PickerCallback;
  setFile: React.Dispatch<React.SetStateAction<PickerCallback | undefined>>;
  folder?: PickerCallback;
  setFolder: React.Dispatch<React.SetStateAction<PickerCallback | undefined>>;
  templateId?: SheetProperties;
  setTemplateId: React.Dispatch<
    React.SetStateAction<SheetProperties | undefined>
  >;
  rosterId?: SheetProperties;
  setRosterId: React.Dispatch<
    React.SetStateAction<SheetProperties | undefined>
  >;
  field?: string;
  setField: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export function LeftPannel({
  file,
  setFile,
  folder,
  setFolder,
  setTemplateId,
  setRosterId,
  setField,
}: LeftPannelProps) {
  const [refreshSheetId, setRefreshSheetId] = useState<
    SheetProperties | undefined
  >();
  return (
    <Flex flexDirection="column" w="400px" p={4} bg="gray.200" mr={4}>
      <Text> Choose speadheet:</Text>
      <FilePicker
        allowFolderSelection={false}
        buttonText={
          file?.docs
            ? `${file.docs[0].name} (click to change...)`
            : "Choose File"
        }
        setFile={setFile}
      />
      <Text> Choose roster sheet:</Text>
      <SheetSelect
        spreadsheetId={file?.docs ? file.docs[0]?.id : undefined}
        sheetType="Roster"
        onChange={(option) => setRosterId(option?.value)}
      />
      <Text> Choose template sheet:</Text>
      <SheetSelect
        spreadsheetId={file?.docs ? file.docs[0]?.id : undefined}
        sheetType="Template"
        onChange={(option) => setTemplateId(option?.value)}
      />
      <Text> Choose student speadsheet folder:</Text>
      <FilePicker
        allowFolderSelection={true}
        buttonText={
          folder?.docs
            ? `${folder.docs[0].name} (click to change...)`
            : "Choose Folder"
        }
        setFile={setFolder}
      />
      <Text> Class name:</Text>
      <Input
        bg="white"
        placeholder="Chemistry"
        onChange={(event) => setField(event.target.value)}
      />
      <Divider orientation="horizontal" />
      <Text> Page Refresher:</Text>
      <SheetSelect
        spreadsheetId={file?.docs ? file.docs[0]?.id : undefined}
        sheetType=""
        onChange={(option) => setRefreshSheetId(option?.value)}
      />
      <SheetRefreshButton
        spreadSheetId={file?.docs ? file.docs[0]?.id : undefined}
        sheetId={refreshSheetId}
      />
    </Flex>
  );
}
