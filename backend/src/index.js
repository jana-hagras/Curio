import 'dotenv/config';
import { bootstrap } from "./app.controller.js";
import { initDatabase } from "./db/setupdb.js";

const start = async () => {
    try {
        await initDatabase();
        console.log("Database ready 🗄️");
    } catch (err) {
        console.error("Failed to initialise database:", err);
        process.exit(1);
    }

    const app = bootstrap();
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
};

start();