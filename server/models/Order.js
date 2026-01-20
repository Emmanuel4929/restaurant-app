// server/models/Order.js
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    total: { type: Number, required: true, min: 0 },
    totalCalories: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["pending", "ready", "delivered", "cancelled"],
      default: "pending",
    },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

// Recalcular total y calorías ANTES de la validación
OrderSchema.pre("validate", async function () {
  if (this.items && this.items.length) {
    // Pobla productos para tener price y calories
    await this.populate("items.product");
    this.total = this.items.reduce(
      (sum, { product, quantity }) => sum + product.price * quantity,
      0
    );
    this.totalCalories = this.items.reduce(
      (sum, { product, quantity }) => sum + product.calories * quantity,
      0
    );
  }
});

module.exports = mongoose.model("Order", OrderSchema);
