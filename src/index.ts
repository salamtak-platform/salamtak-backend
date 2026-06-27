import dotenv from "dotenv";
dotenv.config();
import bootStrap from './bootstrap';

bootStrap().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
