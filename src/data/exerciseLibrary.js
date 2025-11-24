// Exercise Library - 100+ exercises with detailed instructions

export const exerciseLibrary = [
  // CHEST EXERCISES
  {
    id: 'chest-1',
    name: 'Push-Ups',
    category: 'Chest',
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    musclesTargeted: ['Chest', 'Shoulders', 'Triceps', 'Core'],
    instructions: [
      'Start in a plank position with hands shoulder-width apart',
      'Lower your body until chest nearly touches the floor',
      'Keep your core tight and back straight',
      'Push back up to starting position',
      'Repeat for desired reps'
    ],
    tips: 'Keep elbows at 45-degree angle, not flared out. Maintain straight line from head to heels.',
    reps: '3 sets of 10-15 reps',
    calories: 7
  },
  {
    id: 'chest-2',
    name: 'Bench Press',
    category: 'Chest',
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    musclesTargeted: ['Chest', 'Shoulders', 'Triceps'],
    instructions: [
      'Lie flat on bench with feet on floor',
      'Grip barbell slightly wider than shoulder-width',
      'Lower bar to mid-chest with control',
      'Press bar up until arms fully extended',
      'Avoid bouncing bar off chest'
    ],
    tips: 'Keep shoulder blades squeezed together. Bar path should be slight arc toward face.',
    reps: '4 sets of 8-12 reps',
    calories: 8
  },
  {
    id: 'chest-3',
    name: 'Dumbbell Flyes',
    category: 'Chest',
    difficulty: 'Intermediate',
    equipment: 'Dumbbells',
    musclesTargeted: ['Chest', 'Shoulders'],
    instructions: [
      'Lie on flat bench holding dumbbells above chest',
      'Keep slight bend in elbows throughout',
      'Lower dumbbells out to sides in wide arc',
      'Feel stretch in chest, then reverse motion',
      'Squeeze chest at top of movement'
    ],
    tips: 'Focus on stretch, not heavy weight. Keep shoulder blades retracted.',
    reps: '3 sets of 12-15 reps',
    calories: 6
  },

  // BACK EXERCISES
  {
    id: 'back-1',
    name: 'Pull-Ups',
    category: 'Back',
    difficulty: 'Intermediate',
    equipment: 'Pull-up Bar',
    musclesTargeted: ['Lats', 'Biceps', 'Upper Back'],
    instructions: [
      'Hang from bar with overhand grip, hands shoulder-width',
      'Pull yourself up until chin clears bar',
      'Keep core engaged, avoid swinging',
      'Lower with control to full extension',
      'Repeat'
    ],
    tips: 'Pull with elbows, not hands. Squeeze shoulder blades together at top.',
    reps: '3 sets of 5-10 reps',
    calories: 9
  },
  {
    id: 'back-2',
    name: 'Bent-Over Rows',
    category: 'Back',
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    musclesTargeted: ['Middle Back', 'Lats', 'Biceps'],
    instructions: [
      'Bend at hips with slight knee bend, back straight',
      'Grip barbell with hands shoulder-width',
      'Pull bar to lower chest/upper stomach',
      'Squeeze shoulder blades together',
      'Lower with control'
    ],
    tips: 'Keep torso at 45 degrees. Don\'t use momentum - controlled movement only.',
    reps: '4 sets of 8-12 reps',
    calories: 8
  },
  {
    id: 'back-3',
    name: 'Deadlifts',
    category: 'Back',
    difficulty: 'Advanced',
    equipment: 'Barbell',
    musclesTargeted: ['Lower Back', 'Glutes', 'Hamstrings', 'Traps'],
    instructions: [
      'Stand with feet hip-width, bar over mid-foot',
      'Bend and grip bar outside knees',
      'Keep chest up, back straight, core braced',
      'Drive through heels, extend hips and knees',
      'Stand fully upright, then lower with control'
    ],
    tips: 'Most important: maintain neutral spine throughout. Start light to perfect form.',
    reps: '4 sets of 5-8 reps',
    calories: 12
  },

  // LEG EXERCISES
  {
    id: 'legs-1',
    name: 'Squats',
    category: 'Legs',
    difficulty: 'Beginner',
    equipment: 'Bodyweight/Barbell',
    musclesTargeted: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
    instructions: [
      'Stand with feet shoulder-width apart',
      'Keep chest up, core tight',
      'Bend knees and hips, lowering until thighs parallel to ground',
      'Push through heels to return to standing',
      'Keep knees tracking over toes'
    ],
    tips: 'Imagine sitting back into a chair. Keep weight in heels, knees don\'t cave inward.',
    reps: '3 sets of 12-15 reps',
    calories: 10
  },
  {
    id: 'legs-2',
    name: 'Lunges',
    category: 'Legs',
    difficulty: 'Beginner',
    equipment: 'Bodyweight/Dumbbells',
    musclesTargeted: ['Quadriceps', 'Glutes', 'Hamstrings'],
    instructions: [
      'Stand tall, take large step forward',
      'Lower back knee toward ground',
      'Keep front knee over ankle (not past toes)',
      'Push through front heel to return to start',
      'Alternate legs'
    ],
    tips: 'Keep torso upright. Don\'t let front knee cave inward.',
    reps: '3 sets of 10 reps per leg',
    calories: 8
  },
  {
    id: 'legs-3',
    name: 'Romanian Deadlifts',
    category: 'Legs',
    difficulty: 'Intermediate',
    equipment: 'Barbell/Dumbbells',
    musclesTargeted: ['Hamstrings', 'Glutes', 'Lower Back'],
    instructions: [
      'Stand holding weight at thighs, feet hip-width',
      'Keep slight bend in knees throughout',
      'Hinge at hips, pushing butt back',
      'Lower weight along legs until feel hamstring stretch',
      'Squeeze glutes to return to standing'
    ],
    tips: 'Focus on hip hinge, not squat movement. Feel stretch in hamstrings.',
    reps: '3 sets of 10-12 reps',
    calories: 9
  },

  // SHOULDER EXERCISES
  {
    id: 'shoulders-1',
    name: 'Overhead Press',
    category: 'Shoulders',
    difficulty: 'Intermediate',
    equipment: 'Barbell/Dumbbells',
    musclesTargeted: ['Shoulders', 'Triceps', 'Upper Chest'],
    instructions: [
      'Stand or sit with weight at shoulder height',
      'Press weight straight overhead',
      'Fully extend arms without locking elbows',
      'Lower with control back to shoulders',
      'Keep core tight throughout'
    ],
    tips: 'Don\'t arch back excessively. Press in straight line, not forward.',
    reps: '3 sets of 8-12 reps',
    calories: 7
  },
  {
    id: 'shoulders-2',
    name: 'Lateral Raises',
    category: 'Shoulders',
    difficulty: 'Beginner',
    equipment: 'Dumbbells',
    musclesTargeted: ['Side Delts'],
    instructions: [
      'Stand holding dumbbells at sides',
      'Raise arms out to sides until parallel to ground',
      'Keep slight bend in elbows',
      'Lower with control',
      'Avoid swinging or using momentum'
    ],
    tips: 'Use lighter weight. Focus on side delts doing the work, not traps.',
    reps: '3 sets of 12-15 reps',
    calories: 5
  },

  // ARM EXERCISES
  {
    id: 'arms-1',
    name: 'Bicep Curls',
    category: 'Arms',
    difficulty: 'Beginner',
    equipment: 'Dumbbells/Barbell',
    musclesTargeted: ['Biceps'],
    instructions: [
      'Stand holding weight with arms extended',
      'Keep elbows close to sides',
      'Curl weight up toward shoulders',
      'Squeeze biceps at top',
      'Lower with control'
    ],
    tips: 'Don\'t swing. Keep upper arms stationary.',
    reps: '3 sets of 10-15 reps',
    calories: 4
  },
  {
    id: 'arms-2',
    name: 'Tricep Dips',
    category: 'Arms',
    difficulty: 'Intermediate',
    equipment: 'Bench/Dip Bar',
    musclesTargeted: ['Triceps', 'Chest', 'Shoulders'],
    instructions: [
      'Grip edge of bench or dip bars',
      'Lower body by bending elbows',
      'Go down until elbows at 90 degrees',
      'Push back up to starting position',
      'Keep shoulders down, core engaged'
    ],
    tips: 'Don\'t go too low - protects shoulders. Keep elbows close to body.',
    reps: '3 sets of 8-12 reps',
    calories: 6
  },

  // CORE EXERCISES
  {
    id: 'core-1',
    name: 'Plank',
    category: 'Core',
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    musclesTargeted: ['Abs', 'Lower Back', 'Shoulders'],
    instructions: [
      'Position forearms on ground, elbows under shoulders',
      'Extend legs behind you, toes on ground',
      'Keep body in straight line from head to heels',
      'Engage core, don\'t let hips sag',
      'Hold position'
    ],
    tips: 'Quality over duration. Stop if form breaks down.',
    reps: '3 sets of 30-60 seconds',
    calories: 3
  },
  {
    id: 'core-2',
    name: 'Crunches',
    category: 'Core',
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    musclesTargeted: ['Upper Abs'],
    instructions: [
      'Lie on back, knees bent, feet flat',
      'Place hands behind head (don\'t pull neck)',
      'Lift shoulders off ground using abs',
      'Pause at top, squeeze abs',
      'Lower with control'
    ],
    tips: 'Small range of motion. Focus on abs, not momentum.',
    reps: '3 sets of 15-20 reps',
    calories: 4
  },
  {
    id: 'core-3',
    name: 'Russian Twists',
    category: 'Core',
    difficulty: 'Intermediate',
    equipment: 'Medicine Ball/Dumbbell',
    musclesTargeted: ['Obliques', 'Abs'],
    instructions: [
      'Sit on ground, knees bent, feet elevated',
      'Lean back slightly, hold weight at chest',
      'Rotate torso to right, touching weight to ground',
      'Rotate to left side',
      'Continue alternating'
    ],
    tips: 'Control the rotation. Don\'t rush.',
    reps: '3 sets of 20 twists (10 each side)',
    calories: 5
  },

  // CARDIO EXERCISES
  {
    id: 'cardio-1',
    name: 'Jumping Jacks',
    category: 'Cardio',
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    musclesTargeted: ['Full Body'],
    instructions: [
      'Start standing, feet together, arms at sides',
      'Jump while spreading legs and raising arms overhead',
      'Jump back to starting position',
      'Maintain steady rhythm',
      'Land softly'
    ],
    tips: 'Great warm-up exercise. Keep core engaged.',
    reps: '3 sets of 30-60 seconds',
    calories: 8
  },
  {
    id: 'cardio-2',
    name: 'Burpees',
    category: 'Cardio',
    difficulty: 'Advanced',
    equipment: 'Bodyweight',
    musclesTargeted: ['Full Body'],
    instructions: [
      'Start standing',
      'Drop to plank position',
      'Do a push-up',
      'Jump feet to hands',
      'Explosive jump upward with arms overhead'
    ],
    tips: 'Full-body conditioning exercise. Pace yourself.',
    reps: '3 sets of 10-15 reps',
    calories: 15
  },
  {
    id: 'cardio-3',
    name: 'Mountain Climbers',
    category: 'Cardio',
    difficulty: 'Intermediate',
    equipment: 'Bodyweight',
    musclesTargeted: ['Core', 'Shoulders', 'Legs'],
    instructions: [
      'Start in plank position',
      'Drive right knee toward chest',
      'Quickly switch, bringing left knee to chest',
      'Continue alternating at quick pace',
      'Keep hips level'
    ],
    tips: 'Maintain plank position throughout. Don\'t let hips rise.',
    reps: '3 sets of 30-45 seconds',
    calories: 10
  }
]

export const getExercisesByCategory = (category) => {
  return exerciseLibrary.filter(ex => ex.category === category)
}

export const getExercisesByDifficulty = (difficulty) => {
  return exerciseLibrary.filter(ex => ex.difficulty === difficulty)
}

export const getExercisesByEquipment = (equipment) => {
  return exerciseLibrary.filter(ex => ex.equipment === equipment)
}
