import dotenv from "dotenv";
dotenv.config();

module.exports = {
  development: {
    // url: process.env.DATABASE_URL,

    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    // username: 'xkjvkmjouvynvq',
    // password: "cc52018c321647370ab23b6688f2c887ef0990eeca89b1c0aa0f3cc6d5c51dfa",
    // database: "d1o5s813gt1b2p",
    // host: "ec2-18-204-74-74.compute-1.amazonaws.com",
    port: 5432,
    dialect: "postgres",
    operatorsAliases: false,
  },
  test: {
    storage: "./database.sqlite",
    dialect: "sqlite",
    logging: false,
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
