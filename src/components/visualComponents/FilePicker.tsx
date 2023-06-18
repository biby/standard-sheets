import useDrivePicker from "react-google-drive-picker";
import { PickerCallback } from "react-google-drive-picker/dist/typeDefs";
import { clientId, developerKey } from "../../settings.ts";
import { Button, Tooltip } from "@chakra-ui/react";
import { useContext } from "react";
import { UserAccesToken } from "../../google/login.tsx";

type FilePickerProps = {
  accessToken?: string;
  allowFolderSelection?: boolean;
  buttonText: string;
  setFile: React.Dispatch<React.SetStateAction<PickerCallback | undefined>>;
};

export function FilePicker({
  allowFolderSelection = true,
  buttonText = "Choose File",
  setFile,
}: FilePickerProps) {
  const [openPicker] = useDrivePicker();
  const context = useContext(UserAccesToken);
  // const customViewsArray = [new google.picker.DocsView()]; // custom view
  const handleOpenPicker = () => {
    openPicker({
      clientId: clientId,
      developerKey: developerKey,
      viewId: allowFolderSelection ? "FOLDERS" : "SPREADSHEETS",
      token: context?.access_token,
      viewMimeTypes: allowFolderSelection
        ? "application/vnd.google-apps.folder"
        : "application/vnd.google-apps.spreadsheet",
      showUploadView: allowFolderSelection,
      showUploadFolders: allowFolderSelection,
      setSelectFolderEnabled: allowFolderSelection,
      supportDrives: true,
      multiselect: false,
      // customViews: customViewsArray, // custom view
      callbackFunction: (data) => {
        setFile(data);
      },
    });
  };
  const disabledReason = context ? undefined : "Not Logged in";
  return (
    <Tooltip label={disabledReason}>
      <Button
        isDisabled={context == undefined}
        mb={2}
        onClick={() => handleOpenPicker()}
      >
        {buttonText}
      </Button>
    </Tooltip>
  );
}
