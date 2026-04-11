import {
  BMI_NORMAL_MAX,
  BMI_OVERWEIGHT_MAX,
  BMI_UNDERWEIGHT_MAX,
} from '@/lib/bmi';

export type SuggestedWorkout = {
  title: string;
  subtitle: string;
  /** Strength library exercise ids—workout session demos */
  demoExerciseIds: string[];
};

/** Workouts matched to BMI band (same logic as getBmiInfo). */
export function workoutsForBmi(bmi: number | null): { workouts: SuggestedWorkout[]; sectionHint: string } {
  if (bmi === null) {
    return {
      sectionHint: 'General picks to get you moving',
      workouts: [
        {
          title: 'Brisk walk',
          subtitle: '30 minutes of walking builds a daily habit.',
          demoExerciseIds: ['walking-lunge', 'goblet-squat', 'plank'],
        },
        {
          title: 'Light strength',
          subtitle: 'Bodyweight moves to support posture and energy.',
          demoExerciseIds: ['push-up', 'plank', 'goblet-squat'],
        },
      ],
    };
  }
  if (bmi < BMI_UNDERWEIGHT_MAX) {
    return {
      sectionHint: 'Focused on healthy weight gain and muscle',
      workouts: [
        {
          title: 'Strength training',
          subtitle:
            'Compound lifts or resistance bands to build lean mass—pair with enough protein and calories.',
          demoExerciseIds: ['deadlift', 'back-squat', 'bench-press', 'pull-up'],
        },
        {
          title: 'Low-intensity cardio',
          subtitle: 'Short walks or easy cycling—keeps heart healthy without burning too many extra calories.',
          demoExerciseIds: ['walking-lunge', 'hip-thrust', 'plank'],
        },
      ],
    };
  }
  if (bmi < BMI_NORMAL_MAX) {
    return {
      sectionHint: 'Balanced for your healthy BMI',
      workouts: [
        {
          title: 'Mixed cardio',
          subtitle: 'Running, rowing, or dance—keep endurance up while you enjoy variety.',
          demoExerciseIds: ['walking-lunge', 'push-up', 'romanian-deadlift'],
        },
        {
          title: 'Strength maintenance',
          subtitle: 'Two sessions a week preserves muscle and supports metabolism.',
          demoExerciseIds: ['bench-press', 'dumbbell-row', 'goblet-squat'],
        },
      ],
    };
  }
  if (bmi < BMI_OVERWEIGHT_MAX) {
    return {
      sectionHint: 'Extra cardio to support gradual fat loss',
      workouts: [
        {
          title: 'Cycling or elliptical',
          subtitle: 'Lower impact on joints while you raise weekly calorie burn steadily.',
          demoExerciseIds: ['bulgarian-split-squat', 'romanian-deadlift', 'plank'],
        },
        {
          title: 'Interval walking',
          subtitle: 'Alternate brisk and easy pace—simple to start and easy to scale.',
          demoExerciseIds: ['walking-lunge', 'goblet-squat', 'overhead-press'],
        },
      ],
    };
  }
  return {
    sectionHint: 'Low-impact, joint-friendly options',
    workouts: [
      {
        title: 'Walking or aqua fitness',
        subtitle: 'Gentle on knees and hips—aim for consistent daily movement.',
        demoExerciseIds: ['walking-lunge', 'goblet-squat', 'plank'],
      },
      {
        title: 'Seated or supported strength',
        subtitle: 'Light resistance to maintain muscle; clear any plan with your clinician if needed.',
        demoExerciseIds: ['lat-pulldown', 'dumbbell-row', 'push-up'],
      },
    ],
  };
}
