import * as React from "react";
import { MoreHorizontalIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import { ApiPagination, PaginatedResponse } from "@/lib/types";
import { Table } from "@tanstack/react-table";

interface PaginationProps<T = unknown> {
  pagination: PaginatedResponse<T> | ApiPagination;
  table: Table<T>;
}

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "default" : "ghost",
          size,
        }),
        "text-text-disabled font-semibold",
        isActive && "bg-primary-focused text-primary",
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn(
        "gap-1 px-2.5 sm:pl-2.5 rounded-sm border border-primary",
        className,
      )}
      {...props}
    >
      <Image
        src="/icons/arrowLeft.svg"
        width={18}
        height={18}
        alt="arrow left"
      />
      <span className="hidden sm:block text-primary text-sm font-semibold">
        Previous
      </span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn(
        "gap-1 px-2.5 sm:pr-2.5 rounded-sm border border-primary",
        className,
      )}
      {...props}
    >
      <span className="hidden sm:block text-primary text-sm font-semibold">
        Next
      </span>
      <Image
        src="/icons/arrowRight.svg"
        width={18}
        height={18}
        alt="arrow right"
      />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

function GeneralPagination<T = unknown>({
  pagination,
  table,
}: PaginationProps<T>) {
  // Support both old PaginatedResponse and new ApiPagination formats
  const currentPage = (pagination as any).current_page;
  const lastPage = (pagination as any).last_page;
  const nextUrl = (pagination as any).next_page_url ?? (pagination as any).next;
  const prevUrl = (pagination as any).prev_page_url ?? (pagination as any).prev;

  return (
    <Pagination className="justify-between py-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => {
              if (prevUrl || currentPage > 1) table.previousPage();
            }}
            aria-disabled={!prevUrl && currentPage <= 1}
            tabIndex={!prevUrl && currentPage <= 1 ? -1 : 0}
            className={
              !prevUrl && currentPage <= 1
                ? "pointer-events-none opacity-50"
                : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
      <PaginationContent>
        {(prevUrl || currentPage > 1) && (
          <PaginationItem key={currentPage - 1}>
            <PaginationLink onClick={table.previousPage}>
              {currentPage - 1}
            </PaginationLink>
          </PaginationItem>
        )}
        <PaginationItem key={currentPage}>
          <PaginationLink isActive>{currentPage}</PaginationLink>
        </PaginationItem>
        {(nextUrl || (lastPage && currentPage < lastPage)) && (
          <PaginationItem key={currentPage + 1}>
            <PaginationLink onClick={table.nextPage}>
              {currentPage + 1}
            </PaginationLink>
          </PaginationItem>
        )}
      </PaginationContent>
      <PaginationContent>
        <PaginationItem>
          <PaginationNext
            onClick={() => {
              if (nextUrl || (lastPage && currentPage < lastPage))
                table.nextPage();
            }}
            aria-disabled={!nextUrl && (!lastPage || currentPage >= lastPage)}
            tabIndex={
              !nextUrl && (!lastPage || currentPage >= lastPage) ? -1 : 0
            }
            className={
              !nextUrl && (!lastPage || currentPage >= lastPage)
                ? "pointer-events-none opacity-50"
                : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  GeneralPagination,
};
