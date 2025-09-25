import mongoose from 'mongoose';
export const connectDB = async(mongoURL)=>{
    try{
        await mongoose.connect(mongoURL,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to database Successfully");
    }catch (e){
        console.error("MongoDB connection failed:",e.message);
        process.exit(1);
    }
}