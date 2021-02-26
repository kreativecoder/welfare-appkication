// Database connection function goes here
import { Sequelize } from "sequelize";
import { config } from "dotenv";

config();

const sequelize = new Sequelize(
  {
   connectionString: process.env.DATABASE_URL,
   
    dialect: "postgres",
    ssl: {
      rejectUnauthorized: false
    },
    logging: true
  }
);

async function connect() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

export default connect;