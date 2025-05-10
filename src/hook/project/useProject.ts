import { useState, useEffect, useCallback } from 'react';
import { Project, ProjectImage } from '@/src/models/ProjectModels';
import { ProjectService } from '@/src/services/project/ProjectServices';
import { ProjectImageService } from '@/src/services/project/ProjectImageServices';

interface ProjectFilters {
  skillId?: number;
  search?: string;
  sort?: 'created_at' | 'title';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const useProjects = (initialFilters?: ProjectFilters) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<ProjectFilters>(
    initialFilters || { page: 1, limit: 10 }
  );

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const { data, count } = await ProjectService.getAll(filters);
      setProjects(data);
      setTotalCount(count);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createProject = async (
    project: Omit<Project, 'id' | 'created_at' | 'updated_at'>,
    skillIds: number[],
    images?: File[]
  ) => {
    try {
      setLoading(true);

      // Upload images if provided
      let uploadedImages: ProjectImage[] = [];
      if (images && images.length > 0) {
        uploadedImages = await ProjectImageService.uploadMultiple(images);
      }

      // Create project with first image as main image
      const newProject = await ProjectService.create({
        ...project,
        image_id: uploadedImages[0]?.id
      }, skillIds);

      // Update projects list
      setProjects(prev => [newProject, ...prev]);
      setTotalCount(prev => prev + 1);
      
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (
    id: number,
    project: Partial<Project>,
    skillIds?: number[],
    newImages?: File[]
  ) => {
    try {
      setLoading(true);

      // Upload new images if provided
      if (newImages && newImages.length > 0) {
        const uploadedImages = await ProjectImageService.uploadMultiple(newImages);
        project.image_id = uploadedImages[0]?.id; // Update main image
      }

      const updatedProject = await ProjectService.update(id, project, skillIds);
      setProjects(prev => 
        prev.map(p => p.id === id ? updatedProject : p)
      );
      
      return updatedProject;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: number) => {
    try {
      setLoading(true);
      await ProjectService.delete(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadProjectImages = async (files: File[]): Promise<ProjectImage[]> => {
    try {
      setLoading(true);
      return await ProjectImageService.uploadMultiple(files);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProjectImage = async (imageId: number) => {
    try {
      setLoading(true);
      await ProjectImageService.delete(imageId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    totalCount,
    loading,
    error,
    filters,
    setFilters,
    createProject,
    updateProject,
    deleteProject,
    uploadProjectImages,
    deleteProjectImage,
    refreshProjects: fetchProjects,
    getImageUrl: ProjectImageService.getImageUrl
  };
};