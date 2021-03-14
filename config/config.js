import dotenv from 'dotenv';
dotenv.config();
  
  module.exports =  {development: {
    // url: process.env.DATABASE_URL,
    
      username: "xkjvkmjouvynvq",
      password: "cc52018c321647370ab23b6688f2c887ef0990eeca89b1c0aa0f3cc6d5c51dfa",
      database: "d1o5s813gt1b2p",
      host: "ec2-18-204-74-74.compute-1.amazonaws.com",
      port: 5432,
      dialect: "postgres",
      operatorsAliases: false
    },
    test: {
      storage: './database.sqlite',
      dialect: 'sqlite',
      logging: false
    },
    production: {
      // use_env_variable: '',
      url: 'postgres://xkjvkmjouvynvq:cc52018c321647370ab23b6688f2c887ef0990eeca89b1c0aa0f3cc6d5c51dfa@ec2-18-204-74-74.compute-1.amazonaws.com:5432/d1o5s813gt1b2p?sslmode=require'
      
      // username: "xkjvkmjouvynvq",
      // password: "cc52018c321647370ab23b6688f2c887ef0990eeca89b1c0aa0f3cc6d5c51dfa",
      // database: "d1o5s813gt1b2p",
      // host: "ec2-18-204-74-74.compute-1.amazonaws.com",
      // port: 5432,
      // dialect: "postgres",
      // operatorsAliases: false,
      // url: process.env.DATABASE_URL,
      // dialect: 'postgres'
      
      
    }
  }
  