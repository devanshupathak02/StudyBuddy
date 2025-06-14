import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudyPlan from '@/models/StudyPlan';
import mongoose from 'mongoose';

// GET /api/study-plans - Get all study plans for a user
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // Convert string userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const studyPlans = await StudyPlan.find({ userId: userObjectId }).sort({ createdAt: -1 });
    return NextResponse.json(studyPlans);
  } catch (error) {
    console.error('Error in GET /api/study-plans:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST /api/study-plans - Create a new study plan
export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();

    // Convert string userId to ObjectId
    if (data.userId) {
      data.userId = new mongoose.Types.ObjectId(data.userId);
    }

    const studyPlan = new StudyPlan(data);
    await studyPlan.save();

    return NextResponse.json(studyPlan, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/study-plans:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT /api/study-plans/:id - Update a study plan
export async function PUT(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const data = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'Study plan ID is required' }, { status: 400 });
    }

    const studyPlan = await StudyPlan.findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      data,
      { new: true }
    );

    if (!studyPlan) {
      return NextResponse.json({ message: 'Study plan not found' }, { status: 404 });
    }

    return NextResponse.json(studyPlan);
  } catch (error) {
    console.error('Error in PUT /api/study-plans:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// DELETE /api/study-plans/:id - Delete a study plan
export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Study plan ID is required' }, { status: 400 });
    }

    const studyPlan = await StudyPlan.findByIdAndDelete(new mongoose.Types.ObjectId(id));
    if (!studyPlan) {
      return NextResponse.json({ message: 'Study plan not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Study plan deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/study-plans:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
} 