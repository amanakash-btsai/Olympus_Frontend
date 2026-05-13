import { useState } from 'react';

interface PaginationState {
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  reset: () => void;
}

export function usePagination(defaultLimit = 20): PaginationState {
  const [page, setPageState] = useState(1);
  const [limit, setLimitState] = useState(defaultLimit);

  function setPage(nextPage: number) {
    setPageState(nextPage);
  }

  function setLimit(nextLimit: number) {
    setLimitState(nextLimit);
    setPageState(1); // reset to first page when page size changes
  }

  function reset() {
    setPageState(1);
    setLimitState(defaultLimit);
  }

  return { page, limit, setPage, setLimit, reset };
}
