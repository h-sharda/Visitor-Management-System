import AccessRequest from "../models/AccessRequest.js";
import User from "../models/User.js";

// Create new access request
export const createAccessRequest = async (req, res) => {
  try {
    const { fullName, email, purpose } = req.body;

    if (!fullName || !email || !purpose) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (purpose.length > 500) {
      return res
        .status(400)
        .json({ message: "Purpose must not exceed 500 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Check if there's a pending request with this email
    const existingRequest = await AccessRequest.findOne({
      email,
      status: "PENDING",
    });
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "You already have a pending access request" });
    }

    const newRequest = new AccessRequest({ fullName, email, purpose });
    await newRequest.save();

    return res.status(201).json({
      message: "Access request submitted successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error creating access request:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all access requests
export const getAccessRequests = async (req, res) => {
  try {
    const requests = await AccessRequest.find().sort({ requestedAt: -1 });
    return res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching access requests:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Approve access request
export const approveAccessRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { role = "VIEWER" } = req.body;

    const request = await AccessRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Access request not found" });
    }

    if (request.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "This request has already been processed" });
    }

    // Create new user
    const newUser = new User({
      fullName: request.fullName,
      email: request.email,
      role,
    });
    await newUser.save();

    // Update request status
    request.status = "APPROVED";
    await request.save();

    return res.status(200).json({
      message: "Access request approved successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error approving access request:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Reject access request
export const rejectAccessRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await AccessRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Access request not found" });
    }

    if (request.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "This request has already been processed" });
    }

    // Update request status
    request.status = "REJECTED";
    await request.save();

    return res.status(200).json({
      message: "Access request rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting access request:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
