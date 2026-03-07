
import express from "express";
import cors from "cors";

//  Import your module routers 
import authRouter from "./modules/auth/auth.controller.js";
import userRouter from "./modules/user/user.controller.js";

export const bootstrap = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());


  app.use("/auth", authRouter);
  app.use("/user", userRouter);

  app.use((req, res) => {
    res.status(404).json({ ok: false, message: "Route not found" });
  });


  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
      ok: false,
      message: err.message || "Server error",
    });
  });

  return app;
};