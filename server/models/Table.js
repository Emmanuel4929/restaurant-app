const mongoose = require("mongoose");

const TableSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["available", "occupied", "offline"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Table", TableSchema);
