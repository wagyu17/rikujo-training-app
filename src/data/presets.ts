import type { DrillRoutine, InputHistory, StrengthRoutine } from '../types';

export const runningDrill22: DrillRoutine = {
  id: 'running-drill-22',
  name: 'ランニングドリル 22種（動画準拠）',
  referenceUrl: 'https://youtu.be/xy4PRGtr61w',
  items: [
    { id: 'rd22-01', name: 'キャットポスト (Catpost)', cue: '背中を丸める・反らす動きで、脊柱と骨盤の連動性を高める。', durationSec: 30 },
    { id: 'rd22-02', name: 'チェストターン (Chest turn)', cue: '胸郭を大きく開き、走る際の大きな腕振りと胸の開きを作る。', durationSec: 30 },
    { id: 'rd22-03', name: 'ショルダーツイスト (Shoulder twist)', cue: '肩甲骨を柔軟に動かし、肩の力を抜いたリラックスした腕振りへ繋げる。', durationSec: 30 },
    { id: 'rd22-04', name: 'プーリング (Pulling)', cue: '肩甲骨を後ろに引き込み、背中の筋肉で地面を押す推進力を生み出す。', durationSec: 30 },
    { id: 'rd22-05', name: 'スイングアーム (Swingarm)', cue: '肘を主導にして大きく腕を振り、ストライドの伸びを引き出す。', durationSec: 30 },
    { id: 'rd22-06', name: 'I＆W ショルダー (I&W Shoulder)', cue: 'バンザイとWの形を繰り返し、肩甲骨の上下の可動域を広げる。', durationSec: 30 },
    { id: 'rd22-07', name: 'バック (Back)', cue: '体幹の後面（背筋・臀部）を刺激し、走る時の姿勢を安定させる。', durationSec: 30 },
    { id: 'rd22-08', name: '立位でのキャット＆ドッグ (Cat and dog with standing)', cue: '立った状態で骨盤を前傾・後傾させ、走りの中心となる軸を作る。', durationSec: 30 },
    { id: 'rd22-09', name: '片手ストレート (One hand straight)', cue: '体幹のひねりと腕を一直線に伸ばす連動性を意識する。', durationSec: 30 },
    { id: 'rd22-10', name: '脚振り・前後 (Leg Swing vertical)', cue: '軸足でしっかり地面を掴み、骨盤から脚を前後に大きく振る。', durationSec: 30 },
    { id: 'rd22-11', name: '脚振り・左右 (Leg Swing Horizontal)', cue: '股関節のインナーマッスルをほぐし、接地時のブレを抑える。', durationSec: 30 },
    { id: 'rd22-12', name: '股関節回旋 (Hip Rotation)', cue: '股関節を大きく外回し・内回しし、ストライドの滑らかさを出す。', durationSec: 30 },
    { id: 'rd22-13', name: '手付きジャンプスクワット (Jump squat with hand)', cue: '腕の振りの反動を使って、地面からの反発（アンクルホップの意識）を貰う。', durationSec: 30 },
    { id: 'rd22-14', name: 'ジャンプスクワット (Jump squat)', cue: '股関節・膝・足首を連動させ、一瞬で地面にパワーを伝える（プライオメトリクス）。', durationSec: 30 },
    { id: 'rd22-15', name: '上半身回旋 (Rotate upper body)', cue: '軸を真っ直ぐに保ったまま、お腹の深層部から体をひねる。', durationSec: 30 },
    { id: 'rd22-16', name: 'アーノルドプレス (Arnold Press)', cue: '肩周りの筋肉を刺激し、長距離後半でも腕が下がらないスタミナを作る。', durationSec: 30 },
    { id: 'rd22-17', name: '足首ホールド上下 (Hold Ankle updown)', cue: 'ハムストリングスと臀部を伸ばし、着地時の衝撃を吸収・推進力に変える準備。', durationSec: 30 },
    { id: 'rd22-18', name: 'マウンテンクライマー (Mountain climber)', cue: '体幹を固定したまま素早く股関節を動かし、ピッチを上げる神経系を刺激。', durationSec: 30 },
    { id: 'rd22-19', name: 'ツイストランジ (Twist lunge)', cue: '深く踏み込んで体幹をひねり、臀部のパワーと走りの軸を同時に強化。', durationSec: 30 },
    { id: 'rd22-20', name: '前回しアームサークル (Arm circles forward)', cue: 'リズム良く腕を回し、肩周りの血流を一気に上げてラストスパートに備える。', durationSec: 30 },
    { id: 'rd22-21', name: 'クイック・ツイストランジ (Twist lunge Quick)', cue: '素早いランジ動作で、実際の走りに近い素早い筋肉の切り替え（神経系）を促す。', durationSec: 30 },
    { id: 'rd22-22', name: 'ニーハグ (Knee Hugs)', cue: '膝を胸に引き寄せ、大臀部を伸ばしつつ、片足立ちのバランス（接地軸）を確認。', durationSec: 30 },
  ],
};

