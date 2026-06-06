const mongoose = require("mongoose");
require("dotenv").config();

const Admin = require("./models/Admin");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "admin@marketili.com";

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log("Admin already exists");
      process.exit();
    }

    
    const admin = await Admin.create({
      firstName: "Admin",
      lastName: "User",
      email,
      password: "admiiin123",
    });

    console.log("Admin created:", admin.email);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();