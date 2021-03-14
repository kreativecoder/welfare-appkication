// Database connection function goes here
import { Sequelize } from "sequelize";
import { config } from "dotenv";

config();

const sequelize = new Sequelize(
  // process.env.DATABASE_URL,
  {
    // host: process.DB_HOST,
    username: "xkjvkmjouvynvq",
    password: "cc52018c321647370ab23b6688f2c887ef0990eeca89b1c0aa0f3cc6d5c51dfa",
    database: "d1o5s813gt1b2p",
    port: 5432,
    host: "ec2-18-204-74-74.compute-1.amazonaws.com",
    dialectOptions: {
      ssl: {
        require: false,
        rejectUnauthorized: false // <<<<<< YOU NEED THIS
      }
    },
    // port: 5432,
    dialect: "postgres",
    // ssl: {
    //   rejectUnauthorized: true
    // },
  
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