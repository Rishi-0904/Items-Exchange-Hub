import connectToDatabase from '@/lib/mongodb';

export const connect = async () => {
  await connectToDatabase();
}; 