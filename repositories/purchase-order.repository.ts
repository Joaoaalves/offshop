import { PurchaseOrder } from "@/models/PurchaseOrder";
import { Supplier } from "@/models/Supplier";
import { IPurchaseOrder, IPurchaseOrderItem } from "@/types/purchase-order";

export class PurchaseOrderRepository {
  async create(
    supplierName: string,
    items: IPurchaseOrderItem[],
  ): Promise<IPurchaseOrder> {
    const doc = await PurchaseOrder.create({
      supplierName,
      status: "pending",
      orderedAt: new Date(),
      items,
    });
    return doc.toObject();
  }

  async getAll(): Promise<IPurchaseOrder[]> {
    return PurchaseOrder.find().sort({ orderedAt: -1 }).lean();
  }

  async markArrived(
    id: string,
    arrivedAt: Date,
  ): Promise<IPurchaseOrder | null> {
    const order = await PurchaseOrder.findById(id);
    if (!order) return null;

    const orderedAt = order.orderedAt as Date;
    const leadTimeDays = Math.max(
      1,
      Math.round(
        (arrivedAt.getTime() - orderedAt.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );

    const updated = await PurchaseOrder.findByIdAndUpdate(
      id,
      { status: "arrived", arrivedAt, leadTimeDays },
      { new: true },
    ).lean();

    // Update the supplier's lead time with the measured value
    await Supplier.findOneAndUpdate(
      { name: order.supplierName },
      { leadTimeDays },
    );

    return updated as IPurchaseOrder | null;
  }
}
