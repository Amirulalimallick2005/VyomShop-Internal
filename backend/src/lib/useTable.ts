"use client";

import { useTable as useBaseTable, type useTableProps, type useTableReturnType } from "@refinedev/antd";
import type { BaseRecord, HttpError } from "@refinedev/core";

export function cleanTableProps<T extends Record<string, any>>(tableProps: T): T {
  if (!tableProps) return tableProps;
  const pagination = tableProps.pagination;
  if (pagination && typeof pagination === "object") {
    const { position, ...restPagination } = pagination;
    const placement = Array.isArray(position)
      ? position.map((p: string) => {
          if (p === "bottomRight") return "bottomEnd";
          if (p === "bottomLeft") return "bottomStart";
          if (p === "topRight") return "topEnd";
          if (p === "topLeft") return "topStart";
          return p;
        })
      : ["bottomEnd"];

    return {
      ...tableProps,
      pagination: {
        ...restPagination,
        placement,
      },
    };
  }
  return tableProps;
}

export function useTable<
  TQueryFnData extends BaseRecord = BaseRecord,
  TError extends HttpError = HttpError,
  TSearchVariables = unknown,
  TData extends BaseRecord = TQueryFnData,
>(props?: useTableProps<TQueryFnData, TError, TSearchVariables, TData>): useTableReturnType<TData, TError, TSearchVariables> {
  const result = useBaseTable<TQueryFnData, TError, TSearchVariables, TData>(props);
  return {
    ...result,
    tableProps: cleanTableProps(result.tableProps as any) as any,
  };
}
