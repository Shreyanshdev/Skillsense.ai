import mongoose from 'mongoose';

// Connect to MongoDB
export async function connectDB() {

  // Check if the connection string is set
  try{

    await mongoose.connect(process.env.MONGODB_URI! );

    const connection = mongoose.connection;

    connection.on('connected ', () => {
      console.log('MongoDB database connection established successfully');
    });

    connection.on('error', (error: Error) => {
      console.error('MongoDB connection error:', error);
      process.exit(1); // Exit the process with failure
    })
  }

  catch (error) {
    console.error('MongoDB connection error:', error);
  }
}