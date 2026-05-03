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
  {
    id: 'front-squat',
    name: 'Front squat',
    category: 'lower',
    equipment: 'Squat rack, barbell',
    demoSummary: 'Front-loaded squat that demands an upright torso and braced core.',
    steps: [
      'Set the bar across your front delts in a clean grip; elbows high, parallel to the floor.',
      'Unrack with three points of foot contact and step back into your stance.',
      'Sit straight down between your hips, elbows up, torso vertical.',
      'Hit your safe depth, then drive evenly through mid-foot to stand.',
    ],
    cues: [
      'The bar sits on the shoulders—fingers are just guides.',
      '“Show me your logo” to keep elbows pointing forward.',
    ],
    mistakes: [
      'Elbows dropping, which dumps the bar forward.',
      'Excessive forward lean from limited ankle/wrist mobility.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=uYumuL_G4VoY',
    youtubeVideoId: 'uYumuL_G4VoY',
    videoCredit: 'Jeff Nippard — front squat tutorial',
  },
  {
    id: 'leg-press',
    name: 'Leg press',
    category: 'lower',
    equipment: 'Leg press machine',
    demoSummary: 'Machine-supported squat pattern for quads and glutes.',
    steps: [
      'Set feet shoulder-width on the platform, mid-foot pressure.',
      'Release safeties, lower until knees are around 90° without lifting your hips.',
      'Press through whole foot to extend, but do not fully lock the knees.',
    ],
    cues: [
      'Keep your low back in contact with the pad.',
      'Knees track in line with toes.',
    ],
    mistakes: [
      'Going so deep your hips roll under (lumbar flexion).',
      'Hyperextending knees at lockout.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
    youtubeVideoId: 'IZxyjW7MPJQ',
    videoCredit: 'ScottHermanFitness — leg press',
  },
  {
    id: 'lying-leg-curl',
    name: 'Lying leg curl',
    category: 'lower',
    equipment: 'Leg curl machine',
    demoSummary: 'Knee-flexion isolation for the hamstrings.',
    steps: [
      'Lie face down, ankles under the pad, knees just off the bench.',
      'Curl the heels toward your glutes, contracting hamstrings.',
      'Pause briefly at the top, then lower under control.',
    ],
    cues: [
      'Point toes slightly to bias different hamstring heads.',
      'Don’t let hips lift off the pad.',
    ],
    mistakes: [
      'Yanking the weight up with hip flexion.',
      'Crashing the stack on the way down.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs',
    youtubeVideoId: '1Tq3QdYUuHs',
    videoCredit: 'ScottHermanFitness — lying leg curl',
  },
  {
    id: 'leg-extension',
    name: 'Leg extension',
    category: 'lower',
    equipment: 'Leg extension machine',
    demoSummary: 'Open-chain quad isolation.',
    steps: [
      'Adjust the seat so the knee axis aligns with the machine pivot.',
      'Feet under the pad, ankles flexed.',
      'Extend the knees fully, squeeze the quads briefly.',
      'Lower under control without slamming.',
    ],
    cues: [
      'Sit tall, low back against the pad.',
      'Tempo down—don’t free-fall.',
    ],
    mistakes: [
      'Throwing the torso back to swing the weight up.',
      'Going far too heavy and short-cycling reps.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=YyvSfVjQeL0',
    youtubeVideoId: 'YyvSfVjQeL0',
    videoCredit: 'ScottHermanFitness — leg extension',
  },
  {
    id: 'standing-calf-raise',
    name: 'Standing calf raise',
    category: 'lower',
    equipment: 'Calf machine, step, or dumbbells',
    demoSummary: 'Knees-extended calf raise targeting the gastrocnemius.',
    steps: [
      'Balls of feet on a step or platform, heels free to drop.',
      'Drop heels into a stretch, then drive up onto your toes as high as possible.',
      'Pause briefly at the top contraction.',
      'Lower under control to a full stretch.',
    ],
    cues: [
      'Keep knees straight (but not locked) to load the calves.',
      'Full range every rep—stretch hard at the bottom.',
    ],
    mistakes: [
      'Bouncing reps that skip the bottom stretch.',
      'Bending knees and turning it into half-squats.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=-M4-G8p8fmc',
    youtubeVideoId: '-M4-G8p8fmc',
    videoCredit: 'ScottHermanFitness — standing calf raise',
  },
  {
    id: 'step-up',
    name: 'Dumbbell step-up',
    category: 'lower',
    equipment: 'Box or bench, dumbbells',
    demoSummary: 'Single-leg step onto a box—quads, glutes, balance.',
    steps: [
      'Set a box around knee height; hold dumbbells at your sides.',
      'Plant the working foot fully on the box.',
      'Drive through the heel to stand tall on top, minimizing back-leg push.',
      'Lower under control to the start—do not bounce off the floor.',
    ],
    cues: [
      'Most of the work comes from the foot on the box.',
      'Tall posture—no folding forward.',
    ],
    mistakes: [
      'Pushing off the trailing leg to cheat the rep.',
      'Box too high, causing low-back compensation.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=WCFCdxZFu6s',
    youtubeVideoId: 'WCFCdxZFu6s',
    videoCredit: 'Athlean-X — step-up',
  },
  {
    id: 'sumo-deadlift',
    name: 'Sumo deadlift',
    category: 'pull',
    equipment: 'Barbell, plates',
    demoSummary: 'Wide-stance deadlift with a more upright torso.',
    steps: [
      'Take a wide stance, toes turned out 30–45°, shins close to the bar.',
      'Grip inside your knees, arms vertical, chest up.',
      'Wedge into position—pull slack, push knees out, drive the floor away.',
      'Stand tall with hips and knees locked at the top.',
    ],
    cues: [
      'Knees track over the toes throughout.',
      'Hips and shoulders rise together—don’t turn it into a stiff-leg.',
    ],
    mistakes: [
      'Stance so wide you can’t engage hips.',
      'Bar drifting in front of mid-foot.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=3SRS1vHhDcM',
    youtubeVideoId: '3SRS1vHhDcM',
    videoCredit: 'Alan Thrall — sumo deadlift',
  },
  {
    id: 'kettlebell-swing',
    name: 'Russian kettlebell swing',
    category: 'lower',
    equipment: 'Kettlebell',
    demoSummary: 'Explosive hinge—hips power the bell to chest height.',
    steps: [
      'Set the bell a foot in front, hinge and hike it back between your legs.',
      'Snap hips forward; the bell floats up to chest height.',
      'Let it fall on its own; meet it with another hinge.',
      'Stay tall at the top—don’t lean back.',
    ],
    cues: [
      'Hips drive the bell, not arms.',
      'Quick, sharp glute squeeze at the top.',
    ],
    mistakes: [
      'Squatting the swing instead of hinging.',
      'Lifting the bell with the shoulders.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=cKx8xE8jJZs',
    youtubeVideoId: 'cKx8xE8jJZs',
    videoCredit: 'StrongFirst — Russian kettlebell swing',
  },
  {
    id: 'incline-bench-press',
    name: 'Incline barbell bench press',
    category: 'push',
    equipment: 'Incline bench, barbell',
    demoSummary: 'Upper-chest emphasis with a 30° incline.',
    steps: [
      'Set the bench around 30°. Eyes under the bar, feet planted.',
      'Pull shoulder blades back and down into the pad.',
      'Unrack and lower bar to upper chest with elbows ~45°.',
      'Press up and slightly back toward the rack.',
    ],
    cues: [
      'Lower bar to the high collarbone, not the lower chest.',
      'Steep inclines (>45°) become more shoulder-dominant.',
    ],
    mistakes: [
      'Bench too steep, taking chest out of the lift.',
      'Letting elbows flare to 90°.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=jPLdzuHckI8',
    youtubeVideoId: 'jPLdzuHckI8',
    videoCredit: 'Jeff Nippard — incline bench press',
  },
  {
    id: 'dumbbell-shoulder-press',
    name: 'Seated dumbbell shoulder press',
    category: 'push',
    equipment: 'Bench, dumbbells',
    demoSummary: 'Vertical press with a free range of motion.',
    steps: [
      'Sit on an upright bench, dumbbells at shoulder height, palms forward.',
      'Brace ribs down, press up until arms are straight.',
      'Lower under control until elbows are about shoulder-height.',
    ],
    cues: [
      'Elbows slightly forward of shoulders—not flared straight out.',
      'Squeeze the bench with your back to stay tight.',
    ],
    mistakes: [
      'Overarching the low back.',
      'Bouncing the bottom of each rep.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
    youtubeVideoId: 'qEwKCR5JCog',
    videoCredit: 'ScottHermanFitness — DB shoulder press',
  },
  {
    id: 'dip',
    name: 'Parallel bar dip',
    category: 'push',
    equipment: 'Dip bars',
    demoSummary: 'Bodyweight push for chest, triceps, and front delts.',
    steps: [
      'Support yourself on the bars, elbows locked, shoulders packed down.',
      'Lower with a slight forward lean until shoulders are around elbow height.',
      'Press back up by pushing the bars away.',
    ],
    cues: [
      'Lean forward more for chest emphasis, stay upright for triceps.',
      'Don’t let the head punch forward—keep neck neutral.',
    ],
    mistakes: [
      'Going so deep that shoulders shrug to the ears.',
      'Half reps that skip the lockout.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=2z8JmcrW-As',
    youtubeVideoId: '2z8JmcrW-As',
    videoCredit: 'Calisthenicmovement — dips tutorial',
  },
  {
    id: 'lateral-raise',
    name: 'Dumbbell lateral raise',
    category: 'push',
    equipment: 'Dumbbells',
    demoSummary: 'Side-delt isolation—small weights, strict form.',
    steps: [
      'Stand tall, dumbbells at sides, slight elbow bend.',
      'Raise the dumbbells out to your sides until arms are about parallel with the floor.',
      'Lead with the elbows, lower under control.',
    ],
    cues: [
      'Think “pour out a jug”—pinkies lead slightly higher than thumbs.',
      'Pause for a beat at the top to feel the side delt.',
    ],
    mistakes: [
      'Swinging the body to throw the weight up.',
      'Lifting too high and shrugging.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
    youtubeVideoId: '3VcKaXpzqRo',
    videoCredit: 'Athlean-X — lateral raise',
  },
  {
    id: 'cable-chest-fly',
    name: 'Cable chest fly',
    category: 'push',
    equipment: 'Cable machine, D-handles',
    demoSummary: 'Constant-tension chest isolation with a long stretch.',
    steps: [
      'Set both pulleys around shoulder height, grab handles and step forward.',
      'Slight bend in the elbows; arms wide with chest stretched.',
      'Bring hands together in front of the chest along an arc, squeeze chest.',
      'Return slowly until you feel a deep stretch.',
    ],
    cues: [
      'Elbow angle stays fixed—it’s a fly, not a press.',
      'Lead with the elbows, hands follow.',
    ],
    mistakes: [
      'Bending elbows mid-rep into a press.',
      'Going so heavy you shrug to finish.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=Iwe6AmxVf7o',
    youtubeVideoId: 'Iwe6AmxVf7o',
    videoCredit: 'ScottHermanFitness — cable fly',
  },
  {
    id: 'tricep-pushdown',
    name: 'Cable tricep pushdown',
    category: 'push',
    equipment: 'Cable machine, rope or bar',
    demoSummary: 'Elbow-extension isolation for the triceps.',
    steps: [
      'Stand at the cable, elbows pinned at your sides.',
      'Press the attachment down until elbows are fully locked out.',
      'Squeeze briefly, then return until forearms are just above parallel.',
    ],
    cues: [
      'Upper arms don’t move—only the forearms.',
      'With a rope, pull the ends apart at the bottom.',
    ],
    mistakes: [
      'Letting elbows drift forward to involve the chest.',
      'Leaning over the bar to use bodyweight.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
    youtubeVideoId: '2-LAMcpzODU',
    videoCredit: 'ScottHermanFitness — tricep pushdown',
  },
  {
    id: 'skull-crusher',
    name: 'EZ-bar skull crusher',
    category: 'push',
    equipment: 'EZ-bar, bench',
    demoSummary: 'Lying tricep extension—lots of triceps stretch.',
    steps: [
      'Lie on a flat bench, arms straight, EZ-bar over your face.',
      'Bend the elbows to lower the bar toward the top of your head.',
      'Extend the elbows back to start without flaring them wide.',
    ],
    cues: [
      'Upper arms angle slightly back to keep tension on triceps.',
      'Tuck elbows to protect them—don’t let them flare.',
    ],
    mistakes: [
      'Letting elbows drift and turning it into a press.',
      'Hyperextending elbows at the top.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=l3rHYPtMUo8',
    youtubeVideoId: 'l3rHYPtMUo8',
    videoCredit: 'ScottHermanFitness — skull crusher',
  },
  {
    id: 'close-grip-bench',
    name: 'Close-grip bench press',
    category: 'push',
    equipment: 'Bench, barbell, rack',
    demoSummary: 'Tricep-biased bench with hands shoulder-width.',
    steps: [
      'Lie on a flat bench, grip the bar shoulder-width or slightly inside.',
      'Pull shoulder blades back and down; unrack to straight arms.',
      'Lower bar to the lower chest with elbows tucked ~30°.',
      'Press up by extending the elbows forcefully.',
    ],
    cues: [
      'Don’t go so narrow that wrists or elbows hurt.',
      'Elbows tucked, not flared.',
    ],
    mistakes: [
      'Grip so narrow wrists collapse.',
      'Touching the bar high on the chest like a regular bench.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=nEF0bv2FW94',
    youtubeVideoId: 'nEF0bv2FW94',
    videoCredit: 'ScottHermanFitness — close-grip bench',
  },
  {
    id: 'arnold-press',
    name: 'Arnold press',
    category: 'push',
    equipment: 'Dumbbells, bench',
    demoSummary: 'Rotational shoulder press hitting all three delt heads.',
    steps: [
      'Sit on an upright bench, dumbbells at shoulder height, palms facing you.',
      'As you press up, rotate the wrists so palms face forward at the top.',
      'Reverse the rotation as you lower back to start.',
    ],
    cues: [
      'Smooth rotation throughout—don’t jerk the bells.',
      'Keep ribs stacked, no big arch.',
    ],
    mistakes: [
      'Going too heavy and losing the rotation.',
      'Banging dumbbells together at the top.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=3ml7BH7mNwQ',
    youtubeVideoId: '3ml7BH7mNwQ',
    videoCredit: 'ScottHermanFitness — Arnold press',
  },
  {
    id: 'barbell-row',
    name: 'Barbell bent-over row',
    category: 'pull',
    equipment: 'Barbell, plates',
    demoSummary: 'Hinged horizontal pull for the entire back.',
    steps: [
      'Hinge to about 45° with a flat back, bar hanging at knee height.',
      'Pull the bar to the lower chest/upper abs by driving elbows back.',
      'Squeeze the upper back, then lower under control without losing the hinge.',
    ],
    cues: [
      'Knees soft, hips back—not a half-squat.',
      'Lats first—don’t shrug into the pull.',
    ],
    mistakes: [
      'Standing more upright on each rep (shortens range).',
      'Yanking with the low back instead of pulling with the back.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=9efgcAjQe7E',
    youtubeVideoId: '9efgcAjQe7E',
    videoCredit: 'Alan Thrall — barbell row',
  },
  {
    id: 'seated-cable-row',
    name: 'Seated cable row',
    category: 'pull',
    equipment: 'Cable row machine',
    demoSummary: 'Horizontal pull with constant tension—mid-back focus.',
    steps: [
      'Feet on the platform, knees soft, sit tall with chest up.',
      'Reach forward to load the lats without rounding the lumbar spine.',
      'Pull the handle to your lower ribs by driving elbows back.',
      'Return under control to a long but neutral spine.',
    ],
    cues: [
      'Squeeze the shoulder blades together at the end of the pull.',
      'Don’t lean back beyond vertical to cheat reps.',
    ],
    mistakes: [
      'Rocking the torso for momentum.',
      'Ending the pull at the rib cage with shrugged shoulders.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74',
    youtubeVideoId: 'GZbfZ033f74',
    videoCredit: 'ScottHermanFitness — seated cable row',
  },
  {
    id: 't-bar-row',
    name: 'T-bar row',
    category: 'pull',
    equipment: 'T-bar machine or landmine',
    demoSummary: 'Heavy supported row for thickness through the upper back.',
    steps: [
      'Straddle the bar, hinge to about 45°, grip the handles.',
      'Brace, then row the bar toward the lower chest.',
      'Squeeze upper back at the top; lower under control to a full stretch.',
    ],
    cues: [
      'Chest up, neck neutral—don’t crane the head.',
      'Hips stay back; this is a row, not a half-deadlift.',
    ],
    mistakes: [
      'Heaving with the hips on each rep.',
      'Pulling with the arms instead of the back.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=j3Igk5nyZE4',
    youtubeVideoId: 'j3Igk5nyZE4',
    videoCredit: 'ScottHermanFitness — T-bar row',
  },
  {
    id: 'chin-up',
    name: 'Chin-up (underhand)',
    category: 'pull',
    equipment: 'Pull-up bar',
    demoSummary: 'Underhand vertical pull—lats and biceps.',
    steps: [
      'Hang with palms facing you, hands shoulder-width.',
      'Pull elbows down toward your ribs and chin over the bar.',
      'Lower to a full hang under control.',
    ],
    cues: [
      'Keep ribs down, glutes tight—no kipping.',
      'Drive elbows down and slightly back.',
    ],
    mistakes: [
      'Half reps from the top.',
      'Swinging to generate momentum.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=brhRXlOhsAM',
    youtubeVideoId: 'brhRXlOhsAM',
    videoCredit: 'Athlean-X — chin-up',
  },
  {
    id: 'barbell-curl',
    name: 'Barbell biceps curl',
    category: 'pull',
    equipment: 'Barbell',
    demoSummary: 'Classic mass-builder for the biceps.',
    steps: [
      'Stand tall, grip just outside the hips, palms forward.',
      'Curl the bar up by flexing the elbows—keep them pinned at your sides.',
      'Squeeze briefly at the top, then lower under control to nearly straight arms.',
    ],
    cues: [
      'Wrists stay neutral—don’t curl them.',
      'No swinging the torso—if you have to, lighten the load.',
    ],
    mistakes: [
      'Letting elbows drift forward at the top.',
      'Bouncing reps off the thighs.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo',
    youtubeVideoId: 'kwG2ipFRgfo',
    videoCredit: 'ScottHermanFitness — barbell curl',
  },
  {
    id: 'hammer-curl',
    name: 'Dumbbell hammer curl',
    category: 'pull',
    equipment: 'Dumbbells',
    demoSummary: 'Neutral-grip curl that targets brachialis and brachioradialis.',
    steps: [
      'Stand tall, dumbbells at sides, palms facing your thighs.',
      'Curl up keeping the palms facing each other throughout.',
      'Lower under control to a full stretch.',
    ],
    cues: [
      'Elbows stay glued to the ribs.',
      'Slow on the way down to maximize tension.',
    ],
    mistakes: [
      'Swinging the torso to start the rep.',
      'Letting the wrists rotate mid-rep.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4',
    youtubeVideoId: 'zC3nLlEvin4',
    videoCredit: 'ScottHermanFitness — hammer curl',
  },
  {
    id: 'preacher-curl',
    name: 'EZ-bar preacher curl',
    category: 'pull',
    equipment: 'Preacher bench, EZ-bar',
    demoSummary: 'Strict curl with arms supported—zero body english.',
    steps: [
      'Sit at the preacher bench, armpits at the top of the pad.',
      'Grip the EZ-bar at a comfortable angle, lower to a full elbow extension.',
      'Curl up to about 90°, where tension peaks, and squeeze.',
      'Lower under tight control to the bottom stretch.',
    ],
    cues: [
      'Don’t fully lock the elbows at the bottom—save the joint.',
      'Chest stays glued to the pad.',
    ],
    mistakes: [
      'Going so heavy elbows lift off the pad.',
      'Crashing into elbow extension at the bottom.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=fIWP-FRFNU0',
    youtubeVideoId: 'fIWP-FRFNU0',
    videoCredit: 'ScottHermanFitness — preacher curl',
  },
  {
    id: 'reverse-fly',
    name: 'Dumbbell reverse fly',
    category: 'pull',
    equipment: 'Dumbbells, bench optional',
    demoSummary: 'Rear-delt and upper-back isolation.',
    steps: [
      'Hinge to about 45° with a flat back, dumbbells hanging beneath shoulders.',
      'Slight bend in the elbows; raise the dumbbells out to the sides.',
      'Squeeze shoulder blades; pause briefly at the top.',
      'Lower under control without rounding the back.',
    ],
    cues: [
      'Lead with the elbows, not the hands.',
      'Avoid shrugging—keep the neck long.',
    ],
    mistakes: [
      'Standing back up to swing the weight.',
      'Bending elbows further mid-rep into a row.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=ttvfGg9d76c',
    youtubeVideoId: 'ttvfGg9d76c',
    videoCredit: 'ScottHermanFitness — reverse fly',
  },
  {
    id: 'hanging-leg-raise',
    name: 'Hanging leg raise',
    category: 'core',
    equipment: 'Pull-up bar',
    demoSummary: 'Advanced anti-extension core work from a dead hang.',
    steps: [
      'Hang from the bar with shoulders engaged (not fully relaxed).',
      'Tuck the pelvis and lift the legs until thighs pass parallel.',
      'Lower under control without swinging.',
    ],
    cues: [
      'Curl the pelvis up first—not just the legs.',
      'Keep ribs down to avoid arching.',
    ],
    mistakes: [
      'Kipping/swinging to throw the legs up.',
      'Stopping at the hip-flexor level (knees only).',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=Pr1ieGZ5atk',
    youtubeVideoId: 'Pr1ieGZ5atk',
    videoCredit: 'Calisthenicmovement — hanging leg raise',
  },
  {
    id: 'dead-bug',
    name: 'Dead bug',
    category: 'core',
    equipment: 'Bodyweight',
    demoSummary: 'Anti-extension drill for low-back-friendly core control.',
    steps: [
      'Lie on your back, arms straight up, knees bent at 90° over hips.',
      'Press low back into the floor.',
      'Slowly lower opposite arm and leg without losing back contact.',
      'Return and switch sides.',
    ],
    cues: [
      'Exhale as you lower the limbs.',
      'Move slowly—quality over reps.',
    ],
    mistakes: [
      'Letting the low back arch off the floor.',
      'Holding breath through the rep.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=4XLEnwUr1d8',
    youtubeVideoId: '4XLEnwUr1d8',
    videoCredit: 'Athlean-X — dead bug',
  },
  {
    id: 'bird-dog',
    name: 'Bird dog',
    category: 'core',
    equipment: 'Bodyweight',
    demoSummary: 'Anti-rotation core and posterior chain stability.',
    steps: [
      'Start on hands and knees, hands under shoulders, knees under hips.',
      'Extend opposite arm and leg until they’re in line with the torso.',
      'Pause briefly, then return without dropping the hips.',
      'Alternate sides each rep.',
    ],
    cues: [
      'Imagine balancing a glass on your low back.',
      'Move from the trunk, not from rotating the hips.',
    ],
    mistakes: [
      'Hips rotating with each extension.',
      'Lifting the limbs above shoulder/hip line.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=wiFNA3sqjCA',
    youtubeVideoId: 'wiFNA3sqjCA',
    videoCredit: 'Athlean-X — bird dog',
  },
  {
    id: 'russian-twist',
    name: 'Russian twist',
    category: 'core',
    equipment: 'Plate or dumbbell',
    demoSummary: 'Rotational core—obliques and transverse abdominis.',
    steps: [
      'Sit on the floor, knees bent, lean back to about 45°.',
      'Hold the weight at chest height; rotate to one side then the other.',
      'Tap the floor lightly beside the hip, keep chest tall.',
    ],
    cues: [
      'Rotate from the rib cage, not just the arms.',
      'Don’t round the lower back into a slump.',
    ],
    mistakes: [
      'Just swinging the weight side to side.',
      'Holding breath.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=wkD8rjkodUI',
    youtubeVideoId: 'wkD8rjkodUI',
    videoCredit: 'ScottHermanFitness — Russian twist',
  },
  {
    id: 'side-plank',
    name: 'Side plank',
    category: 'core',
    equipment: 'Bodyweight',
    demoSummary: 'Anti-lateral-flexion plank for the obliques and QL.',
    steps: [
      'Lie on your side, forearm on the floor with elbow under shoulder.',
      'Stack feet (or stagger) and lift hips so body forms a straight line.',
      'Hold while breathing; switch sides after the set.',
    ],
    cues: [
      'Drive the bottom hip up to the ceiling.',
      'Top shoulder packed—not crashing forward.',
    ],
    mistakes: [
      'Hips sagging toward the floor.',
      'Twisting the torso forward.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=K2VljzCC16g',
    youtubeVideoId: 'K2VljzCC16g',
    videoCredit: 'Athlean-X — side plank',
  },
  {
    id: 'ab-wheel-rollout',
    name: 'Ab wheel rollout',
    category: 'core',
    equipment: 'Ab wheel',
    demoSummary: 'Heavy anti-extension—roll out, then pull back without arching.',
    steps: [
      'Kneel with the wheel under your shoulders.',
      'Tuck the pelvis; roll the wheel forward as far as you can control.',
      'Pull the wheel back by driving the hips forward—not by piking.',
    ],
    cues: [
      'Ribs stay down throughout the rollout.',
      'Stop short of where your low back would arch.',
    ],
    mistakes: [
      'Letting the lumbar spine sag at full reach.',
      'Sitting back into the heels to “cheat” the return.',
    ],
    youtubeUrl: 'https://www.youtube.com/watch?v=rqiTPdK1c-Q',
    youtubeVideoId: 'rqiTPdK1c-Q',
    videoCredit: 'Athlean-X — ab wheel rollout',
  },
];

export function getStrengthExerciseById(id: string): StrengthExercise | undefined {
  return STRENGTH_EXERCISES.find((e) => e.id === id);
}

export function strengthExercisesByCategory(cat: StrengthCategory): StrengthExercise[] {
  return STRENGTH_EXERCISES.filter((e) => e.category === cat);
}
