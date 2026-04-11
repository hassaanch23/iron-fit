import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { AppTheme } from '@/constants/app-theme';
import {
  BMI_NORMAL_MAX,
  BMI_OVERWEIGHT_MAX,
  BMI_UNDERWEIGHT_MAX,
  getBmiCategory,
} from '@/lib/bmi';

type Props = {
  bmi: number;
  weightKg: number | null;
  heightCm: number | null;
};

/** Arc segments (low → high BMI). Rendered in reverse order so underweight isn’t covered by normal’s stroke at 18.5. */
const ZONES = [
  { label: 'Underweight', min: 0, max: BMI_UNDERWEIGHT_MAX, color: '#F4B740' },
  { label: 'Normal', min: BMI_UNDERWEIGHT_MAX, max: BMI_NORMAL_MAX, color: '#2EBD85' },
  { label: 'Overweight', min: BMI_NORMAL_MAX, max: BMI_OVERWEIGHT_MAX, color: '#FF9800' },
  { label: 'Obese', min: BMI_OVERWEIGHT_MAX, max: 40, color: '#E53935' },
];

const ARC_START = 135;
const ARC_END = 405;
const ARC_RANGE = ARC_END - ARC_START;
const BMI_MIN = 10;
const BMI_MAX = 40;
const SIZE = 260;
const CX = SIZE / 2;
const CY = SIZE / 2 + 10;
const R = 100;
const STROKE = 18;
/** Tip meets the arc stroke centerline (path radius R), not inside the band. */
const NEEDLE_RADIUS = R - 6;

/** Needle rest: straight down from pivot (6 o’clock). */
const NEEDLE_START_ANGLE = 90;

/** Padding so arc and ticks are not clipped (underweight ticks were past x = 0). */
const VB_X = -42;
const VB_Y = 12;
const VB_W = SIZE + 84;
const VB_H = 228;
/** Match former SvgText y = CY + 36 as % of viewBox height (for RN Text overlay). */
const BMI_VALUE_TOP_PCT = ((CY + 36 - VB_Y) / VB_H) * 100;

const AnimatedLine = Animated.createAnimatedComponent(Line);

function needleTipXYWorklet(angleDeg: number, radius: number) {
  'worklet';
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  };
}

