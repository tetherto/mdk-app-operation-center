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

// The devkit's AlertDialogHeader takes no `bare` prop (DialogHeader does), so
// the modifier class is applied directly.
const DIALOG_HEADER_BARE_CLASS = "mdk-dialog__header--bare";

// AlertDialogCancel ships `mdk-button--variant-outline`, a variant the devkit
// has no styles for, so it renders as the browser's default button. The
// secondary variant is the devkit's styled cancel look.
const CANCEL_BUTTON_CLASS = "mdk-button--variant-secondary";

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
        {/* Bare: the footer's top border is the one divider; the header's own
            border and bottom padding stacked a second line above it. */}
        <AlertDialogHeader className={DIALOG_HEADER_BARE_CLASS}>
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
          <AlertDialogCancel className={CANCEL_BUTTON_CLASS}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(choice)}>Apply</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    )}
  </AlertDialog>
);
