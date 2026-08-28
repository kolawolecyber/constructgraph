import type {
  ProjectRepository,
  SupplierImpact,
} from "@/domain/project/repositories/project.repository";

export class GetSupplierImpact {
  constructor(private readonly repository: ProjectRepository) {}

  async execute( projectId: string,
    supplierId: string, 
  ): Promise<SupplierImpact | null> {
    return this.repository.getSupplierImpact( projectId,supplierId);
  }
}