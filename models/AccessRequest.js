import mongoose from "mongoose";

const accessRequestSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "user-access-requests" }
);

accessRequestSchema.pre("save", function (next) {
  this.email = this.email.toLowerCase().trim();
  this.fullName = this.fullName.trim();
  next();
});

export default mongoose.model("AccessRequest", accessRequestSchema);
