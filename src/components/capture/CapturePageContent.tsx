"use client";

import { StatusModal } from "@/components/StatusModal";
import { CardUploadPanel } from "@/components/capture/CardUploadPanel";
import { DuplicateMergeModal } from "@/components/capture/DuplicateMergeModal";
import { EditableCardPanel } from "@/components/capture/EditableCardPanel";
import { useCapturePage } from "@/hooks/useCapturePage";

export function CapturePageContent() {
  const {
    online,
    file,
    card,
    error,
    busy,
    apiReady,
    authenticated,
    duplicate,
    mergeCard,
    modalMessage,
    setFile,
    setCard,
    setMergeCard,
    extract,
    save,
    merge,
    closeDuplicate,
    clearModalMessage,
    replaceLogoFromFile,
    removeCardLogo,
    removeMergeCardLogo
  } = useCapturePage();

  const actionsDisabled = !online || authenticated === false || !apiReady || busy;

  return (
    <>
      <CardUploadPanel
        online={online}
        busy={busy}
        authenticated={authenticated}
        apiReady={apiReady}
        file={file}
        cardName={card.name}
        onFileChange={setFile}
        onExtract={extract}
        onSave={() => save(false)}
      />

      <EditableCardPanel
        title="Extracted / Editable Card"
        card={card}
        onChange={setCard}
        onReplaceLogo={(nextFile: File | null) => replaceLogoFromFile(nextFile, "card")}
        onRemoveLogo={removeCardLogo}
        error={error}
        disabled={actionsDisabled}
      />

      <DuplicateMergeModal
        duplicate={duplicate}
        mergeCard={mergeCard}
        onMergeCardChange={setMergeCard}
        onReplaceMergeLogo={(nextFile: File | null) => replaceLogoFromFile(nextFile, "merge")}
        onRemoveMergeLogo={removeMergeCardLogo}
        onClose={closeDuplicate}
        onMerge={merge}
        onSaveAsNew={() => save(true)}
        busy={busy}
        saveAsNewDisabled={busy || !card.name}
      />

      <StatusModal
        isOpen={!!modalMessage}
        title="Success"
        message={modalMessage}
        onClose={clearModalMessage}
      />
    </>
  );
}