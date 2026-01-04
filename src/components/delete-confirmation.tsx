"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";
import { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";

interface DeleteConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  locale: Locale;
  isLoading?: boolean;
}

export function DeleteConfirmation({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  locale,
  isLoading = false,
}: DeleteConfirmationProps) {
  const t = getTranslations(locale);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto bg-[rgba(26,26,58,0.95)] backdrop-blur-md border-[rgba(100,200,255,0.2)]">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-400" />
            {title}
          </SheetTitle>
          <SheetDescription className="text-[#9ca3af]">
            {description}
          </SheetDescription>
        </SheetHeader>
        <SheetFooter className="mt-6 gap-3 sm:gap-0">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            {t.common.cancel}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            loading={isLoading}
            className="w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t.readings.deleteConfirm}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

