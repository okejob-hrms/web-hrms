import * as React from "react";

export const useDisclose = (initState?: boolean) => {
  const [isOpen, setIsOpen] = React.useState(initState || false);

  const onOpen = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const onClose = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const onToggle = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return { isOpen, onClose, onOpen, onToggle };
};
