import { Dialog, DialogBody, DialogProps } from "@blueprintjs/core";
import React from "react";
import { TAny } from "../../shared/types/common";

interface AppDialogProps extends Omit<DialogProps, "isOpen"> {
  buttonText: string;
  footerStyle: "default" | "minimal" | "none";
  isOpen: boolean;
  handleClose: TAny;
  children: TAny;
}

export const AppDialog: React.FC<AppDialogProps> = ({
  isOpen,
  handleClose,
  children,
  ...props
}) => {
  return (
    <Dialog {...props} isOpen={isOpen} onClose={handleClose}>
      <DialogBody>{children}</DialogBody>
    </Dialog>
  );
};
