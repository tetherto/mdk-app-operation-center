import { useMdkApp } from "@tetherto/mdk-react-adapter";
import { useNotification } from "@tetherto/mdk-react-devkit";
import { useState } from "react";

import type { Miner } from "../../api/contract";
import { downloadFile } from "../../api/download";
import { minerLogsRoute } from "../../api/routes";
import { describeRequestError } from "../../lib/describe-request-error";

export type MinerLogsDownload = {
  download: (miner: Miner) => void;
  /** Whether this miner's archive is on its way; another miner's download does not count. */
  isDownloading: (minerId: string) => boolean;
};

/** Downloads a miner's log archive, as the worker names it, and reports a failure in a toast. */
export const useMinerLogsDownload = (): MinerLogsDownload => {
  const { apiUrl } = useMdkApp();
  const { notifyError } = useNotification();
  const [downloadingId, setDownloadingId] = useState<string | undefined>(undefined);

  const download = (miner: Miner) => {
    const url = apiUrl(minerLogsRoute(miner.id));
    setDownloadingId(miner.id);
    downloadFile(url, `${miner.serial}-logs.tgz`)
      .catch((error: unknown) => {
        notifyError(
          `Could not download the logs of ${miner.serial}`,
          describeRequestError(error, url),
        );
      })
      .finally(() => setDownloadingId((current) => (current === miner.id ? undefined : current)));
  };

  return { download, isDownloading: (minerId) => minerId === downloadingId };
};
