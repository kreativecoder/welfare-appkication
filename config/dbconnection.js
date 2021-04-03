// Database connection function goes here
import { Sequelize } from "sequelize";
import { config } from "dotenv";

config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  // "d1o5s813gt1b2p",
  // "xkjvkmjouvynvq",
  // "cc52018c321647370ab23b6688f2c887ef0990eeca89b1c0aa0f3cc6d5c51dfa",
  {
    host: process.env.DB_HOST,
    // host: "ec2-18-204-74-74.compute-1.amazonaws.com",

    dialect: "postgres",
    dialectOptions: process.env.NODE_ENV === "production" && {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },

    logging: false,
  }
);

async function connect() {
  try {
    await sequelize.authenticate();
    console.log("Database Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

export default connect;
