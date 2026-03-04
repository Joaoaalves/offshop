import { Supplier } from "@/models/Supplier";

export class SupplierRepository {
  create(data: any) {
    return Supplier.create(data);
  }

  findAll() {
    return Supplier.find().lean();
  }

  update(supplierId: string, data: any) {
    return Supplier.findByIdAndUpdate(supplierId, data, {
      new: true,
    });
  }

  delete(supplierId: string) {
    return Supplier.findByIdAndDelete(supplierId);
  }
}
