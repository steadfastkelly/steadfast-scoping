import { useState } from "react";
import { DataImportCompleteScreen } from "./components/data-import/DataImportCompleteScreen";
import { DataImportUploadScreen } from "./components/data-import/DataImportUploadScreen";
import { DataImportValidationScreen } from "./components/data-import/DataImportValidationScreen";

type ScreenKey = "upload" | "validation" | "complete";

export default function App() {
  const [screen, setScreen] = useState<ScreenKey>("upload");

  if (screen === "validation") {
    return (
      <DataImportValidationScreen
        onBack={() => setScreen("upload")}
        onSkipWarnings={() => setScreen("complete")}
        onBeginImport={() => setScreen("complete")}
      />
    );
  }

  if (screen === "complete") {
    return (
      <DataImportCompleteScreen
        onImportAnotherFile={() => setScreen("upload")}
        onGoToDashboard={() => setScreen("upload")}
      />
    );
  }

  return (
    <DataImportUploadScreen
      onCancel={() => setScreen("upload")}
      onBrowse={() => setScreen("validation")}
    />
  );
}
