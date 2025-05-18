// hooks/useCertificates.ts
import {
  useEffect,
  useReducer,
  useCallback,
  useRef,
  Dispatch,
} from 'react';
import { Certificate } from '@/src/models/CertificateModels';
import { CertificateService } from '@/src/services/CertificateServices';

/* ------------  types  ------------ */

export interface CertificateFilters {
  skillId?: number;
  isValid?: boolean;
  issuedDateStart?: string;
  issuedDateEnd?: string;
  sort?: 'issued_date' | 'valid_until' | 'created_at';
  order?: 'asc' | 'desc';
  search?: string;
  page?: number;
  limit?: number;
}

type State = {
  data: Certificate[];
  total: number;
  loadingList: boolean;
  loadingAction: boolean;
  error: Error | null;
  filters: CertificateFilters;
};

type Action =
  | { type: 'SET_LIST_LOADING'; payload: boolean }
  | { type: 'SET_ACTION_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: { data: Certificate[]; total: number } }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'SET_FILTERS'; payload: Partial<CertificateFilters> }
  | { type: 'ADD_CERT'; payload: Certificate }
  | { type: 'UPDATE_CERT'; payload: Certificate }
  | { type: 'REMOVE_CERT'; payload: number };

/* ------------  reducer  ------------ */

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LIST_LOADING':
      return { ...state, loadingList: action.payload };
    case 'SET_ACTION_LOADING':
      return { ...state, loadingAction: action.payload };
    case 'SET_DATA':
      return {
        ...state,
        data: action.payload.data,
        total: action.payload.total,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'ADD_CERT':
      return {
        ...state,
        data: [action.payload, ...state.data],
        total: state.total + 1,
      };
    case 'UPDATE_CERT':
      return {
        ...state,
        data: state.data.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case 'REMOVE_CERT':
      return {
        ...state,
        data: state.data.filter((c) => c.id !== action.payload),
        total: Math.max(0, state.total - 1),
      };
    default:
      return state;
  }
}

/* ------------  hook  ------------ */

export const useCertificates = (initial?: CertificateFilters) => {
  const [state, dispatch] = useReducer(reducer, {
    data: [],
    total: 0,
    loadingList: true,
    loadingAction: false,
    error: null,
    filters: { page: 1, limit: 10, ...initial },
  });

  /* ------- debounce search (opsional) ------- */
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setFilters = (f: Partial<CertificateFilters>, debounce = false) => {
    if (debounce && 'search' in f) {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => {
        dispatch({ type: 'SET_FILTERS', payload: f });
      }, 300);
    } else {
      dispatch({ type: 'SET_FILTERS', payload: f });
    }
  };

  /* ------- fetch list ------- */
  const fetchList = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LIST_LOADING', payload: true });
      const { data, count } = await CertificateService.getAll(state.filters);
      dispatch({ type: 'SET_DATA', payload: { data, total: count } });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err : new Error('Unknown error'),
      });
    } finally {
      dispatch({ type: 'SET_LIST_LOADING', payload: false });
    }
  }, [state.filters]);

  /* trigger fetch every filters change */
  useEffect(() => {
    fetchList();
  }, [fetchList]);

  /* ------- CRUD helpers ------- */
  const wrapAction = async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      dispatch({ type: 'SET_ACTION_LOADING', payload: true });
      const result = await fn();
      dispatch({ type: 'SET_ERROR', payload: null });
      return result;
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err : new Error('Unknown error'),
      });
      throw err;
    } finally {
      dispatch({ type: 'SET_ACTION_LOADING', payload: false });
    }
  };

  /* CREATE */
  const createCertificate = (
    payload: Omit<Certificate, 'id' | 'created_at' | 'updated_at'> & {
      skills?: number[];
    },
    files?: { pdf?: File; image?: File }
  ) =>
    wrapAction(async () => {
      const cert = await CertificateService.create(payload);
      if (files && (files.pdf || files.image)) {
        await CertificateService.uploadFiles(cert.id, files);
      }
      dispatch({ type: 'ADD_CERT', payload: cert });
      return cert;
    });

  /* UPDATE */
  const updateCertificate = (
    id: number,
    payload: Partial<Omit<Certificate, 'skills'>> & { skills?: number[] },
    files?: { pdf?: File; image?: File }
  ) =>
    wrapAction(async () => {
      let cert = await CertificateService.update(id, payload);
      if (files && (files.pdf || files.image)) {
        cert = await CertificateService.uploadFiles(id, files);
      }
      dispatch({ type: 'UPDATE_CERT', payload: cert });
      return cert;
    });

  /* DELETE */
  const deleteCertificate = (id: number) =>
    wrapAction(async () => {
      await CertificateService.delete(id);
      dispatch({ type: 'REMOVE_CERT', payload: id });
    });

  /* upload / delete file */
  const uploadFiles = (
    id: number,
    files: { pdf?: File; image?: File }
  ) =>
    wrapAction(async () => {
      const cert = await CertificateService.uploadFiles(id, files);
      dispatch({ type: 'UPDATE_CERT', payload: cert });
      return cert;
    });

  const deleteFiles = (id: number, kind: 'pdf' | 'image' | 'both') =>
    wrapAction(async () => {
      await CertificateService.deleteFiles(id, kind);
      const cert = await CertificateService.getById(id);
      if (cert) {
        dispatch({ type: 'UPDATE_CERT', payload: cert });
      }
    });

  /* skill helpers */
  const addSkills = (id: number, skillIds: number[]) =>
    wrapAction(async () => {
      await CertificateService.addSkills(id, skillIds);
      const cert = await CertificateService.getById(id);
      if (cert) dispatch({ type: 'UPDATE_CERT', payload: cert });
    });

  const removeSkills = (id: number, skillIds: number[]) =>
    wrapAction(async () => {
      await CertificateService.removeSkills(id, skillIds);
      const cert = await CertificateService.getById(id);
      if (cert) dispatch({ type: 'UPDATE_CERT', payload: cert });
    });

  /* pagination shortcuts */
  const setPage = (page: number) => setFilters({ page });
  const nextPage = () =>
    setFilters({ page: (state.filters.page ?? 1) + 1 });
  const prevPage = () =>
    setFilters({ page: Math.max(1, (state.filters.page ?? 1) - 1) });

  /* ------- expose API ------- */
  return {
    certificates: state.data,
    totalCount: state.total,
    loadingList: state.loadingList,
    loadingAction: state.loadingAction,
    error: state.error,
    filters: state.filters,
    setFilters, // use setFilters({ … }, true) to debounce search
    setPage,
    nextPage,
    prevPage,

    /* CRUD */
    createCertificate,
    updateCertificate,
    deleteCertificate,

    /* files */
    uploadFiles,
    deleteFiles,

    /* skills */
    addSkills,
    removeSkills,

    /* misc */
    refreshCertificates: fetchList,
    isValid: CertificateService.isValid,
  };
};
