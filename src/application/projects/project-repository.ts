import type { ProjectRepository } from "@/domain/project/repositories/project.repository";
import { CognoDBProjectRepository } from "@/infrastructure/database/cognodb/repositories/cognodb-project.repository";

let repository: ProjectRepository | undefined;

export function getProjectRepository(): ProjectRepository {
  repository ??= new CognoDBProjectRepository();

  return repository;
}