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
      returnDocument: "after",
    });
  }

  delete(supplierId: string) {
    return Supplier.findByIdAndDelete(supplierId);
  }

  findByPrefix(prefix: string) {
    return Supplier.findOne({ prefix }).lean();
  }

  findByNamePartial(name: string) {
    return Supplier.findOne({
      name: { $regex: name.slice(0, 20), $options: "i" },
    }).lean();
  }
}
