import mongoose from "mongoose";

export const DBConnection = async () => {
    const uri = process.env.DB_URI || process.env.LOCAL_DATABASE_URI;
    if (!uri) {
        throw new Error("Database URI is not defined in environment variables.");
    }

    const serverSelectionTimeoutMS = Number(process.env.DB_CONNECTION_TIMEOUT_MS) || 10000;

    await mongoose.connect(uri, { serverSelectionTimeoutMS });
    console.log('Database connected successfully');
};
