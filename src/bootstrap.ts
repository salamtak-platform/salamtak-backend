import app from "./app";
import { DBConnection } from "./DB/config/connectDB";

const bootStrap = async () => {
    const port = Number(process.env.PORT) || 3000;

    await DBConnection();

    return app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
};

export default bootStrap;
