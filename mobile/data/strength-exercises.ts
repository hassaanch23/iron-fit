/**
 * Curated strength exercises with form cues and YouTube references (educational channels).
 * Thumbnails: https://img.youtube.com/vi/{youtubeVideoId}/hqdefault.jpg
 */

export type StrengthCategory = 'lower' | 'push' | 'pull' | 'core';

export type StrengthExercise = {
  id: string;
  name: string;
  category: StrengthCategory;
  equipment: string;
  /** Short demo summary shown in list */
  demoSummary: string;
  /** Step-by-step on the detail screen */
  steps: string[];
  /** Coaching cues */
  cues: string[];
  /** Common mistakes to avoid */
  mistakes: string[];
  /** YouTube watch URL (stable reference) */
  youtubeUrl: string;
  /** 11-char video id for thumbnails */
  youtubeVideoId: string;
  /** Attribution / channel hint for the user */
  videoCredit: string;
};

export const STRENGTH_CATEGORIES: { key: StrengthCategory; label: string; description: string }[] = [
  { key: 'lower', label: 'Lower body', description: 'Hips, legs, glutes' },
  { key: 'push', label: 'Push', description: 'Chest, shoulders, triceps' },
  { key: 'pull', label: 'Pull', description: 'Back, biceps, rear delts' },
  { key: 'core', label: 'Core', description: 'Trunk stability' },
];

