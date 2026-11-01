import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@tetherto/mdk-react-devkit";

import {
  choiceLabel,
  POWER_TARGET_KINDS,
  type PowerChoice,
  type PowerTargetKind,
} from "./power-commands";

type ConfirmPowerDialogProps = {
  /** The setting waiting for a yes; undefined keeps the dialog closed. */
  choice: PowerChoice | undefined;
  targetName: string;
  /** A whole container, or the miners picked one by one: the dialog words each. */
  targetKind: PowerTargetKind;
  onConfirm: (choice: PowerChoice) => void;
  onCancel: VoidFunction;
};

/** Asks before a power command: it changes live miners right away. */
export const ConfirmPowerDialog = ({
  choice,
  targetName,
  targetKind,
  onConfirm,
  onCancel,
}: ConfirmPowerDialogProps) => (
  <AlertDialog
    open={choice !== undefined}
    onOpenChange={(open) => {
      if (!open) onCancel();
    }}
  >
    {choice === undefined ? null : (
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Set {targetName} to {choiceLabel(choice)}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {targetKind === POWER_TARGET_KINDS.CONTAINER
              ? `This applies right away to every online miner in ${targetName} that supports it.`
              : `This applies right away to ${targetName}.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(choice)}>Apply</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    )}
  </AlertDialog>
);