export const drillRoutines: DrillRoutine[] = [
  {
    id: 'warmup-basic',
    name: 'ベース・ドリル（基本動き作り）',
    items: [
      { id: 'a-skip', name: 'A-Skip', cue: '膝を真上に。接地は母指球で短く。', durationSec: 30 },
      { id: 'b-skip', name: 'B-Skip', cue: '振り出した脚を真下に掻き込む。ブレーキをかけない。', durationSec: 30 },
      { id: 'high-knee', name: 'もも上げ（High Knee）', cue: '骨盤を立てる。腕振りで脚が出る感覚。', durationSec: 30 },
      { id: 'butt-kick', name: 'バットキック', cue: 'かかとを真下から畳む。お尻まで届かせる。', durationSec: 30 },
      { id: 'straight-leg', name: 'ストレートレッグ', cue: '脚を伸ばしたまま接地。地面を後ろに掻く意識。', durationSec: 30 },
      { id: 'skip-bound', name: 'スキップ・バウンディング', cue: '反発をもらう。空中時間を長く。', durationSec: 30 },
    ],
  },
  {
    id: 'sprint-tech',
    name: 'スプリント・テクニック',
    items: [
      { id: 'wall-drill', name: 'ウォールドリル', cue: '前傾を保持。接地と引き上げを同時に。', durationSec: 20 },
      { id: 'fast-leg', name: 'ファストレッグ（片脚）', cue: '回転速度を最優先。接地は瞬間で。', reps: '左右 各10回' },
      { id: 'acceleration', name: '加速ドリル（20m）', cue: '一歩目を強く長く。徐々に立ち上がる。', reps: '3本' },
    ],
  },
];

export const strengthRoutines: StrengthRoutine[] = [
  {
    id: 'core-basic',
    name: '体幹サーキット',
    items: [
      { id: 'plank', name: 'フロントプランク', cue: '頭〜踵を一直線。呼吸を止めない。', defaultReps: 60, defaultSets: 3 },
      { id: 'side-plank', name: 'サイドプランク（左右）', cue: '腰を高く。肩・腰・膝を一直線。', defaultReps: 45, defaultSets: 2 },
      { id: 'dead-bug', name: 'デッドバグ', cue: '腰を床に押し付け続ける。反らない。', defaultReps: 12, defaultSets: 3 },
      { id: 'hip-thrust', name: 'ヒップスラスト（自重）', cue: '殿筋で押し切る。腰で反らない。', defaultReps: 15, defaultSets: 3 },
    ],
  },
  {
    id: 'weight-lower',
    name: 'ウエイト・下半身',
    items: [
      { id: 'squat', name: 'バックスクワット', cue: 'ニーオーバートゥ。胸を張る。深さより質。', defaultReps: 5, defaultSets: 5 },
      { id: 'rdl', name: 'ルーマニアン・デッドリフト', cue: 'ヒンジ動作。ハムで引き上げる感覚。', defaultReps: 8, defaultSets: 3 },
      { id: 'split-squat', name: 'ブルガリアン・スプリットスクワット', cue: '前脚に荷重。後脚は支え程度。', defaultReps: 8, defaultSets: 3 },
    ],
  },
];

export const seedInputHistory: InputHistory = {
  distance: [1000, 400, 200, 600, 800, 2000, 300],
  time: [60, 90, 120, 180],
  reps: [5, 10, 8, 6, 12, 3],
  sets: [1, 2, 3],
  restM: [200, 100, 400, 300],
  restSec: [60, 90, 120, 180, 30, 45],
  intensity: ['I', 'T', 'E', 'R', 'M', 'LT', 'VO2'],
  environment: ['Track', 'Road', 'Trail', 'Hill', 'Treadmill'],
  incline: ['5%', '7%', '10%'],
  load: ['Vest 5kg', 'Vest 10kg'],
};