function bmiToAngle(bmi: number): number {
  const clamped = Math.max(BMI_MIN, Math.min(BMI_MAX, bmi));
  const ratio = (clamped - BMI_MIN) / (BMI_MAX - BMI_MIN);
  return ARC_START + ratio * ARC_RANGE;
}

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function pointOnArc(angle: number, radius: number) {
  const rad = degToRad(angle);
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

function arcPath(startAngle: number, endAngle: number, r: number): string {
  const start = pointOnArc(startAngle, r);
  const end = pointOnArc(endAngle, r);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function healthyWeightRange(heightCm: number): { min: number; max: number } {
  const hM = heightCm / 100;
  return {
    min: Math.round(18.5 * hM * hM * 10) / 10,
    max: Math.round(25 * hM * hM * 10) / 10,
  };
}

export function BmiGauge({ bmi, weightKg, heightCm }: Props) {
  const targetAngle = bmiToAngle(bmi);
  const cat = getBmiCategory(bmi);
  const healthy = heightCm ? healthyWeightRange(heightCm) : null;
  const bmiPrime = (bmi / 25).toFixed(1);

  const needleAngle = useSharedValue(NEEDLE_START_ANGLE);

  const animatedNeedleProps = useAnimatedProps(() => {
    const tip = needleTipXYWorklet(needleAngle.value, NEEDLE_RADIUS);
    return { x2: tip.x, y2: tip.y };
  });

  useFocusEffect(
    useCallback(() => {
      needleAngle.value = NEEDLE_START_ANGLE;
      needleAngle.value = withTiming(targetAngle, {
        duration: 950,
        easing: Easing.out(Easing.cubic),
      });
    }, [needleAngle, targetAngle]),
  );

  const tickRadius = R + STROKE / 2 + 12;

  return (
    <View style={styles.container}>
      <View style={styles.svgAspect}>
        <Svg width="100%" height="100%" viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet">
        {[...ZONES].reverse().map((zone) => {
          const sa = bmiToAngle(Math.max(zone.min, BMI_MIN));
          const ea = bmiToAngle(Math.min(zone.max, BMI_MAX));
          return (
            <Path
              key={zone.label}
              d={arcPath(sa, ea, R)}
              stroke={zone.color}
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="butt"
            />
          );
        })}

        {[16, 18.5, 25, 30, 40].map((val) => {
          const a = bmiToAngle(val);
          const p = pointOnArc(a, tickRadius);
          return (
            <SvgText
              key={val}
              x={p.x}
              y={p.y}
              fontSize={10}
              fontWeight="600"
              fill="#999"
              textAnchor="middle"
              alignmentBaseline="central">
              {val}
            </SvgText>
          );
        })}

        <AnimatedLine
          x1={CX}
          y1={CY}
          stroke={cat.color}
          strokeWidth={3}
          strokeLinecap="round"
          animatedProps={animatedNeedleProps}
        />
        <Circle cx={CX} cy={CY} r={6} fill="#ccc" />
        <Circle cx={CX} cy={CY} r={3} fill="#fff" />
      </Svg>
        <View style={styles.bmiValueOverlay} pointerEvents="none">
          <Text style={styles.bmiValueText}>
            BMI = {bmi.toFixed(1)}
          </Text>
        </View>
      </View>

      <View style={styles.zoneLegend}>
        {ZONES.map((z) => (
          <View key={z.label} style={styles.zoneLegendItem}>
            <View style={[styles.zoneLegendDot, { backgroundColor: z.color }]} />
            <Text style={[styles.zoneLegendText, { color: z.color }]} numberOfLines={1}>
              {z.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <View style={[styles.dot, { backgroundColor: cat.color }]} />
          <Text style={styles.infoText}>
            BMI = <Text style={{ fontWeight: '800' }}>{bmi.toFixed(1)} kg/m²</Text>
            {'  '}(<Text style={{ color: cat.color, fontWeight: '700' }}>{cat.label}</Text>)
          </Text>
        </View>
        {healthy && (
          <View style={styles.infoRow}>
            <View style={[styles.dot, { backgroundColor: '#2EBD85' }]} />
            <Text style={styles.infoText}>
              Healthy weight: {healthy.min} – {healthy.max} kg
            </Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <View style={[styles.dot, { backgroundColor: '#7E5BEF' }]} />
          <Text style={styles.infoText}>
            Healthy BMI range: {BMI_UNDERWEIGHT_MAX} – {BMI_NORMAL_MAX} kg/m²
          </Text>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.dot, { backgroundColor: AppTheme.colors.textSecondary }]} />
          <Text style={styles.infoText}>BMI Prime: {bmiPrime}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 16,
    alignItems: 'center',
    overflow: 'visible',
  },
  svgAspect: {
    width: '100%',
    aspectRatio: VB_W / VB_H,
    maxWidth: SIZE + 84,
    alignSelf: 'center',
    position: 'relative',
  },
  bmiValueOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: `${BMI_VALUE_TOP_PCT}%`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bmiValueText: {
    width: '100%',
    fontSize: 22,
    fontWeight: '800',
    color: AppTheme.colors.textPrimary,
    textAlign: 'center',
    writingDirection: 'ltr',
  },
  zoneLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    rowGap: 6,
    columnGap: 10,
    marginTop: 2,
    marginBottom: 4,
    paddingHorizontal: 4,
    maxWidth: '100%',
  },
  zoneLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  zoneLegendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  zoneLegendText: {
    fontSize: 10,
    fontWeight: '700',
  },
  infoSection: {
    width: '100%',
    gap: 8,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  infoText: {
    fontSize: 13,
    color: AppTheme.colors.textSecondary,
    flex: 1,
  },
});
