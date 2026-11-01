/** Saves a blob as a file through the browser's download. */
export const saveFile = (fileName: string, blob: Blob): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  // Revoking in the same task can cancel the download (Safari): let it start first.
  setTimeout(() => URL.revokeObjectURL(url), 0);
};
