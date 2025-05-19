import { useEffect, useState } from 'react';
import { ProjectFull } from '@/src/services/ProjectServices';
import { ProjectService } from '@/src/services/ProjectServices';

/**
 * Jika dipanggil tanpa argumen, hook akan memuat list project.
 * Jika dipanggil dengan `id`, hook akan memuat detail project tersebut.
 */
export const useProject = (id?: number) => {
  const [projects, setProjects] = useState<ProjectFull[] | null>(null);
  const [project, setProject]   = useState<ProjectFull | null>(null);
  const [loading, setLoading]   = useState<boolean>(true);
  const [error, setError]       = useState<Error | null>(null);

  // ───────────────────── Fetchers ─────────────────────
  const fetchList = async () => {
    try {
      setLoading(true);
      const data = await ProjectService.list();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async () => {
    if (id === undefined) return;
    try {
      setLoading(true);
      const data = await ProjectService.get(id);
      setProject(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────── Helpers call service & refresh ───────────────
  const createProject = async (
    payload: Omit<ProjectFull, 'id' | 'skills' | 'images' | 'created_at' | 'updated_at'>,
    skillIds: number[] = [],
    imageFiles: File[] = [],
  ) => {
    const created = await ProjectService.create(payload, skillIds, imageFiles);
    await fetchList();
    return created;
  };

  const updateProject = async (
    projectId: number,
    payload: Partial<ProjectFull>,
    skillIds?: number[],
    newImageFiles: File[] = [],
    removeImageIds: number[] = []
  ) => {
    const updated = await ProjectService.update(
      projectId,
      payload,
      skillIds,
      newImageFiles,
      removeImageIds
    );
    if (id) await fetchDetail();      // jika sedang di halaman detail
    else await fetchList();
    return updated;
  };

  const deleteProject = async (projectId: number) => {
    await ProjectService.delete(projectId);
    await fetchList();
  };

  // skills & images helper
  const addSkill    = async (pid: number, sid: number) => ProjectService.addSkill(pid, sid).then(() => fetchDetail());
  const removeSkill = async (pid: number, sid: number) => ProjectService.removeSkill(pid, sid).then(() => fetchDetail());
  const addImage    = async (pid: number, f: File)      => ProjectService.addImage(pid, f).then(() => fetchDetail());
  const removeImage = async (pid: number, imgId:number) => ProjectService.removeImage(pid, imgId).then(() => fetchDetail());

  // ───────────────────── Init ─────────────────────
  useEffect(() => {
    id === undefined ? fetchList() : fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return {
    // state
    loading,
    error,
    project,
    projects,
    // methods
    fetchList,
    fetchDetail,
    createProject,
    updateProject,
    deleteProject,
    addSkill,
    removeSkill,
    addImage,
    removeImage,
  };
};
