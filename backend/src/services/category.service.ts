import { CategoryRepository } from '../repositories/category.repository';

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  async getAllCategories() {
    return this.categoryRepository.findAll();
  }

  async getCategoryById(id: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new Error('Category not found');
    return category;
  }

  async createCategory(data: { name: string; description?: string }) {
    // Check if category name already exists
    const existing = await this.categoryRepository.findAll();
    if (existing.some(c => c.name.toLowerCase() === data.name.toLowerCase())) {
      throw new Error('Category with this name already exists');
    }
    return this.categoryRepository.create(data);
  }
}
