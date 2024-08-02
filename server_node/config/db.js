const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://thamaltw97:thamaltw97@cluster0.uyrzdjf.mongodb.net/", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    //   createIndexes: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