/** Public YouTube thumbnail (hq ~480px wide). */
export function strengthExerciseThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export const STRENGTH_EXERCISES: StrengthExercise[] = [
  {
    id: 'deadlift',
    name: 'Conventional deadlift',
    category: 'pull',
    equipment: 'Barbell, plates',
    demoSummary: 'Hinge at the hips, bar close to the body, neutral spine.',
    steps: [
      'Stand with mid-foot under the bar, feet hip-width.',
      'Hinge and grip the bar just outside your legs without rounding your back.',
      'Pull slack out of the bar, brace your core, and drive the floor away.',
      'Stand tall at the top with hips and knees locked, shoulders over hips.',
      'Reverse by pushing hips back first, then bending knees once the bar passes them.',
    ],
    cues: [
      'Bar stays in contact with the legs.',
      'Neck neutral—eyes a few feet ahead.',
      'Breathe and brace before each rep.',
    ],
    mistakes: [
      'Rounding the lower back off the floor.',
      'Letting the bar drift forward.',
      'Jerking the bar instead of maintaining tension.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=MBbyAqvTNkU',
    youtubeVideoId: 'MBbyAqvTNkU',
    videoCredit: 'Alan Thrall — updated deadlift tutorial (Untamed Strength)',
  },
  {
    id: 'back-squat',
    name: 'Barbell back squat',
    category: 'lower',
    equipment: 'Squat rack, barbell',
    demoSummary: 'Full-body pattern: sit between your hips while keeping the chest proud.',
    steps: [
      'Set the bar on your upper back, hands evenly on the bar, feet shoulder-width.',
      'Unrack with three points of foot contact and ribs stacked over pelvis.',
      'Break at hips and knees together, tracking knees over toes.',
      'Descend until hip crease is at least parallel to the knee (or your safe depth).',
      'Drive up evenly—chest and hips rise together.',
    ],
    cues: [
      '“Spread the floor” with your feet for a stable arch.',
      'Keep the bar path vertical over mid-foot.',
      'Think “sit between your legs,” not only forward.',
    ],
    mistakes: [
      'Collapsing knees inward (valgus).',
      'Good-morning-ing the weight up with a soft back.',
      'Heels lifting—often a depth or ankle-mobility issue.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
    youtubeVideoId: 'ultWZbUMPL8',
    videoCredit: 'Jeff Nippard — how to squat',
  },
  {
    id: 'goblet-squat',
    name: 'Goblet squat',
    category: 'lower',
    equipment: 'Dumbbell or kettlebell',
    demoSummary: 'Front-loaded squat—great for learning depth and upright torso.',
    steps: [
      'Hold one dumbbell vertically at chest height, elbows pointing down.',
      'Feet slightly wider than hips, toes out a few degrees.',
      'Squat down keeping the weight stacked over mid-foot.',
      'Drive through mid-foot to stand, exhaling at the top.',
    ],
    cues: [
      'Use the elbows to wedge your knees out slightly.',
      'Keep the weight touching your sternum.',
    ],
    mistakes: [
      'Letting elbows flare way forward.',
      'Rising onto the toes.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=MeIiIdhvXT4',
    youtubeVideoId: 'MeIiIdhvXT4',
    videoCredit: 'Mind Pump TV — goblet squat',
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian deadlift (RDL)',
    category: 'lower',
    equipment: 'Barbell or dumbbells',
    demoSummary: 'Hip hinge for hamstrings and glutes—bar slides along the thighs.',
    steps: [
      'Start standing with bar at hips, soft knees, ribs down.',
      'Push hips back while sliding the bar down the legs.',
      'Stop when you feel a strong hamstring stretch (usually mid-shin).',
      'Drive hips forward to return, squeezing glutes at the top.',
    ],
    cues: [
      'Shins stay relatively vertical.',
      'Neck long, lats engaged to keep bar close.',
    ],
    mistakes: [
      'Squatting the weight down instead of hinging.',
      'Overarching the low back at the bottom.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=JCXUYuzwNrM',
    youtubeVideoId: 'JCXUYuzwNrM',
    videoCredit: 'Jeff Nippard — RDL',
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian split squat',
    category: 'lower',
    equipment: 'Bench, dumbbells optional',
    demoSummary: 'Single-leg strength with rear foot elevated.',
    steps: [
      'Place the top of your rear foot on a bench, hop front foot forward.',
      'Torso tall, descend until front thigh is near parallel.',
      'Press through the whole front foot to stand.',
      'Keep the knee tracking over the foot, not caving in.',
    ],
    cues: [
      'Most weight on the front leg—rear foot is for balance.',
      'Lean slightly forward from the hips if it helps depth.',
    ],
    mistakes: [
      'Standing too close to the bench (knee jams).',
      'Bouncing out of the bottom.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE',
    youtubeVideoId: '2C-uNgKwPLE',
    videoCredit: 'ScottHermanFitness — Bulgarian split squat',
  },
  {
    id: 'hip-thrust',
    name: 'Barbell hip thrust',
    category: 'lower',
    equipment: 'Bench, barbell, pad',
    demoSummary: 'Glute-focused bridge with shoulders on the bench.',
    steps: [
      'Upper back on bench, bar over hips (use a pad).',
      'Feet flat, knees bent ~90° at the top position.',
      'Drive hips up until body forms a straight line from knees to shoulders.',
      'Lower with control; don’t hyperextend the low back.',
    ],
    cues: [
      'Chin tucked slightly, eyes forward.',
      'Push through heels and squeeze glutes hard at the top.',
    ],
    mistakes: [
      'Arching the low back instead of extending the hip.',
      'Feet too far away—hamstrings take over.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=xDmFk_JxqzY',
    youtubeVideoId: 'xDmFk_JxqzY',
    videoCredit: 'Bret Contreras — hip thrust',
  },
  {
    id: 'walking-lunge',
    name: 'Walking lunge',
    category: 'lower',
    equipment: 'Bodyweight or dumbbells',
    demoSummary: 'Stepping lunge for legs and single-leg stability.',
    steps: [
      'Stand tall, take a long step forward.',
      'Drop the back knee toward the floor; front shin stays relatively vertical.',
      'Push through the front foot to bring the back foot forward into the next step.',
    ],
    cues: [
      'Keep ribs stacked—don’t fold forward excessively.',
      'Knee tracks over the shoelaces.',
    ],
    mistakes: [
      'Short steps that jam the front knee.',
      'Torso collapsing forward.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=L8fvyBHUPew',
    youtubeVideoId: 'L8fvyBHUPew',
    videoCredit: 'Jeremy Ethier — lunge',
  },
  {
    id: 'bench-press',
    name: 'Barbell bench press',
    category: 'push',
    equipment: 'Bench, barbell, rack',
    demoSummary: 'Horizontal press with stable shoulder blades and bar path.',
    steps: [
      'Lie on bench, eyes under bar, feet planted.',
      'Pull shoulder blades together and down into the bench.',
      'Unrack to straight arms, then lower to mid-chest with elbows ~45° from torso.',
      'Touch lightly and press back along a slight arc toward the rack.',
    ],
    cues: [
      '“Pull the bar apart” to engage lats.',
      'Leg drive pushes you slightly up the bench (not hips flying).',
    ],
    mistakes: [
      'Flaring elbows to 90° (shoulder stress).',
      'Bouncing off the chest.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=esQi683u65A',
    youtubeVideoId: 'esQi683u65A',
    videoCredit: 'Jeff Nippard — bench press',
  },
  {
    id: 'overhead-press',
    name: 'Standing overhead press',
    category: 'push',
    equipment: 'Barbell or dumbbells',
    demoSummary: 'Strict press overhead with a straight bar path.',
    steps: [
      'Bar at collarbone, grip just outside shoulders, elbows slightly forward.',
      'Brace core and glutes, press straight up, moving head slightly back then through.',
      'Lock out overhead with biceps by ears, then lower under control.',
    ],
    cues: [
      'Ribs down—don’t turn it into a standing incline bench.',
      'Wrists stacked over elbows over hips.',
    ],
    mistakes: [
      'Overarching the low back.',
      'Pressing in front of the face the whole way.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=CnBmiBqp-AI',
    youtubeVideoId: 'CnBmiBqp-AI',
    videoCredit: 'Alan Thrall — press',
  },
  {
    id: 'push-up',
    name: 'Push-up',
    category: 'push',
    equipment: 'Bodyweight',
    demoSummary: 'Full-body plank that moves—chest to hands.',
    steps: [
      'Hands under shoulders, body in a straight line from head to heels.',
      'Lower chest toward the floor, elbows ~45° from ribs.',
      'Press the floor away and lock out without sagging hips.',
    ],
    cues: [
      'Screw hands outward slightly to engage lats.',
      'Keep the neck long.',
    ],
    mistakes: [
      'Piking hips up or sagging low back.',
      'Only moving the head, not the chest.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
    youtubeVideoId: 'IODxDxX7oi4',
    videoCredit: 'Calisthenicmovement — push-up',
  },
  {
    id: 'dumbbell-row',
    name: 'One-arm dumbbell row',
    category: 'pull',
    equipment: 'Dumbbell, bench',
    demoSummary: 'Supported row for mid-back and lats.',
    steps: [
      'One knee and hand on bench, other foot out to the side.',
      'Let the dumbbell hang straight down, shoulder packed.',
      'Row toward hip pocket, elbow skimming the ribs.',
      'Lower with control; don’t rotate the torso excessively.',
    ],
    cues: [
      'Think “elbow to ceiling,” not hand to armpit.',
      'Keep neck neutral.',
    ],
    mistakes: [
      'Using momentum from the low back.',
      'Shrugging the shoulder into the ear.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=roCP6wCXPqo',
    youtubeVideoId: 'roCP6wCXPqo',
    videoCredit: 'ScottHermanFitness — dumbbell row',
  },
  {
    id: 'pull-up',
    name: 'Pull-up (overhand)',
    category: 'pull',
    equipment: 'Pull-up bar',
    demoSummary: 'Vertical pull—chest to bar path with full extension.',
    steps: [
      'Hang with straight arms, shoulders slightly engaged (not fully relaxed).',
      'Pull elbows down and back, aiming chest toward bar.',
      'Clear the chin or touch chest depending on mobility.',
      'Lower to full extension under control.',
    ],
    cues: [
      'Squeeze glutes and abs to limit swinging.',
      'Think “bend the bar” with your hands.',
    ],
    mistakes: [
      'Kipping wildly before mastering strict reps.',
      'Half reps—chase full range when possible.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    youtubeVideoId: 'eGo4IYlbE5g',
    videoCredit: 'Chris Heria — pull-up tutorial',
  },
  {
    id: 'face-pull',
    name: 'Face pull',
    category: 'pull',
    equipment: 'Cable machine or band',
    demoSummary: 'Rear delts and external rotation—great for posture.',
    steps: [
      'Set cable at upper chest height, rope attachment.',
      'Pull rope toward face, splitting the ends beside your ears.',
      'Externally rotate so hands end slightly outside elbows.',
      'Control the return; keep elbows high.',
    ],
    cues: [
      'Think “thumbs pointing behind you” at the end.',
      'Don’t lean back to cheat.',
    ],
    mistakes: [
      'Elbows dropping toward the floor.',
      'Using too much weight and shrugging.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=zcpYZkBXOxc',
    youtubeVideoId: 'zcpYZkBXOxc',
    videoCredit: 'Jeremy Ethier — rear delts & face pull variations',
  },
  {
    id: 'lat-pulldown',
    name: 'Lat pulldown',
    category: 'pull',
    equipment: 'Cable machine',
    demoSummary: 'Vertical pull with torso stable—great pull-up progression.',
    steps: [
      'Grip slightly outside shoulders, thighs fixed under pads.',
      'Lean back very slightly, pull bar to upper chest.',
      'Drive elbows down and in toward pockets.',
      'Return until arms almost straight without losing posture.',
    ],
    cues: [
      'Depress shoulders first—don’t yank with traps.',
      'Chest proud throughout.',
    ],
    mistakes: [
      'Pulling behind the neck (not needed, more risk).',
      'Using torso swing for momentum.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
    youtubeVideoId: 'CAwf7n6Luuc',
    videoCredit: 'ScottHermanFitness — lat pulldown',
  },
  {
    id: 'plank',
    name: 'Forearm plank',
    category: 'core',
    equipment: 'Bodyweight',
    demoSummary: 'Anti-extension core—straight line, breathe.',
    steps: [
      'Forearms on floor, elbows under shoulders.',
      'Lift knees so body is rigid from head to heels.',
      'Tuck pelvis slightly, squeeze glutes, press floor away.',
      'Hold and breathe in controlled cycles.',
    ],
    cues: [
      'Imagine a glass of water on your low back—don’t spill.',
      'Push the floor with forearms and toes.',
    ],
    mistakes: [
      'Hips piking up or sagging.',
      'Holding breath the whole time.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
    youtubeVideoId: 'pSHjTRCQxIw',
    videoCredit: 'Calisthenicmovement — plank',
  },
  {
    id: 'pallof-press',
    name: 'Cable Pallof press',
    category: 'core',
    equipment: 'Cable or band',
    demoSummary: 'Anti-rotation press—trains the obliques and deep core.',
    steps: [
      'Stand sideways to cable at chest height, interlock fingers on handle.',
      'Step out so cable tries to rotate you—resist.',
      'Press hands straight out, hold 1–2 seconds, return.',
      'Complete reps then switch sides.',
    ],
    cues: [
      'Shoulders and hips stay square to the front.',
      'Exhale on the press.',
    ],
    mistakes: [
      'Twisting toward the stack.',
      'Feet too narrow.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=AH_QZmxvzCM',
    youtubeVideoId: 'AH_QZmxvzCM',
    videoCredit: 'Mind Pump TV — Pallof press',
  },
];

export function getStrengthExerciseById(id: string): StrengthExercise | undefined {
  return STRENGTH_EXERCISES.find((e) => e.id === id);
}

export function strengthExercisesByCategory(cat: StrengthCategory): StrengthExercise[] {
  return STRENGTH_EXERCISES.filter((e) => e.category === cat);
}
