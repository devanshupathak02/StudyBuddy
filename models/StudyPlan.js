import mongoose from 'mongoose';

const studyPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  description: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  estimatedHours: {
    type: Number,
    default: 0,
    min: 0
  },
  tasks: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    estimatedHours: {
      type: Number,
      default: 1,
      min: 0.5
    },
    completedAt: Date
  }],
  reminders: [{
    message: String,
    date: Date,
    isCompleted: {
      type: Boolean,
      default: false
    }
  }],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
studyPlanSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calculate progress based on completed tasks
studyPlanSchema.methods.calculateProgress = function() {
  if (!this.tasks || this.tasks.length === 0) return 0;
  const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
  return Math.round((completedTasks / this.tasks.length) * 100);
};

// Get overdue tasks
studyPlanSchema.methods.getOverdueTasks = function() {
  const today = new Date();
  return this.tasks.filter(task => 
    task.status === 'pending' && 
    task.dueDate && 
    new Date(task.dueDate) < today
  );
};

// Get upcoming tasks
studyPlanSchema.methods.getUpcomingTasks = function() {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  return this.tasks.filter(task => 
    task.status === 'pending' && 
    task.dueDate && 
    new Date(task.dueDate) >= today &&
    new Date(task.dueDate) <= nextWeek
  );
};

export default mongoose.models.StudyPlan || mongoose.model('StudyPlan', studyPlanSchema); 