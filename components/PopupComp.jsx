"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PiArrowRightThin } from "react-icons/pi";

const PopupComp = ({ isOpen, onClose, PopupData }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{PopupData?.header}</DialogTitle>
          <DialogDescription>{PopupData?.description}</DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
          {PopupData?.message.map((message, index) => (
            <li key={index} className="flex items-start gap-2">
              <PiArrowRightThin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {message}
            </li>
          ))}
        </ul>
        <Button onClick={onClose} className="mt-2 w-full">
          Got it
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default PopupComp;
