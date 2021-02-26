import dotenv from 'dotenv';
dotenv.config();
  
  module.exports =  {development: {
      username: "postgres",
      password: "root",
      database: "cooporativeApp",
      host: "127.0.0.1",
      dialect: "postgres",
      operatorsAliases: false
    },
    test: {
      storage: './database.sqlite',
      dialect: 'sqlite',
      logging: false
    },
    production: {
      // use_env_variable: process.env.DATABASE_URL,
      url: process.env.DATABASE_URL,
      dialect: 'postgres',
      
      
    }
  }
  