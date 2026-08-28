import type {
  ProjectRepository,
  SupplierImpact,
} from "@/domain/project/repositories/project.repository";

export class GetSupplierImpact {
  constructor(private readonly repository: ProjectRepository) {}

  async execute(
    supplierId: string
  ): Promise<SupplierImpact | null> {
    return this.repository.getSupplierImpact(supplierId);
  }
}